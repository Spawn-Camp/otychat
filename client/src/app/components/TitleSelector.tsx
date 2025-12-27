import { useState } from 'react';

interface TitleSelectorProps {
  onBack: () => void;
  onTitleChange: (title: string) => void;
  currentTitle?: string;
}

interface Title {
  id: string;
  emoji: string;
  name: string;
  description: string;
  unlocked: boolean;
  requirement?: string;
}

const AVAILABLE_TITLES: Title[] = [
  {
    id: 'none',
    emoji: '⚪',
    name: 'No Title',
    description: 'Display no title',
    unlocked: true
  },
  {
    id: 'emoji-enthusiast',
    emoji: '⭐',
    name: 'Emoji Enthusiast',
    description: 'Send 100+ emoji reactions',
    unlocked: true
  },
  {
    id: 'social-butterfly',
    emoji: '🦋',
    name: 'Social Butterfly',
    description: 'Send 50+ DMs',
    unlocked: true
  },
  {
    id: 'artist',
    emoji: '🎨',
    name: 'Artist',
    description: 'Create 25+ drawings',
    unlocked: true
  },
  {
    id: 'party-legend',
    emoji: '🎉',
    name: 'Party Legend',
    description: 'Log 20+ drinks',
    unlocked: true
  },
  {
    id: 'question-master',
    emoji: '❓',
    name: 'Question Master',
    description: 'Ask 15+ questions',
    unlocked: true
  },
  {
    id: 'pokemon-trainer',
    emoji: '⚡',
    name: 'Pokémon Trainer',
    description: 'Catch 10+ Pokémon',
    unlocked: true
  },
  {
    id: 'poke-master',
    emoji: '🏆',
    name: 'Poké Master',
    description: 'Catch 50+ Pokémon',
    unlocked: false,
    requirement: 'Catch 50 Pokémon'
  },
  {
    id: 'millionaire',
    emoji: '💰',
    name: 'Millionaire',
    description: 'Earn 10,000 coins',
    unlocked: false,
    requirement: 'Earn 10,000 coins'
  },
  {
    id: 'night-owl',
    emoji: '🦉',
    name: 'Night Owl',
    description: 'Active past 2 AM',
    unlocked: false,
    requirement: 'Be active past 2 AM'
  },
  {
    id: 'early-bird',
    emoji: '🐦',
    name: 'Early Bird',
    description: 'First to join 5 sessions',
    unlocked: false,
    requirement: 'First to join 5 sessions'
  },
  {
    id: 'kudos-king',
    emoji: '👑',
    name: 'Kudos King',
    description: 'Receive 100+ kudos',
    unlocked: false,
    requirement: 'Receive 100 kudos'
  },
  {
    id: 'doodle-deity',
    emoji: '✨',
    name: 'Doodle Deity',
    description: 'Create 100+ drawings',
    unlocked: false,
    requirement: 'Create 100 drawings'
  },
  {
    id: 'chatterbox',
    emoji: '💬',
    name: 'Chatterbox',
    description: 'Send 500+ messages',
    unlocked: false,
    requirement: 'Send 500 messages'
  },
  {
    id: 'trendsetter',
    emoji: '🌟',
    name: 'Trendsetter',
    description: 'Get 50+ upvotes on questions',
    unlocked: false,
    requirement: 'Get 50+ upvotes on questions'
  },
  {
    id: 'collector',
    emoji: '🎁',
    name: 'Collector',
    description: 'Buy 20+ shop items',
    unlocked: false,
    requirement: 'Buy 20 shop items'
  }
];

