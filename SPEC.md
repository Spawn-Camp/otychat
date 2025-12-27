# OtyChat - Interactive Presentation Companion

## Overview

A playful web app for in-person presentation hangouts. Everyone joins from their phone and can:
- 🎭 Send emoji reactions to the presentation screen
- 🎨 Draw PictoChat-style doodles with optional text
- ❓ Submit and upvote questions (live feed)
- 💬 DM other participants
- 🍺 Track drinks
- ⚡ Catch Pokémon with zones, leveling, and evolution
- 🏆 Earn achievements, XP, and coins
- 📊 Compete on leaderboards

**Inspiration:** FroggieChat, PictoChat (Nintendo DS), Pokémon GO

---

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build/dev server
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time communication
- **Custom playful UI** with Fredoka/Nunito fonts, gradients, and rounded corners

### Backend
- **Node.js** with Express
- **Socket.io** for WebSocket communication
- **SQLite** for persistent data (better-sqlite3)

### Design System
- Rounded corners (12-16px radius)
- Gradient backgrounds (pink/purple for active states, green for success)
- Soft shadows and blur effects
- Cream-colored "paper" for drawing canvas with ruled lines
- Mobile-first responsive design (optimized for 390x844 iPhone viewport)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│  client/src/                                                 │
│  ├── contexts/SocketContext.tsx  (central socket state)     │
│  ├── app/components/             (UI components)            │
│  │   ├── MainApp.tsx             (tab navigation)           │
│  │   ├── MessageComposer.tsx     (draw/text input)          │
│  │   ├── EmojiPicker.tsx         (emoji reactions)          │
│  │   └── tabs/                   (Feed, React, Pokemon...)  │
│  └── app/data/emoji-data.ts      (custom emoji URLs)        │
└─────────────────────────────────────────────────────────────┘
                              │
                         WebSocket
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Backend                           │
│  ├── server.js       (Express + Socket.io)                  │
│  ├── db.js           (SQLite queries)                       │
│  ├── pokemon.js      (zones, spawns, catch rates)           │
│  └── achievements.js (achievement definitions)              │
└─────────────────────────────────────────────────────────────┘
                              │
                           SQLite
                              │
                    data/otychat.db
```

---

## Navigation

Bottom tab bar with 5 tabs:

| Tab | Icon | Purpose |
|-----|------|---------|
| Feed | 📊 | Dashboard with leaderboards, stats, activity feed |
| React | 🎭 | Emoji reactions, questions feed, drawing/text input |
| Pokémon | ⚡ | Catch Pokémon, view Pokédex, change zones |
| DMs | 💬 | Direct messages with other users |
| Me | 👤 | Profile, stats, inventory, settings |

---

## Screens & Components

### 1. Login Screen

Simple username entry with animated background. Credentials cached in localStorage for auto-login.

### 2. Feed Tab (Dashboard)

```
┌─────────────────────────────────────┐
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │ ⚡  │ │ 🪙  │ │ 👥  │  Quick     │
│ │ Lv1 │ │ 55  │ │  3  │  Stats     │
│ └─────┘ └─────┘ └─────┘            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✨ Shiny Hunters    [⚡][🎯][✨][🎭] │
│ │ 1. chase ............ 4        │ │
│ │ 2. TestUser ......... 0        │ │
│ │ 3. Artist ........... 0        │ │
│ │ (auto-cycles every 5 seconds)  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Live Activity                       │
│ ┌─────────────────────────────────┐ │
│ │ ❓ Chase asked a question       │ │
│ │ 🎨 Chase sent a drawing         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Features:**
- Quick stats bar: Level, Coins, Online count
- Cycling leaderboards: XP Leaders, Top Catchers, Shiny Hunters, Most Active
- Live activity feed (last 10 events)

### 3. React Tab

```
┌─────────────────────────────────────┐
│ [😀][🔥][💀][😂][👏][❤️][🎉] [•••]  │  Emoji bar
│                                     │
│ Questions & Reactions               │
│ ┌─────────────────────────────────┐ │
│ │ C chase  ❓Question    6:54 AM │ │
│ │ No more duplicates!            │ │
│ │ 👍 0                           │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ C chase  🎨Drawing     8:30 PM │ │
│ │ [drawing image]                │ │
│ │ 👍 2                           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─┐ ┌───────────────────────┐ ┌─┐  │
│ │Ι│ │                       │ │🗑│  │
│ │🪣│ │  Canvas (draw/type)  │ │➤│  │
│ │•│ │                       │ └─┘  │
│ └─┘ └───────────────────────┘      │
└─────────────────────────────────────┘
```

**MessageComposer Controls:**
- **Left side (top to bottom):**
  - `Ι` Insert point - toggles text mode (shows ✏️ when active)
  - `🪣` Color picker - opens color palette modal
  - `•` Brush size - opens size selector modal
- **Center:** Canvas with ruled paper lines
- **Right side:**
  - `🗑️` Clear - resets canvas and text
  - `➤` Send - submits drawing/text (pointing NE like paper airplane)

**Behavior:**
- Default mode is draw - tap canvas to draw
- Tap `Ι` to enable text mode - textarea appears over canvas
- Drawing and text can be combined
- Text aligns to ruled paper lines

