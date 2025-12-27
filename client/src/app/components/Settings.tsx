import { useState, useEffect } from 'react';
import ProfilePicSelector from './ProfilePicSelector';
import StatusEditor from './StatusEditor';
import { loadFavorites, saveFavorites, getEmojiUrl, CUSTOM_EMOJI_IDS, UNICODE_EMOJIS } from '../data/emoji-data';

interface SettingsProps {
  onBack: () => void;
  onThemeChange?: (theme: string) => void;
  currentTheme?: string;
  profilePic?: string;
  onProfilePicChange?: (pic: string) => void;
  status?: string;
  onStatusChange?: (status: string) => void;
}

const THEMES = [
  { id: 'waves', name: 'Ocean Waves', emoji: '🌊', description: 'Flowing wave patterns' },
  { id: 'zigzag', name: 'Zig Zag', emoji: '⚡', description: 'Dynamic diagonal stripes' },
  { id: 'dots', name: 'Floating Dots', emoji: '✨', description: 'Gentle floating orbs' },
  { id: 'bubbles', name: 'Bubbles', emoji: '🫧', description: 'Rising bubbles' },
  { id: 'gradient', name: 'Simple Gradient', emoji: '🌈', description: 'Clean gradient only' }
];

export default function Settings({ onBack, onThemeChange, currentTheme = 'gradient', profilePic, onProfilePicChange, status, onStatusChange }: SettingsProps) {
  const [theme, setTheme] = useState(currentTheme);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showEmojiEditor, setShowEmojiEditor] = useState(false);
  const [soundVolume, setSoundVolume] = useState(75);
  const [vibration, setVibration] = useState(true);
  const [showProfilePicSelector, setShowProfilePicSelector] = useState(false);
  const [showStatusEditor, setShowStatusEditor] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  if (showProfilePicSelector) {
    return (
      <ProfilePicSelector
        onBack={() => setShowProfilePicSelector(false)}
        onSelect={(pic) => {
          if (onProfilePicChange) {
            onProfilePicChange(pic);
          }
          setShowProfilePicSelector(false);
        }}
        currentPic={profilePic}
      />
    );
  }

  if (showStatusEditor) {
    return (
      <StatusEditor
        onBack={() => setShowStatusEditor(false)}
        onStatusChange={(newStatus) => {
          if (onStatusChange) {
            onStatusChange(newStatus);
          }
          setShowStatusEditor(false);
        }}
        currentStatus={status}
      />
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-4 flex items-center gap-3" style={{
        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
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
          ⚙️ Settings
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Theme Selector */}
        <section>
          <div className="p-5 rounded-3xl" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}>
            <h3 className="mb-3" style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '16px',
              color: 'var(--text)',
              fontWeight: '700'
            }}>
              🎨 Background Theme
            </h3>
            <p className="mb-4" style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              lineHeight: '1.5'
            }}>
              Choose an animated background pattern for the app
            </p>
            
            <div className="space-y-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className="w-full p-4 rounded-2xl flex items-center gap-3 transition-all transform hover:scale-102"
                  style={{
                    background: theme === t.id 
                      ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' 
                      : 'var(--bg-secondary)',
                    color: theme === t.id ? 'white' : 'var(--text)',
                    border: 'none',
                    textAlign: 'left',
                    boxShadow: theme === t.id ? '0 4px 12px rgba(236, 72, 153, 0.3)' : 'none'
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{
                    background: theme === t.id ? 'rgba(255, 255, 255, 0.2)' : 'white'
                  }}>
                    {t.emoji}
                  </div>
                  <div className="flex-1">
                    <div style={{
                      fontFamily: 'Fredoka, sans-serif',
                      fontSize: '14px',
                      fontWeight: '700',
                      marginBottom: '2px'
                    }}>
                      {t.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      opacity: theme === t.id ? 0.9 : 0.7
                    }}>
                      {t.description}
                    </div>
                  </div>
                  {theme === t.id && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{
                      background: 'white',
                      color: '#ec4899'
                    }}>
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Emojis */}
        <section>
          <div className="p-5 rounded-3xl" style={{
            background: 'white',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}>
            <div className="flex justify-between items-center mb-3">
              <h3 style={{
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '16px',
                color: 'var(--text)',
                fontWeight: '700'
              }}>
                ⚡ Quick Reactions
              </h3>
              <button
                onClick={() => setShowEmojiEditor(true)}
                className="px-3 py-1.5 rounded-xl transition-all"
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '11px',
                  fontWeight: '600',
                  border: 'none',
                }}
              >
                ✏️ Edit
              </button>
            </div>
            <p className="mb-4" style={{
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}>
              Your favorite emojis for quick reactions
            </p>
            <div className="flex gap-2 flex-wrap">
              {favorites.map((emoji, i) => {
                const isCustom = /^\d+$/.test(emoji);
                return (
                  <div
                    key={i}
                    className="p-3 rounded-2xl"
                    style={{
                      background: 'var(--bg-secondary)',
                    }}
                  >
                    {isCustom ? (
                      <img src={getEmojiUrl(emoji)} alt="emoji" className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-3xl">{emoji}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Emoji Editor Modal */}
        {showEmojiEditor && (
          <EmojiEditorModal
            favorites={favorites}
            onSave={(newFavorites) => {
              setFavorites(newFavorites);
              saveFavorites(newFavorites);
              setShowEmojiEditor(false);
            }}
            onClose={() => setShowEmojiEditor(false)}
          />
        )}

        {/* Profile */}
        <section>
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
              👤 Profile
            </h3>
            <div className="space-y-2">
              <SettingRow label="Profile Picture" action="Change" onClick={() => setShowProfilePicSelector(true)} />
              <SettingRow label="Status" action="Set" onClick={() => setShowStatusEditor(true)} />
              <SettingRow label="Name Color" action="Pick" />
            </div>
          </div>
        </section>

        {/* Sounds & Haptics */}
        <section>
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
              🔊 Sounds & Haptics
            </h3>
            
            {/* Volume Slider */}
            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <span style={{
                  fontSize: '14px',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: '600'
                }}>
                  Sound Effects
                </span>
                <span style={{
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '14px',
                  color: '#ec4899',
                  fontWeight: '700'
                }}>
                  {soundVolume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={soundVolume}
                onChange={(e) => setSoundVolume(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${soundVolume}%, #f3f4f6 ${soundVolume}%, #f3f4f6 100%)`,
                  outline: 'none'
                }}
              />
            </div>

            {/* Vibration Toggle */}
            <div className="flex justify-between items-center p-4 rounded-2xl" style={{
              background: 'var(--bg-secondary)'
            }}>
              <span style={{
                fontSize: '14px',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: '600'
              }}>
                Vibration
              </span>
              <button
                onClick={() => setVibration(!vibration)}
                className="px-5 py-2 rounded-xl transition-all transform hover:scale-105"
                style={{
                  background: vibration 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : '#d1d5db',
                  color: 'white',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: 'none',
                  boxShadow: vibration ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none'
                }}
              >
                {vibration ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <div className="p-5 rounded-3xl text-center" style={{
            background: 'white',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}>
            <p style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '8px'
            }}>
              HangChat v1.0.0
            </p>
            <p style={{
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}>
              Made with 💖 for hangouts
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

interface SettingRowProps {
  label: string;
  action: string;
  onClick?: () => void;
}

function SettingRow({ label, action, onClick }: SettingRowProps) {
  return (
    <div className="p-4 rounded-2xl flex justify-between items-center" style={{
      background: 'var(--bg-secondary)'
    }}>
      <span style={{
        fontSize: '14px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: '600'
      }}>
        {label}
      </span>
      <button
        className="px-4 py-2 rounded-xl transition-all transform hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
          color: 'white',
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '12px',
          fontWeight: '600',
          border: 'none',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
        }}
        onClick={onClick}
      >
        {action}
      </button>
    </div>
  );
}

// Emoji Editor Modal Component
interface EmojiEditorModalProps {
  favorites: string[];
  onSave: (favorites: string[]) => void;
  onClose: () => void;
}

type Category = 'custom' | 'faces' | 'gestures' | 'hearts' | 'symbols';

const CATEGORY_ICONS: Record<Category, string> = {
  custom: '⭐',
  faces: '😀',
  gestures: '👋',
  hearts: '❤️',
  symbols: '🔥',
};

function EmojiEditorModal({ favorites, onSave, onClose }: EmojiEditorModalProps) {
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>(favorites);
  const [activeCategory, setActiveCategory] = useState<Category>('custom');

  const toggleEmoji = (emoji: string) => {
    if (selectedFavorites.includes(emoji)) {
      setSelectedFavorites(selectedFavorites.filter(e => e !== emoji));
    } else if (selectedFavorites.length < 7) {
      setSelectedFavorites([...selectedFavorites, emoji]);
    }
  };

  const getEmojisForCategory = () => {
    if (activeCategory === 'custom') return CUSTOM_EMOJI_IDS;
    return UNICODE_EMOJIS[activeCategory] || [];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{
        background: 'white',
        maxHeight: '80vh',
      }}>
        {/* Header */}
        <div className="p-4 flex justify-between items-center" style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        }}>
          <h3 style={{
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '16px',
            color: 'white',
            fontWeight: '700'
          }}>
            ⭐ Edit Favorites ({selectedFavorites.length}/7)
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '18px' }}
          >
            ×
          </button>
        </div>

        {/* Selected favorites preview */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex gap-2 flex-wrap min-h-[50px]">
            {selectedFavorites.map((emoji, i) => {
              const isCustom = /^\d+$/.test(emoji);
              return (
                <button
                  key={i}
                  onClick={() => toggleEmoji(emoji)}
                  className="p-2 rounded-xl transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: 'none' }}
                >
                  {isCustom ? (
                    <img src={getEmojiUrl(emoji)} alt="emoji" className="w-6 h-6 object-contain" />
                  ) : (
                    <span className="text-xl">{emoji}</span>
                  )}
                </button>
              );
            })}
            {selectedFavorites.length === 0 && (
              <p className="text-sm text-gray-400 p-2">Tap emojis below to add favorites</p>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-100">
          {(Object.keys(CATEGORY_ICONS) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-3 py-2 rounded-xl transition-all"
              style={{
                background: activeCategory === cat ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'transparent',
                color: activeCategory === cat ? 'white' : 'var(--text-muted)',
                border: 'none',
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              <span className="text-lg mr-1">{CATEGORY_ICONS[cat]}</span>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Emoji grid */}
        <div className="p-3 overflow-y-auto" style={{ maxHeight: '250px' }}>
          <div className="grid grid-cols-8 gap-1">
            {getEmojisForCategory().map((emoji, i) => {
              const isCustom = activeCategory === 'custom';
              const isSelected = selectedFavorites.includes(emoji);
              return (
                <button
                  key={i}
                  onClick={() => toggleEmoji(emoji)}
                  className="p-2 rounded-xl transition-all hover:bg-gray-100 active:scale-110 flex items-center justify-center"
                  style={{
                    border: 'none',
                    background: isSelected ? 'rgba(251, 191, 36, 0.3)' : 'transparent',
                  }}
                >
                  {isCustom ? (
                    <img src={getEmojiUrl(emoji)} alt="emoji" className="w-7 h-7 object-contain" />
                  ) : (
                    <span className="text-2xl">{emoji}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl"
            style={{
              background: 'var(--bg-secondary)',
              border: 'none',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedFavorites)}
            className="flex-1 py-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            ✓ Save
          </button>
        </div>
      </div>
    </div>
  );
}