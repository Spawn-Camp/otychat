import { useState } from 'react';

interface JoinScreenProps {
  onJoin: (username: string) => void;
  onlineCount: number;
}

export default function JoinScreen({ onJoin, onlineCount }: JoinScreenProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin(username.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #fae8ff 100%)',
      fontFamily: 'Nunito, system-ui, sans-serif'
    }}>
      <div className="w-full max-w-md space-y-6">
        {/* Floating Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>🎈</div>
          <div className="absolute top-40 right-16 text-5xl opacity-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>⭐</div>
          <div className="absolute bottom-32 left-20 text-7xl opacity-20 animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>✨</div>
        </div>

        {/* Header */}
        <div className="text-center relative z-10">
          <div className="inline-block px-8 py-6 mb-4 animate-pulse" style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(236, 72, 153, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.5)',
            transform: 'rotate(-2deg)'
          }}>
            <h1 style={{
              fontFamily: 'Fredoka, sans-serif',
              color: '#ffffff',
              fontSize: '32px',
              letterSpacing: '1px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              OtyChat 💬
            </h1>
          </div>
          <p className="text-lg mb-6" style={{ 
            color: 'var(--text)',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: '600'
          }}>
            Join the party! 🎉
          </p>
        </div>

        {/* Join Form */}
        <div className="p-8 relative z-10" style={{
          background: 'white',
          borderRadius: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-3" style={{
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '14px',
                color: 'var(--text)',
                fontWeight: '600'
              }}>
                What's your name? ✨
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                placeholder="Name"
                className="w-full px-5 py-4 outline-none transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '16px',
                  borderRadius: '16px',
                  border: '2px solid transparent',
                  boxShadow: username ? '0 0 0 2px #ec4899' : 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!username.trim()}
              className="w-full px-6 py-4 transition-all transform hover:scale-105 active:scale-95"
              style={{
                background: username.trim() 
                  ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' 
                  : 'var(--bg-secondary)',
                borderRadius: '20px',
                color: username.trim() ? 'white' : 'var(--text-muted)',
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '18px',
                fontWeight: '600',
                boxShadow: username.trim() 
                  ? '0 8px 24px rgba(236, 72, 153, 0.4)' 
                  : 'none',
                cursor: username.trim() ? 'pointer' : 'not-allowed',
                border: 'none'
              }}
            >
              {username.trim() ? '🚀 Join the Fun!' : '🔒 Enter your name'}
            </button>
          </form>
        </div>

        {/* Online Count */}
        <div className="text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '14px',
              color: 'var(--text)',
              fontWeight: '600'
            }}>
              {onlineCount} people online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}