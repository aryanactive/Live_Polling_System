import { useState } from 'react';
import { usePolling } from '@/contexts/PollingContext';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { UserSetup } from '@/components/UserSetup';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';
import { KickedOut } from '@/components/KickedOut';

type AppState = 'welcome' | 'setup' | 'dashboard' | 'kicked';

const Index = () => {
  const { state, joinAsUser } = usePolling();
  const [appState, setAppState] = useState<AppState>('welcome');
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setSelectedRole(role);
    setAppState('setup');
  };

  const handleUserSetupComplete = (name: string) => {
    if (selectedRole) {
      joinAsUser(name, selectedRole);
      setAppState('dashboard');
    }
  };

  // Handle different app states
  switch (appState) {
    case 'welcome':
      return <WelcomeScreen onRoleSelect={handleRoleSelect} />;
    
    case 'setup':
      return (
        <UserSetup 
          role={selectedRole!} 
          onComplete={handleUserSetupComplete} 
        />
      );
    
    case 'dashboard':
      if (state.user?.role === 'teacher') {
        return <TeacherDashboard />;
      } else {
        return <StudentDashboard />;
      }
    
    case 'kicked':
      return <KickedOut />;
    
    default:
      return <WelcomeScreen onRoleSelect={handleRoleSelect} />;
  }
};

export default Index;
