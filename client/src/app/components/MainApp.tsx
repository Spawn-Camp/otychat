import { useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import ReactTab from './tabs/ReactTab';
import DMsTab from './tabs/DMsTab';
import FeedTab from './tabs/FeedTab';
import MeTab from './tabs/MeTab';
import PokemonTab from './tabs/PokemonTab';
import AnimatedBackground from './AnimatedBackground';
import NotificationPrompt from './NotificationPrompt';

type Tab = 'feed' | 'react' | 'pokemon' | 'dms' | 'me';

interface MainAppProps {
  username: string;
}

export default function MainApp({ username }: MainAppProps) {
  const { unreadDMCount, user } = useSocket();
  const profilePic = user?.odProfilePic || '👤';
  const userId = user?.id || null;
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [backgroundTheme, setBackgroundTheme] = useState<'waves' | 'zigzag' | 'dots' | 'bubbles' | 'gradient'>('gradient');

  const handleThemeChange = (newTheme: 'waves' | 'zigzag' | 'dots' | 'bubbles' | 'gradient') => {
    console.log('Theme changing to:', newTheme);
    setBackgroundTheme(newTheme);
  };

  return (
    <div className="h-screen flex flex-col relative" style={{
      color: 'var(--text)',
      fontFamily: 'Nunito, sans-serif'
    }}>
      {/* Animated Background */}
      <AnimatedBackground pattern={backgroundTheme} />

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pb-12 relative z-10">
        {activeTab === 'feed' && <FeedTab />}
        {activeTab === 'react' && <ReactTab username={username} />}
        {activeTab === 'pokemon' && <PokemonTab />}
        {activeTab === 'dms' && <DMsTab username={username} />}
        {activeTab === 'me' && (
          <MeTab
            username={username}
            onThemeChange={handleThemeChange}
            currentTheme={backgroundTheme}
          />
        )}
      </div>

      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 flex p-1 gap-1 z-20" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <TabButton
          icon="📊"
          label="Feed"
          active={activeTab === 'feed'}
          onClick={() => setActiveTab('feed')}
        />
        <TabButton
          icon="🎭"
          label="React"
          active={activeTab === 'react'}
          onClick={() => setActiveTab('react')}
        />
        <TabButton
          icon="⚡"
          label="Pokémon"
          active={activeTab === 'pokemon'}
          onClick={() => setActiveTab('pokemon')}
        />
        <TabButton
          icon="💬"
          label="DMs"
          active={activeTab === 'dms'}
          badge={unreadDMCount > 0 ? unreadDMCount : undefined}
          onClick={() => setActiveTab('dms')}
        />
        <TabButton
          icon={profilePic}
          label="Me"
          active={activeTab === 'me'}
          onClick={() => setActiveTab('me')}
          isProfilePic
        />
      </div>

      {/* Push Notification Prompt */}
      <NotificationPrompt userId={userId} />
    </div>
  );
}

interface TabButtonProps {
  icon: string;
  label: string;
  active: boolean;
  badge?: number;
  isProfilePic?: boolean;
  onClick: () => void;
}

function TabButton({ icon, label, active, badge, isProfilePic, onClick }: TabButtonProps) {
  const isImageUrl = icon.startsWith('data:') || icon.startsWith('http');

  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-all transform hover:scale-105 active:scale-95"
      style={{
        background: active
          ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
          : 'transparent',
        color: active ? 'white' : 'var(--text-muted)',
        borderRadius: '12px',
        boxShadow: active ? '0 4px 12px rgba(236, 72, 153, 0.3)' : 'none'
      }}
    >
      {isProfilePic && isImageUrl ? (
        <div
          className="w-6 h-6 rounded-full overflow-hidden"
          style={{
            border: active ? '2px solid white' : '2px solid var(--text-muted)',
            boxShadow: active ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
          }}
        >
          <img src={icon} alt="Profile" className="w-full h-full object-cover" />
        </div>
      ) : (
        <span className="text-lg">{icon}</span>
      )}
      <span style={{
        fontFamily: 'Fredoka, sans-serif',
        fontWeight: '600',
        fontSize: '10px'
      }}>
        {label}
      </span>
      {badge && (
        <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs" style={{
          background: 'var(--danger)',
          color: 'white',
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '10px',
          fontWeight: '700',
          minWidth: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}