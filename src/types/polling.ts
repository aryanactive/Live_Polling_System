export interface User {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  socketId?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  timeLimit: number; // in seconds
  createdAt: Date;
  endedAt?: Date;
  totalVotes: number;
}

export interface PollResult {
  pollId: string;
  question: string;
  options: Array<{
    text: string;
    votes: number;
    percentage: number;
  }>;
  totalVotes: number;
  createdAt: Date;
}

export interface SocketEvents {
  // User events
  'user:join': (user: User) => void;
  'user:leave': (userId: string) => void;
  'user:kicked': (userId: string) => void;
  
  // Poll events
  'poll:created': (poll: Poll) => void;
  'poll:updated': (poll: Poll) => void;
  'poll:ended': (pollResult: PollResult) => void;
  'poll:vote': (vote: { pollId: string; optionId: string; userId: string }) => void;
  
  // System events
  'participants:updated': (participants: User[]) => void;
  'timer:updated': (timeRemaining: number) => void;
  'error': (error: string) => void;
}