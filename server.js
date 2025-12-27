/**
 * OtyChat Server
 * Express + Socket.io + SQLite
 * Enhanced Pokemon System with Zones, Leveling, and Catch Mechanics
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const db = require('./db');
const pokemon = require('./pokemon');
const achievements = require('./achievements');

// ============================================
// SERVER SETUP
// ============================================

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;
const ADMIN_CODE = process.env.ADMIN_CODE || 'otyadmin';

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ============================================
// TEST ROUTES (for development)
// ============================================

// Grant test Pokemon and items to a user
app.post('/api/test/grant-pokemon', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    let user = db.getUserByUsername(username);
    if (!user) {
      user = db.createUser(username);
    }

    // Grant some caught Pokemon (mix of common, uncommon, rare, and a shiny)
    const testPokemon = [
      { id: 25, name: 'Pikachu', shiny: false },      // Common favorite
      { id: 1, name: 'Bulbasaur', shiny: false },     // Starter
      { id: 4, name: 'Charmander', shiny: false },    // Starter
      { id: 7, name: 'Squirtle', shiny: false },      // Starter
      { id: 133, name: 'Eevee', shiny: false },       // Popular
      { id: 143, name: 'Snorlax', shiny: false },     // Rare
      { id: 149, name: 'Dragonite', shiny: false },   // Rare
      { id: 150, name: 'Mewtwo', shiny: false },      // Legendary
      { id: 6, name: 'Charizard', shiny: true },      // Shiny!
      { id: 151, name: 'Mew', shiny: true },          // Shiny Legendary!
    ];

    for (const poke of testPokemon) {
      db.catchPokemon(user.id, poke.id, poke.name, poke.shiny, 'meadow');
    }

    // Grant some balls
    db.updateBallInventory(user.id, 'great', 10);
    db.updateBallInventory(user.id, 'ultra', 5);
    db.updateBallInventory(user.id, 'master', 1);

    // Grant some stones
    db.updateStoneInventory(user.id, 'fire_stone', 2);
    db.updateStoneInventory(user.id, 'water_stone', 2);
    db.updateStoneInventory(user.id, 'thunder_stone', 2);
    db.updateStoneInventory(user.id, 'moon_stone', 1);

    // Grant XP to level up
    db.addXP(user.id, 500); // Should get to level 5+

    // Grant coins
    db.addCoins(user.id, 500);

    res.json({
      success: true,
      message: `Granted 10 Pokemon (2 shiny), balls, stones, 500 XP, and 500 coins to ${username}`,
      pokemon: testPokemon.map(p => `${p.name}${p.shiny ? ' ✨' : ''}`),
    });
  } catch (error) {
    console.error('Test grant error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Trigger a Pokemon spawn for a user
app.post('/api/test/spawn', async (req, res) => {
  const { username, pokemonId, shiny, zone } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  // Find the user's socket
  let targetSocket = null;
  for (const [socketId, data] of connectedUsers.entries()) {
    if (data.username === username) {
      targetSocket = io.sockets.sockets.get(socketId);
      break;
    }
  }

  if (!targetSocket) {
    return res.status(404).json({ error: 'User not connected' });
  }

  const spawn = pokemon.adminSpawn(
    targetSocket.data.userId,
    zone || 'meadow',
    pokemonId || null,
    shiny || false
  );

  // Format spawn data for frontend
  const spawnData = {
    odId: spawn.odId,
    pokemonId: spawn.pokemon.id,
    pokemonName: spawn.pokemon.name,
    rarity: spawn.pokemon.rarity,
    isShiny: spawn.isShiny,
    zone: spawn.zone,
    expiresAt: spawn.expiresAt
  };

  targetSocket.emit('pokemon-spawn', spawnData);

  res.json({
    success: true,
    message: `Spawned ${spawnData.pokemonName}${spawnData.isShiny ? ' ✨' : ''} for ${username}`,
    spawn: spawnData
  });
});

// ============================================
// XP REWARDS
// ============================================

const XP_REWARDS = {
  emoji: 1,
  question: 20,
  drawing: 15,
  upvote_received: 5,
  drink: 10,
  dm: 2
};

// ============================================
// SHOP ITEMS
// ============================================

const SHOP_ITEMS = {
  // Pokeballs
  great_ball_5: { price: 200, type: 'ball', ballType: 'great', quantity: 5, name: '5x Great Balls' },
  ultra_ball_3: { price: 350, type: 'ball', ballType: 'ultra', quantity: 3, name: '3x Ultra Balls' },
  master_ball: { price: 1000, type: 'ball', ballType: 'master', quantity: 1, name: 'Master Ball' },

  // Spawn effects
  incense: { price: 300, type: 'effect', effectType: 'incense', duration: 30 * 60 * 1000, name: 'Incense (30min)' },
  lure: { price: 250, type: 'effect', effectType: 'lure', uses: 5, name: 'Lure (5 catches)' },
  lucky_egg: { price: 200, type: 'effect', effectType: 'lucky_egg', duration: 30 * 60 * 1000, name: 'Lucky Egg (30min)' },

  // Evolution stones
  fire_stone: { price: 200, type: 'stone', stoneType: 'fire_stone', name: 'Fire Stone' },
  water_stone: { price: 200, type: 'stone', stoneType: 'water_stone', name: 'Water Stone' },
  thunder_stone: { price: 200, type: 'stone', stoneType: 'thunder_stone', name: 'Thunder Stone' },
  leaf_stone: { price: 200, type: 'stone', stoneType: 'leaf_stone', name: 'Leaf Stone' },
  moon_stone: { price: 200, type: 'stone', stoneType: 'moon_stone', name: 'Moon Stone' },
  sun_stone: { price: 250, type: 'stone', stoneType: 'sun_stone', name: 'Sun Stone' },
  dragon_scale: { price: 300, type: 'stone', stoneType: 'dragon_scale', name: 'Dragon Scale' },

  // Permanent upgrades
  shiny_charm: { price: 500, type: 'permanent', name: 'Shiny Charm' }
};

// ============================================
// STATE
// ============================================

const connectedUsers = new Map(); // socketId -> { username, odId, zone, trainerLevel }
const displaySockets = new Set();
const adminSockets = new Set();
const userSpawns = new Map(); // oderId -> current spawn odId
const catchAttempts = new Map(); // odId -> attempt count (max 3)

const MAX_CATCH_ATTEMPTS = 3;

let currentPresentation = null;

// ============================================
// HELPERS
// ============================================

function getOnlineCount() {
  return connectedUsers.size;
}

function getOnlineUsers() {
  const users = [];
  connectedUsers.forEach((data, socketId) => {
    users.push({
      username: data.username,
      zone: data.zone,
      level: data.trainerLevel,
      online: true
    });
  });
  return users;
}

function broadcastUserCount() {
  io.emit('user-count', getOnlineCount());
}

function broadcastUserList() {
  const users = getOnlineUsers();
  io.emit('user-list', users);
  adminSockets.forEach(socketId => {
    io.to(socketId).emit('user-list', users);
  });
}

function broadcastLeaderboards() {
  io.emit('leaderboards', db.getLeaderboards(10));
}

function emitToDisplay(event, data) {
  displaySockets.forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
}

function emitToAdmin(event, data) {
  adminSockets.forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
}

function getUserStats(userId) {
  if (!currentPresentation) return { reactions: 0, questions: 0, drinks: 0 };
  return db.getStats(userId, currentPresentation.id) || { reactions: 0, questions: 0, drinks: 0 };
}

/**
 * Add XP to user and handle level-up
 */
