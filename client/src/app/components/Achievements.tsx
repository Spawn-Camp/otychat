interface AchievementsProps {
  onBack: () => void;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: string;
  unlocked: boolean;
  progress?: { current: number; total: number };
}

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    name: 'First Blood',
    description: 'Send your first emoji',
    icon: '🏆',
    reward: '"Newbie" title',
    unlocked: true
  },
  {
    id: '2',
    name: 'One Down',
    description: 'Log your first drink',
    icon: '🍺',
    reward: '50 coins',
    unlocked: true
  },
  {
    id: '3',
    name: 'Trainer',
    description: 'Catch your first Pokémon',
    icon: '⚾',
    reward: '50 coins',
    unlocked: true
  },
  {
    id: '4',
    name: 'Emoji Lord',
    description: 'Send 500 emojis',
    icon: '👑',
    reward: 'Gold name color',
    unlocked: false,
    progress: { current: 247, total: 500 }
  },
  {
    id: '5',
    name: 'Gotta Catch \'Em All',
    description: 'Complete the Pokédex',
    icon: '🎮',
    reward: '"Pokemon Master" title',
    unlocked: false,
    progress: { current: 23, total: 386 }
  },
  {
    id: '6',
    name: 'Artist',
    description: 'Send 100 drawings',
    icon: '🎨',
    reward: '"Artist" title',
    unlocked: false,
    progress: { current: 8, total: 100 }
  }
];

export default function Achievements({ onBack }: AchievementsProps) {
  const unlockedCount = MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;

  const unlocked = MOCK_ACHIEVEMENTS.filter(a => a.unlocked);
  const locked = MOCK_ACHIEVEMENTS.filter(a => !a.unlocked);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-4 border-b-2 flex items-center gap-3" style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)'
      }}>
        <button
          onClick={onBack}
          className="text-xl"
          style={{ color: 'var(--accent)' }}
        >
          ←
        </button>
        <h2
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '14px',
            flex: 1
          }}
        >
          🏆 Achievements
        </h2>
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '11px',
            color: 'var(--accent)'
          }}
        >
          {unlockedCount}/{totalCount}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Unlocked */}
        {unlocked.length > 0 && (
          <>
            <h3 style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: 'var(--success)'
            }}>
              🔓 UNLOCKED
            </h3>
            <div className="space-y-3">
              {unlocked.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <>
            <h3 className="mt-6" style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: 'var(--text-muted)'
            }}>
              🔒 LOCKED
            </h3>
            <div className="space-y-3">
              {locked.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div className="p-4 border-2 rounded-lg" style={{
      background: achievement.unlocked ? 'var(--bg-card)' : 'var(--bg-secondary)',
      borderColor: achievement.unlocked ? 'var(--success)' : 'var(--border)',
      opacity: achievement.unlocked ? 1 : 0.8
    }}>
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">
          {achievement.unlocked ? achievement.icon : '⬛'}
        </span>
        <div className="flex-1 min-w-0">
          <h4 style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
            marginBottom: '4px'
          }}>
            {achievement.name}
          </h4>
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            {achievement.description}
          </p>
          <p className="text-xs" style={{ color: 'var(--accent)' }}>
            Reward: {achievement.reward}
          </p>

          {/* Progress Bar */}
          {achievement.progress && !achievement.unlocked && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-muted)' }}>Progress:</span>
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '10px'
                }}>
                  {achievement.progress.current}/{achievement.progress.total}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)'
              }}>
                <div
                  className="h-full transition-all"
                  style={{
                    background: 'var(--accent)',
                    width: `${(achievement.progress.current / achievement.progress.total) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}