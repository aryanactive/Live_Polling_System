import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSupabasePolling } from '@/contexts/SupabasePollingContext';

interface PollHistoryProps {
  onBack: () => void;
}

export function PollHistory({ onBack }: PollHistoryProps) {
  const { state } = useSupabasePolling();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <Badge variant="secondary" className="mb-2">
                Intervue.io
              </Badge>
              <h1 className="text-2xl font-bold">View Poll History</h1>
              <p className="text-muted-foreground">
                Review past polls and their results
              </p>
            </div>
          </div>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Poll History
          </Button>
        </div>

        {/* Poll History */}
        <div className="space-y-6">
          {state.pollHistory.length === 0 ? (
            <Card className="card-gradient">
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Poll History</h3>
                <p className="text-muted-foreground">
                  Create your first poll to see results here
                </p>
              </CardContent>
            </Card>
          ) : (
            state.pollHistory.map((poll, pollIndex) => (
              <motion.div
                key={poll.pollId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pollIndex * 0.1 }}
              >
                <Card className="card-gradient">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>Question {pollIndex + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {poll.totalVotes} responses
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {poll.question}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(poll.createdAt)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {poll.options.map((option, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {getOptionLetter(index)}
                              </span>
                            </div>
                            <span className="font-medium">{option.text}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 bg-background rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full poll-bar"
                                style={{ width: `${option.percentage}%` }}
                              />
                            </div>
                            <div className="text-right min-w-[60px]">
                              <div className="font-bold">{option.percentage}%</div>
                              <div className="text-xs text-muted-foreground">{option.votes} votes</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Poll Summary */}
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Responses:</span>
                        <span className="font-medium">{poll.totalVotes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Sample Data for Demo */}
        {state.pollHistory.length === 0 && (
          <div className="space-y-6 mt-8">
            <h3 className="text-lg font-semibold text-center text-muted-foreground mb-6">
              Sample Poll History (Demo)
            </h3>
            
            {/* Sample Poll 1 */}
            <Card className="card-gradient">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>Question 1</span>
                      <Badge variant="outline" className="text-xs">
                        8 responses
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Which planet is known as the Red Planet?
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Sep 28, 2:30 PM</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { text: "Mars", percentage: 75, votes: 6 },
                    { text: "Venus", percentage: 12, votes: 1 },
                    { text: "Jupiter", percentage: 13, votes: 1 },
                    { text: "Saturn", percentage: 0, votes: 0 }
                  ].map((option, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {getOptionLetter(index)}
                          </span>
                        </div>
                        <span className="font-medium">{option.text}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-background rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full poll-bar"
                            style={{ width: `${option.percentage}%` }}
                          />
                        </div>
                        <div className="text-right min-w-[60px]">
                          <div className="font-bold">{option.percentage}%</div>
                          <div className="text-xs text-muted-foreground">{option.votes} votes</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Responses:</span>
                    <span className="font-medium">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Poll 2 */}
            <Card className="card-gradient">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>Question 2</span>
                      <Badge variant="outline" className="text-xs">
                        5 responses
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      What is the capital of France?
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Sep 28, 2:25 PM</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { text: "Paris", percentage: 100, votes: 5 },
                    { text: "London", percentage: 0, votes: 0 },
                    { text: "Berlin", percentage: 0, votes: 0 }
                  ].map((option, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {getOptionLetter(index)}
                          </span>
                        </div>
                        <span className="font-medium">{option.text}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-background rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full poll-bar"
                            style={{ width: `${option.percentage}%` }}
                          />
                        </div>
                        <div className="text-right min-w-[60px]">
                          <div className="font-bold">{option.percentage}%</div>
                          <div className="text-xs text-muted-foreground">{option.votes} votes</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Responses:</span>
                    <span className="font-medium">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}