import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onRoleSelect: (role: 'teacher' | 'student') => void;
}

export function WelcomeScreen({ onRoleSelect }: WelcomeScreenProps) {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

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
            Welcome to the Live Polling System
          </h1>
          <p className="text-white/80 text-sm">
            Please select the role that best describes you to begin using the live polling system
          </p>
        </div>

        <Card className="card-gradient border-0 shadow-modal">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Choose Your Role</CardTitle>
            <CardDescription>
              Select your role to get started with the polling system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 ${
                  selectedRole === 'student' 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleRoleSelect('student')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">I'm a Student</h3>
                      <p className="text-sm text-muted-foreground">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 ${
                  selectedRole === 'teacher' 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleRoleSelect('teacher')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">I'm a Teacher</h3>
                      <p className="text-sm text-muted-foreground">
                        Submit answers and view live poll results in real-time
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Button 
              variant="poll" 
              size="lg" 
              className="w-full"
              disabled={!selectedRole}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}