# OtyChat Development Guide

## Quick Start

```bash
# Terminal 1 - Backend
npm install
npm start        # or: npm run dev (with --watch)

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

- **Frontend**: http://localhost:5176
- **Backend**: http://localhost:3000

---

## Project Overview

OtyChat is a real-time presentation companion app for in-person hangouts. Features:
- Emoji reactions that blast to a presentation screen
- PictoChat-style drawing canvas with text
- Live Q&A with upvoting
- Direct messages between participants
- Pokemon catching with zones, leveling, and evolution
- Achievements, XP, coins, and leaderboards
- Drink tracking

**Inspiration**: FroggieChat, PictoChat (Nintendo DS), Pokemon GO

---

## Architecture

```
OtyChat/
├── server.js              # Express + Socket.io server (port 3000)
├── db.js                  # SQLite database functions (sql.js)
├── pokemon.js             # Pokemon zones, spawns, catch rates
├── achievements.js        # Achievement definitions
├── data/
│   └── otychat.db         # SQLite database file
└── client/                # React frontend (Vite, port 5176)
    └── src/
        ├── main.tsx
        ├── contexts/
        │   └── SocketContext.tsx   # Central socket state manager
        └── app/
            ├── App.tsx
            ├── components/
            │   ├── MainApp.tsx         # Tab navigation
            │   ├── JoinScreen.tsx      # Login screen
            │   ├── MessageComposer.tsx # Drawing/text input
            │   ├── EmojiPicker.tsx
            │   ├── PokemonEncounter.tsx
            │   ├── Pokedex.tsx
            │   └── tabs/
            │       ├── FeedTab.tsx     # Dashboard & leaderboards
            │       ├── ReactTab.tsx    # Emoji reactions & Q&A
            │       ├── PokemonTab.tsx  # Pokemon catching
            │       ├── DMsTab.tsx      # Direct messages
            │       └── MeTab.tsx       # Profile & settings
            └── data/
                ├── emoji-data.ts       # Custom emoji URLs
                └── pokemon-data.ts     # Pokemon metadata
