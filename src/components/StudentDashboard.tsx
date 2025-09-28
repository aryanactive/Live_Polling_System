import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, Users, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePolling } from '@/contexts/PollingContext';
import { PollResults } from './PollResults';

export function StudentDashboard() {
  const { state, vote } = usePolling();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // If no poll is active, show waiting state
  if (!state.currentPoll) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge variant="secondary" className="mb-4">
            Intervue.io
          </Badge>
          
          <Card className="card-gradient max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <RotateCcw className="h-12 w-12 text-primary mx-auto" />
              </motion.div>
              <h2 className="text-xl font-semibold mb-2">
                Wait for the teacher to ask questions..
              </h2>
              <p className="text-muted-foreground text-sm">
                You'll be able to participate once a poll is started
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // If student has voted, show results
  if (state.hasVoted) {
    return <PollResults poll={state.currentPoll} userVote={state.userVote} />;
  }

  const handleVote = () => {
    if (selectedOption) {
      vote(selectedOption);
    }
  };

  const timePercentage = state.currentPoll.timeLimit > 0 
    ? ((state.currentPoll.timeLimit - state.timeRemaining) / state.currentPoll.timeLimit) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Intervue.io
          </Badge>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{state.participants.length}</span>
            </Badge>
          </div>
        </div>

        {/* Question Card */}
        <Card className="card-gradient mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-sm font-medium">Question 1</span>
              <Badge variant="destructive" className="text-xs">
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
              <Progress value={timePercentage} className="h-2" />
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
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setSelectedOption(option.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedOption === option.id 
                          ? 'bg-white text-primary' 
                          : 'bg-primary text-white'
                      }`}>
                        <span className="text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <span className="text-left">{option.text}</span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Submit Button */}
            <Button 
              variant="poll" 
              size="lg" 
              className="w-full mt-6"
              disabled={!selectedOption}
              onClick={handleVote}
            >
              Submit
            </Button>
          </CardContent>
        </Card>

        {/* Info Text */}
        <p className="text-center text-sm text-muted-foreground">
          Select your answer and submit before time runs out
        </p>
      </div>
    </div>
  );
}