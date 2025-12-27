/**
 * OtyChat Admin Panel
 * Controls for managing presentations and participants
 */

const socket = io();

// State
let presentationActive = false;
let questions = [];
let participants = [];

// Stats
const stats = {
  reactions: 0,
  questions: 0,
  pokemon: 0,
  achievements: 0,
  drinks: 0
};

// Join as admin
socket.emit('join-admin', {
  adminCode: sessionStorage.getItem('adminCode') || ''
});

// ============================================
// PRESENTATION CONTROLS
// ============================================

document.getElementById('btn-start-presentation').addEventListener('click', () => {
  socket.emit('admin:start-presentation');
  presentationActive = true;
  updatePresentationUI();
});

document.getElementById('btn-end-presentation').addEventListener('click', () => {
  if (confirm('End the current presentation?')) {
    socket.emit('admin:end-presentation');
    presentationActive = false;
    updatePresentationUI();
  }
});

function updatePresentationUI() {
  document.getElementById('btn-start-presentation').disabled = presentationActive;
  document.getElementById('btn-end-presentation').disabled = !presentationActive;
}

// ============================================
// POKEMON SPAWNING
// ============================================

document.getElementById('btn-spawn-pokemon').addEventListener('click', () => {
  const select = document.getElementById('pokemon-select');
  const forceShiny = document.getElementById('force-shiny').checked;

  socket.emit('admin:spawn-pokemon', {
    pokemonId: select.value,
    forceShiny
  });
});

// ============================================
// QUESTIONS MANAGEMENT
// ============================================

socket.on('question-added', (question) => {
  questions.push(question);
  renderQuestions();
  stats.questions++;
  updateStats();
});

socket.on('question-upvoted', ({ questionId, votes }) => {
  const q = questions.find(q => q.id === questionId);
  if (q) {
    q.votes = votes;
    renderQuestions();
  }
});

socket.on('questions-sync', (allQuestions) => {
  questions = allQuestions;
  renderQuestions();
});

function renderQuestions() {
  const container = document.getElementById('question-queue');
  document.getElementById('question-count').textContent = `(${questions.length})`;

  if (questions.length === 0) {
    container.innerHTML = '<p style="color: #666; font-size: 0.6rem; text-align: center;">No questions yet</p>';
    return;
  }

  // Sort by votes (highest first)
  const sorted = [...questions].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  container.innerHTML = sorted.map(q => `
    <div class="question-admin-item" data-id="${q.id}">
      <div class="meta">
        <span>@${escapeHtml(q.username)}</span>
        <span>👍 ${q.votes || 0}</span>
      </div>
      <div class="content">
        ${q.text ? escapeHtml(q.text) : ''}
        ${q.drawing ? `<br><img src="${q.drawing}" alt="Drawing">` : ''}
      </div>
      <div class="actions">
        <button class="nes-btn is-success admin-btn" onclick="showQuestion('${q.id}')">
          Show
        </button>
        <button class="nes-btn is-warning admin-btn" onclick="highlightQuestion('${q.id}')">
          Highlight
        </button>
        <button class="nes-btn is-error admin-btn" onclick="dismissQuestion('${q.id}')">
          Dismiss
        </button>
      </div>
    </div>
  `).join('');
}

window.showQuestion = function(questionId) {
  const q = questions.find(q => q.id === questionId);
  if (q) {
    socket.emit('admin:show-question', q);
  }
};

window.highlightQuestion = function(questionId) {
  socket.emit('admin:highlight-question', { questionId });
};

window.dismissQuestion = function(questionId) {
  socket.emit('admin:dismiss-question', { questionId });
  questions = questions.filter(q => q.id !== questionId);
  renderQuestions();
};

// ============================================
// DRAWING PROMPTS
// ============================================

document.getElementById('btn-add-prompt').addEventListener('click', () => {
  const input = document.getElementById('new-prompt-input');
  const prompt = input.value.trim();

  if (!prompt) return;

  addPromptToList(prompt);
  input.value = '';
});

document.getElementById('new-prompt-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('btn-add-prompt').click();
  }
});

function addPromptToList(prompt) {
  const list = document.getElementById('prompts-list');
  const item = document.createElement('div');
  item.className = 'prompt-item';
  item.innerHTML = `
    <span>${escapeHtml(prompt)}</span>
    <button class="nes-btn is-success admin-btn" data-prompt="${escapeHtml(prompt)}">Send</button>
  `;

  item.querySelector('button').addEventListener('click', () => {
    sendDrawingPrompt(prompt);
  });

  list.appendChild(item);
}

