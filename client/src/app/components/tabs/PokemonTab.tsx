import { useState } from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import { getSpriteUrl, getPokemonName, RARITY_COLORS, BALL_SPRITES, STONE_SPRITES } from '../../data/pokemon-data';
import Pokedex from '../Pokedex';
import Shop from '../Shop';

type SubPage = 'pokedex' | 'shop' | 'zones' | null;

export default function PokemonTab() {
  const {
    user,
    activePokemon,
    caughtPokemon,
    ballInventory,
    stoneInventory,
    zones,
    catchPokemon,
    runFromPokemon,
    changeZone
  } = useSocket();

  // XP calculation for progress bar
  const currentXp = user?.odTrainerXp || 0;
  const currentLevel = user?.odTrainerLevel || 1;
  const xpForNextLevel = currentLevel * 100; // Simple formula: level * 100 XP to level up
  const xpProgress = (currentXp % xpForNextLevel) / xpForNextLevel * 100;

  const [currentPage, setCurrentPage] = useState<SubPage>(null);

  // Get unique Pokemon count
  const uniquePokemonIds = new Set(caughtPokemon.map(p => p.odPokemonId));
  const pokemonCaught = uniquePokemonIds.size;
  const shinyCaught = caughtPokemon.filter(p => p.odIsShiny).length;

  if (currentPage === 'pokedex') {
    return (
      <Pokedex
        caughtPokemon={caughtPokemon}
        onBack={() => setCurrentPage(null)}
      />
    );
  }

  if (currentPage === 'shop') {
    return (
      <Shop
        coins={user?.odCoins || 0}
        onBack={() => setCurrentPage(null)}
      />
    );
  }

  if (currentPage === 'zones') {
    return (
      <ZoneSelector
        zones={zones}
        currentZone={user?.odCurrentZone || 'meadow'}
        trainerLevel={user?.odTrainerLevel || 1}
        onSelectZone={(zone) => {
          changeZone(zone);
          setCurrentPage(null);
        }}
        onBack={() => setCurrentPage(null)}
      />
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Trainer Card Header */}
      <div className="p-5 rounded-3xl" style={{
        background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
      }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{
            background: 'rgba(255, 255, 255, 0.2)'
          }}>
            ⚡
          </div>
          <div className="flex-1 text-white">
            <h2 style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              Pokémon Safari
            </h2>
            <div className="flex gap-4 mt-1">
              <span style={{ fontSize: '13px', opacity: 0.9 }}>
                🎮 Level {currentLevel}
              </span>
              <span style={{ fontSize: '13px', opacity: 0.9 }}>
                📍 {zones[user?.odCurrentZone || 'meadow']?.name || 'Starter Meadow'}
              </span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-white text-xs mb-1">
            <span style={{ fontFamily: 'Fredoka, sans-serif' }}>XP Progress</span>
            <span style={{ fontFamily: 'Fredoka, sans-serif' }}>{currentXp} / {xpForNextLevel} XP</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${xpProgress}%`,
                background: 'linear-gradient(90deg, #fbbf24 0%, #fef3c7 100%)',
                boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Active Encounter */}
      {activePokemon ? (
        <ActiveEncounter
          pokemon={activePokemon}
          ballInventory={ballInventory}
          onCatch={catchPokemon}
          onRun={runFromPokemon}
        />
      ) : (
        <div className="p-6 rounded-3xl text-center" style={{
          background: 'white',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="text-5xl mb-3 animate-bounce">🌿</div>
          <p style={{
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '16px',
            color: 'var(--text)',
            fontWeight: '600'
          }}>
            Searching for Pokémon...
          </p>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}>
            Keep participating to attract wild Pokémon!
          </p>
        </div>
      )}

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
          📊 Trainer Stats
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl text-center" style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white'
          }}>
            <div className="text-xl mb-1">📦</div>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '20px', fontWeight: '700' }}>
              {pokemonCaught}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9 }}>Caught</div>
          </div>
          <div className="p-3 rounded-2xl text-center" style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            color: 'white'
          }}>
            <div className="text-xl mb-1">📖</div>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '20px', fontWeight: '700' }}>
              {pokemonCaught}/386
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9 }}>Pokédex</div>
          </div>
          <div className="p-3 rounded-2xl text-center" style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            color: 'white'
          }}>
            <div className="text-xl mb-1">✨</div>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '20px', fontWeight: '700' }}>
              {shinyCaught}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9 }}>Shiny</div>
          </div>
        </div>
      </div>

      {/* Ball Inventory */}
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
          🎒 Poké Balls
        </h3>

        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
            <img src={BALL_SPRITES.poke} alt="Poké Ball" className="w-8 h-8 mx-auto" style={{ imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>
              ∞
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Poké</div>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
            <img src={BALL_SPRITES.great} alt="Great Ball" className="w-8 h-8 mx-auto" style={{ imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>
              {ballInventory.great}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Great</div>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
            <img src={BALL_SPRITES.ultra} alt="Ultra Ball" className="w-8 h-8 mx-auto" style={{ imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>
              {ballInventory.ultra}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Ultra</div>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
            <img src={BALL_SPRITES.master} alt="Master Ball" className="w-8 h-8 mx-auto" style={{ imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>
              {ballInventory.master}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Master</div>
          </div>
        </div>
      </div>

      {/* Stone Inventory */}
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
          💎 Evolution Stones
        </h3>

        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
            <img src={STONE_SPRITES.fire} alt="Fire Stone" className="w-7 h-7 mx-auto" style={{ imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
              {stoneInventory.fire}
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Fire</div>
          </div>
          <div className="p-2 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
            <img src={STONE_SPRITES.water} alt="Water Stone" className="w-7 h-7 mx-auto" style={{ imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
              {stoneInventory.water}
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Water</div>
          </div>
          <div className="p-2 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
            <img src={STONE_SPRITES.thunder} alt="Thunder Stone" className="w-7 h-7 mx-auto" style={{ imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
              {stoneInventory.thunder}
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Thunder</div>
          </div>
          <div className="p-2 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
            <img src={STONE_SPRITES.leaf} alt="Leaf Stone" className="w-7 h-7 mx-auto" style={{ imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
              {stoneInventory.leaf}
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Leaf</div>
          </div>
          <div className="p-2 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
            <img src={STONE_SPRITES.moon} alt="Moon Stone" className="w-7 h-7 mx-auto" style={{ imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
              {stoneInventory.moon}
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Moon</div>
          </div>
          <div className="p-2 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
            <img src={STONE_SPRITES.sun} alt="Sun Stone" className="w-7 h-7 mx-auto" style={{ imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
              {stoneInventory.sun}
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Sun</div>
          </div>
          <div className="p-2 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
            <img src={STONE_SPRITES.dragon} alt="Dragon Scale" className="w-7 h-7 mx-auto" style={{ imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
              {stoneInventory.dragon}
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Dragon</div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <NavButton
          icon="🗺️"
          label="Change Zone"
          color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          onClick={() => setCurrentPage('zones')}
        />
        <NavButton
          icon="📖"
          label="Pokédex"
          color="linear-gradient(135deg, #ef4444 0%, #f97316 100%)"
          onClick={() => setCurrentPage('pokedex')}
        />
        <NavButton
          icon="🛒"
          label="Shop"
          color="linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
          onClick={() => setCurrentPage('shop')}
        />
        <div className="p-4 rounded-2xl flex items-center gap-3" style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: 'white'
        }}>
          <span className="text-2xl">🪙</span>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Balance</div>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', fontWeight: '700' }}>
              {user?.odCoins || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Active Encounter Component
interface ActiveEncounterProps {
  pokemon: {
    odId: string;
    odPokemonId: number;
    odName: string;
    odRarity: 'common' | 'uncommon' | 'rare' | 'legendary';
    odIsShiny: boolean;
    odSpriteUrl: string;
  };
  ballInventory: { great: number; ultra: number; master: number };
  onCatch: (odId: string, ballType: string) => void;
  onRun: () => void;
}

function ActiveEncounter({ pokemon, ballInventory, onCatch, onRun }: ActiveEncounterProps) {
  // Use centralized sprite URL function
  const spriteUrl = getSpriteUrl(pokemon.odPokemonId, pokemon.odIsShiny);
  const pokemonName = getPokemonName(pokemon.odPokemonId);

  return (
    <div className="p-5 rounded-3xl" style={{
      background: RARITY_COLORS[pokemon.odRarity],
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    }}>
      <div className="text-center text-white">
        <div className="text-xs uppercase tracking-wider mb-2 opacity-80">
          {pokemon.odIsShiny && '✨ '}{pokemon.odRarity} Pokémon!
        </div>
        <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
          <img
            src={spriteUrl}
            alt={pokemonName}
            className="w-full h-full object-contain"
            style={{
              imageRendering: 'pixelated',
              filter: pokemon.odIsShiny ? 'drop-shadow(0 0 8px gold)' : 'none'
            }}
          />
        </div>
        <h3 style={{
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '22px',
          fontWeight: '700'
        }}>
          {pokemon.odIsShiny && '✨ '}{pokemonName}
        </h3>
      </div>

      {/* Ball Selection */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        <button
          onClick={() => onCatch(pokemon.odId, 'pokeball')}
          className="p-3 rounded-xl text-center transition-all transform hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.9)' }}
        >
          <img src={BALL_SPRITES.poke} alt="Poké Ball" className="w-8 h-8 mx-auto" style={{ imageRendering: 'pixelated' }} />
          <div style={{ fontSize: '10px', color: 'var(--text)', fontWeight: '600' }}>Poké</div>
        </button>
        <button
          onClick={() => ballInventory.great > 0 && onCatch(pokemon.odId, 'great')}
          disabled={ballInventory.great === 0}
          className="p-3 rounded-xl text-center transition-all transform hover:scale-105"
          style={{
            background: ballInventory.great > 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
            opacity: ballInventory.great > 0 ? 1 : 0.5
          }}
        >
          <img src={BALL_SPRITES.great} alt="Great Ball" className="w-8 h-8 mx-auto" style={{ imageRendering: 'pixelated' }} />
          <div style={{ fontSize: '10px', color: 'var(--text)', fontWeight: '600' }}>{ballInventory.great}</div>
        </button>
        <button
          onClick={() => ballInventory.ultra > 0 && onCatch(pokemon.odId, 'ultra')}
          disabled={ballInventory.ultra === 0}
          className="p-3 rounded-xl text-center transition-all transform hover:scale-105"
          style={{
            background: ballInventory.ultra > 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
            opacity: ballInventory.ultra > 0 ? 1 : 0.5
          }}
        >
          <img src={BALL_SPRITES.ultra} alt="Ultra Ball" className="w-8 h-8 mx-auto" style={{ imageRendering: 'pixelated' }} />
          <div style={{ fontSize: '10px', color: 'var(--text)', fontWeight: '600' }}>{ballInventory.ultra}</div>
        </button>
        <button
          onClick={() => ballInventory.master > 0 && onCatch(pokemon.odId, 'master')}
          disabled={ballInventory.master === 0}
          className="p-3 rounded-xl text-center transition-all transform hover:scale-105"
          style={{
            background: ballInventory.master > 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
            opacity: ballInventory.master > 0 ? 1 : 0.5
          }}
        >
          <img src={BALL_SPRITES.master} alt="Master Ball" className="w-8 h-8 mx-auto" style={{ imageRendering: 'pixelated' }} />
          <div style={{ fontSize: '10px', color: 'var(--text)', fontWeight: '600' }}>{ballInventory.master}</div>
        </button>
      </div>

      {/* Run Button */}
      <button
        onClick={onRun}
        className="w-full mt-3 py-2 rounded-xl transition-all"
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: 'none',
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        🏃 Run Away
      </button>
    </div>
  );
}

// Zone Selector Component
interface ZoneSelectorProps {
  zones: Record<string, { name: string; levelRequired: number }>;
  currentZone: string;
  trainerLevel: number;
  onSelectZone: (zone: string) => void;
  onBack: () => void;
}

function ZoneSelector({ zones, currentZone, trainerLevel, onSelectZone, onBack }: ZoneSelectorProps) {
  const zoneColors: Record<string, string> = {
    meadow: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    forest: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    mountain: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    ocean: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    sky: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    mystery: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
  };

  const zoneIcons: Record<string, string> = {
    meadow: '🌿',
    forest: '🌲',
    mountain: '🏔️',
    ocean: '🌊',
    sky: '☁️',
    mystery: '❓',
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-4 flex items-center gap-3" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <button
          onClick={onBack}
          className="text-2xl"
          style={{ color: 'var(--accent-solid)', background: 'none', border: 'none' }}
        >
          ←
        </button>
        <h2 style={{
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '20px',
          fontWeight: '700'
        }}>
          🗺️ Select Zone
        </h2>
      </div>

      <div className="p-4 space-y-3">
        {Object.entries(zones).map(([zoneId, zone]) => {
          const isUnlocked = trainerLevel >= zone.levelRequired;
          const isCurrent = currentZone === zoneId;

          return (
            <button
              key={zoneId}
              onClick={() => isUnlocked && onSelectZone(zoneId)}
              disabled={!isUnlocked}
              className="w-full p-5 rounded-2xl flex items-center gap-4 transition-all transform hover:scale-102 active:scale-95"
              style={{
                background: isUnlocked ? zoneColors[zoneId] : 'var(--bg-secondary)',
                color: isUnlocked ? 'white' : 'var(--text-muted)',
                border: isCurrent ? '3px solid white' : 'none',
                boxShadow: isCurrent ? '0 0 20px rgba(236, 72, 153, 0.5)' : '0 4px 16px rgba(0, 0, 0, 0.1)',
                opacity: isUnlocked ? 1 : 0.6
              }}
            >
              <span className="text-4xl">{zoneIcons[zoneId]}</span>
              <div className="flex-1 text-left">
                <div style={{
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  {zone.name}
                </div>
                {!isUnlocked && (
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    🔒 Requires Level {zone.levelRequired}
                  </div>
                )}
                {isCurrent && (
                  <div style={{ fontSize: '12px' }}>
                    ✓ Current Zone
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Nav Button Component
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
      className="p-4 rounded-2xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
      style={{
        background: color,
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
      }}
    >
      <span className="text-2xl">{icon}</span>
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
