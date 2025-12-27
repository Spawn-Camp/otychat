import { useState } from 'react';

interface TrainerSpritesProps {
  onBack: () => void;
  onSelect: (sprite: string) => void;
}

// Pokemon Showdown trainer sprite base URL
const SPRITE_BASE = 'https://play.pokemonshowdown.com/sprites/trainers';

// Curated list of popular trainer sprites organized by category
const TRAINER_CATEGORIES = {
  'Protagonists': [
    { name: 'red', label: 'Red' },
    { name: 'leaf-gen3', label: 'Leaf' },
    { name: 'blue', label: 'Blue' },
    { name: 'ethan', label: 'Ethan' },
    { name: 'lyra', label: 'Lyra' },
    { name: 'brendan', label: 'Brendan' },
    { name: 'may', label: 'May' },
    { name: 'lucas', label: 'Lucas' },
    { name: 'dawn', label: 'Dawn' },
    { name: 'hilbert', label: 'Hilbert' },
    { name: 'hilda', label: 'Hilda' },
    { name: 'nate', label: 'Nate' },
    { name: 'rosa', label: 'Rosa' },
    { name: 'calem', label: 'Calem' },
    { name: 'serena', label: 'Serena' },
    { name: 'elio', label: 'Elio' },
    { name: 'selene', label: 'Selene' },
    { name: 'victor', label: 'Victor' },
    { name: 'gloria', label: 'Gloria' },
  ],
  'Anime': [
    { name: 'ash', label: 'Ash' },
    { name: 'ash-alola', label: 'Ash (Alola)' },
    { name: 'ash-hoenn', label: 'Ash (Hoenn)' },
    { name: 'misty', label: 'Misty' },
    { name: 'brock', label: 'Brock' },
    { name: 'dawn-contest', label: 'Dawn' },
    { name: 'may-contest', label: 'May' },
    { name: 'serena-anime', label: 'Serena' },
    { name: 'jessiejames-gen1', label: 'Jessie & James' },
    { name: 'cynthia-anime', label: 'Cynthia' },
  ],
  'Gym Leaders': [
    { name: 'brock-gen1', label: 'Brock' },
    { name: 'misty-gen1', label: 'Misty' },
    { name: 'ltsurge', label: 'Lt. Surge' },
    { name: 'erika-gen1', label: 'Erika' },
    { name: 'sabrina-gen1', label: 'Sabrina' },
    { name: 'koga-gen1', label: 'Koga' },
    { name: 'blaine-gen1', label: 'Blaine' },
    { name: 'giovanni-gen1', label: 'Giovanni' },
    { name: 'whitney', label: 'Whitney' },
    { name: 'clair', label: 'Clair' },
    { name: 'roxanne', label: 'Roxanne' },
    { name: 'flannery', label: 'Flannery' },
    { name: 'elesa', label: 'Elesa' },
    { name: 'skyla', label: 'Skyla' },
    { name: 'korrina', label: 'Korrina' },
    { name: 'raihan', label: 'Raihan' },
    { name: 'nessa', label: 'Nessa' },
    { name: 'marnie', label: 'Marnie' },
  ],
  'Champions & Elite 4': [
    { name: 'lance', label: 'Lance' },
    { name: 'cynthia', label: 'Cynthia' },
    { name: 'steven', label: 'Steven' },
    { name: 'wallace', label: 'Wallace' },
    { name: 'alder', label: 'Alder' },
    { name: 'iris-gen5bw2', label: 'Iris' },
    { name: 'diantha', label: 'Diantha' },
    { name: 'leon', label: 'Leon' },
    { name: 'lorelei-gen3', label: 'Lorelei' },
    { name: 'bruno', label: 'Bruno' },
    { name: 'agatha-gen3', label: 'Agatha' },
    { name: 'karen', label: 'Karen' },
    { name: 'phoebe-gen3', label: 'Phoebe' },
    { name: 'flint', label: 'Flint' },
    { name: 'caitlin', label: 'Caitlin' },
    { name: 'grimsley', label: 'Grimsley' },
  ],
  'Rivals': [
    { name: 'blue-gen1', label: 'Blue' },
    { name: 'silver', label: 'Silver' },
    { name: 'wally', label: 'Wally' },
    { name: 'barry', label: 'Barry' },
    { name: 'cheren', label: 'Cheren' },
    { name: 'bianca', label: 'Bianca' },
    { name: 'hugh', label: 'Hugh' },
    { name: 'shauna', label: 'Shauna' },
    { name: 'hau', label: 'Hau' },
    { name: 'gladion', label: 'Gladion' },
    { name: 'hop', label: 'Hop' },
    { name: 'bede', label: 'Bede' },
  ],
  'Team Villains': [
    { name: 'rocketgrunt', label: 'Rocket Grunt' },
    { name: 'magmagrunt', label: 'Magma Grunt' },
    { name: 'aquagrunt', label: 'Aqua Grunt' },
    { name: 'galacticgrunt', label: 'Galactic Grunt' },
    { name: 'plasmagrunt', label: 'Plasma Grunt' },
    { name: 'flaregrunt', label: 'Flare Grunt' },
    { name: 'skullgrunt', label: 'Skull Grunt' },
    { name: 'giovanni', label: 'Giovanni' },
    { name: 'archie-gen6', label: 'Archie' },
    { name: 'maxie-gen6', label: 'Maxie' },
    { name: 'cyrus', label: 'Cyrus' },
    { name: 'ghetsis', label: 'Ghetsis' },
    { name: 'lysandre', label: 'Lysandre' },
    { name: 'guzma', label: 'Guzma' },
    { name: 'lusamine', label: 'Lusamine' },
  ],
  'Trainer Classes': [
    { name: 'acetrainer', label: 'Ace Trainer' },
    { name: 'acetrainerf', label: 'Ace Trainer F' },
    { name: 'youngster-gen4', label: 'Youngster' },
    { name: 'lass-gen4', label: 'Lass' },
    { name: 'hiker', label: 'Hiker' },
    { name: 'swimmer', label: 'Swimmer' },
    { name: 'swimmerf', label: 'Swimmer F' },
    { name: 'beauty', label: 'Beauty' },
    { name: 'scientist', label: 'Scientist' },
    { name: 'pokemonbreeder', label: 'Breeder' },
    { name: 'pokemonbreederf', label: 'Breeder F' },
    { name: 'pokemonranger', label: 'Ranger' },
    { name: 'pokemonrangerf', label: 'Ranger F' },
    { name: 'sailor', label: 'Sailor' },
    { name: 'fisherman', label: 'Fisherman' },
    { name: 'blackbelt', label: 'Black Belt' },
    { name: 'psychic-gen4', label: 'Psychic' },
    { name: 'guitarist', label: 'Guitarist' },
  ],
  'Special': [
    { name: 'oak', label: 'Prof. Oak' },
    { name: 'elm', label: 'Prof. Elm' },
    { name: 'birch', label: 'Prof. Birch' },
    { name: 'rowan', label: 'Prof. Rowan' },
    { name: 'juniper', label: 'Prof. Juniper' },
    { name: 'sycamore', label: 'Prof. Sycamore' },
    { name: 'kukui', label: 'Prof. Kukui' },
    { name: 'nurse', label: 'Nurse Joy' },
    { name: 'pokemoncenterlady', label: 'Poké Mart Lady' },
    { name: 'n', label: 'N' },
    { name: 'colress', label: 'Colress' },
    { name: 'zinnia', label: 'Zinnia' },
    { name: 'lillie', label: 'Lillie' },
    { name: 'lillie-z', label: 'Lillie Z' },
  ],
};

