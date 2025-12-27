import { useSocket } from '../../contexts/SocketContext';

interface ShopProps {
  coins: number;
  onBack: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  category: string;
  price: number;
  icon: string;
  description?: string;
  gradient: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // Pokeballs
  {
    id: 'great_ball_5',
    category: 'Pokéballs',
    name: 'Great Ball x5',
    icon: '🔵',
    price: 200,
    description: '1.5x catch rate',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  },
  {
    id: 'ultra_ball_3',
    category: 'Pokéballs',
    name: 'Ultra Ball x3',
    icon: '⚫',
    price: 350,
    description: '2x catch rate',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
  },
  {
    id: 'master_ball',
    category: 'Pokéballs',
    name: 'Master Ball',
    icon: '🟣',
    price: 1000,
    description: '100% catch rate!',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
  },
  // Stones
  {
    id: 'fire_stone',
    category: 'Evolution Stones',
    name: 'Fire Stone',
    icon: '🔥',
    price: 200,
    description: 'Evolve fire-type Pokemon',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  },
  {
    id: 'water_stone',
    category: 'Evolution Stones',
    name: 'Water Stone',
    icon: '💧',
    price: 200,
    description: 'Evolve water-type Pokemon',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  {
    id: 'thunder_stone',
    category: 'Evolution Stones',
    name: 'Thunder Stone',
    icon: '⚡',
    price: 200,
    description: 'Evolve electric-type Pokemon',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
  },
  {
    id: 'leaf_stone',
    category: 'Evolution Stones',
    name: 'Leaf Stone',
    icon: '🍃',
    price: 200,
    description: 'Evolve grass-type Pokemon',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    id: 'moon_stone',
    category: 'Evolution Stones',
    name: 'Moon Stone',
    icon: '🌙',
    price: 200,
    description: 'Evolve special Pokemon',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
  },
  // Upgrades
  {
    id: 'shiny_charm',
    category: 'Upgrades',
    name: 'Shiny Charm',
    icon: '✨',
    price: 500,
    description: '2x shiny encounter rate',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
  },
  // Titles
  {
    id: 'title_party',
    category: 'Titles',
    name: '"Party Animal"',
    icon: '🎉',
    price: 300,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  },
  {
    id: 'title_brain',
    category: 'Titles',
    name: '"Big Brain"',
    icon: '🧠',
    price: 300,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  },
  {
    id: 'title_goat',
    category: 'Titles',
    name: '"Certified Goat"',
    icon: '🐐',
    price: 500,
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    id: 'gold_title',
    category: 'Titles',
    name: 'Gold Username',
    icon: '👑',
    price: 50,
    description: 'Golden username color',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
  },
];

export default function Shop({ coins, onBack }: ShopProps) {
  const { buyItem } = useSocket();
  const categories = Array.from(new Set(SHOP_ITEMS.map(item => item.category)));

  const categoryIcons: Record<string, string> = {
    'Pokéballs': '⚾',
    'Evolution Stones': '💎',
    'Upgrades': '⚡',
    'Titles': '🎖️',
  };

  const handleBuy = (item: ShopItem) => {
    if (coins < item.price) {
      return;
    }
    buyItem(item.id);
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <button
          onClick={onBack}
          className="text-2xl"
          style={{ color: 'var(--accent-solid)' }}
        >
          ←
        </button>
        <h2 style={{
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '20px',
          fontWeight: '700',
          flex: 1
        }}>
          🛒 Shop
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: 'white'
        }}>
          <span>🪙</span>
          <span style={{
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '16px',
            fontWeight: '700'
          }}>
            {coins}
          </span>
        </div>
      </div>

      {/* Items by Category */}
      <div className="p-4 space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h3 className="mb-3 flex items-center gap-2" style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--text)'
            }}>
              <span>{categoryIcons[category]}</span>
              {category}
            </h3>

            <div className="space-y-3">
              {SHOP_ITEMS.filter(item => item.category === category).map(item => {
                const canAfford = coins >= item.price;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl flex items-center gap-4"
                    style={{
                      background: 'white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      opacity: canAfford ? 1 : 0.6
                    }}
                  >
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{
                      background: item.gradient
                    }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{
                        fontFamily: 'Fredoka, sans-serif',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'var(--text)'
                      }}>
                        {item.name}
                      </p>
                      {item.description && (
                        <p style={{
                          fontSize: '13px',
                          color: 'var(--text-muted)',
                          marginTop: '2px'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className="px-4 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                      style={{
                        background: canAfford
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'var(--bg-secondary)',
                        color: canAfford ? 'white' : 'var(--text-muted)',
                        fontFamily: 'Fredoka, sans-serif',
                        fontSize: '14px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        boxShadow: canAfford ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                      }}
                    >
                      <span>🪙</span>
                      {item.price}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