export default function TitleSelector({ onBack, onTitleChange, currentTitle = '⭐ Emoji Enthusiast' }: TitleSelectorProps) {
  const [selectedTitle, setSelectedTitle] = useState(currentTitle);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredTitles = AVAILABLE_TITLES.filter(title => {
    if (filter === 'unlocked') return title.unlocked;
    if (filter === 'locked') return !title.unlocked;
    return true;
  });

  const handleSelect = (title: Title) => {
    if (!title.unlocked) return;
    
    const titleText = title.id === 'none' ? '' : `${title.emoji} ${title.name}`;
    setSelectedTitle(titleText);
  };

  const handleSave = () => {
    onTitleChange(selectedTitle);
    onBack();
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-4 flex items-center gap-3" style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)'
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
          🏆 Choose Title
        </h2>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-2xl transition-all transform hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#f59e0b',
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none'
          }}
        >
          Save
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Selection Preview */}
        <div className="p-5 rounded-3xl text-center" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
        }}>
          <p className="mb-2" style={{
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}>
            Current Title
          </p>
          {selectedTitle ? (
            <div className="px-4 py-2 inline-block rounded-full" style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              color: 'white',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {selectedTitle}
            </div>
          ) : (
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              fontStyle: 'italic'
            }}>
              No title selected
            </p>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          {(['all', 'unlocked', 'locked'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-1 py-2 rounded-xl transition-all transform"
              style={{
                background: filter === f 
                  ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' 
                  : 'transparent',
                color: filter === f ? 'white' : 'var(--text)',
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '13px',
                fontWeight: '700',
                border: 'none',
                textTransform: 'capitalize'
              }}
            >
              {f === 'all' ? '🌟 All' : f === 'unlocked' ? '🔓 Unlocked' : '🔒 Locked'}
            </button>
          ))}
        </div>

        {/* Titles List */}
        <div className="space-y-2">
          {filteredTitles.map(title => (
            <button
              key={title.id}
              onClick={() => handleSelect(title)}
              disabled={!title.unlocked}
              className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all transform hover:scale-102 active:scale-95"
              style={{
                background: title.unlocked
                  ? (selectedTitle === `${title.emoji} ${title.name}` || (title.id === 'none' && !selectedTitle))
                    ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                    : 'rgba(255, 255, 255, 0.95)'
                  : 'rgba(200, 200, 200, 0.3)',
                color: (selectedTitle === `${title.emoji} ${title.name}` || (title.id === 'none' && !selectedTitle))
                  ? 'white'
                  : title.unlocked 
                    ? 'var(--text)' 
                    : 'var(--text-muted)',
                border: 'none',
                textAlign: 'left',
                backdropFilter: 'blur(10px)',
                boxShadow: title.unlocked 
                  ? (selectedTitle === `${title.emoji} ${title.name}` || (title.id === 'none' && !selectedTitle))
                    ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.05)'
                  : 'none',
                cursor: title.unlocked ? 'pointer' : 'not-allowed',
                opacity: title.unlocked ? 1 : 0.6
              }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{
                background: (selectedTitle === `${title.emoji} ${title.name}` || (title.id === 'none' && !selectedTitle))
                  ? 'rgba(255, 255, 255, 0.2)'
                  : title.unlocked
                    ? 'var(--bg-secondary)'
                    : 'rgba(150, 150, 150, 0.2)'
              }}>
                {title.unlocked ? title.emoji : '🔒'}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div style={{
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '15px',
                  fontWeight: '700',
                  marginBottom: '2px'
                }}>
                  {title.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  {title.unlocked ? title.description : title.requirement}
                </div>
              </div>

              {/* Checkmark */}
              {title.unlocked && (selectedTitle === `${title.emoji} ${title.name}` || (title.id === 'none' && !selectedTitle)) && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{
                  background: 'white',
                  color: '#f59e0b',
                  fontSize: '16px',
                  fontWeight: '700'
                }}>
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="p-4 rounded-2xl text-center" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}>
            {AVAILABLE_TITLES.filter(t => t.unlocked).length} / {AVAILABLE_TITLES.length} titles unlocked
          </p>
          <div className="mt-2 h-2 rounded-full overflow-hidden" style={{
            background: 'var(--bg-secondary)'
          }}>
            <div style={{
              width: `${(AVAILABLE_TITLES.filter(t => t.unlocked).length / AVAILABLE_TITLES.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}