function addUserXP(socket, userId, amount) {
  // Check for lucky egg (2x XP)
  if (db.hasActiveEffect(userId, 'lucky_egg')) {
    amount *= 2;
  }

  const result = db.addXP(userId, amount);
  if (!result) return null;

  // Emit XP gain
  socket.emit('xp-gained', {
    amount,
    newXP: result.newXP,
    level: result.newLevel,
    nextLevelXP: db.getXPForNextLevel(result.newLevel)
  });

  // Handle level up
  if (result.leveledUp) {
    socket.emit('level-up', {
      oldLevel: result.oldLevel,
      newLevel: result.newLevel,
      newZonesUnlocked: result.newZonesUnlocked
    });

    // Broadcast to feed
    io.emit('feed-event', {
      type: 'level-up',
      username: socket.data.username,
      level: result.newLevel,
      timestamp: Date.now()
    });

    emitToDisplay('level-up', {
      username: socket.data.username,
      level: result.newLevel
    });

    // Broadcast updated leaderboards
    broadcastLeaderboards();

    console.log(`[Level Up] ${socket.data.username} reached level ${result.newLevel}!`);
  }

  return result;
}

/**
 * Send full trainer stats to a socket
 */
function sendTrainerStats(socket, user) {
  const totals = db.getUserTotals(user.id) || { reactions: 0, questions: 0, drinks: 0 };
  const pokemonCount = db.getPokemonCount(user.id);
  const uniquePokemon = db.getUniquePokemonCount(user.id);
  const shinyCount = db.getShinyCount(user.id);
  const ballInventory = db.getBallInventory(user.id);
  const stoneInventory = db.getStoneInventory(user.id);
  const activeEffects = db.getActiveEffects(user.id);
  const unlockedZones = db.getUnlockedZones(user.trainer_level);

  socket.emit('trainer-stats', {
    // Basic stats
    ...totals,
    coins: user.coins,
    title: user.title,

    // Trainer leveling (matching frontend expectations)
    level: user.trainer_level,
    xp: user.trainer_xp,
    xpForNextLevel: db.getXPForNextLevel(user.trainer_level),

    // Zone
    currentZone: user.current_zone,
    unlockedZones,

    // Pokemon stats (matching frontend expectations)
    totalCaught: pokemonCount,
    uniqueCaught: uniquePokemon,
    shinyCaught: shinyCount,
    shinyCharm: user.shiny_charm === 1,

    // Inventory
    balls: {
      pokeball: Infinity,
      great: ballInventory.great_balls,
      ultra: ballInventory.ultra_balls,
      master: ballInventory.master_balls
    },
    stones: {
      fire_stone: stoneInventory.fire_stone,
      water_stone: stoneInventory.water_stone,
      thunder_stone: stoneInventory.thunder_stone,
      leaf_stone: stoneInventory.leaf_stone,
      moon_stone: stoneInventory.moon_stone,
      sun_stone: stoneInventory.sun_stone,
      dragon_scale: stoneInventory.dragon_scale
    },
    activeEffects: activeEffects.map(e => ({
      type: e.effect_type,
      expiresAt: e.expires_at,
      usesRemaining: e.uses_remaining
    }))
  });
}

