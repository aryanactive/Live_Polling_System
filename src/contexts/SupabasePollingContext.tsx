import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Poll, PollResult, SocketEvents } from '@/types/polling';
import { toast } from '@/hooks/use-toast';

interface PollingState {
  user: User | null;
  currentPoll: Poll | null;
  pollHistory: PollResult[];
  participants: User[];
  timeRemaining: number;
  isConnected: boolean;
  hasVoted: boolean;
  userVote: string | null;
  chatMessages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  message: string;
  user_name: string;
  user_role: 'teacher' | 'student';
  created_at: string;
}

type PollingAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_POLL'; payload: Poll | null }
  | { type: 'SET_POLL_HISTORY'; payload: PollResult[] }
  | { type: 'SET_PARTICIPANTS'; payload: User[] }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'SET_CONNECTION'; payload: boolean }
  | { type: 'SET_VOTE'; payload: { hasVoted: boolean; vote: string | null } }
  | { type: 'SET_CHAT_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'RESET_STATE' };

const initialState: PollingState = {
  user: null,
  currentPoll: null,
  pollHistory: [],
  participants: [],
  timeRemaining: 0,
  isConnected: false,
  hasVoted: false,
  userVote: null,
  chatMessages: [],
};

function pollingReducer(state: PollingState, action: PollingAction): PollingState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_POLL':
      return { 
        ...state, 
        currentPoll: action.payload,
        hasVoted: false,
        userVote: null,
        timeRemaining: action.payload?.timeLimit || 0
      };
    case 'SET_POLL_HISTORY':
      return { ...state, pollHistory: action.payload };
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    case 'SET_TIME_REMAINING':
      return { ...state, timeRemaining: action.payload };
    case 'SET_CONNECTION':
      return { ...state, isConnected: action.payload };
    case 'SET_VOTE':
      return { 
        ...state, 
        hasVoted: action.payload.hasVoted, 
        userVote: action.payload.vote 
      };
    case 'SET_CHAT_MESSAGES':
      return { ...state, chatMessages: action.payload };
    case 'ADD_CHAT_MESSAGE':
      return { 
        ...state, 
        chatMessages: [...state.chatMessages, action.payload] 
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

interface PollingContextType {
  state: PollingState;
  joinAsUser: (name: string, role: 'teacher' | 'student') => Promise<void>;
  createPoll: (question: string, options: string[], timeLimit?: number) => Promise<void>;
  vote: (optionId: string) => Promise<void>;
  endPoll: () => Promise<void>;
  kickUser: (userId: string) => void;
  getPollHistory: () => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  disconnect: () => void;
}

const PollingContext = createContext<PollingContextType | undefined>(undefined);

export function SupabasePollingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(pollingReducer, initialState);
  let pollTimer: NodeJS.Timeout | null = null;

  const transformSupabasePoll = (data: any): Poll => {
    const options = Array.isArray(data.options) ? data.options : [];
    return {
      id: data.id,
      question: data.question,
      options: options.map((opt: any, index: number) => ({
        id: index.toString(),
        text: opt.text,
        votes: opt.votes || 0,
        voters: opt.voters || []
      })),
      isActive: data.is_active,
      timeLimit: data.time_limit,
      createdAt: new Date(data.created_at),
      totalVotes: data.total_votes
    };
  };

  const startPollTimer = (timeLimit: number) => {
    if (pollTimer) clearInterval(pollTimer);
    
    let timeLeft = timeLimit;
    dispatch({ type: 'SET_TIME_REMAINING', payload: timeLeft });
    
    pollTimer = setInterval(() => {
      timeLeft--;
      dispatch({ type: 'SET_TIME_REMAINING', payload: timeLeft });
      
      if (timeLeft <= 0) {
        clearInterval(pollTimer!);
        endPoll();
      }
    }, 1000);
  };

  const refreshCurrentPoll = async () => {
    const { data: polls } = await supabase
      .from('polls')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (polls && polls.length > 0) {
      const poll = polls[0];
      
      // Get vote counts for each option
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', poll.id);

      const optionVotes: Record<string, number> = {};
      votes?.forEach(vote => {
        optionVotes[vote.option_id] = (optionVotes[vote.option_id] || 0) + 1;
      });

      // Ensure poll.options is an array before mapping
      const pollOptions = Array.isArray(poll.options) ? poll.options : [];
      const updatedOptions = pollOptions.map((opt: any, index: number) => ({
        ...opt,
        votes: optionVotes[index.toString()] || 0
      }));

      const totalVotes = Object.values(optionVotes).reduce((sum: number, count: number) => sum + count, 0);

      // Update the poll with current vote counts
      await supabase
        .from('polls')
        .update({ 
          options: updatedOptions, 
          total_votes: totalVotes 
        })
        .eq('id', poll.id);

      const transformedPoll = transformSupabasePoll({
        ...poll,
        options: updatedOptions,
        total_votes: totalVotes
      });

      dispatch({ type: 'SET_POLL', payload: transformedPoll });
    }
  };

  const checkActivePoll = async () => {
    const { data: polls } = await supabase
      .from('polls')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (polls && polls.length > 0) {
      const poll = transformSupabasePoll(polls[0]);
      dispatch({ type: 'SET_POLL', payload: poll });
      
      // Calculate remaining time
      const elapsed = Math.floor((Date.now() - new Date(polls[0].created_at).getTime()) / 1000);
      const remaining = Math.max(0, poll.timeLimit - elapsed);
      
      if (remaining > 0) {
        startPollTimer(remaining);
      } else {
        endPoll();
      }
    }
  };

  const loadChatMessages = async () => {
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);

    if (messages) {
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        id: msg.id,
        message: msg.message,
        user_name: msg.user_name,
        user_role: msg.user_role as 'teacher' | 'student',
        created_at: msg.created_at
      }));
      dispatch({ type: 'SET_CHAT_MESSAGES', payload: chatMessages });
    }
  };

  const loadPollHistory = async () => {
    const { data: polls } = await supabase
      .from('polls')
      .select('*')
      .eq('is_active', false)
      .order('created_at', { ascending: false });

    if (polls) {
      const history: PollResult[] = polls.map(poll => {
        const options = Array.isArray(poll.options) ? poll.options : [];
        return {
          pollId: poll.id,
          question: poll.question,
          options: options.map((opt: any) => ({
            text: opt.text,
            votes: opt.votes || 0,
            percentage: poll.total_votes > 0 ? Math.round(((opt.votes || 0) / poll.total_votes) * 100) : 0
          })),
          totalVotes: poll.total_votes,
          createdAt: new Date(poll.created_at)
        };
      });

      dispatch({ type: 'SET_POLL_HISTORY', payload: history });
    }
  };

  const refreshParticipants = async () => {
    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .eq('is_active', true);

    if (participants) {
      const users: User[] = participants.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role as 'teacher' | 'student'
      }));
      dispatch({ type: 'SET_PARTICIPANTS', payload: users });
    }
  };

  useEffect(() => {
    // Set up real-time subscriptions
    const pollsChannel = supabase
      .channel('polls-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'polls' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const poll = transformSupabasePoll(payload.new);
          dispatch({ type: 'SET_POLL', payload: poll });
          startPollTimer(poll.timeLimit);
        } else if (payload.eventType === 'UPDATE') {
          const poll = transformSupabasePoll(payload.new);
          dispatch({ type: 'SET_POLL', payload: poll });
        }
      })
      .subscribe();

    const votesChannel = supabase
      .channel('votes-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'poll_votes' 
      }, async () => {
        // Refresh current poll to get updated vote counts
        await refreshCurrentPoll();
      })
      .subscribe();

    const chatChannel = supabase
      .channel('chat-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages' 
      }, (payload) => {
        const newMessage = payload.new as any;
        const chatMessage: ChatMessage = {
          id: newMessage.id,
          message: newMessage.message,
          user_name: newMessage.user_name,
          user_role: newMessage.user_role as 'teacher' | 'student',
          created_at: newMessage.created_at
        };
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: chatMessage });
      })
      .subscribe();

    const participantsChannel = supabase
      .channel('participants-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'participants' 
      }, () => {
        refreshParticipants();
      })
      .subscribe();

    // Load initial data
    loadChatMessages();
    loadPollHistory();
    refreshParticipants();
    checkActivePoll();

    dispatch({ type: 'SET_CONNECTION', payload: true });

    return () => {
      supabase.removeChannel(pollsChannel);
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, []);

  const joinAsUser = async (name: string, role: 'teacher' | 'student') => {
    const userId = Date.now().toString();
    const user: User = { id: userId, name, role };
    
    // Add to participants table
    await supabase
      .from('participants')
      .insert({
        id: userId,
        name,
        role,
        is_active: true
      });
    
    dispatch({ type: 'SET_USER', payload: user });
    toast({ description: `Joined as ${role}` });
  };

  const createPoll = async (question: string, options: string[], timeLimit = 60) => {
    if (state.user?.role !== 'teacher') return;
    
    const pollData = {
      question,
      options: options.map((text, index) => ({
        id: index.toString(),
        text,
        votes: 0,
        voters: []
      })),
      time_limit: timeLimit,
      is_active: true,
      created_by: state.user.id,
      total_votes: 0
    };

    await supabase
      .from('polls')
      .insert(pollData);

    toast({ description: 'Poll created successfully!' });
  };

  const vote = async (optionId: string) => {
    if (!state.currentPoll || !state.user || state.hasVoted) return;
    
    const { error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: state.currentPoll.id,
        user_id: state.user.id,
        option_id: optionId
      });

    if (!error) {
      dispatch({ type: 'SET_VOTE', payload: { hasVoted: true, vote: optionId } });
      toast({ description: 'Vote submitted successfully!' });
    }
  };

  const endPoll = async () => {
    if (!state.currentPoll) return;
    
    await supabase
      .from('polls')
      .update({ 
        is_active: false, 
        ended_at: new Date().toISOString() 
      })
      .eq('id', state.currentPoll.id);

    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }

    dispatch({ type: 'SET_POLL', payload: null });
    loadPollHistory();
  };

  const kickUser = async (userId: string) => {
    if (state.user?.role !== 'teacher') return;
    
    await supabase
      .from('participants')
      .update({ is_active: false })
      .eq('id', userId);
  };

  const getPollHistory = async () => {
    await loadPollHistory();
  };

  const sendChatMessage = async (message: string) => {
    if (!state.user) return;

    await supabase
      .from('chat_messages')
      .insert({
        message,
        user_name: state.user.name,
        user_role: state.user.role
      });
  };

  const disconnect = () => {
    if (state.user) {
      supabase
        .from('participants')
        .update({ is_active: false })
        .eq('id', state.user.id);
    }
    
    dispatch({ type: 'RESET_STATE' });
  };

  return (
    <PollingContext.Provider value={{
      state,
      joinAsUser,
      createPoll,
      vote,
      endPoll,
      kickUser,
      getPollHistory,
      sendChatMessage,
      disconnect
    }}>
      {children}
    </PollingContext.Provider>
  );
}

export function useSupabasePolling() {
  const context = useContext(PollingContext);
  if (context === undefined) {
    throw new Error('useSupabasePolling must be used within a SupabasePollingProvider');
  }
  return context;
}