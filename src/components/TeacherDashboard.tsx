import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Timer, Users, Plus, BarChart3, History, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePolling } from '@/contexts/PollingContext';
import { PollResults } from './PollResults';
import { PollHistory } from './PollHistory';

export function TeacherDashboard() {
  const { state, createPoll, endPoll } = usePolling();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [showHistory, setShowHistory] = useState(false);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleCreatePoll = () => {
    if (question.trim() && options.every(opt => opt.trim())) {
      createPoll(question.trim(), options.filter(opt => opt.trim()), timeLimit);
      setQuestion('');
      setOptions(['', '']);
    }
  };

  const canCreatePoll = !state.currentPoll && question.trim() && options.filter(opt => opt.trim()).length >= 2;

  if (showHistory) {
    return <PollHistory onBack={() => setShowHistory(false)} />;
  }

  if (state.currentPoll) {
    return <PollResults poll={state.currentPoll} onEndPoll={endPoll} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="secondary" className="mb-2">
              Intervue.io
            </Badge>
            <h1 className="text-2xl font-bold">Let's Get Started</h1>
            <p className="text-muted-foreground">
              You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowHistory(true)}>
              <History className="h-4 w-4 mr-2" />
              View Poll History
            </Button>
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>

        {/* Create Poll Form */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Create New Poll</span>
            </CardTitle>
            <CardDescription>
              Create engaging polls for your students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">Enter your question</Label>
              <Textarea
                id="question"
                placeholder="Which planet is known as the Red Planet?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{question.length}/200 characters</span>
                <div className="flex items-center space-x-2">
                  <Timer className="h-4 w-4" />
                  <span>{timeLimit} seconds</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Edit Options</Label>
                <span className="text-sm text-muted-foreground">Is It Correct?</span>
              </div>
              
              {options.map((option, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <Input
                    placeholder={index === 0 ? "Mars" : index === 1 ? "Venus" : `Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Yes
                    </Button>
                    <Button variant="outline" size="sm">
                      No
                    </Button>
                  </div>
                  {options.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      ×
                    </Button>
                  )}
                </motion.div>
              ))}
              
              <Button 
                variant="outline" 
                onClick={addOption}
                className="w-full"
                disabled={options.length >= 6}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add More Option
              </Button>
            </div>

            <Button 
              variant="poll" 
              size="lg" 
              className="w-full"
              disabled={!canCreatePoll}
              onClick={handleCreatePoll}
            >
              Ask Question
            </Button>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Participants ({state.participants.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.participants.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Waiting for students to join...
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{participant.name}</span>
                    <Badge variant="outline">{participant.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}