function checkAndEmitAchievements(socket, userId, context = {}) {
  const stats = db.getUserTotals(userId) || { reactions: 0, questions: 0, drinks: 0 };
  const pokemonCount = db.getPokemonCount(userId);

  const unlocked = achievements.checkAchievements(db, userId, stats, {
    ...context,
    pokemonCount
  });

  unlocked.forEach(achievement => {
    socket.emit('achievement-unlocked', {
      username: socket.data.username,
      achievement: achievement.name,
      icon: achievement.icon,
      reward: achievement.reward
    });

    io.emit('feed-event', {
      type: 'achievement',
      username: socket.data.username,
      achievement: achievement.name,
      icon: achievement.icon,
      timestamp: Date.now()
    });

    emitToDisplay('achievement-unlocked', {
      username: socket.data.username,
      achievement: achievement.name,
      icon: achievement.icon
    });
  });
}

/**
 * Create per-user Pokemon spawn
 */
function createSpawnForSocket(socket) {
  const userId = socket.data.userId;
  const user = db.getUserById(userId);
  if (!user) return null;

  const hasShinyCharm = user.shiny_charm === 1;
  const zone = user.current_zone || 'meadow';

  const spawn = pokemon.createSpawnForUser(userId, zone, hasShinyCharm);
  if (!spawn) return null;

  userSpawns.set(userId, spawn.odId);

  return spawn;
}

/**
 * Trigger global spawn - creates per-user spawns for all connected users
 */
function triggerGlobalSpawn() {
  console.log('[Pokemon] Global spawn triggered!');

  connectedUsers.forEach((data, socketId) => {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket || !socket.data.userId) return;

    const spawn = createSpawnForSocket(socket);
    if (spawn) {
      socket.emit('pokemon-spawn', {
        odId: spawn.odId,
        pokemonId: spawn.pokemon.id,
        pokemonName: spawn.pokemon.name,
        rarity: spawn.pokemon.rarity,
        isShiny: spawn.isShiny,
        zone: spawn.zone,
        sprite: pokemon.getSpriteUrl(spawn.pokemon.id, spawn.isShiny),
        animatedSprite: pokemon.getAnimatedSpriteUrl(spawn.pokemon.id, spawn.isShiny),
        expiresAt: spawn.expiresAt,
        catchWindow: pokemon.CATCH_WINDOW,
        quickCatchWindow: pokemon.QUICK_CATCH_WINDOW
      });

      console.log(`[Pokemon] ${spawn.pokemon.name} spawned for ${data.username} in ${spawn.zone}${spawn.isShiny ? ' (SHINY!)' : ''}`);
    }
  });

  // Notify display
  emitToDisplay('pokemon-spawn-wave', { count: connectedUsers.size });
}