type Category = keyof typeof TRAINER_CATEGORIES;

export default function TrainerSprites({ onBack, onSelect }: TrainerSpritesProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Protagonists');
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (name: string) => {
    setLoadedImages(prev => new Set(prev).add(name));
  };

  const handleImageError = (name: string) => {
    setFailedImages(prev => new Set(prev).add(name));
  };

  const handleSelect = (spriteName: string) => {
    // Return the full URL so it can be used as profile pic
    onSelect(`${SPRITE_BASE}/${spriteName}.png`);
  };

  const categories = Object.keys(TRAINER_CATEGORIES) as Category[];
  const trainers = TRAINER_CATEGORIES[selectedCategory];

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3" style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
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
          🎮 Trainer Sprites
        </h2>
      </div>

      {/* Category Tabs */}
      <div className="p-3 overflow-x-auto" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="px-4 py-2 rounded-full transition-all whitespace-nowrap"
              style={{
                background: selectedCategory === category
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'var(--bg-secondary)',
                color: selectedCategory === category ? 'white' : 'var(--text)',
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                boxShadow: selectedCategory === category
                  ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                  : 'none'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Sprite Grid */}
      <div className="p-4">
        <p className="mb-4" style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          Tap a trainer to use as your avatar
        </p>

        <div className="grid grid-cols-4 gap-3">
          {trainers.map((trainer) => {
            const hasLoaded = loadedImages.has(trainer.name);
            const hasFailed = failedImages.has(trainer.name);

            return (
              <button
                key={trainer.name}
                onClick={() => !hasFailed && handleSelect(trainer.name)}
                className="aspect-square p-2 rounded-2xl transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  border: 'none',
                  opacity: hasFailed ? 0.4 : 1
                }}
                disabled={hasFailed}
              >
                <div className="w-14 h-14 flex items-center justify-center relative">
                  {!hasLoaded && !hasFailed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full animate-pulse" style={{
                        background: 'var(--bg-secondary)'
                      }} />
                    </div>
                  )}
                  <img
                    src={`${SPRITE_BASE}/${trainer.name}.png`}
                    alt={trainer.label}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      imageRendering: 'pixelated',
                      opacity: hasLoaded ? 1 : 0,
                      transition: 'opacity 0.2s'
                    }}
                    onLoad={() => handleImageLoad(trainer.name)}
                    onError={() => handleImageError(trainer.name)}
                  />
                </div>
                <span style={{
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }}>
                  {trainer.label}
                </span>
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
          Sprites from Pokémon Showdown
        </p>
      </div>
    </div>
  );
}
