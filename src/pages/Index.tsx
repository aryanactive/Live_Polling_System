import { useState } from 'react';
import { useSupabasePolling } from '@/contexts/SupabasePollingContext';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { UserSetup } from '@/components/UserSetup';
import { EnhancedTeacherDashboard } from '@/components/EnhancedTeacherDashboard';
import { EnhancedStudentDashboard } from '@/components/EnhancedStudentDashboard';
import { KickedOut } from '@/components/KickedOut';

type AppState = 'welcome' | 'setup' | 'dashboard' | 'kicked';

const Index = () => {
  const { state, joinAsUser } = useSupabasePolling();
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
        return <EnhancedTeacherDashboard />;
      } else {
        return <EnhancedStudentDashboard />;
      }
    
    case 'kicked':
      return <KickedOut />;
    
    default:
      return <WelcomeScreen onRoleSelect={handleRoleSelect} />;
  }
};

export default Index;
