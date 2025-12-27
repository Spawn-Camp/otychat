import { useState, useEffect } from 'react';
import { SocketProvider, useSocket } from '../contexts/SocketContext';
import JoinScreen from './components/JoinScreen';
import MainApp from './components/MainApp';

function AppContent() {
  const { user, onlineCount, join } = useSocket();
  const [attemptedAutoJoin, setAttemptedAutoJoin] = useState(false);

  useEffect(() => {
    // Check localStorage for existing username
    const savedUsername = localStorage.getItem('otychat_username');
    if (savedUsername && !attemptedAutoJoin) {
      setAttemptedAutoJoin(true);
      join(savedUsername);
    }
  }, [join, attemptedAutoJoin]);

  const handleJoin = (name: string) => {
    localStorage.setItem('otychat_username', name);
    join(name);
  };

  if (!user) {
    return <JoinScreen onJoin={handleJoin} onlineCount={onlineCount} />;
  }

  return <MainApp username={user.odName} />;
}

export default function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}
