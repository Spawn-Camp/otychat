import { useState, useEffect } from 'react';
import {
  CUSTOM_EMOJI_IDS,
  UNICODE_EMOJIS,
  getEmojiUrl,
  loadFavorites,
  saveFavorites,
} from '../data/emoji-data';

interface EmojiPickerProps {
  onSelect: (emoji: string, isCustom: boolean) => void;
}

type Category = 'custom' | 'faces' | 'gestures' | 'hearts' | 'animals' | 'food' | 'activities' | 'objects' | 'symbols';

const CATEGORY_ICONS: Record<Category, string> = {
  custom: '⭐',
  faces: '😀',
  gestures: '👋',
  hearts: '❤️',
  animals: '🐶',
  food: '🍕',
  activities: '🎮',
  objects: '💡',
  symbols: '🔥',
};

const CATEGORY_NAMES: Record<Category, string> = {
  custom: 'Fellas',
  faces: 'Faces',
  gestures: 'Gestures',
  hearts: 'Hearts',
  animals: 'Animals',
  food: 'Food',
  activities: 'Activities',
  objects: 'Objects',
  symbols: 'Symbols',
};

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('custom');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const handleEmojiClick = (emoji: string, isCustom: boolean) => {
    if (editMode) {
      // Toggle favorite
      const newFavorites = favorites.includes(emoji)
        ? favorites.filter(f => f !== emoji)
        : [...favorites.slice(0, 6), emoji]; // Max 7 favorites
      setFavorites(newFavorites);
      saveFavorites(newFavorites);
    } else {
      onSelect(emoji, isCustom);
      setShowFullPicker(false);
    }
  };

  const handleQuickEmoji = (emoji: string) => {
    // Custom emojis are IDs (numbers), unicode are actual emoji chars
    const isCustom = /^\d+$/.test(emoji);
    onSelect(emoji, isCustom);
  };

  // Render a single emoji (custom or unicode)
  const renderEmoji = (emoji: string, isCustom: boolean, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10',
    };

    const isFavorite = favorites.includes(emoji);

    if (isCustom) {
      return (
        <div className="relative">
          <img
            src={getEmojiUrl(emoji)}
            alt="emoji"
            className={`${sizeClasses[size]} object-contain`}
          />
          {editMode && (
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs ${
              isFavorite ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {isFavorite ? '★' : '+'}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="relative">
        <span className={size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'}>
          {emoji}
        </span>
        {editMode && (
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs ${
            isFavorite ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {isFavorite ? '★' : '+'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Favorites Bar */}
      <div className="flex items-center gap-1.5">
        {/* Scrollable favorites */}
        <div
          className="favorites-bar flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.favorites-bar::-webkit-scrollbar { display: none; }`}</style>
          {favorites.map((emoji, i) => {
            const isCustom = /^\d+$/.test(emoji);
            return (
              <button
                key={`fav-${i}`}
                onClick={() => handleQuickEmoji(emoji)}
                className="flex-shrink-0 transition-all transform hover:scale-110 active:scale-125"
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  padding: '6px 8px',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(251, 191, 36, 0.2)',
                }}
              >
                {renderEmoji(emoji, isCustom, 'sm')}
              </button>
            );
          })}
        </div>

        {/* More button - always visible */}
        <button
          onClick={() => setShowFullPicker(!showFullPicker)}
          className="flex-shrink-0 transition-all transform hover:scale-110"
          style={{
            background: showFullPicker
              ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
              : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
            borderRadius: '12px',
            padding: '6px 10px',
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            color: showFullPicker ? 'white' : '#6b7280',
            fontFamily: 'Fredoka, sans-serif',
            fontWeight: '700',
            fontSize: '14px',
          }}
        >
          •••
        </button>
      </div>

      {/* Full Emoji Picker Modal */}
      {showFullPicker && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-3xl overflow-hidden z-50"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            maxHeight: '350px',
          }}
        >
          {/* Header */}
          <div className="p-3 flex items-center justify-between border-b border-gray-100">
            <h3 style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--text)',
            }}>
              {editMode ? '⭐ Edit Favorites' : '😎 All Emojis'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-3 py-1.5 rounded-xl transition-all"
                style={{
                  background: editMode
                    ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
                    : 'var(--bg-secondary)',
                  color: editMode ? 'white' : 'var(--text-muted)',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '11px',
                  fontWeight: '600',
                  border: 'none',
                }}
              >
                {editMode ? '✓ Done' : '✏️ Edit'}
              </button>
              <button
                onClick={() => setShowFullPicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--bg-secondary)',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '16px',
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-100">
            {(Object.keys(CATEGORY_ICONS) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-3 py-2 rounded-xl transition-all"
                style={{
                  background: activeCategory === cat
                    ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
                    : 'transparent',
                  color: activeCategory === cat ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                <span className="text-lg mr-1">{CATEGORY_ICONS[cat]}</span>
                {CATEGORY_NAMES[cat]}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="p-3 overflow-y-auto" style={{ maxHeight: '220px' }}>
            {editMode && (
              <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>
                Tap emojis to add/remove from favorites (max 7)
              </p>
            )}

            <div className="grid grid-cols-8 gap-1">
              {activeCategory === 'custom' ? (
                CUSTOM_EMOJI_IDS.map((id) => (
                  <button
                    key={id}
                    onClick={() => handleEmojiClick(id, true)}
                    className="p-2 rounded-xl transition-all hover:bg-gray-100 active:scale-110 flex items-center justify-center"
                    style={{
                      border: 'none',
                      background: favorites.includes(id) && editMode
                        ? 'rgba(251, 191, 36, 0.2)'
                        : 'transparent',
                    }}
                  >
                    {renderEmoji(id, true, 'md')}
                  </button>
                ))
              ) : (
                UNICODE_EMOJIS[activeCategory].map((emoji, i) => (
                  <button
                    key={`${activeCategory}-${i}`}
                    onClick={() => handleEmojiClick(emoji, false)}
                    className="p-2 rounded-xl transition-all hover:bg-gray-100 active:scale-110 flex items-center justify-center"
                    style={{
                      border: 'none',
                      background: favorites.includes(emoji) && editMode
                        ? 'rgba(251, 191, 36, 0.2)'
                        : 'transparent',
                    }}
                  >
                    {renderEmoji(emoji, false, 'md')}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
