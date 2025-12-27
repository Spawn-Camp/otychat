/**
 * OtyChat Database Module
 * SQLite database using sql.js (pure JS, no native deps)
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Database file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'otychat.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database instance (set after init)
let db = null;

// Auto-save interval (save every 30 seconds if changes made)
let saveTimer = null;
let hasChanges = false;

function saveDatabase() {
  if (db && hasChanges) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    hasChanges = false;
    console.log('[DB] Saved to disk');
  }
}

function markChanged() {
  hasChanges = true;
}

// Initialize database
async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('[DB] Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('[DB] Created new database');
  }

  // Create tables
  db.run(`
    -- Users table (with trainer leveling)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      coins INTEGER DEFAULT 0,
      trainer_sprite TEXT DEFAULT 'default',
      title TEXT DEFAULT 'Newcomer',
      trainer_level INTEGER DEFAULT 1,
      trainer_xp INTEGER DEFAULT 0,
      current_zone TEXT DEFAULT 'meadow',
      shiny_charm BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Pokemon caught (with zone tracking)
    CREATE TABLE IF NOT EXISTS pokemon_caught (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pokemon_id INTEGER NOT NULL,
      pokemon_name TEXT,
      is_shiny BOOLEAN DEFAULT 0,
      zone TEXT DEFAULT 'meadow',
      evolved_from INTEGER,
      caught_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Achievements
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_id TEXT NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, achievement_id)
    );

    -- Inventory (purchased items - legacy)
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Ball inventory
    CREATE TABLE IF NOT EXISTS ball_inventory (
      user_id INTEGER PRIMARY KEY,
      great_balls INTEGER DEFAULT 0,
      ultra_balls INTEGER DEFAULT 0,
      master_balls INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Stone inventory
    CREATE TABLE IF NOT EXISTS stone_inventory (
      user_id INTEGER PRIMARY KEY,
      fire_stone INTEGER DEFAULT 0,
      water_stone INTEGER DEFAULT 0,
      thunder_stone INTEGER DEFAULT 0,
      leaf_stone INTEGER DEFAULT 0,
      moon_stone INTEGER DEFAULT 0,
      sun_stone INTEGER DEFAULT 0,
      dragon_scale INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Active effects (incense, lure, lucky egg)
    CREATE TABLE IF NOT EXISTS active_effects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      effect_type TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      uses_remaining INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Presentations
    CREATE TABLE IF NOT EXISTS presentations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      started_at DATETIME,
      ended_at DATETIME
    );

    -- User stats (per presentation session)
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      presentation_id INTEGER,
      reactions INTEGER DEFAULT 0,
      questions INTEGER DEFAULT 0,
      drinks INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (presentation_id) REFERENCES presentations(id),
      UNIQUE(user_id, presentation_id)
    );

    -- Questions
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      presentation_id INTEGER,
      text TEXT,
      drawing TEXT,
      votes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (presentation_id) REFERENCES presentations(id)
    );

    -- Question votes (to prevent double voting)
    CREATE TABLE IF NOT EXISTS question_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(question_id, user_id)
    );

    -- Kudos (with cooldown tracking)
    CREATE TABLE IF NOT EXISTS kudos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      message TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    );
  `);

  // Migration: Add new columns to existing tables if they don't exist
  // (SQLite doesn't error on duplicate column adds if we use try/catch)
  try {
    db.run(`ALTER TABLE users ADD COLUMN trainer_level INTEGER DEFAULT 1`);
  } catch (e) { /* column exists */ }
  try {
    db.run(`ALTER TABLE users ADD COLUMN trainer_xp INTEGER DEFAULT 0`);
  } catch (e) { /* column exists */ }
  try {
    db.run(`ALTER TABLE users ADD COLUMN current_zone TEXT DEFAULT 'meadow'`);
  } catch (e) { /* column exists */ }
  try {
    db.run(`ALTER TABLE users ADD COLUMN shiny_charm BOOLEAN DEFAULT 0`);
  } catch (e) { /* column exists */ }
  try {
    db.run(`ALTER TABLE pokemon_caught ADD COLUMN pokemon_name TEXT`);
  } catch (e) { /* column exists */ }
  try {
    db.run(`ALTER TABLE pokemon_caught ADD COLUMN zone TEXT DEFAULT 'meadow'`);
  } catch (e) { /* column exists */ }
  try {
    db.run(`ALTER TABLE pokemon_caught ADD COLUMN evolved_from INTEGER`);
  } catch (e) { /* column exists */ }

  // Profile columns
  try {
    db.run(`ALTER TABLE users ADD COLUMN profile_pic TEXT DEFAULT '👤'`);
  } catch (e) { /* column exists */ }
  try {
    db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT ''`);
  } catch (e) { /* column exists */ }
  try {
    db.run(`ALTER TABLE users ADD COLUMN name_color TEXT DEFAULT ''`);
  } catch (e) { /* column exists */ }

  // Save initial schema
  saveDatabase();

  // Start auto-save timer
  saveTimer = setInterval(saveDatabase, 30000);

  // Save on process exit
  process.on('exit', saveDatabase);
  process.on('SIGINT', () => {
    saveDatabase();
    process.exit();
  });

  return db;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function runSql(sql, params = []) {
  db.run(sql, params);
  markChanged();
  return { changes: db.getRowsModified(), lastInsertRowid: getLastInsertId() };
}

function getLastInsertId() {
  const result = queryOne('SELECT last_insert_rowid() as id');
  return result ? result.id : null;
}

// ============================================
// USER FUNCTIONS
// ============================================

function createUser(username) {
  // Try to insert, ignore if exists
  runSql(`INSERT OR IGNORE INTO users (username) VALUES (?)`, [username]);
  return queryOne(`SELECT * FROM users WHERE username = ?`, [username]);
}

function getUserByUsername(username) {
  return queryOne(`SELECT * FROM users WHERE username = ?`, [username]);
}

function getUserById(id) {
  return queryOne(`SELECT * FROM users WHERE id = ?`, [id]);
}

function addCoins(userId, amount) {
  return runSql(`UPDATE users SET coins = coins + ? WHERE id = ?`, [amount, userId]);
}

function setTitle(userId, title) {
  return runSql(`UPDATE users SET title = ? WHERE id = ?`, [title, userId]);
}

function setSprite(userId, sprite) {
  return runSql(`UPDATE users SET trainer_sprite = ? WHERE id = ?`, [sprite, userId]);
}

function getAllUsers() {
  return queryAll(`SELECT id, username, title, trainer_sprite FROM users`);
}

function updateProfile(userId, updates) {
  const allowedFields = ['profile_pic', 'status', 'title', 'name_color'];
  const setClauses = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      setClauses.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (setClauses.length === 0) return false;

  values.push(userId);
  return runSql(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`, values);
}

