import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Poll } from '@/types/polling';
import { usePolling } from '@/contexts/PollingContext';

interface PollResultsProps {
  poll: Poll;
  onEndPoll?: () => void;
  userVote?: string | null;
}

export function PollResults({ poll, onEndPoll, userVote }: PollResultsProps) {
  const { state } = usePolling();
  const isTeacher = state.user?.role === 'teacher';

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Intervue.io
          </Badge>
          {!isTeacher && (
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{state.participants.length}</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Question Header */}
        <Card className="card-gradient mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Question 1</span>
                <Badge variant="destructive" className="text-xs">
                  00:{state.timeRemaining.toString().padStart(2, '0')}
                </Badge>
              </div>
              {isTeacher && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Chat
                  </Button>
                  <Button variant="outline" size="sm">
                    Participants
                  </Button>
                </div>
              )}
            </div>
            <CardTitle className="text-xl">{poll.question}</CardTitle>
            {isTeacher && (
              <CardDescription>
                Live polling results - updates in real-time
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Poll Options Results */}
          <div className="lg:col-span-2">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Live Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {poll.options.map((option, index) => {
                  const percentage = getPercentage(option.votes);
                  const isUserVote = userVote === option.id;
                  
                  return (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${
                        isUserVote 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isUserVote ? 'bg-primary text-white' : 'bg-muted text-foreground'
                          }`}>
                            <span className="text-sm font-medium">
                              {getOptionLetter(index)}
                            </span>
                          </div>
                          <span className="font-medium">{option.text}</span>
                          {isUserVote && (
                            <Badge variant="default" className="text-xs">
                              Your answer
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{percentage}%</div>
                          <div className="text-sm text-muted-foreground">{option.votes} votes</div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full poll-bar"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          style={{ '--poll-width': `${percentage}%` } as any}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Participants Panel */}
          {isTeacher && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Participants</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.participants.slice(0, 6).map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {participant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm">{participant.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Kick out
                        </Button>
                      </div>
                    ))}
                    {state.participants.length > 6 && (
                      <div className="text-center text-sm text-muted-foreground pt-2">
                        +{state.participants.length - 6} more participants
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Poll Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Responses</span>
                    <span className="font-medium">{poll.totalVotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Response Rate</span>
                    <span className="font-medium">
                      {state.participants.length > 0 
                        ? Math.round((poll.totalVotes / state.participants.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time Elapsed</span>
                    <span className="font-medium">
                      {Math.floor((poll.timeLimit - state.timeRemaining) / 60)}:
                      {((poll.timeLimit - state.timeRemaining) % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          {isTeacher ? (
            <>
              <Button variant="poll" onClick={onEndPoll}>
                <Plus className="h-4 w-4 mr-2" />
                Ask a new question
              </Button>
              <Button variant="outline">
                View Poll History
              </Button>
            </>
          ) : (
            <p className="text-center text-muted-foreground">
              Wait for the teacher to ask a new question.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}