```

---

## Tech Stack

### Backend
- **Node.js** + **Express** - HTTP server
- **Socket.io** - WebSocket communication
- **sql.js** - SQLite in JavaScript (WASM)

### Frontend
- **React 18** with TypeScript
- **Vite** - Dev server and bundler
- **Tailwind CSS v4** - Utility styling
- **Radix UI** - Accessible component primitives
- **MUI** - Some Material UI components
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icon library

### Design System
- **Fonts**: Fredoka (headers), Nunito (body)
- **Colors**: Pink/purple gradients for active states, green for success
- **Style**: Rounded corners (12-16px), soft shadows, playful aesthetic
- **Canvas**: Cream-colored "paper" with ruled lines
- **Mobile-first**: Optimized for 390x844 iPhone viewport

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `client/src/contexts/SocketContext.tsx` | **Critical** - All socket state, real-time data |
| `client/src/app/components/MainApp.tsx` | Tab navigation, background themes |
| `client/src/app/components/MessageComposer.tsx` | Drawing canvas + text input |
| `client/src/app/components/tabs/*.tsx` | Individual tab implementations |
| `server.js` | Express routes + Socket.io events |
| `db.js` | All SQLite queries and schema |
| `pokemon.js` | Zones, spawns, catch rates, evolution |

---

## Common Patterns

### Socket Event Handling

All socket events flow through `SocketContext.tsx`. To add a new event:

```typescript
// In SocketContext.tsx
newSocket.on('event-name', (data) => {
  setSomeState(data);
});

// Expose in context value
const value = {
  someState,
  sendSomething: (data) => socket?.emit('send-something', data),
};
```

### Preventing Duplicate Events

React Strict Mode and rapid socket events can cause duplicates. Use ref-based deduplication:

```typescript
const seenIds = useRef<Set<string>>(new Set());

socket.on('item-added', (item) => {
  const id = String(item.id);
  if (seenIds.current.has(id)) return;
  seenIds.current.add(id);
  // Now safe to update state
});
```

### Component Styling

Use inline styles with CSS variables for theming:

```typescript
<div style={{
  background: 'var(--bg-primary)',
  color: 'var(--text)',
  fontFamily: 'Fredoka, sans-serif',  // Headers
  // or
  fontFamily: 'Nunito, sans-serif',   // Body text
}}>
```

Common gradients:
- **Active/selected**: `linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)`
- **Info/question**: `linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)`
- **Success**: `linear-gradient(135deg, #10b981 0%, #06b6d4 100%)`

---

## Navigation (5 Tabs)

| Tab | Icon | Component | Purpose |
|-----|------|-----------|---------|
| Feed | 📊 | `FeedTab` | Dashboard, leaderboards, activity |
| React | 🎭 | `ReactTab` | Emoji reactions, Q&A, drawing |
| Pokemon | ⚡ | `PokemonTab` | Catch Pokemon, Pokedex, zones |
| DMs | 💬 | `DMsTab` | Direct messages |
| Me | 👤 | `MeTab` | Profile, stats, shop, settings |

---

## Pokemon System

### Zones (Unlock by Level)
| Zone | Level | Pokemon Types |
|------|-------|---------------|
| Meadow | 1 | Common starters |
| Forest | 5 | Bug, Grass |
| Mountain | 10 | Rock, Ground |
| Ocean | 15 | Water |
| Sky Temple | 20 | Flying, Psychic |
| Mystery | 25 | Rare, Legendary |

### Spawning
- Server emits `pokemon-spawned` to individual users
- Each user gets spawns based on their selected zone
- Spawns stored in-memory (not database)

### Catch Flow
1. User clicks Pokemon spawn
2. Catch modal opens with ball selector
3. User selects ball type, clicks catch
4. Server calculates catch rate and rolls
5. Emit `pokemon-caught` or `catch-failed`

### Ball Types
- **Poke Ball**: Free, base catch rate
- **Great Ball**: +20% catch rate
- **Ultra Ball**: +40% catch rate
- **Master Ball**: 100% catch rate (rare)

---

## XP & Leveling

| Action | XP |
|--------|-----|
| Emoji reaction | +1 |
| Question asked | +20 |
| Drawing sent | +15 |
| Question upvoted | +5 per vote |
| Pokemon caught | +25 |
| Shiny caught | +100 |
| Log drink | +10 |

**Level Thresholds**: 0, 200, 500, 1000, 1750, 2750...

---

## Database Schema (SQLite)

```sql
-- Core tables
users (id, username, coins, title, trainer_level, trainer_xp, current_zone, shiny_charm)
pokemon_caught (id, user_id, pokemon_id, is_shiny, zone, caught_at)
ball_inventory (user_id, great_balls, ultra_balls, master_balls)
questions (id, user_id, text, drawing, created_at)
user_stats (user_id, reactions, questions, drinks)
```

---

## Socket Events Reference

### Client → Server
| Event | Payload |
|-------|---------|
| `join` | `{ username }` |
| `reaction` | `{ emoji }` |
| `send-question` | `{ text?, drawing? }` |
| `upvote-question` | `{ questionId }` |
| `catch-pokemon` | `{ odId, ballType }` |
| `change-zone` | `{ zone }` |
| `log-drink` | `{}` |
| `send-dm` | `{ toUsername, content }` |

### Server → Client
| Event | Payload |
|-------|---------|
| `trainer-stats` | User data on join |
| `questions-sync` | Initial questions list |
| `question-added` | New question |
| `pokemon-spawned` | New spawn for user |
| `pokemon-caught` | Successful catch |
| `level-up` | Level up notification |
| `leaderboards` | Leaderboard data |

---

## Debugging Tips

### Socket Connection
```typescript
const { isConnected, user } = useSocket();
console.log('Connected:', isConnected, 'User:', user);
```

### Common Issues

1. **Duplicate messages** - Check `seenIds` ref filtering in SocketContext
2. **Canvas not drawing** - Verify canvas ref attached, context is 2d
3. **Pokemon not spawning** - Check zone is unlocked, spawn interval running
4. **Layout broken** - Check for conflicting `h-screen`/`h-full`, extra padding

### React Strict Mode
Events fire twice in dev. Use ref-based deduplication (see patterns above).

---

## Code Style

- TypeScript strict mode
- Inline styles for dynamic values, Tailwind for static layout
- Components < 100 lines; extract when larger
- Socket events: verb prefixes (`send-`, `get-`)
- Database: snake_case
- Frontend state: camelCase

---

## Testing Checklist

Before deploying:
- [ ] Login works and persists (localStorage)
- [ ] Emoji reactions appear on display
- [ ] Drawings render correctly with text
- [ ] Questions show without duplicates
- [ ] Upvotes increment correctly
- [ ] Pokemon spawns in correct zone
- [ ] Catch modal works
- [ ] DMs send and receive
- [ ] Leaderboards update
- [ ] Background themes switch

---

## Deprecated

- **NES.css** - Previously used for retro pixel styling, now removed
- **`/Oty-Chat` folder** - Old prototype with NES.css, not actively developed

The current active project uses a modern playful UI with Radix/Tailwind instead.
