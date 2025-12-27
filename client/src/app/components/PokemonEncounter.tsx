import { useState, useEffect } from 'react';

interface Pokemon {
  id: number;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface PokemonEncounterProps {
  pokemon: Pokemon;
  onCatch: () => void;
  onRun: () => void;
}

const CATCH_RATES = {
  common: 0.7,
  uncommon: 0.5,
  rare: 0.3,
  legendary: 0.1
};

export default function PokemonEncounter({ pokemon, onCatch, onRun }: PokemonEncounterProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [attempting, setAttempting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onRun();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRun]);

  const handleCatchAttempt = (ballType: string) => {
    setAttempting(true);

    setTimeout(() => {
      const baseRate = CATCH_RATES[pokemon.rarity];
      const success = Math.random() < baseRate;

      if (success) {
        onCatch();
      } else {
        setAttempting(false);
        alert('It broke free!');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      background: 'rgba(0, 0, 0, 0.8)'
    }}>
      <div className="w-full max-w-sm p-6 border-4 rounded-lg" style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--accent)',
        boxShadow: '0 0 20px var(--accent)'
      }}>
        <h2
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '14px',
            color: 'var(--accent)'
          }}
        >
          Wild {pokemon.name} appeared!
        </h2>

        {/* Pokemon Display */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 border-4 rounded-lg flex items-center justify-center text-6xl" style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
            animation: attempting ? 'shake 0.5s infinite' : 'none'
          }}>
            {/* In real app, would show sprite */}
            🐭
          </div>
        </div>

        {/* Ball Selection */}
        {!attempting && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleCatchAttempt('poke')}
              className="p-3 border-2 rounded transition-all active:scale-95"
              style={{
                background: 'var(--accent-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '11px'
              }}
            >
              ⚾ Poké Ball
            </button>
            <button
              onClick={() => handleCatchAttempt('great')}
              disabled
              className="p-3 border-2 rounded opacity-50"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '11px'
              }}
            >
              🔵 Great Ball
            </button>
            <button
              onClick={() => handleCatchAttempt('ultra')}
              disabled
              className="p-3 border-2 rounded opacity-50"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '11px'
              }}
            >
              ⚫ Ultra Ball
            </button>
            <button
              onClick={onRun}
              className="p-3 border-2 rounded transition-all active:scale-95"
              style={{
                background: 'var(--danger)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '11px'
              }}
            >
              Run
            </button>
          </div>
        )}

        {attempting && (
          <div className="text-center mb-4" style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
            color: 'var(--warning)'
          }}>
            Attempting to catch...
          </div>
        )}

        {/* Timer */}
        <div className="text-center" style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          color: timeLeft < 10 ? 'var(--danger)' : 'var(--text-muted)'
        }}>
          ⏱️ 0:{timeLeft.toString().padStart(2, '0')} remaining
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}