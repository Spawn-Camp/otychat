import { useState, useEffect } from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import ProfilePicSelector from '../ProfilePicSelector';
import Settings from '../Settings';
import ProfileEditor from '../ProfileEditor';
import Achievements from '../Achievements';

interface MeTabProps {
  username: string;
  onThemeChange?: (theme: string) => void;
  currentTheme?: string;
}

type SubPage = 'settings' | 'profilePic' | 'profileEditor' | 'achievements' | null;

export default function MeTab({ username, onThemeChange, currentTheme }: MeTabProps) {
  const {
    user,
    caughtPokemon,
    logDrink,
    updateProfile
  } = useSocket();

  const [currentPage, setCurrentPage] = useState<SubPage>(null);
  const [profilePic, setProfilePic] = useState(user?.odProfilePic || '👤');
  const [status, setStatus] = useState(user?.odStatus || '');
  const [title, setTitle] = useState(user?.odTitle || 'Newcomer');

  // Sync local state with user data from socket context
  useEffect(() => {
    if (user?.odProfilePic) setProfilePic(user.odProfilePic);
    if (user?.odStatus !== undefined) setStatus(user.odStatus);
    if (user?.odTitle) setTitle(user.odTitle);
  }, [user?.odProfilePic, user?.odStatus, user?.odTitle]);

  const handleLogDrink = () => {
    logDrink();
    const btn = document.activeElement as HTMLButtonElement;
    if (btn) {
      btn.style.transform = 'scale(1.15) rotate(-8deg)';
      setTimeout(() => {
        btn.style.transform = 'scale(1) rotate(0deg)';
      }, 300);
    }
  };

  const handleProfilePicChange = (pic: string) => {
    setProfilePic(pic);
    updateProfile({ profilePic: pic });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateProfile({ status: newStatus });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateProfile({ title: newTitle });
  };

  // Get unique Pokemon count
  const uniquePokemonIds = new Set(caughtPokemon.map(p => p.odPokemonId));
  const pokemonCaught = uniquePokemonIds.size;

  if (currentPage === 'settings') {
    return (
      <Settings
        onBack={() => setCurrentPage(null)}
        onThemeChange={onThemeChange}
        currentTheme={currentTheme}
        profilePic={profilePic}
        onProfilePicChange={handleProfilePicChange}
        status={status}
        onStatusChange={handleStatusChange}
      />
    );
  }

  if (currentPage === 'profilePic') {
    return (
      <ProfilePicSelector
        onBack={() => setCurrentPage(null)}
        onSelect={(pic) => {
          handleProfilePicChange(pic);
          setCurrentPage(null);
        }}
        currentPic={profilePic}
      />
    );
  }

  if (currentPage === 'profileEditor') {
    return (
      <ProfileEditor
        onBack={() => setCurrentPage(null)}
        profilePic={profilePic}
        onProfilePicChange={handleProfilePicChange}
        status={status}
        onStatusChange={handleStatusChange}
        title={title}
        onTitleChange={handleTitleChange}
        username={username}
      />
    );
  }

  if (currentPage === 'achievements') {
    return (
      <Achievements
        onBack={() => setCurrentPage(null)}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Profile Header */}
      <div className="p-5 rounded-3xl" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(236, 72, 153, 0.2)'
      }}>
        <div className="flex items-start gap-4">
          {/* Profile Pic */}
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl overflow-hidden" style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
          }}>
            {profilePic.startsWith('data:') || profilePic.startsWith('http') ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{profilePic}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '20px',
              color: 'var(--text)',
              fontWeight: '700'
            }}>
              {username}
            </h2>
            {status && (
              <p className="mt-1" style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                fontStyle: 'italic'
              }}>
                {status}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">🪙</span>
              <span style={{
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '18px',
                color: '#fbbf24',
                fontWeight: '700'
              }}>
                {user?.odCoins || 0}
              </span>
              <span style={{
                fontSize: '14px',
                color: 'var(--text-muted)'
              }}>
                coins
              </span>
            </div>
            <p className="mt-2 px-3 py-1 inline-block rounded-full" style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              color: 'white',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {title}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Button */}
      <button
        onClick={() => setCurrentPage('profileEditor')}
        className="w-full p-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-102 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          color: 'white',
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '16px',
          fontWeight: '700',
          border: 'none',
          boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)'
        }}
      >
        <span className="text-2xl">✏️</span>
        Edit Profile
      </button>

      {/* Stats */}
      <div className="p-5 rounded-3xl" style={{
        background: 'white',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
      }}>
        <h3 className="mb-4" style={{
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '16px',
          color: 'var(--text)',
          fontWeight: '700'
        }}>
          📊 My Stats
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="🔥" label="Reactions" value={user?.odReactions || 0} color="linear-gradient(135deg, #f97316 0%, #fbbf24 100%)" />
          <StatCard icon="❓" label="Questions" value={user?.odQuestions || 0} color="linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)" />
          <StatCard icon="🍺" label="Drinks" value={user?.odDrinksTotal || 0} color="linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" />
          <StatCard icon="🎨" label="Drawings" value={user?.odDrawings || 0} color="linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)" />
        </div>

        <div className="mt-4 p-4 rounded-2xl" style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white'
        }}>
          <div className="flex items-center justify-between">
            <span style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              🎮 Pokémon Caught
            </span>
            <span style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              {pokemonCaught}/386
            </span>
          </div>
        </div>

        <button
          className="w-full mt-3 px-4 py-3 transition-all transform hover:scale-105"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            color: 'var(--text)'
          }}
        >
          🏆 View Leaderboards
        </button>
      </div>

      {/* Drink Logger */}
      <div className="p-5 rounded-3xl" style={{
        background: 'white',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
      }}>
        <h3 className="mb-4" style={{
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '16px',
          color: 'var(--text)',
          fontWeight: '700'
        }}>
          🍺 Log a Drink
        </h3>

        <button
          onClick={handleLogDrink}
          className="w-full py-8 mb-4 transition-all transform hover:scale-105 active:scale-110"
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            borderRadius: '24px',
            color: 'white',
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '24px',
            fontWeight: '700',
            boxShadow: '0 8px 24px rgba(251, 191, 36, 0.4)',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          🍻 CHEERS!
        </button>

        <div className="flex justify-around">
          <div className="text-center">
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '14px',
              marginBottom: '4px'
            }}>
              Tonight
            </p>
            <p style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '28px',
              color: '#fbbf24',
              fontWeight: '700'
            }}>
              {user?.odDrinksTonight || 0}
            </p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div className="text-center">
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '14px',
              marginBottom: '4px'
            }}>
              All-time
            </p>
            <p style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '28px',
              color: '#fbbf24',
              fontWeight: '700'
            }}>
              {user?.odDrinksTotal || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <NavButton
          icon="📷"
          label="Profile Pic"
          color="linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)"
          onClick={() => setCurrentPage('profilePic')}
        />
        <NavButton
          icon="🏆"
          label="Achievements"
          color="linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
          onClick={() => setCurrentPage('achievements')}
        />
        <NavButton
          icon="⚙️"
          label="Settings"
          color="linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
          onClick={() => setCurrentPage('settings')}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="p-4 rounded-2xl" style={{
      background: color,
      color: 'white'
    }}>
      <div className="text-2xl mb-1">{icon}</div>
      <div style={{
        fontSize: '12px',
        opacity: 0.9,
        marginBottom: '4px'
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '24px',
        fontWeight: '700'
      }}>
        {value}
      </div>
    </div>
  );
}

interface NavButtonProps {
  icon: string;
  label: string;
  color: string;
  onClick: () => void;
}

function NavButton({ icon, label, color, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-5 rounded-2xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
      style={{
        background: color,
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
      }}
    >
      <span className="text-3xl">{icon}</span>
      <span style={{
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        fontWeight: '700'
      }}>
        {label}
      </span>
    </button>
  );
}
