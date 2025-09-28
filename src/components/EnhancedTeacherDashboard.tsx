import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Timer, Users, Plus, BarChart3, History, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSupabasePolling } from '@/contexts/SupabasePollingContext';
import { PollResults } from './PollResults';
import { PollHistory } from './PollHistory';
import { ChatInterface } from './ChatInterface';

export function EnhancedTeacherDashboard() {
  const { state, createPoll, endPoll } = useSupabasePolling();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);

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

  const handleCreatePoll = async () => {
    if (question.trim() && options.every(opt => opt.trim())) {
      await createPoll(question.trim(), options.filter(opt => opt.trim()), timeLimit);
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
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <Badge variant="secondary" className="mb-2">
              Intervue.io
            </Badge>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Let's Get Started
            </h1>
            <p className="text-muted-foreground">
              You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowHistory(true)}>
              <History className="h-4 w-4 mr-2" />
              View Poll History
            </Button>
            <Button variant="outline" onClick={() => setShowChat(true)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat ({state.chatMessages.length})
            </Button>
          </div>
        </motion.div>

        {/* Create Poll Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-gradient mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Create New Poll</span>
              </CardTitle>
              <CardDescription>
                Create engaging polls for your students with real-time results
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
                  className="min-h-[80px] transition-all focus:ring-2 focus:ring-primary"
                />
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{question.length}/200 characters</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4" />
                      <Input
                        type="number"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
                        className="w-20"
                        min="10"
                        max="300"
                      />
                      <span>seconds</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Edit Options</Label>
                  <span className="text-sm text-muted-foreground">Add up to 6 options</span>
                </div>
                
                {options.map((option, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-button">
                      <span className="text-white text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <Input
                      placeholder={index === 0 ? "Mars" : index === 1 ? "Venus" : `Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 transition-all focus:ring-2 focus:ring-primary"
                    />
                    {options.length > 2 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    )}
                  </motion.div>
                ))}
                
                <Button 
                  variant="outline" 
                  onClick={addOption}
                  className="w-full transition-all hover:border-primary"
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
        </motion.div>

        {/* Participants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Participants ({state.participants.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.participants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Waiting for students to join...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.participants.map((participant, index) => (
                    <motion.div 
                      key={participant.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <span className="font-medium">{participant.name}</span>
                      <Badge variant={participant.role === 'teacher' ? 'default' : 'secondary'}>
                        {participant.role}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chat Interface */}
      <ChatInterface isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
}