// ============================================
// STATS FUNCTIONS
// ============================================

function ensureStats(userId, presentationId) {
  runSql(`INSERT OR IGNORE INTO user_stats (user_id, presentation_id) VALUES (?, ?)`, [userId, presentationId]);
  return queryOne(`SELECT * FROM user_stats WHERE user_id = ? AND presentation_id = ?`, [userId, presentationId]);
}

function getStats(userId, presentationId) {
  return queryOne(`SELECT * FROM user_stats WHERE user_id = ? AND presentation_id = ?`, [userId, presentationId]);
}

function incrementReactions(userId, presentationId) {
  return runSql(`UPDATE user_stats SET reactions = reactions + 1 WHERE user_id = ? AND presentation_id = ?`, [userId, presentationId]);
}

function incrementQuestions(userId, presentationId) {
  return runSql(`UPDATE user_stats SET questions = questions + 1 WHERE user_id = ? AND presentation_id = ?`, [userId, presentationId]);
}

function incrementDrinks(userId, presentationId) {
  return runSql(`UPDATE user_stats SET drinks = drinks + 1 WHERE user_id = ? AND presentation_id = ?`, [userId, presentationId]);
}

function getTotalDrinks(presentationId) {
  const result = queryOne(`SELECT SUM(drinks) as total FROM user_stats WHERE presentation_id = ?`, [presentationId]);
  return result ? (result.total || 0) : 0;
}

function getUserTotals(userId) {
  return queryOne(`
    SELECT
      SUM(reactions) as reactions,
      SUM(questions) as questions,
      SUM(drinks) as drinks
    FROM user_stats WHERE user_id = ?
  `, [userId]);
}

// ============================================
// TRAINER LEVELING FUNCTIONS
// ============================================

