import { useState } from 'react';

interface StatusEditorProps {
  onBack: () => void;
  onStatusChange: (status: string) => void;
  currentStatus?: string;
}

const PRESET_STATUSES = [
  '🎉 Partying!',
  '🍻 Drinking',
  '🎮 Gaming',
  '😴 Tired',
  '🔥 Vibing',
  '💯 Feeling good',
  '👀 Lurking',
  '🤔 Thinking',
  '💪 Pumped up',
  '😎 Chilling',
  '🎵 Listening to music',
  '🍕 Hungry',
  '☕ Need coffee',
  '📱 Online',
  '🚀 Ready to go',
  '💤 Sleepy'
];

export default function StatusEditor({ onBack, onStatusChange, currentStatus = '' }: StatusEditorProps) {
  const [status, setStatus] = useState(currentStatus);
  const [customMode, setCustomMode] = useState(false);

  const handleSave = () => {
    onStatusChange(status);
    onBack();
  };

  const handleClear = () => {
    setStatus('');
    onStatusChange('');
    onBack();
  };

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
          fontWeight: '700',
          flex: 1
        }}>
          💬 Set Status
        </h2>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-2xl transition-all transform hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#ec4899',
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
        {/* Current Status Preview */}
        <div className="p-5 rounded-3xl" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
        }}>
          <p className="mb-2" style={{
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}>
            Current Status
          </p>
          {status ? (
            <p style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '16px',
              color: 'var(--text)',
              fontWeight: '600'
            }}>
              {status}
            </p>
          ) : (
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              fontStyle: 'italic'
            }}>
              No status set
            </p>
          )}
        </div>

        {/* Custom Status Input */}
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
            ✏️ Custom Status
          </h3>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="What's happening?"
            maxLength={50}
            className="w-full p-4 rounded-2xl"
            style={{
              background: 'var(--bg-secondary)',
              border: '2px solid transparent',
              outline: 'none',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
              color: 'var(--text)',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#ec4899'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
          />
          <p className="mt-2" style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'right'
          }}>
            {status.length}/50
          </p>
        </div>

        {/* Quick Presets */}
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
            ⚡ Quick Presets
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {PRESET_STATUSES.map((preset, index) => (
              <button
                key={index}
                onClick={() => setStatus(preset)}
                className="p-3 rounded-2xl text-left transition-all transform hover:scale-102 active:scale-95"
                style={{
                  background: status === preset 
                    ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' 
                    : 'var(--bg-secondary)',
                  color: status === preset ? 'white' : 'var(--text)',
                  border: 'none',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Status Button */}
        {status && (
          <button
            onClick={handleClear}
            className="w-full p-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '14px',
              fontWeight: '700',
              border: '2px solid #ef4444'
            }}
          >
            🗑️ Clear Status
          </button>
        )}
      </div>
    </div>
  );
}