/**
 * OtyChat Display Overlay
 * Handles animations and visual feedback on the presentation screen
 */

const socket = io();

let totalDrinks = 0;
let pokemonTimer = null;

// Join as display client
socket.emit('join-display');

// ============================================
// EMOJI ANIMATIONS
// ============================================

socket.on('emoji-blast', (data) => {
  spawnEmoji(data.emoji);
});

function spawnEmoji(emoji) {
  const el = document.createElement('div');
  el.className = 'emoji-float';
  el.textContent = emoji;

  // Random horizontal position
  const x = Math.random() * (window.innerWidth - 100) + 50;
  const y = window.innerHeight - 100;

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  document.querySelector('.overlay').appendChild(el);

  // Remove after animation
  setTimeout(() => {
    el.remove();
  }, 3000);
}

// Spawn multiple emojis for emphasis
function spawnEmojiFlurry(emoji, count = 5) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => spawnEmoji(emoji), i * 100);
  }
}

// ============================================
// DRAWING BLASTS
// ============================================

socket.on('drawing-blast', (data) => {
  showDrawingBlast(data);
});

function showDrawingBlast(data) {
  const el = document.createElement('div');
  el.className = 'drawing-blast';

  let content = `<div class="author">@${escapeHtml(data.username)}</div>`;

  if (data.drawing) {
    content += `<img src="${data.drawing}" alt="Drawing">`;
  }
  if (data.text) {
    content += `<div class="text">${escapeHtml(data.text)}</div>`;
  }

  el.innerHTML = content;
  document.querySelector('.overlay').appendChild(el);

  // Remove after animation
  setTimeout(() => {
    el.remove();
  }, 4000);
}

// ============================================
// CURRENT QUESTION
// ============================================

socket.on('show-question', (question) => {
  showCurrentQuestion(question);
});

socket.on('hide-question', () => {
  hideCurrentQuestion();
});

socket.on('question-upvoted', ({ questionId, votes }) => {
  const votesEl = document.getElementById('question-votes');
  if (votesEl.dataset.questionId === String(questionId)) {
    votesEl.textContent = `👍 ${votes}`;
  }
});

function showCurrentQuestion(question) {
  const container = document.getElementById('current-question');
  const authorEl = document.getElementById('question-author');
  const contentEl = document.getElementById('question-content');
  const votesEl = document.getElementById('question-votes');

  authorEl.textContent = `@${question.username}`;
  votesEl.textContent = `👍 ${question.votes || 0}`;
  votesEl.dataset.questionId = question.id;

  let content = '';
  if (question.text) {
    content += `<p>${escapeHtml(question.text)}</p>`;
  }
  if (question.drawing) {
    content += `<img src="${question.drawing}" alt="Drawing">`;
  }
  contentEl.innerHTML = content;

  container.classList.add('active');
}

function hideCurrentQuestion() {
  document.getElementById('current-question').classList.remove('active');
}

// ============================================
// POKEMON SPAWNS
// ============================================

socket.on('pokemon-spawn', (data) => {
  showPokemonSpawn(data);
});

socket.on('pokemon-caught', (data) => {
  hidePokemonSpawn();

  // Show achievement-style toast
  showAchievementToast(`${data.username} caught ${data.pokemonName}!`, '🎉');
});

socket.on('pokemon-escaped', () => {
  hidePokemonSpawn();
});

function showPokemonSpawn(data) {
  const alert = document.getElementById('pokemon-alert');
  const title = document.getElementById('pokemon-title');
  const sprite = document.getElementById('pokemon-sprite');
  const timer = document.getElementById('pokemon-timer');

  title.textContent = `Wild ${data.pokemonName} appeared!`;
  title.className = data.isShiny ? 'shiny' : '';

  // Could use actual Pokemon sprite URLs here
  sprite.textContent = data.isShiny ? '✨🔴✨' : '🔴';
  sprite.className = 'pokemon-sprite' + (data.isShiny ? ' shiny' : '');

  let timeLeft = 30;
  timer.textContent = timeLeft;

  // Clear existing timer
  if (pokemonTimer) {
    clearInterval(pokemonTimer);
  }

  pokemonTimer = setInterval(() => {
    timeLeft--;
    timer.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(pokemonTimer);
      hidePokemonSpawn();
    }
  }, 1000);

  alert.classList.add('active');
}

function hidePokemonSpawn() {
  if (pokemonTimer) {
    clearInterval(pokemonTimer);
    pokemonTimer = null;
  }
  document.getElementById('pokemon-alert').classList.remove('active');
}

// ============================================
// ACHIEVEMENTS
// ============================================

socket.on('achievement-unlocked', (data) => {
  showAchievementToast(`${data.username} unlocked: ${data.achievement}`, '🏆');
});

function showAchievementToast(message, icon = '🏆') {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <span class="icon">${icon}</span>
    <div class="info">
      <div class="title">Achievement Unlocked!</div>
      <div class="name">${escapeHtml(message)}</div>
    </div>
  `;

  document.querySelector('.overlay').appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// ============================================
// DRINKS
// ============================================

socket.on('drink-logged', (data) => {
  totalDrinks = data.totalDrinks || totalDrinks + 1;
  updateDrinkCounter();

  // Show toast
  showAchievementToast(`${data.username} logged drink #${data.count}`, '🍺');
});

function updateDrinkCounter() {
  const counter = document.getElementById('drink-counter');
  document.getElementById('total-drinks').textContent = totalDrinks;
  counter.classList.add('active');
}

// ============================================
// ONLINE COUNT
// ============================================

socket.on('user-count', (count) => {
  document.getElementById('online-count').textContent = count;
});

// ============================================
// UTILITIES
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// KEYBOARD SHORTCUTS (for admin control)
// ============================================

document.addEventListener('keydown', (e) => {
  // Press 'H' to hide current question
  if (e.key === 'h' || e.key === 'H') {
    hideCurrentQuestion();
  }

  // Press 'P' to hide Pokemon
  if (e.key === 'p' || e.key === 'P') {
    hidePokemonSpawn();
  }
});