// ============================================
// SOCKET.IO HANDLERS
// ============================================

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.emit('user-count', getOnlineCount());

  // ----------------------------------------
  // JOIN HANDLERS
  // ----------------------------------------

  socket.on('join', ({ username }) => {
    if (!username || username.length > 16) {
      socket.emit('error', { message: 'Invalid username' });
      return;
    }

    const user = db.createUser(username.trim());
    socket.data.userId = user.id;
    socket.data.username = user.username;

    connectedUsers.set(socket.id, {
      username: user.username,
      odId: user.id,
      zone: user.current_zone || 'meadow',
      trainerLevel: user.trainer_level || 1
    });

    if (currentPresentation) {
      db.ensureStats(user.id, currentPresentation.id);
    }

    // Check early bird achievement
    if (getOnlineCount() <= 5) {
      checkAndEmitAchievements(socket, user.id, { isEarlyBird: true });
    }

    // Send full trainer stats
    sendTrainerStats(socket, user);

    // Send existing questions
    if (currentPresentation) {
      const questions = db.getQuestions(currentPresentation.id);
      socket.emit('questions-sync', questions);
    }

    // Send zone data
    socket.emit('zones-data', {
      zones: pokemon.ZONES,
      requirements: pokemon.ZONE_REQUIREMENTS
    });

    // Send shop items
    socket.emit('shop-items', SHOP_ITEMS);

    // Send leaderboards
    socket.emit('leaderboards', db.getLeaderboards(10));

    broadcastUserCount();
    broadcastUserList();

    console.log(`[User] ${username} joined (Level ${user.trainer_level}, Zone: ${user.current_zone})`);
  });

  socket.on('join-display', () => {
    displaySockets.add(socket.id);
    socket.emit('user-count', getOnlineCount());
    console.log('[Display] Connected');
  });

  socket.on('join-admin', ({ adminCode }) => {
    if (adminCode === ADMIN_CODE) {
      adminSockets.add(socket.id);
      socket.emit('user-list', getOnlineUsers());

      if (currentPresentation) {
        const questions = db.getQuestions(currentPresentation.id);
        socket.emit('questions-sync', questions);
      }

      socket.emit('stats-sync', {
        reactions: 0,
        questions: currentPresentation ? db.getQuestions(currentPresentation.id).length : 0,
        pokemon: 0,
        achievements: 0,
        drinks: currentPresentation ? db.getTotalDrinks(currentPresentation.id) : 0
      });

      console.log('[Admin] Connected');
    }
  });

  socket.on('get-user-count', () => {
    socket.emit('user-count', getOnlineCount());
  });

  socket.on('get-leaderboards', () => {
    socket.emit('leaderboards', db.getLeaderboards(10));
  });

  // ----------------------------------------
  // ZONE MANAGEMENT
  // ----------------------------------------

  socket.on('change-zone', ({ zone }) => {
    if (!socket.data.userId) return;

    const success = db.setZone(socket.data.userId, zone);
    if (success) {
      // Update connected users map
      const userData = connectedUsers.get(socket.id);
      if (userData) {
        userData.zone = zone;
      }

      socket.emit('zone-changed', {
        zone,
        zoneName: pokemon.ZONES[zone]?.name || zone
      });

      console.log(`[Zone] ${socket.data.username} moved to ${zone}`);
    } else {
      socket.emit('zone-change-failed', { message: 'Zone not unlocked' });
    }
  });

  // ----------------------------------------
  // PROFILE UPDATES
  // ----------------------------------------

  socket.on('update-profile', (updates) => {
    if (!socket.data.userId) return;

    // Map frontend field names to database field names
    const dbUpdates = {};
    if (updates.profilePic !== undefined) dbUpdates.profile_pic = updates.profilePic;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.nameColor !== undefined) dbUpdates.name_color = updates.nameColor;

    const success = db.updateProfile(socket.data.userId, dbUpdates);
    if (success) {
      socket.emit('profile-updated', updates);
      console.log(`[Profile] ${socket.data.username} updated profile:`, Object.keys(updates).join(', '));
    }
  });

  // ----------------------------------------
  // EMOJI REACTIONS
  // ----------------------------------------

  socket.on('send-emoji', ({ emoji }) => {
    if (!socket.data.userId) return;

    if (currentPresentation) {
      db.incrementReactions(socket.data.userId, currentPresentation.id);
    }

    // Add XP
    addUserXP(socket, socket.data.userId, XP_REWARDS.emoji);

    io.emit('emoji-blast', {
      emoji,
      username: socket.data.username
    });

    emitToDisplay('emoji-blast', {
      emoji,
      username: socket.data.username
    });

    checkAndEmitAchievements(socket, socket.data.userId);
  });

  // ----------------------------------------
  // QUESTIONS
  // ----------------------------------------

  socket.on('send-question', ({ text, drawing }) => {
    if (!socket.data.userId || !currentPresentation) return;
    if (!text && !drawing) return;

    const question = db.createQuestion(
      socket.data.userId,
      currentPresentation.id,
      text || null,
      drawing || null
    );

    db.incrementQuestions(socket.data.userId, currentPresentation.id);

    // Add XP (more for drawings)
    const xp = drawing ? XP_REWARDS.drawing : XP_REWARDS.question;
    addUserXP(socket, socket.data.userId, xp);

    const fullQuestion = {
      ...question,
      username: socket.data.username
    };

    io.emit('question-added', fullQuestion);
    emitToAdmin('question-added', fullQuestion);

    checkAndEmitAchievements(socket, socket.data.userId, {
      isDrawing: !!drawing
    });

    if (drawing) {
      emitToDisplay('drawing-blast', {
        username: socket.data.username,
        text,
        drawing
      });
    }
  });

  socket.on('upvote-question', ({ questionId }) => {
    if (!socket.data.userId) return;

    const success = db.upvoteQuestion(questionId, socket.data.userId);
    if (success) {
      const question = db.getQuestion(questionId);
      if (question) {
        io.emit('question-upvoted', {
          questionId,
          votes: question.votes
        });

        emitToDisplay('question-upvoted', {
          questionId,
          votes: question.votes
        });

        // Give XP to question author
        if (question.user_id !== socket.data.userId) {
          const authorEntry = [...connectedUsers.entries()]
            .find(([_, data]) => data.odId === question.user_id);
          if (authorEntry) {
            const [authorSocketId] = authorEntry;
            const authorSocket = io.sockets.sockets.get(authorSocketId);
            if (authorSocket) {
              addUserXP(authorSocket, question.user_id, XP_REWARDS.upvote_received);
              checkAndEmitAchievements(authorSocket, question.user_id, {
                questionVotes: question.votes
              });
            }
          }
        }
      }
    }
  });

  // ----------------------------------------
  // DIRECT MESSAGES
  // ----------------------------------------

  socket.on('send-dm', ({ to, text, drawing }) => {
    if (!socket.data.userId) return;
    if (!text && !drawing) return;

    const recipientEntry = [...connectedUsers.entries()]
      .find(([_, data]) => data.username === to);

    if (recipientEntry) {
      const [recipientSocketId] = recipientEntry;
      io.to(recipientSocketId).emit('dm-received', {
        from: socket.data.username,
        text,
        drawing,
        timestamp: Date.now()
      });

      // Add XP
      addUserXP(socket, socket.data.userId, XP_REWARDS.dm);

      checkAndEmitAchievements(socket, socket.data.userId, { isDM: true });
    }
  });

  // ----------------------------------------
  // DRINKS
  // ----------------------------------------

  socket.on('log-drink', () => {
    if (!socket.data.userId || !currentPresentation) return;

    db.incrementDrinks(socket.data.userId, currentPresentation.id);

    // Add XP
    addUserXP(socket, socket.data.userId, XP_REWARDS.drink);

    const stats = getUserStats(socket.data.userId);
    const totalDrinks = db.getTotalDrinks(currentPresentation.id);

    io.emit('drink-logged', {
      username: socket.data.username,
      count: stats.drinks,
      totalDrinks
    });

    emitToDisplay('drink-logged', {
      username: socket.data.username,
      count: stats.drinks,
      totalDrinks
    });

    checkAndEmitAchievements(socket, socket.data.userId);
  });

  // ----------------------------------------
  // POKEMON - ENHANCED CATCH SYSTEM
  // ----------------------------------------

  socket.on('catch-pokemon', ({ odId, ballType = 'pokeball' }) => {
    if (!socket.data.userId) return;

    const userId = socket.data.userId;
    const user = db.getUserById(userId);
    if (!user) return;

    // Check attempt count (max 3 tries per spawn)
    const attempts = catchAttempts.get(odId) || 0;
    if (attempts >= MAX_CATCH_ATTEMPTS) {
      socket.emit('catch-failed', {
        reason: 'no_attempts',
        message: 'Out of attempts! Pokemon fled!',
        fled: true
      });
      catchAttempts.delete(odId);
      userSpawns.delete(userId);
      return;
    }

    // Check ball inventory (pokeball is infinite)
    if (ballType !== 'pokeball') {
      const hasEnough = db.useBall(userId, ballType);
      if (!hasEnough) {
        socket.emit('catch-failed', {
          reason: 'no_balls',
          ballType,
          message: `No ${ballType} balls left!`
        });
        return;
      }
    }

    // Increment attempt counter
    catchAttempts.set(odId, attempts + 1);
    const attemptsRemaining = MAX_CATCH_ATTEMPTS - (attempts + 1);

    // Attempt catch with ball type
    const result = pokemon.attemptCatch(odId, ballType);

    if (result.success) {
      // Get rewards
      const rewards = pokemon.getCatchReward(result.pokemon, result.isShiny, result.isQuickCatch);

      // Save to database
      db.catchPokemon(
        userId,
        result.pokemon.id,
        result.pokemon.name,
        result.isShiny,
        result.zone
      );
      db.addCoins(userId, rewards.coins);

      // Add XP
      addUserXP(socket, userId, rewards.xp);

      // Clear user's current spawn and attempts
      userSpawns.delete(userId);
      catchAttempts.delete(odId);

      // Decrement lure if active
      db.decrementEffectUse(userId, 'lure');

      // Send success
      socket.emit('pokemon-caught', {
        pokemonId: result.pokemon.id,
        pokemonName: result.pokemon.name,
        isShiny: result.isShiny,
        rarity: result.pokemon.rarity,
        zone: result.zone,
        isQuickCatch: result.isQuickCatch,
        rewards,
        ballUsed: ballType
      });

      // Broadcast to all
      io.emit('feed-event', {
        type: 'pokemon-caught',
        username: socket.data.username,
        pokemonId: result.pokemon.id,
        pokemonName: result.pokemon.name,
        isShiny: result.isShiny,
        timestamp: Date.now()
      });

      emitToDisplay('pokemon-caught', {
        username: socket.data.username,
        pokemonId: result.pokemon.id,
        pokemonName: result.pokemon.name,
        isShiny: result.isShiny
      });

      // Check achievements
      checkAndEmitAchievements(socket, userId, {
        isShiny: result.isShiny,
        isLegendary: result.pokemon.rarity === 'legendary'
      });

      // Broadcast updated leaderboards
      broadcastLeaderboards();

      console.log(`[Pokemon] ${socket.data.username} caught ${result.pokemon.name}${result.isShiny ? ' (SHINY!)' : ''} with ${ballType}`);

    } else {
      // Catch failed - check if out of attempts
      const fled = attemptsRemaining <= 0;

      if (fled) {
        catchAttempts.delete(odId);
        userSpawns.delete(userId);
      }

      socket.emit('catch-failed', {
        reason: fled ? 'fled' : result.reason,
        pokemonId: result.pokemon?.id,
        pokemonName: result.pokemon?.name,
        ballUsed: ballType,
        catchChance: result.catchChance,
        attemptsRemaining: fled ? 0 : attemptsRemaining,
        fled,
        message: fled ? 'Pokemon fled!' : `It broke free! ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} left.`
      });

      console.log(`[Pokemon] ${socket.data.username} failed to catch ${result.pokemon?.name || 'unknown'} (${result.reason}) - ${attemptsRemaining} attempts left`);
    }

    // Update inventory
    const ballInventory = db.getBallInventory(userId);
    socket.emit('balls-updated', {
      pokeball: Infinity,
      great: ballInventory.great_balls,
      ultra: ballInventory.ultra_balls,
      master: ballInventory.master_balls
    });
  });

  socket.on('get-pokedex', () => {
    if (!socket.data.userId) return;

    const caught = db.getUserPokemon(socket.data.userId);
    // Frontend expects an array of caught pokemon entries
    socket.emit('pokedex-data', caught);
  });

  socket.on('get-evolutions', ({ pokemonId }) => {
    if (!socket.data.userId) return;

    const user = db.getUserById(socket.data.userId);
    const stones = db.getStoneInventory(socket.data.userId);

    const evolutions = pokemon.getAvailableEvolutions(pokemonId, user.trainer_level, stones);

    socket.emit('evolutions-data', {
      pokemonId,
      evolutions
    });
  });

  socket.on('evolve-pokemon', ({ pokemonId, method, stone }) => {
    if (!socket.data.userId) return;

    const userId = socket.data.userId;
    const user = db.getUserById(userId);

    // Check if user has this Pokemon
    if (!db.hasPokemon(userId, pokemonId)) {
      socket.emit('evolve-failed', { message: 'You don\'t have this Pokemon' });
      return;
    }

    let evolution = null;

    if (method === 'level') {
      if (pokemon.canEvolveWithLevel(pokemonId, user.trainer_level)) {
        evolution = pokemon.getLevelEvolution(pokemonId);
      }
    } else if (method === 'stone' && stone) {
      if (pokemon.canEvolveWithStone(pokemonId, stone)) {
        // Use the stone
        if (!db.useStone(userId, stone)) {
          socket.emit('evolve-failed', { message: 'You don\'t have this stone' });
          return;
        }
        evolution = pokemon.getStoneEvolution(pokemonId, stone);
      }
    }

    if (evolution) {
      // Add evolved Pokemon to collection
      db.evolvePokemon(userId, pokemonId, evolution.to, evolution.name);

      socket.emit('pokemon-evolved', {
        fromId: pokemonId,
        toId: evolution.to,
        toName: evolution.name,
        method,
        stone
      });

      io.emit('feed-event', {
        type: 'pokemon-evolved',
        username: socket.data.username,
        fromId: pokemonId,
        toId: evolution.to,
        toName: evolution.name,
        timestamp: Date.now()
      });

      console.log(`[Evolution] ${socket.data.username}'s Pokemon evolved to ${evolution.name}!`);
    } else {
      socket.emit('evolve-failed', { message: 'Cannot evolve this Pokemon' });
    }
  });

  // ----------------------------------------
  // SHOP - ENHANCED
  // ----------------------------------------

  socket.on('buy-item', ({ itemId }) => {
    if (!socket.data.userId) return;

    const user = db.getUserById(socket.data.userId);
    if (!user) return;

    const item = SHOP_ITEMS[itemId];
    if (!item || user.coins < item.price) {
      socket.emit('shop-error', { message: 'Cannot purchase' });
      return;
    }

    // Deduct coins
    db.addCoins(socket.data.userId, -item.price);

    // Handle item by type
    switch (item.type) {
      case 'ball':
        db.updateBallInventory(socket.data.userId, item.ballType, item.quantity);
        break;

      case 'stone':
        db.updateStoneInventory(socket.data.userId, item.stoneType, 1);
        break;

      case 'effect':
        if (item.duration) {
          db.addEffect(socket.data.userId, item.effectType, item.duration);
        } else if (item.uses) {
          db.addEffect(socket.data.userId, item.effectType, 24 * 60 * 60 * 1000, item.uses);
        }
        break;

      case 'permanent':
        if (itemId === 'shiny_charm') {
          db.setShinyCharm(socket.data.userId, true);
        }
        break;
    }

    socket.emit('shop-purchase', {
      itemId,
      itemName: item.name,
      newBalance: user.coins - item.price
    });

    // Send updated inventory
    const updatedUser = db.getUserById(socket.data.userId);
    sendTrainerStats(socket, updatedUser);

    checkAndEmitAchievements(socket, socket.data.userId, { shopPurchase: true });

    console.log(`[Shop] ${socket.data.username} bought ${item.name}`);
  });

  // ----------------------------------------
  // ADMIN COMMANDS
  // ----------------------------------------

  socket.on('admin:start-presentation', () => {
    if (!adminSockets.has(socket.id)) return;

    currentPresentation = db.startPresentation();
    console.log(`[Admin] Presentation started: ${currentPresentation.id}`);

    // Start per-user auto-spawn system
    pokemon.startAutoSpawn(() => {
      triggerGlobalSpawn();
    });
  });

  socket.on('admin:end-presentation', () => {
    if (!adminSockets.has(socket.id) || !currentPresentation) return;

    db.endPresentation(currentPresentation.id);
    pokemon.stopAutoSpawn();
    currentPresentation = null;
    userSpawns.clear();
    console.log('[Admin] Presentation ended');
  });

  socket.on('admin:spawn-pokemon', ({ zone, pokemonId, forceShiny }) => {
    if (!adminSockets.has(socket.id)) return;

    // Spawn for all users
    connectedUsers.forEach((data, socketId) => {
      const userSocket = io.sockets.sockets.get(socketId);
      if (!userSocket || !userSocket.data.userId) return;

      const targetZone = zone || data.zone || 'meadow';
      const spawn = pokemon.adminSpawn(
        userSocket.data.userId,
        targetZone,
        pokemonId || null,
        forceShiny || false
      );

      if (spawn) {
        userSpawns.set(userSocket.data.userId, spawn.odId);
        userSocket.emit('pokemon-spawn', {
          odId: spawn.odId,
          pokemonId: spawn.pokemon.id,
          pokemonName: spawn.pokemon.name,
          rarity: spawn.pokemon.rarity,
          isShiny: spawn.isShiny,
          zone: spawn.zone,
          sprite: pokemon.getSpriteUrl(spawn.pokemon.id, spawn.isShiny),
          animatedSprite: pokemon.getAnimatedSpriteUrl(spawn.pokemon.id, spawn.isShiny),
          expiresAt: spawn.expiresAt,
          catchWindow: pokemon.CATCH_WINDOW,
          quickCatchWindow: pokemon.QUICK_CATCH_WINDOW
        });
      }
    });

    console.log(`[Admin] Spawned Pokemon for all users`);
  });

  socket.on('admin:show-question', (question) => {
    if (!adminSockets.has(socket.id)) return;
    emitToDisplay('show-question', question);
  });

  socket.on('admin:hide-question', () => {
    if (!adminSockets.has(socket.id)) return;
    emitToDisplay('hide-question');
  });

  socket.on('admin:dismiss-question', ({ questionId }) => {
    if (!adminSockets.has(socket.id)) return;
    db.deleteQuestion(questionId);
  });

  socket.on('admin:drawing-prompt', ({ prompt }) => {
    if (!adminSockets.has(socket.id)) return;
    io.emit('drawing-prompt', { prompt });
  });

  // ----------------------------------------
  // DISCONNECT
  // ----------------------------------------

  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    connectedUsers.delete(socket.id);
    displaySockets.delete(socket.id);
    adminSockets.delete(socket.id);

    if (userData?.odId) {
      userSpawns.delete(userData.odId);
    }

    broadcastUserCount();
    broadcastUserList();

    if (userData) {
      console.log(`[User] ${userData.username} disconnected (${getOnlineCount()} online)`);
    }
  });
});

// ============================================
// START SERVER
// ============================================

async function startServer() {
  try {
    await db.initDatabase();
    console.log('[Server] Database initialized');

    currentPresentation = db.getCurrentPresentation();
    if (currentPresentation) {
      console.log(`[Server] Resuming presentation: ${currentPresentation.id}`);
    }

    httpServer.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║        🎮 OTY Chat Server (Enhanced) 🎮        ║
╠═══════════════════════════════════════════════╣
║  App:     http://localhost:${PORT}              ║
║  Admin:   http://localhost:${PORT}/admin.html   ║
║  Display: http://localhost:${PORT}/display.html ║
╠═══════════════════════════════════════════════╣
║  Features:                                    ║
║  • Trainer Leveling (1-25)                    ║
║  • 6 Zones with unique Pokemon               ║
║  • Per-user spawns                           ║
║  • Catch mechanics with Pokeballs            ║
║  • Evolution system                          ║
║  • Enhanced shop                             ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

startServer();