### 4. Pokémon Tab

- Zone selector (unlock zones by leveling up)
- Active Pokémon spawn with catch modal
- Ball selector (Poké Ball, Great Ball, Ultra Ball, Master Ball)
- Catch rate calculations with quick-catch bonus
- Pokédex grid showing caught/uncaught silhouettes

### 5. DMs Tab

- List of conversations
- Unread message badges
- Same MessageComposer for sending drawings/text

### 6. Me Tab

- Profile picture and username
- Trainer level with XP bar
- Stats: Pokémon caught, shinies, reactions, drinks
- Inventory: balls, evolution stones
- Shop for items
- Background theme selector
- Logout button

---

## Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ username }` | Join/rejoin session |
| `reaction` | `{ emoji }` | Send emoji to display |
| `send-question` | `{ text?, drawing? }` | Submit question/drawing |
| `upvote-question` | `{ questionId }` | Upvote a question |
| `catch-pokemon` | `{ odId, ballType }` | Attempt to catch |
| `change-zone` | `{ zone }` | Change hunting zone |
| `log-drink` | `{}` | Log a drink |
| `send-dm` | `{ toUsername, content }` | Send direct message |
| `send-kudos` | `{ toUsername, message }` | Give kudos |
| `buy-item` | `{ itemId }` | Purchase from shop |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `trainer-stats` | `{ coins, level, xp, ... }` | User data on join |
| `questions-sync` | `[questions]` | Initial questions list |
| `question-added` | `{ id, username, text, drawing }` | New question |
| `question-upvoted` | `{ questionId, votes }` | Vote update |
| `pokemon-spawned` | `{ pokemon }` | New spawn for user |
| `pokemon-caught` | `{ pokemon, xpGained }` | Successful catch |
| `catch-failed` | `{ ballUsed }` | Failed catch attempt |
| `level-up` | `{ level, unlockedZone? }` | Level up notification |
| `leaderboards` | `{ xp, pokemon, shiny, reactions }` | Leaderboard data |
| `online-users` | `[users]` | Online user list |

---

## XP & Leveling System

**XP Gains:**
- Emoji reaction: +1 XP
- Question asked: +20 XP
- Drawing sent: +15 XP
- Question upvoted: +5 XP per vote
- Pokémon caught: +25 XP
- Shiny caught: +100 XP
- Log drink: +10 XP

**Level Thresholds:** 0, 200, 500, 1000, 1750, 2750...

**Zone Unlocks:**
- Meadow: Level 1 (starter)
- Forest: Level 5
- Mountain: Level 10
- Ocean: Level 15
- Sky Temple: Level 20
- Mystery: Level 25

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  coins INTEGER DEFAULT 0,
  title TEXT,
  trainer_level INTEGER DEFAULT 1,
  trainer_xp INTEGER DEFAULT 0,
  current_zone TEXT DEFAULT 'meadow',
  shiny_charm BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pokemon caught
CREATE TABLE pokemon_caught (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  pokemon_id INTEGER,
  is_shiny BOOLEAN DEFAULT FALSE,
  zone TEXT,
  caught_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ball inventory
CREATE TABLE ball_inventory (
  user_id INTEGER PRIMARY KEY,
  great_balls INTEGER DEFAULT 0,
  ultra_balls INTEGER DEFAULT 0,
  master_balls INTEGER DEFAULT 0
);

-- Questions
CREATE TABLE questions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  text TEXT,
  drawing TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User stats
CREATE TABLE user_stats (
  user_id INTEGER PRIMARY KEY,
  reactions INTEGER DEFAULT 0,
  questions INTEGER DEFAULT 0,
  drinks INTEGER DEFAULT 0
);
```

---

## File Structure

```
OtyChat/
├── server.js              # Express + Socket.io server
├── db.js                  # SQLite database functions
├── pokemon.js             # Pokemon zones, spawns, catch rates
├── achievements.js        # Achievement definitions
├── SPEC.md               # This file
├── CLAUDE.md             # Development guide for Claude
├── data/
│   └── otychat.db        # SQLite database
└── client/               # React frontend
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── contexts/
        │   └── SocketContext.tsx
        └── app/
            ├── components/
            │   ├── MainApp.tsx
            │   ├── LoginScreen.tsx
            │   ├── MessageComposer.tsx
            │   ├── EmojiPicker.tsx
            │   ├── UserProfile.tsx
            │   └── tabs/
            │       ├── FeedTab.tsx
            │       ├── ReactTab.tsx
            │       ├── PokemonTab.tsx
            │       ├── DMsTab.tsx
            │       └── MeTab.tsx
            └── data/
                └── emoji-data.ts
```

---

## Running Locally

```bash
# Terminal 1 - Backend
npm install
npm run backend:start

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

Frontend: http://localhost:5176
Backend: http://localhost:3000

---

## Post-V1 Ideas

- Display overlay for presentation screen
- Admin panel for moderating questions
- Pokémon trading between users
- Custom emoji upload
- Polls and voting
- End-of-night awards ceremony
- Mr. Cheese hardware integration
