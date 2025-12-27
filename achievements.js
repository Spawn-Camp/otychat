/**
 * OtyChat Achievement System
 * Track and unlock achievements
 */

// Achievement definitions
const ACHIEVEMENTS = {
  // First actions
  first_reaction: {
    id: 'first_reaction',
    name: 'First Reaction',
    description: 'Send your first emoji reaction',
    icon: '🎭',
    reward: 10,
    title: null
  },
  first_question: {
    id: 'first_question',
    name: 'Curious Mind',
    description: 'Ask your first question',
    icon: '❓',
    reward: 15,
    title: null
  },
  first_drawing: {
    id: 'first_drawing',
    name: 'Picasso',
    description: 'Send your first drawing',
    icon: '🎨',
    reward: 15,
    title: 'Artist'
  },
  first_pokemon: {
    id: 'first_pokemon',
    name: 'Pokemon Trainer',
    description: 'Catch your first Pokemon',
    icon: '🎮',
    reward: 20,
    title: 'Trainer'
  },
  first_drink: {
    id: 'first_drink',
    name: 'Cheers!',
    description: 'Log your first drink',
    icon: '🍺',
    reward: 10,
    title: null
  },
  first_dm: {
    id: 'first_dm',
    name: 'Social Butterfly',
    description: 'Send your first DM',
    icon: '💬',
    reward: 10,
    title: null
  },

  // Milestones - Reactions
  reactions_10: {
    id: 'reactions_10',
    name: 'Reactor',
    description: 'Send 10 reactions',
    icon: '🔥',
    reward: 20,
    title: null
  },
  reactions_50: {
    id: 'reactions_50',
    name: 'Hype Machine',
    description: 'Send 50 reactions',
    icon: '💯',
    reward: 50,
    title: 'Hype Beast'
  },
  reactions_100: {
    id: 'reactions_100',
    name: 'Reaction King',
    description: 'Send 100 reactions',
    icon: '👑',
    reward: 100,
    title: 'Reaction King'
  },

  // Milestones - Questions
  questions_5: {
    id: 'questions_5',
    name: 'Inquisitive',
    description: 'Ask 5 questions',
    icon: '🤔',
    reward: 25,
    title: null
  },
  questions_20: {
    id: 'questions_20',
    name: 'Question Master',
    description: 'Ask 20 questions',
    icon: '🧠',
    reward: 75,
    title: 'Question Master'
  },

  // Milestones - Pokemon
  pokemon_5: {
    id: 'pokemon_5',
    name: 'Pokemon Collector',
    description: 'Catch 5 Pokemon',
    icon: '📦',
    reward: 30,
    title: null
  },
  pokemon_20: {
    id: 'pokemon_20',
    name: 'Pokemon Master',
    description: 'Catch 20 Pokemon',
    icon: '🏆',
    reward: 100,
    title: 'Pokemon Master'
  },
  first_shiny: {
    id: 'first_shiny',
    name: 'Shiny Hunter',
    description: 'Catch a shiny Pokemon',
    icon: '✨',
    reward: 50,
    title: 'Shiny Hunter'
  },
  legendary_catch: {
    id: 'legendary_catch',
    name: 'Legend',
    description: 'Catch a legendary Pokemon',
    icon: '🌟',
    reward: 100,
    title: 'Legend'
  },

  // Milestones - Drinks
  drinks_3: {
    id: 'drinks_3',
    name: 'Tipsy',
    description: 'Log 3 drinks',
    icon: '🍻',
    reward: 15,
    title: null
  },
  drinks_5: {
    id: 'drinks_5',
    name: 'Party Animal',
    description: 'Log 5 drinks in one session',
    icon: '🎉',
    reward: 30,
    title: 'Party Animal'
  },
  drinks_10: {
    id: 'drinks_10',
    name: 'Legendary Drinker',
    description: 'Log 10 drinks',
    icon: '🍾',
    reward: 50,
    title: 'Legendary Drinker'
  },

  // Special
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Be one of the first 5 to join',
    icon: '🐦',
    reward: 25,
    title: 'Early Bird'
  },
  popular_question: {
    id: 'popular_question',
    name: 'Popular',
    description: 'Get 10 upvotes on a question',
    icon: '⭐',
    reward: 40,
    title: null
  },
  shop_purchase: {
    id: 'shop_purchase',
    name: 'Big Spender',
    description: 'Buy something from the shop',
    icon: '🛒',
    reward: 10,
    title: null
  }
};

// Get all achievements
function getAllAchievements() {
  return Object.values(ACHIEVEMENTS);
}

// Get achievement by ID
function getAchievement(id) {
  return ACHIEVEMENTS[id] || null;
}

// Check and unlock achievements based on stats
function checkAchievements(db, userId, stats, context = {}) {
  const unlocked = [];

  const check = (achievementId, condition) => {
    if (condition && !db.hasAchievement(userId, achievementId)) {
      const result = db.unlockAchievement(userId, achievementId);
      if (result.changes > 0) {
        const achievement = getAchievement(achievementId);
        if (achievement) {
          // Give coins
          db.addCoins(userId, achievement.reward);

          // Set title if achievement has one
          if (achievement.title) {
            db.setTitle(userId, achievement.title);
          }

          unlocked.push(achievement);
        }
      }
    }
  };

  // Check first-time achievements
  check('first_reaction', stats.reactions >= 1);
  check('first_question', stats.questions >= 1);
  check('first_drink', stats.drinks >= 1);

  // Check milestone achievements
  check('reactions_10', stats.reactions >= 10);
  check('reactions_50', stats.reactions >= 50);
  check('reactions_100', stats.reactions >= 100);

  check('questions_5', stats.questions >= 5);
  check('questions_20', stats.questions >= 20);

  check('drinks_3', stats.drinks >= 3);
  check('drinks_5', stats.drinks >= 5);
  check('drinks_10', stats.drinks >= 10);

  // Pokemon achievements
  if (context.pokemonCount !== undefined) {
    check('first_pokemon', context.pokemonCount >= 1);
    check('pokemon_5', context.pokemonCount >= 5);
    check('pokemon_20', context.pokemonCount >= 20);
  }

  // Context-specific achievements
  if (context.isDrawing) {
    check('first_drawing', true);
  }

  if (context.isShiny) {
    check('first_shiny', true);
  }

  if (context.isLegendary) {
    check('legendary_catch', true);
  }

  if (context.isDM) {
    check('first_dm', true);
  }

  if (context.isEarlyBird) {
    check('early_bird', true);
  }

  if (context.questionVotes >= 10) {
    check('popular_question', true);
  }

  if (context.shopPurchase) {
    check('shop_purchase', true);
  }

  return unlocked;
}

// Get user's achievement progress
function getProgress(stats, pokemonCount = 0) {
  return {
    reactions: {
      current: stats.reactions || 0,
      milestones: [1, 10, 50, 100]
    },
    questions: {
      current: stats.questions || 0,
      milestones: [1, 5, 20]
    },
    drinks: {
      current: stats.drinks || 0,
      milestones: [1, 3, 5, 10]
    },
    pokemon: {
      current: pokemonCount,
      milestones: [1, 5, 20]
    }
  };
}

module.exports = {
  ACHIEVEMENTS,
  getAllAchievements,
  getAchievement,
  checkAchievements,
  getProgress
};