// XP thresholds for each level (index = level - 1)
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  450,    // Level 4
  700,    // Level 5
  1000,   // Level 6
  1350,   // Level 7
  1750,   // Level 8
  2200,   // Level 9
  2700,   // Level 10
  3250,   // Level 11
  3850,   // Level 12
  4500,   // Level 13
  5200,   // Level 14
  5950,   // Level 15
  6750,   // Level 16
  7600,   // Level 17
  8500,   // Level 18
  9450,   // Level 19
  10450,  // Level 20
  11500,  // Level 21
  12600,  // Level 22
  13750,  // Level 23
  14950,  // Level 24
  16200,  // Level 25 (max)
];

// Zones and their level requirements
const ZONE_REQUIREMENTS = {
  meadow: 1,
  forest: 5,
  mountain: 10,
  ocean: 15,
  sky: 20,
  mystery: 25
};

function getLevelFromXP(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

function getXPForNextLevel(level) {
  if (level >= LEVEL_THRESHOLDS.length) return null; // Max level
  return LEVEL_THRESHOLDS[level];
}

function getUnlockedZones(level) {
  const zones = [];
  for (const [zone, reqLevel] of Object.entries(ZONE_REQUIREMENTS)) {
    if (level >= reqLevel) {
      zones.push(zone);
    }
  }
  return zones;
}

function addXP(userId, amount) {
  const user = getUserById(userId);
  if (!user) return null;

  const oldLevel = user.trainer_level;
  const newXP = user.trainer_xp + amount;
  const newLevel = getLevelFromXP(newXP);

  runSql(`UPDATE users SET trainer_xp = ?, trainer_level = ? WHERE id = ?`, [newXP, newLevel, userId]);

  return {
    oldLevel,
    newLevel,
    oldXP: user.trainer_xp,
    newXP,
    leveledUp: newLevel > oldLevel,
    newZonesUnlocked: getUnlockedZones(newLevel).filter(z => !getUnlockedZones(oldLevel).includes(z))
  };
}

function setZone(userId, zone) {
  const user = getUserById(userId);
  if (!user) return false;

  // Check if zone is unlocked
  const unlockedZones = getUnlockedZones(user.trainer_level);
  if (!unlockedZones.includes(zone)) {
    return false;
  }

  runSql(`UPDATE users SET current_zone = ? WHERE id = ?`, [zone, userId]);
  return true;
}

function setShinyCharm(userId, value) {
  return runSql(`UPDATE users SET shiny_charm = ? WHERE id = ?`, [value ? 1 : 0, userId]);
}

// ============================================
// BALL INVENTORY FUNCTIONS
// ============================================

function ensureBallInventory(userId) {
  runSql(`INSERT OR IGNORE INTO ball_inventory (user_id) VALUES (?)`, [userId]);
}

function getBallInventory(userId) {
  ensureBallInventory(userId);
  return queryOne(`SELECT * FROM ball_inventory WHERE user_id = ?`, [userId]);
}

function updateBallInventory(userId, ballType, delta) {
  ensureBallInventory(userId);
  const columnMap = {
    great: 'great_balls',
    ultra: 'ultra_balls',
    master: 'master_balls'
  };
  const column = columnMap[ballType];
  if (!column) return false;

  // Prevent negative values
  const current = getBallInventory(userId);
  const newValue = Math.max(0, current[column] + delta);
  runSql(`UPDATE ball_inventory SET ${column} = ? WHERE user_id = ?`, [newValue, userId]);
  return true;
}

function useBall(userId, ballType) {
  if (ballType === 'pokeball') return true; // Infinite Pokeballs
  const inv = getBallInventory(userId);
  const columnMap = {
    great: 'great_balls',
    ultra: 'ultra_balls',
    master: 'master_balls'
  };
  if (inv[columnMap[ballType]] <= 0) return false;
  return updateBallInventory(userId, ballType, -1);
}

// ============================================
// STONE INVENTORY FUNCTIONS
// ============================================

function ensureStoneInventory(userId) {
  runSql(`INSERT OR IGNORE INTO stone_inventory (user_id) VALUES (?)`, [userId]);
}

function getStoneInventory(userId) {
  ensureStoneInventory(userId);
  return queryOne(`SELECT * FROM stone_inventory WHERE user_id = ?`, [userId]);
}

function updateStoneInventory(userId, stoneType, delta) {
  ensureStoneInventory(userId);
  const validStones = ['fire_stone', 'water_stone', 'thunder_stone', 'leaf_stone', 'moon_stone', 'sun_stone', 'dragon_scale'];
  if (!validStones.includes(stoneType)) return false;

  const current = getStoneInventory(userId);
  const newValue = Math.max(0, current[stoneType] + delta);
  runSql(`UPDATE stone_inventory SET ${stoneType} = ? WHERE user_id = ?`, [newValue, userId]);
  return true;
}

function useStone(userId, stoneType) {
  const inv = getStoneInventory(userId);
  if (inv[stoneType] <= 0) return false;
  return updateStoneInventory(userId, stoneType, -1);
}

// ============================================
// ACTIVE EFFECTS FUNCTIONS
// ============================================

function addEffect(userId, effectType, durationMs, usesRemaining = null) {
  const expiresAt = new Date(Date.now() + durationMs).toISOString();
  runSql(
    `INSERT INTO active_effects (user_id, effect_type, expires_at, uses_remaining) VALUES (?, ?, ?, ?)`,
    [userId, effectType, expiresAt, usesRemaining]
  );
  return getLastInsertId();
}

function getActiveEffects(userId) {
  removeExpiredEffects(userId);
  return queryAll(
    `SELECT * FROM active_effects WHERE user_id = ? AND (expires_at > datetime('now') OR uses_remaining > 0)`,
    [userId]
  );
}

function hasActiveEffect(userId, effectType) {
  const effects = getActiveEffects(userId);
  return effects.some(e => e.effect_type === effectType);
}

function removeExpiredEffects(userId) {
  runSql(
    `DELETE FROM active_effects WHERE user_id = ? AND expires_at <= datetime('now') AND (uses_remaining IS NULL OR uses_remaining <= 0)`,
    [userId]
  );
}

function decrementEffectUse(userId, effectType) {
  const effect = queryOne(
    `SELECT * FROM active_effects WHERE user_id = ? AND effect_type = ? AND uses_remaining > 0`,
    [userId, effectType]
  );
  if (effect) {
    runSql(`UPDATE active_effects SET uses_remaining = uses_remaining - 1 WHERE id = ?`, [effect.id]);
    if (effect.uses_remaining <= 1) {
      runSql(`DELETE FROM active_effects WHERE id = ?`, [effect.id]);
    }
    return true;
  }
  return false;
}

// ============================================
// POKEMON FUNCTIONS
// ============================================

function catchPokemon(userId, pokemonId, pokemonName, isShiny, zone = 'meadow', evolvedFrom = null) {
  return runSql(
    `INSERT INTO pokemon_caught (user_id, pokemon_id, pokemon_name, is_shiny, zone, evolved_from) VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, pokemonId, pokemonName, isShiny ? 1 : 0, zone, evolvedFrom]
  );
}

function getUserPokemon(userId) {
  return queryAll(`SELECT * FROM pokemon_caught WHERE user_id = ? ORDER BY caught_at DESC`, [userId]);
}

function getUniquePokemonCount(userId) {
  const result = queryOne(`SELECT COUNT(DISTINCT pokemon_id) as count FROM pokemon_caught WHERE user_id = ?`, [userId]);
  return result ? result.count : 0;
}

function getShinyCount(userId) {
  const result = queryOne(`SELECT COUNT(*) as count FROM pokemon_caught WHERE user_id = ? AND is_shiny = 1`, [userId]);
  return result ? result.count : 0;
}

function getPokemonCount(userId) {
  const result = queryOne(`SELECT COUNT(*) as count FROM pokemon_caught WHERE user_id = ?`, [userId]);
  return result ? result.count : 0;
}

function hasPokemon(userId, pokemonId) {
  const result = queryOne(`SELECT COUNT(*) as count FROM pokemon_caught WHERE user_id = ? AND pokemon_id = ?`, [userId, pokemonId]);
  return result ? result.count > 0 : false;
}

function getUserPokemonEntry(userId, pokemonId) {
  return queryOne(`SELECT * FROM pokemon_caught WHERE user_id = ? AND pokemon_id = ? LIMIT 1`, [userId, pokemonId]);
}

function evolvePokemon(userId, fromPokemonId, toPokemonId, toPokemonName) {
  // Record the evolution
  return runSql(
    `INSERT INTO pokemon_caught (user_id, pokemon_id, pokemon_name, is_shiny, zone, evolved_from)
     SELECT user_id, ?, ?, is_shiny, zone, pokemon_id
     FROM pokemon_caught WHERE user_id = ? AND pokemon_id = ? LIMIT 1`,
    [toPokemonId, toPokemonName, userId, fromPokemonId]
  );
}

// ============================================
// ACHIEVEMENT FUNCTIONS
// ============================================

function unlockAchievement(userId, achievementId) {
  return runSql(`INSERT OR IGNORE INTO achievements (user_id, achievement_id) VALUES (?, ?)`, [userId, achievementId]);
}

function getUserAchievements(userId) {
  return queryAll(`SELECT * FROM achievements WHERE user_id = ?`, [userId]);
}

function hasAchievement(userId, achievementId) {
  const result = queryOne(`SELECT COUNT(*) as count FROM achievements WHERE user_id = ? AND achievement_id = ?`, [userId, achievementId]);
  return result ? result.count > 0 : false;
}

// ============================================
// INVENTORY FUNCTIONS
// ============================================

function addToInventory(userId, itemId) {
  return runSql(`INSERT INTO inventory (user_id, item_id) VALUES (?, ?)`, [userId, itemId]);
}

function getUserInventory(userId) {
  return queryAll(`SELECT * FROM inventory WHERE user_id = ?`, [userId]);
}

function hasItem(userId, itemId) {
  const result = queryOne(`SELECT COUNT(*) as count FROM inventory WHERE user_id = ? AND item_id = ?`, [userId, itemId]);
  return result ? result.count > 0 : false;
}

// ============================================
// PRESENTATION FUNCTIONS
// ============================================

function startPresentation(name = 'Presentation') {
  runSql(`INSERT INTO presentations (name, started_at) VALUES (?, datetime('now'))`, [name]);
  const id = getLastInsertId();
  return queryOne(`SELECT * FROM presentations WHERE id = ?`, [id]);
}

function endPresentation(id) {
  return runSql(`UPDATE presentations SET ended_at = datetime('now') WHERE id = ?`, [id]);
}

function getCurrentPresentation() {
  return queryOne(`SELECT * FROM presentations WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1`);
}

function getPresentation(id) {
  return queryOne(`SELECT * FROM presentations WHERE id = ?`, [id]);
}

// ============================================
// QUESTION FUNCTIONS
// ============================================

function createQuestion(userId, presentationId, text, drawing) {
  runSql(`INSERT INTO questions (user_id, presentation_id, text, drawing) VALUES (?, ?, ?, ?)`, [userId, presentationId, text, drawing]);
  const id = getLastInsertId();
  return queryOne(`SELECT * FROM questions WHERE id = ?`, [id]);
}

function getQuestions(presentationId) {
  return queryAll(`
    SELECT q.*, u.username
    FROM questions q
    JOIN users u ON q.user_id = u.id
    WHERE q.presentation_id = ?
    ORDER BY q.created_at ASC
  `, [presentationId]);
}

function upvoteQuestion(questionId, userId) {
  const hasVoted = queryOne(`SELECT COUNT(*) as count FROM question_votes WHERE question_id = ? AND user_id = ?`, [questionId, userId]);
  if (!hasVoted || hasVoted.count === 0) {
    runSql(`INSERT OR IGNORE INTO question_votes (question_id, user_id) VALUES (?, ?)`, [questionId, userId]);
    runSql(`UPDATE questions SET votes = votes + 1 WHERE id = ?`, [questionId]);
    return true;
  }
  return false;
}

function getQuestion(id) {
  return queryOne(`
    SELECT q.*, u.username
    FROM questions q
    JOIN users u ON q.user_id = u.id
    WHERE q.id = ?
  `, [id]);
}

function deleteQuestion(id) {
  return runSql(`DELETE FROM questions WHERE id = ?`, [id]);
}

// ============================================
// KUDOS FUNCTIONS
// ============================================

const KUDOS_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown per person

function canSendKudos(fromUserId, toUserId) {
  // Check if there's a recent kudos from this user to the target
  const recent = queryOne(`
    SELECT * FROM kudos
    WHERE from_user_id = ? AND to_user_id = ?
    AND datetime(sent_at) > datetime('now', '-1 hour')
    LIMIT 1
  `, [fromUserId, toUserId]);
  return !recent;
}

function sendKudos(fromUserId, toUserId, message = '') {
  // Check cooldown first
  if (!canSendKudos(fromUserId, toUserId)) {
    return { success: false, reason: 'cooldown' };
  }

  // Can't send kudos to yourself
  if (fromUserId === toUserId) {
    return { success: false, reason: 'self' };
  }

  // Insert kudos record
  runSql(`INSERT INTO kudos (from_user_id, to_user_id, message) VALUES (?, ?, ?)`,
    [fromUserId, toUserId, message]);
  markChanged();

  return { success: true };
}

function getKudosReceived(userId) {
  const result = queryOne(`SELECT COUNT(*) as count FROM kudos WHERE to_user_id = ?`, [userId]);
  return result ? result.count : 0;
}

function getKudosSent(userId) {
  const result = queryOne(`SELECT COUNT(*) as count FROM kudos WHERE from_user_id = ?`, [userId]);
  return result ? result.count : 0;
}

// ============================================
// EXPORTED API
// ============================================

module.exports = {
  initDatabase,
  saveDatabase,

  // Users
  createUser,
  getUserByUsername,
  getUserById,
  addCoins,
  setTitle,
  setSprite,
  getAllUsers,
  updateProfile,

  // Trainer Leveling
  LEVEL_THRESHOLDS,
  ZONE_REQUIREMENTS,
  getLevelFromXP,
  getXPForNextLevel,
  getUnlockedZones,
  addXP,
  setZone,
  setShinyCharm,

  // Ball Inventory
  getBallInventory,
  updateBallInventory,
  useBall,

  // Stone Inventory
  getStoneInventory,
  updateStoneInventory,
  useStone,

  // Active Effects
  addEffect,
  getActiveEffects,
  hasActiveEffect,
  removeExpiredEffects,
  decrementEffectUse,

  // Stats
  ensureStats,
  getStats,
  incrementReactions,
  incrementQuestions,
  incrementDrinks,
  getTotalDrinks,
  getUserTotals,

  // Pokemon
  catchPokemon,
  getUserPokemon,
  getPokemonCount,
  getUniquePokemonCount,
  getShinyCount,
  hasPokemon,
  getUserPokemonEntry,
  evolvePokemon,

  // Achievements
  unlockAchievement,
  getUserAchievements,
  hasAchievement,

  // Inventory (legacy)
  addToInventory,
  getUserInventory,
  hasItem,

  // Presentations
  startPresentation,
  endPresentation,
  getCurrentPresentation,
  getPresentation,

  // Questions
  createQuestion,
  getQuestions,
  upvoteQuestion,
  getQuestion,
  deleteQuestion,

  // Kudos
  canSendKudos,
  sendKudos,
  getKudosReceived,
  getKudosSent,

  // Leaderboards
  getLeaderboards
};

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

function getLeaderboards(limit = 10) {
  // XP Leaderboard
  const xpLeaderboard = queryAll(`
    SELECT username, trainer_level as level, trainer_xp as xp
    FROM users
    ORDER BY trainer_xp DESC
    LIMIT ?
  `, [limit]);

  // Pokemon Caught Leaderboard
  const pokemonLeaderboard = queryAll(`
    SELECT u.username, COUNT(pc.id) as count
    FROM users u
    LEFT JOIN pokemon_caught pc ON u.id = pc.user_id
    GROUP BY u.id
    ORDER BY count DESC
    LIMIT ?
  `, [limit]);

  // Shiny Hunters Leaderboard
  const shinyLeaderboard = queryAll(`
    SELECT u.username, COUNT(pc.id) as count
    FROM users u
    LEFT JOIN pokemon_caught pc ON u.id = pc.user_id AND pc.is_shiny = 1
    GROUP BY u.id
    ORDER BY count DESC
    LIMIT ?
  `, [limit]);

  // Reactions Leaderboard (total across all presentations)
  const reactionsLeaderboard = queryAll(`
    SELECT u.username, COALESCE(SUM(us.reactions), 0) as count
    FROM users u
    LEFT JOIN user_stats us ON u.id = us.user_id
    GROUP BY u.id
    ORDER BY count DESC
    LIMIT ?
  `, [limit]);

  return {
    xp: xpLeaderboard,
    pokemon: pokemonLeaderboard,
    shiny: shinyLeaderboard,
    reactions: reactionsLeaderboard
  };
}
