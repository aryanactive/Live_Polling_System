import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
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
}

type PollingAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_POLL'; payload: Poll | null }
  | { type: 'SET_POLL_HISTORY'; payload: PollResult[] }
  | { type: 'SET_PARTICIPANTS'; payload: User[] }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'SET_CONNECTION'; payload: boolean }
  | { type: 'SET_VOTE'; payload: { hasVoted: boolean; vote: string | null } }
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
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

interface PollingContextType {
  state: PollingState;
  socket: Socket | null;
  joinAsUser: (name: string, role: 'teacher' | 'student') => void;
  createPoll: (question: string, options: string[], timeLimit?: number) => void;
  vote: (optionId: string) => void;
  endPoll: () => void;
  kickUser: (userId: string) => void;
  getPollHistory: () => void;
  disconnect: () => void;
}

const PollingContext = createContext<PollingContextType | undefined>(undefined);

export function PollingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(pollingReducer, initialState);
  const [socket, setSocket] = React.useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    // Note: In a real implementation, this would connect to your backend
    // For demo purposes, we'll simulate the socket connection
    const mockSocket = {
      emit: (event: string, data?: any) => {
        console.log('Mock socket emit:', event, data);
        // Simulate socket responses for demo
        if (event === 'user:join') {
          setTimeout(() => {
            dispatch({ type: 'SET_CONNECTION', payload: true });
            toast({ description: `Joined as ${data.role}` });
          }, 500);
        }
      },
      on: (event: string, handler: Function) => {
        console.log('Mock socket listener:', event);
      },
      disconnect: () => {
        console.log('Mock socket disconnect');
        dispatch({ type: 'SET_CONNECTION', payload: false });
      }
    } as any;

    setSocket(mockSocket);
    
    return () => {
      mockSocket?.disconnect();
    };
  }, []);

  const joinAsUser = (name: string, role: 'teacher' | 'student') => {
    const user: User = {
      id: Date.now().toString(),
      name,
      role
    };
    
    dispatch({ type: 'SET_USER', payload: user });
    socket?.emit('user:join', user);
  };

  const createPoll = (question: string, options: string[], timeLimit = 60) => {
    if (state.user?.role !== 'teacher') return;
    
    const poll: Poll = {
      id: Date.now().toString(),
      question,
      options: options.map((text, index) => ({
        id: index.toString(),
        text,
        votes: 0,
        voters: []
      })),
      isActive: true,
      timeLimit,
      createdAt: new Date(),
      totalVotes: 0
    };

    dispatch({ type: 'SET_POLL', payload: poll });
    socket?.emit('poll:created', poll);
    
    // Start timer
    let timeLeft = timeLimit;
    const timer = setInterval(() => {
      timeLeft--;
      dispatch({ type: 'SET_TIME_REMAINING', payload: timeLeft });
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        endPoll();
      }
    }, 1000);
  };

  const vote = (optionId: string) => {
    if (!state.currentPoll || !state.user || state.hasVoted) return;
    
    const updatedPoll = {
      ...state.currentPoll,
      options: state.currentPoll.options.map(option => {
        if (option.id === optionId) {
          return {
            ...option,
            votes: option.votes + 1,
            voters: [...option.voters, state.user!.id]
          };
        }
        return option;
      }),
      totalVotes: state.currentPoll.totalVotes + 1
    };

    dispatch({ type: 'SET_POLL', payload: updatedPoll });
    dispatch({ type: 'SET_VOTE', payload: { hasVoted: true, vote: optionId } });
    
    socket?.emit('poll:vote', {
      pollId: state.currentPoll.id,
      optionId,
      userId: state.user.id
    });

    toast({ description: 'Vote submitted successfully!' });
  };

  const endPoll = () => {
    if (!state.currentPoll) return;
    
    const pollResult: PollResult = {
      pollId: state.currentPoll.id,
      question: state.currentPoll.question,
      options: state.currentPoll.options.map(option => ({
        text: option.text,
        votes: option.votes,
        percentage: state.currentPoll!.totalVotes > 0 ? 
          Math.round((option.votes / state.currentPoll!.totalVotes) * 100) : 0
      })),
      totalVotes: state.currentPoll.totalVotes,
      createdAt: state.currentPoll.createdAt
    };

    dispatch({ type: 'SET_POLL_HISTORY', payload: [...state.pollHistory, pollResult] });
    dispatch({ type: 'SET_POLL', payload: null });
    
    socket?.emit('poll:ended', pollResult);
  };

  const kickUser = (userId: string) => {
    if (state.user?.role !== 'teacher') return;
    socket?.emit('user:kicked', userId);
  };

  const getPollHistory = () => {
    // In real implementation, this would fetch from backend
    return state.pollHistory;
  };

  const disconnect = () => {
    socket?.disconnect();
    dispatch({ type: 'RESET_STATE' });
  };

  return (
    <PollingContext.Provider value={{
      state,
      socket,
      joinAsUser,
      createPoll,
      vote,
      endPoll,
      kickUser,
      getPollHistory,
      disconnect
    }}>
      {children}
    </PollingContext.Provider>
  );
}

export function usePolling() {
  const context = useContext(PollingContext);
  if (context === undefined) {
    throw new Error('usePolling must be used within a PollingProvider');
  }
  return context;
}