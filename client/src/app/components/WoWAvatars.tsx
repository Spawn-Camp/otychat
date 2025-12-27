import { useState } from 'react';

interface WoWAvatarsProps {
  onBack: () => void;
  onSelect: (sprite: string) => void;
}

// Local avatars path (files copied to public/avatars/)
const AVATAR_BASE = '/avatars';

// Curated WoW-specific avatar IDs from the Battle.net gallery
const WOW_AVATARS = [
  { id: 661530, label: 'Avatar 1' },
  { id: 661531, label: 'Avatar 2' },
  { id: 661532, label: 'Avatar 3' },
  { id: 661533, label: 'Avatar 4' },
  { id: 661535, label: 'Avatar 5' },
  { id: 661536, label: 'Avatar 6' },
  { id: 661537, label: 'Avatar 7' },
  { id: 661538, label: 'Avatar 8' },
  { id: 661539, label: 'Avatar 9' },
  { id: 661540, label: 'Avatar 10' },
  { id: 661541, label: 'Avatar 11' },
  { id: 661542, label: 'Avatar 12' },
  { id: 661543, label: 'Avatar 13' },
  { id: 661544, label: 'Avatar 14' },
  { id: 661545, label: 'Avatar 15' },
  { id: 661546, label: 'Avatar 16' },
  { id: 661547, label: 'Avatar 17' },
  { id: 661548, label: 'Avatar 18' },
  { id: 661549, label: 'Avatar 19' },
  { id: 661550, label: 'Avatar 20' },
];

export default function WoWAvatars({ onBack, onSelect }: WoWAvatarsProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  const handleImageError = (id: number) => {
    setFailedImages(prev => new Set(prev).add(id));
  };

  const handleSelect = (id: number) => {
    onSelect(`${AVATAR_BASE}/${id}.jpg`);
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3" style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
        boxShadow: '0 4px 16px rgba(30, 64, 175, 0.3)'
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
          fontWeight: '700',
          flex: 1
        }}>
          ⚔️ WoW Avatars
        </h2>
      </div>

      {/* Avatar Grid */}
      <div className="p-4">
        <p className="mb-4" style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          Tap an avatar to use as your profile picture
        </p>

        <div className="grid grid-cols-3 gap-3">
          {WOW_AVATARS.map((avatar) => {
            const hasLoaded = loadedImages.has(avatar.id);
            const hasFailed = failedImages.has(avatar.id);

            return (
              <button
                key={avatar.id}
                onClick={() => !hasFailed && handleSelect(avatar.id)}
                className="aspect-square rounded-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  border: 'none',
                  opacity: hasFailed ? 0.4 : 1,
                  padding: 0
                }}
                disabled={hasFailed}
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  {!hasLoaded && !hasFailed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full animate-pulse" style={{
                        background: 'var(--bg-secondary)'
                      }} />
                    </div>
                  )}
                  <img
                    src={`${AVATAR_BASE}/${avatar.id}.jpg`}
                    alt={avatar.label}
                    className="w-full h-full object-cover rounded-2xl"
                    style={{
                      opacity: hasLoaded ? 1 : 0,
                      transition: 'opacity 0.2s'
                    }}
                    onLoad={() => handleImageLoad(avatar.id)}
                    onError={() => handleImageError(avatar.id)}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Attribution */}
        <p className="mt-6 text-center" style={{
          fontSize: '10px',
          color: 'var(--text-muted)',
          opacity: 0.6
        }}>
          Avatars from Battle.net / Blizzard Entertainment
        </p>
      </div>
    </div>
  );
}
