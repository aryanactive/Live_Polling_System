import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface UserSetupProps {
  role: 'teacher' | 'student';
  onComplete: (name: string) => void;
}

export function UserSetup({ role, onComplete }: UserSetupProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  const isStudent = role === 'student';

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
            Intervue.io
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            Let's Get Started
          </h1>
          <p className="text-white/80 text-sm">
            {isStudent 
              ? "If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates" 
              : "You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time"
            }
          </p>
        </div>

        <Card className="card-gradient border-0 shadow-modal">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isStudent ? "Let's Get Started" : "Enter your question"}
            </CardTitle>
            <CardDescription>
              {isStudent ? "Enter your Name" : "50 seconds"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {isStudent ? "Enter your Name" : "Enter your question"}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={isStudent ? "Rahul Bajaj" : "Enter your question here..."}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-center"
                  autoFocus
                />
              </div>

              <Button 
                type="submit"
                variant="poll" 
                size="lg" 
                className="w-full"
                disabled={!name.trim()}
              >
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}