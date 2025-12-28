(function() {
  'use strict';

  // Only run in top frame, not iframes (Google Slides has many iframes)
  if (window !== window.top) return;

  // Prevent double injection
  if (window.__otychatOverlayInjected) return;
  window.__otychatOverlayInjected = true;

  const DEFAULT_SERVER = 'http://localhost:3000';
  let socket = null;
  let overlayContainer = null;
  let serverUrl = DEFAULT_SERVER; // Store for resolving relative URLs

  // ============================================
  // ANIMATION PATTERNS
  // ============================================

  const ANIMATION_PATTERNS = [
    'float-up',
    'pop-in',
    'bounce-across',
    'spiral-rise',
    'firework',
    'rain-down'
  ];

  function getRandomPattern() {
    return ANIMATION_PATTERNS[Math.floor(Math.random() * ANIMATION_PATTERNS.length)];
  }

  function getRandomX() {
    return Math.random() * (window.innerWidth - 120) + 60;
  }

  function getRandomY() {
    return Math.random() * (window.innerHeight - 120) + 60;
  }

  // ============================================
  // OVERLAY CREATION
  // ============================================

  function createOverlay() {
    if (overlayContainer) return;

    overlayContainer = document.createElement('div');
    overlayContainer.id = 'otychat-overlay';

    // Popcorn emergency container (hidden by default)
    overlayContainer.innerHTML = `
      <div class="otychat-popcorn-emergency" id="otychat-popcorn-emergency">
        <div class="emergency-bars top"></div>
        <div class="emergency-content">
          <div class="popcorn-icon">🍿</div>
          <h1>POPCORN EMERGENCY</h1>
          <div class="host-name" id="popcorn-host"></div>
          <div class="responders" id="popcorn-responders"></div>
        </div>
        <div class="emergency-bars bottom"></div>
        <div class="popcorn-kernels" id="popcorn-kernels"></div>
      </div>
    `;

    attachOverlay();
  }

  function attachOverlay() {
    const parent = document.fullscreenElement || document.body;
    if (overlayContainer.parentNode) {
      overlayContainer.parentNode.removeChild(overlayContainer);
    }
    parent.appendChild(overlayContainer);
  }

  // ============================================
  // FULLSCREEN HANDLING
  // ============================================

  document.addEventListener('fullscreenchange', () => {
    if (overlayContainer) attachOverlay();
  });
  document.addEventListener('webkitfullscreenchange', () => {
    if (overlayContainer) attachOverlay();
  });

  // ============================================
  // SOCKET CONNECTION
  // ============================================

  async function connectSocket() {
    const result = await chrome.storage.sync.get(['serverUrl']);
    serverUrl = result.serverUrl || DEFAULT_SERVER; // Store at module scope

    try {
      socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
      });

      socket.on('connect', () => {
        socket.emit('join-display');
        console.log('✅ OtyChat overlay connected');
      });

      socket.on('disconnect', () => {
        console.log('❌ OtyChat overlay disconnected');
      });

      // Emoji reactions - emoji field contains the URL path like "/emojis/123.png"
      socket.on('emoji-blast', (data) => {
        spawnEmoji(data.emoji, data.emoji); // emoji IS the URL
      });

      // Popcorn Emergency
      socket.on('popcorn-emergency-start', (data) => {
        showPopcornEmergency(data);
      });

      socket.on('popcorn-emergency-response', (data) => {
        updatePopcornResponder(data);
      });

      socket.on('popcorn-emergency-end', () => {
        hidePopcornEmergency();
      });

    } catch (err) {
      console.error('Failed to connect to OtyChat server:', err);
    }
  }

  // ============================================
  // EMOJI SPAWNING
  // ============================================

  function spawnEmoji(emoji, emojiUrl) {
    const el = document.createElement('div');
    const pattern = getRandomPattern();
    el.className = `otychat-emoji otychat-${pattern}`;

    // Create emoji content - resolve relative URLs to server
    if (emojiUrl) {
      const img = document.createElement('img');
      // Handle both absolute URLs and relative paths
      if (emojiUrl.startsWith('http')) {
        img.src = emojiUrl;
      } else if (emojiUrl.startsWith('/')) {
        img.src = serverUrl + emojiUrl; // Prepend server URL to relative path
      } else {
        img.src = serverUrl + '/' + emojiUrl;
      }
      img.alt = emoji || 'emoji';
      el.appendChild(img);
    } else if (emoji) {
      el.textContent = emoji;
    }

    // Position based on animation pattern
    switch(pattern) {
      case 'float-up':
        el.style.left = `${getRandomX()}px`;
        el.style.bottom = '0px';
        break;
      case 'pop-in':
        el.style.left = `${getRandomX()}px`;
        el.style.top = `${getRandomY()}px`;
        break;
      case 'bounce-across':
        el.style.left = '-60px';
        el.style.top = `${getRandomY()}px`;
        break;
      case 'spiral-rise':
        el.style.left = `${getRandomX()}px`;
        el.style.bottom = '0px';
        break;
      case 'firework':
        el.style.left = `${getRandomX()}px`;
        el.style.bottom = '0px';
        el.dataset.burstX = getRandomX();
        el.dataset.burstY = window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.3;
        break;
      case 'rain-down':
        el.style.left = `${getRandomX()}px`;
        el.style.top = '-60px';
        break;
    }

    overlayContainer.appendChild(el);

    // Firework burst effect
    if (pattern === 'firework') {
      setTimeout(() => {
        createFireworkBurst(el, emoji, emojiUrl);
      }, 600);
    }

    // Remove after animation
    const duration = pattern === 'firework' ? 2000 : 3500;
    setTimeout(() => el.remove(), duration);
  }

  function createFireworkBurst(parentEl, emoji, emojiUrl) {
    const rect = parentEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create 5 mini emojis bursting outward
    for (let i = 0; i < 5; i++) {
      const mini = document.createElement('div');
      mini.className = 'otychat-emoji otychat-burst-particle';

      if (emojiUrl) {
        const img = document.createElement('img');
        // Handle both absolute URLs and relative paths
        if (emojiUrl.startsWith('http')) {
          img.src = emojiUrl;
        } else if (emojiUrl.startsWith('/')) {
          img.src = serverUrl + emojiUrl;
        } else {
          img.src = serverUrl + '/' + emojiUrl;
        }
        mini.appendChild(img);
      } else if (emoji) {
        mini.textContent = emoji;
      }

      const angle = (i / 5) * Math.PI * 2;
      const distance = 80 + Math.random() * 40;
      mini.style.left = `${centerX}px`;
      mini.style.top = `${centerY}px`;
      mini.style.setProperty('--burst-x', `${Math.cos(angle) * distance}px`);
      mini.style.setProperty('--burst-y', `${Math.sin(angle) * distance}px`);

      overlayContainer.appendChild(mini);
      setTimeout(() => mini.remove(), 1000);
    }
  }

  // ============================================
  // POPCORN EMERGENCY
  // ============================================

  let popcornResponders = {};
  let popcornKernelInterval = null;

  function showPopcornEmergency(data) {
    const container = document.getElementById('otychat-popcorn-emergency');
    const hostEl = document.getElementById('popcorn-host');
    const respondersEl = document.getElementById('popcorn-responders');

    hostEl.textContent = `${data.hostUsername} needs you!`;
    respondersEl.innerHTML = '';
    popcornResponders = {};

    // Initialize invitees as pending
    data.invitees.forEach(user => {
      popcornResponders[user.username] = 'pending';
      addResponderElement(user.username, 'pending');
    });

    container.classList.add('active');

    // Start popping kernels
    startPopcornKernels();
  }

  function updatePopcornResponder(data) {
    const { username, status } = data;
    popcornResponders[username] = status;

    const el = document.querySelector(`[data-responder="${username}"]`);
    if (el) {
      el.className = `responder ${status}`;
      el.querySelector('.status-icon').textContent = status === 'accepted' ? '✅' : '❌';

      // Accepted users get a pop-in animation
      if (status === 'accepted') {
        el.classList.add('pop-in');
      }
    }
  }

  function addResponderElement(username, status) {
    const respondersEl = document.getElementById('popcorn-responders');
    const el = document.createElement('div');
    el.className = `responder ${status}`;
    el.dataset.responder = username;
    el.innerHTML = `
      <span class="status-icon">${status === 'pending' ? '⏳' : status === 'accepted' ? '✅' : '❌'}</span>
      <span class="name">${escapeHtml(username)}</span>
    `;
    respondersEl.appendChild(el);
  }

  function hidePopcornEmergency() {
    const container = document.getElementById('otychat-popcorn-emergency');
    container.classList.remove('active');
    stopPopcornKernels();
  }

  function startPopcornKernels() {
    const kernelsContainer = document.getElementById('popcorn-kernels');
    kernelsContainer.innerHTML = '';

    popcornKernelInterval = setInterval(() => {
      const kernel = document.createElement('div');
      kernel.className = 'kernel';
      kernel.textContent = '🍿';
      kernel.style.left = `${Math.random() * 100}%`;
      kernel.style.animationDuration = `${1 + Math.random() * 2}s`;
      kernelsContainer.appendChild(kernel);

      setTimeout(() => kernel.remove(), 3000);
    }, 200);
  }

  function stopPopcornKernels() {
    if (popcornKernelInterval) {
      clearInterval(popcornKernelInterval);
      popcornKernelInterval = null;
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // MESSAGE HANDLING (from popup)
  // ============================================

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'reconnect') {
      if (socket) socket.disconnect();
      connectSocket();
    }
    if (message.action === 'test') {
      // Test all animation patterns
      ANIMATION_PATTERNS.forEach((pattern, i) => {
        setTimeout(() => spawnEmoji('🎉', null), i * 300);
      });
    }
  });

  // ============================================
  // INIT
  // ============================================

  function init() {
    console.log('🎭 OtyChat Display Overlay initializing...');
    createOverlay();
    connectSocket();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
