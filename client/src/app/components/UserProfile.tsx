import { useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';

interface UserProfileProps {
  username: string;
  onBack: () => void;
  onDM?: () => void;
}

interface UserData {
  username: string;
  profilePic: string;
  level: number;
  coins: number;
  pokemonCaught: number;
  achievements: number;
  drinkCount: number;
  kudosReceived: number;
  joinedDate: string;
  bio?: string;
  title?: string;
}

// Mock user data - in a real app, this would come from an API
const MOCK_USERS: Record<string, UserData> = {
  'Jake': {
    username: 'Jake',
    profilePic: '👨‍🦰',
    level: 12,
    coins: 450,
    pokemonCaught: 23,
    achievements: 8,
    drinkCount: 7,
    kudosReceived: 42,
    joinedDate: 'Dec 2024',
    title: 'Emoji Lord',
    bio: 'Just here for the memes and drinks 🍺'
  },
  'Sarah': {
    username: 'Sarah',
    profilePic: '👧',
    level: 15,
    coins: 680,
    pokemonCaught: 45,
    achievements: 12,
    drinkCount: 3,
    kudosReceived: 89,
    joinedDate: 'Nov 2024',
    title: 'Pokemon Master',
    bio: 'Gotta catch \'em all! 🎮'
  },
  'Mike': {
    username: 'Mike',
    profilePic: '👨‍🔬',
    level: 8,
    coins: 230,
    pokemonCaught: 12,
    achievements: 5,
    drinkCount: 15,
    kudosReceived: 28,
    joinedDate: 'Dec 2024',
    bio: 'Living my best life 🎉'
  }
};

export default function UserProfile({ username, onBack, onDM }: UserProfileProps) {
  const { sendKudos, user: currentUser } = useSocket();
  const [showKudosModal, setShowKudosModal] = useState(false);
  const [kudosMessage, setKudosMessage] = useState('');
  const [kudosSent, setKudosSent] = useState(false);

  const user = MOCK_USERS[username] || {
    username,
    profilePic: '👤',
    level: 1,
    coins: 0,
    pokemonCaught: 0,
    achievements: 0,
    drinkCount: 0,
    kudosReceived: 0,
    joinedDate: 'Dec 2024'
  };

  const handleSendKudos = () => {
    sendKudos(username, kudosMessage);
    setKudosSent(true);
    setTimeout(() => {
      setShowKudosModal(false);
      setKudosMessage('');
      setKudosSent(false);
    }, 1500);
  };

  const isOwnProfile = currentUser?.odName === username;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-4 flex items-center gap-3" style={{
        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        boxShadow: '0 4px 16px rgba(236, 72, 153, 0.2)'
      }}>
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all transform hover:scale-110"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none'
          }}
        >
          ←
        </button>
        <h2 style={{
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '18px',
          color: 'white',
          fontWeight: '700'
        }}>
          Profile
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="flex flex-col items-center gap-3">
            {/* Profile Picture */}
            <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-7xl overflow-hidden" style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 16px rgba(236, 72, 153, 0.2)'
            }}>
              {user.profilePic.startsWith('data:') || user.profilePic.startsWith('http') ? (
                <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span>{user.profilePic}</span>
              )}
            </div>

            {/* Username & Title */}
            <div className="text-center">
              <h3 style={{
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '24px',
                color: 'var(--text)',
                fontWeight: '700'
              }}>
                {user.username}
              </h3>
              {user.title && (
                <div className="mt-1 px-3 py-1 rounded-full inline-block" style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: 'white',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  "{user.title}"
                </div>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                maxWidth: '280px'
              }}>
                {user.bio}
              </p>
            )}

            {/* Level Badge */}
            <div className="mt-2 px-4 py-2 rounded-2xl" style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white'
            }}>
              <span style={{
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '16px',
                fontWeight: '700'
              }}>
                Level {user.level}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {onDM && (
          <button
            onClick={onDM}
            className="w-full p-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95"
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
            💬 Send Message
          </button>
        )}

        {!isOwnProfile && (
          <button
            onClick={() => setShowKudosModal(true)}
            className="w-full p-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: 'none',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--text)'
            }}
          >
            💖 Give Kudos
          </button>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="🪙" label="Coins" value={user.coins.toString()} />
          <StatCard icon="⚾" label="Pokémon" value={user.pokemonCaught.toString()} />
          <StatCard icon="🏆" label="Achievements" value={user.achievements.toString()} />
          <StatCard icon="🍺" label="Drinks" value={user.drinkCount.toString()} />
          <StatCard icon="💖" label="Kudos" value={user.kudosReceived.toString()} />
          <StatCard icon="📅" label="Joined" value={user.joinedDate} />
        </div>

        {/* Recent Activity */}
        <div className="p-5 rounded-3xl" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '12px'
          }}>
            📊 Recent Activity
          </h3>
          <div className="space-y-3">
            <ActivityItem
              icon="🎉"
              text="Caught a Pikachu"
              time="2 hours ago"
            />
            <ActivityItem
              icon="🍺"
              text="Logged a drink"
              time="4 hours ago"
            />
            <ActivityItem
              icon="🏆"
              text="Unlocked 'Emoji Lord'"
              time="1 day ago"
            />
          </div>
        </div>
      </div>

      {/* Kudos Modal */}
      {showKudosModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => !kudosSent && setShowKudosModal(false)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {kudosSent ? (
              <div className="text-center py-4">
                <div className="text-6xl mb-4">💖</div>
                <p style={{
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--text)'
                }}>
                  Kudos sent to {username}!
                </p>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  marginTop: '8px'
                }}>
                  You both earned 10 coins! 🪙
                </p>
              </div>
            ) : (
              <>
                <h3 style={{
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  💖 Send Kudos to {username}
                </h3>

                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  You both earn 10 coins! 🪙
                </p>

                <textarea
                  value={kudosMessage}
                  onChange={(e) => setKudosMessage(e.target.value)}
                  placeholder="Add a message (optional)"
                  maxLength={100}
                  className="w-full p-3 rounded-2xl mb-4"
                  style={{
                    border: '2px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    resize: 'none',
                    height: '80px'
                  }}
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowKudosModal(false)}
                    className="flex-1 p-3 rounded-2xl transition-all"
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text)',
                      fontFamily: 'Fredoka, sans-serif',
                      fontWeight: '600',
                      border: 'none'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendKudos}
                    className="flex-1 p-3 rounded-2xl transition-all transform hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                      color: 'white',
                      fontFamily: 'Fredoka, sans-serif',
                      fontWeight: '700',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)'
                    }}
                  >
                    Send 💖
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="p-4 rounded-2xl" style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
    }}>
      <div className="text-2xl mb-1">{icon}</div>
      <div style={{
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginBottom: '4px'
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '20px',
        fontWeight: '700',
        color: 'var(--text)'
      }}>
        {value}
      </div>
    </div>
  );
}

interface ActivityItemProps {
  icon: string;
  text: string;
  time: string;
}

function ActivityItem({ icon, text, time }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b" style={{
      borderColor: 'var(--border)'
    }}>
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p style={{
          fontSize: '14px',
          color: 'var(--text)'
        }}>
          {text}
        </p>
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          {time}
        </p>
      </div>
    </div>
  );
}
