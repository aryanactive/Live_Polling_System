import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, Users, RotateCcw, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSupabasePolling } from '@/contexts/SupabasePollingContext';
import { PollResults } from './PollResults';
import { ChatInterface } from './ChatInterface';

export function EnhancedStudentDashboard() {
  const { state, vote } = useSupabasePolling();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  // If no poll is active, show waiting state
  if (!state.currentPoll) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <Badge variant="secondary" className="mb-4">
            Intervue.io
          </Badge>
          
          <Card className="card-gradient">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <RotateCcw className="h-16 w-16 text-primary mx-auto" />
              </motion.div>
              <h2 className="text-xl font-semibold mb-2">
                Wait for the teacher to ask questions..
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                You'll be able to participate once a poll is started
              </p>
              
              <Button variant="outline" onClick={() => setShowChat(true)} className="mb-4">
                <MessageCircle className="h-4 w-4 mr-2" />
                Open Chat ({state.chatMessages.length})
              </Button>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{state.participants.length} participants</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ChatInterface isOpen={showChat} onClose={() => setShowChat(false)} />
        </motion.div>
      </div>
    );
  }

  // If student has voted, show results
  if (state.hasVoted) {
    return <PollResults poll={state.currentPoll} userVote={state.userVote} />;
  }

  const handleVote = async () => {
    if (selectedOption) {
      await vote(selectedOption);
    }
  };

  const timePercentage = state.currentPoll.timeLimit > 0 
    ? ((state.currentPoll.timeLimit - state.timeRemaining) / state.currentPoll.timeLimit) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="secondary" className="mb-4">
            Intervue.io
          </Badge>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{state.participants.length}</span>
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowChat(true)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-gradient mb-6">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-sm font-medium">Live Poll</span>
                <Badge variant="destructive" className="text-xs animate-pulse">
                  00:{state.timeRemaining.toString().padStart(2, '0')}
                </Badge>
              </div>
              <CardTitle className="text-lg">{state.currentPoll.question}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Timer */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Time Remaining</span>
                  <div className="flex items-center space-x-1">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {Math.floor(state.timeRemaining / 60)}:{(state.timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <Progress value={timePercentage} className="h-3" />
              </div>

              {/* Options */}
              <div className="space-y-3">
                {state.currentPoll.options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant={selectedOption === option.id ? "poll-selected" : "poll-option"}
                      className="w-full justify-start h-auto p-4 transition-all hover:scale-[1.02]"
                      onClick={() => setSelectedOption(option.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all ${
                          selectedOption === option.id 
                            ? 'bg-white text-primary shadow-lg scale-110' 
                            : 'bg-primary text-white'
                        }`}>
                          <span className="text-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                        <span className="text-left font-medium">{option.text}</span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  variant="poll" 
                  size="lg" 
                  className="w-full mt-6"
                  disabled={!selectedOption}
                  onClick={handleVote}
                >
                  Submit Answer
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground"
        >
          Select your answer and submit before time runs out
        </motion.p>
      </div>

      {/* Chat Interface */}
      <ChatInterface isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
}