// Bind existing prompt buttons
document.querySelectorAll('[data-prompt]').forEach(btn => {
  btn.addEventListener('click', () => {
    sendDrawingPrompt(btn.dataset.prompt);
  });
});

function sendDrawingPrompt(prompt) {
  socket.emit('admin:drawing-prompt', { prompt });

  // Visual feedback
  const items = document.querySelectorAll('.prompt-item');
  items.forEach(item => {
    if (item.querySelector('span').textContent === prompt) {
      item.classList.add('prompt-active');
      setTimeout(() => item.classList.remove('prompt-active'), 2000);
    }
  });
}

// ============================================
// PARTICIPANTS
// ============================================

socket.on('user-list', (users) => {
  participants = users;
  renderParticipants();
});

socket.on('user-count', (count) => {
  document.getElementById('online-count').textContent = count;
});

function renderParticipants() {
  const container = document.getElementById('participant-grid');
  document.getElementById('participant-count').textContent = `(${participants.length})`;

  if (participants.length === 0) {
    container.innerHTML = '<p style="color: #666; font-size: 0.6rem; grid-column: 1/-1; text-align: center;">No participants yet</p>';
    return;
  }

  container.innerHTML = participants.map(p => `
    <div class="participant-card ${p.online ? 'online' : ''}">
      <div class="name">@${escapeHtml(p.username)}</div>
      <div class="stats">
        🔥 ${p.reactions || 0} | ❓ ${p.questions || 0} | 🍺 ${p.drinks || 0}
      </div>
    </div>
  `).join('');
}

// ============================================
// ACTIVITY FEED
// ============================================

socket.on('emoji-blast', (data) => {
  addActivity(`${data.username} reacted with ${data.emoji}`, data.emoji);
  stats.reactions++;
  updateStats();
});

socket.on('drink-logged', (data) => {
  addActivity(`${data.username} logged drink #${data.count}`, '🍺');
  stats.drinks++;
  document.getElementById('total-drinks').textContent = data.totalDrinks || stats.drinks;
});

socket.on('pokemon-caught', (data) => {
  addActivity(`${data.username} caught ${data.pokemonName}${data.isShiny ? ' ✨' : ''}!`, '🎮');
  stats.pokemon++;
  updateStats();
});

socket.on('achievement-unlocked', (data) => {
  addActivity(`${data.username} unlocked: ${data.achievement}`, '🏆');
  stats.achievements++;
  updateStats();
});

socket.on('feed-event', (event) => {
  addActivity(event.message || 'Event occurred', event.icon || '📣');
});

function addActivity(message, icon = '📣') {
  const feed = document.getElementById('activity-feed');

  // Remove empty state
  if (feed.querySelector('p[style*="text-align: center"]')) {
    feed.innerHTML = '';
  }

  const item = document.createElement('div');
  item.className = 'feed-item';
  item.innerHTML = `
    <span class="feed-icon">${icon}</span>
    <div class="feed-content">
      <div class="feed-text">${escapeHtml(message)}</div>
      <div class="feed-time">${formatTime(Date.now())}</div>
    </div>
  `;

  feed.insertBefore(item, feed.firstChild);

  // Keep only last 50 items
  while (feed.children.length > 50) {
    feed.removeChild(feed.lastChild);
  }
}

// ============================================
// STATS
// ============================================

function updateStats() {
  document.getElementById('stat-reactions').textContent = stats.reactions;
  document.getElementById('stat-questions').textContent = stats.questions;
  document.getElementById('stat-pokemon').textContent = stats.pokemon;
  document.getElementById('stat-achievements').textContent = stats.achievements;
}

// Sync stats from server
socket.on('stats-sync', (serverStats) => {
  Object.assign(stats, serverStats);
  updateStats();
  document.getElementById('total-drinks').textContent = stats.drinks;
});

// ============================================
// UTILITIES
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
  // Ctrl+H: Hide current question on display
  if (e.ctrlKey && e.key === 'h') {
    e.preventDefault();
    socket.emit('admin:hide-question');
  }

  // Ctrl+P: Spawn random Pokemon
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();
    document.getElementById('btn-spawn-pokemon').click();
  }
});
