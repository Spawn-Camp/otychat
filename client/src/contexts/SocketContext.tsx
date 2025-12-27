import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Types matching the backend
interface User {
  odId: string;
  odName: string;
  odTitle: string;
  odCoins: number;
  odDrinksTonight: number;
  odDrinksTotal: number;
  odReactions: number;
  odQuestions: number;
  odDrawings: number;
  odPokemon: number;
  odAchievements: string[];
  odTrainerLevel: number;
  odTrainerXp: number;
  odCurrentZone: string;
  odShinyCharm: boolean;
  odProfilePic?: string;
  odStatus?: string;
  odNameColor?: string;
}

interface Pokemon {
  odId: string;
  odPokemonId: number;
  odName: string;
  odRarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  odIsShiny: boolean;
  odZone: string;
  odSpriteUrl: string;
}

interface BallInventory {
  great: number;
  ultra: number;
  master: number;
}

interface StoneInventory {
  fire: number;
  water: number;
  thunder: number;
  leaf: number;
  moon: number;
  sun: number;
  dragon: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

interface Zone {
  name: string;
  levelRequired: number;
  pokemon: {
    common: number[];
    uncommon: number[];
    rare: number[];
    legendary?: number[];
  };
}

interface FeedItem {
  id: string;
  type: 'achievement' | 'pokemon' | 'drink' | 'kudos' | 'drawing' | 'slide' | 'question';
  message: string;
  timestamp: Date;
  icon: string;
  username?: string;
}

interface Question {
  odId: string;
  odUserId: number;
  odUsername: string;
  odContent: string;
  odType: 'text' | 'drawing';
  odImageData?: string;
  odUpvotes: number;
  odHasUpvoted: boolean;
  odCreatedAt: string;
}

interface DM {
  odId: string;
  odFromId: number;
  odFromName: string;
  odToId: number;
  odToName: string;
  odContent: string;
  odRead: boolean;
  odCreatedAt: string;
}

interface LeaderboardEntry {
  username: string;
  level?: number;
  xp?: number;
  count?: number;
}

interface Leaderboards {
  xp: LeaderboardEntry[];
  pokemon: LeaderboardEntry[];
  shiny: LeaderboardEntry[];
  reactions: LeaderboardEntry[];
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  user: User | null;
  onlineUsers: { odName: string; odTitle: string; odProfilePic?: string }[];
  onlineCount: number;
  questions: Question[];
  feed: FeedItem[];
  activePokemon: Pokemon | null;
  caughtPokemon: Pokemon[];
  ballInventory: BallInventory;
  stoneInventory: StoneInventory;
  zones: Record<string, Zone>;
  achievements: Achievement[];
  unlockedAchievements: string[];
  dms: DM[];
  unreadDMCount: number;
  leaderboards: Leaderboards;

  // Actions
  join: (username: string) => void;
  sendReaction: (emoji: string) => void;
  sendQuestion: (content: string, type: 'text' | 'drawing', imageData?: string) => void;
  upvoteQuestion: (questionId: string) => void;
  catchPokemon: (odId: string, ballType: string) => void;
  runFromPokemon: () => void;
  changeZone: (zone: string) => void;
  logDrink: () => void;
  buyItem: (itemId: string) => void;
  evolvePokemon: (pokemonId: string, stoneType: string) => void;
  sendDM: (toUsername: string, content: string) => void;
  sendKudos: (toUsername: string, message: string) => void;
  updateProfile: (updates: { profilePic?: string; status?: string; title?: string }) => void;
  leave: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{ odName: string; odTitle: string; odProfilePic?: string }[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [activePokemon, setActivePokemon] = useState<Pokemon | null>(null);
  const [caughtPokemon, setCaughtPokemon] = useState<Pokemon[]>([]);
  const [ballInventory, setBallInventory] = useState<BallInventory>({ great: 0, ultra: 0, master: 0 });
  const [stoneInventory, setStoneInventory] = useState<StoneInventory>({ fire: 0, water: 0, thunder: 0, leaf: 0, moon: 0, sun: 0, dragon: 0 });
  const [zones, setZones] = useState<Record<string, Zone>>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [dms, setDms] = useState<DM[]>([]);
  const [unreadDMCount, setUnreadDMCount] = useState(0);
  const [leaderboards, setLeaderboards] = useState<Leaderboards>({
    xp: [],
    pokemon: [],
    shiny: [],
    reactions: []
  });

  // Ref to track seen question IDs (prevents duplicates from rapid events/React Strict Mode)
  const seenQuestionIds = useRef<Set<string>>(new Set());

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io({
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    // User events - server sends 'trainer-stats' on join
    newSocket.on('trainer-stats', (data: {
      coins: number;
      title: string;
      level: number;
      xp: number;
      xpForNextLevel: number;
      currentZone: string;
      unlockedZones: string[];
      totalCaught: number;
      uniqueCaught: number;
      shinyCaught: number;
      shinyCharm: boolean;
      reactions: number;
      questions: number;
      drinks: number;
      balls: { pokeball: number; great: number; ultra: number; master: number };
      stones: Record<string, number>;
    }) => {
      console.log('Received trainer-stats:', data);
      // Get the username from localStorage since server doesn't send it back
      const username = localStorage.getItem('otychat_username') || 'Unknown';
      setUser({
        odId: '', // Will be set by server in future
        odName: username,
        odTitle: data.title || '',
        odCoins: data.coins,
        odDrinksTonight: data.drinks,
        odDrinksTotal: data.drinks,
        odReactions: data.reactions,
        odQuestions: data.questions,
        odDrawings: 0,
        odPokemon: data.totalCaught,
        odAchievements: [],
        odTrainerLevel: data.level,
        odTrainerXp: data.xp,
        odCurrentZone: data.currentZone,
        odShinyCharm: data.shinyCharm,
      });
      // Also update ball inventory
      setBallInventory({
        great: data.balls.great,
        ultra: data.balls.ultra,
        master: data.balls.master,
      });
    });

    newSocket.on('user-joined', (data: { username: string; onlineCount: number }) => {
      setOnlineCount(data.onlineCount);
      addFeedItem({
        type: 'achievement',
        message: `${data.username} joined the room!`,
        icon: '👋',
      });
    });

    newSocket.on('user-left', (data: { username: string; onlineCount: number }) => {
      setOnlineCount(data.onlineCount);
    });

    newSocket.on('online-users', (users: { odName: string; odTitle: string; odProfilePic?: string }[]) => {
      setOnlineUsers(users);
      setOnlineCount(users.length);
    });

    newSocket.on('coins-updated', (coins: number) => {
      setUser(prev => prev ? { ...prev, odCoins: coins } : null);
    });

    newSocket.on('xp-updated', (data: { xp: number; level: number }) => {
      setUser(prev => prev ? { ...prev, odTrainerXp: data.xp, odTrainerLevel: data.level } : null);
    });

    newSocket.on('level-up', (data: { level: number; unlockedZone?: string }) => {
      addFeedItem({
        type: 'achievement',
        message: `You reached Level ${data.level}!${data.unlockedZone ? ` New zone unlocked: ${data.unlockedZone}` : ''}`,
        icon: '🎉',
      });
    });

    // Questions
    // Server sends 'questions-sync' with array of server-format questions
    newSocket.on('questions-sync', (serverQuestions: Array<{
      id: number;
      user_id: number;
      text: string | null;
      drawing: string | null;
      created_at: string;
      username: string;
      upvotes?: number;
    }>) => {
      // Map server format to client format
      const questions: Question[] = serverQuestions.map(sq => ({
        odId: String(sq.id),
        odUserId: sq.user_id,
        odUsername: sq.username,
        odContent: sq.text || '',
        odType: sq.drawing ? 'drawing' as const : 'text' as const,
        odImageData: sq.drawing || undefined,
        odUpvotes: sq.upvotes || 0,
        odHasUpvoted: false,
        odCreatedAt: sq.created_at,
      }));
      setQuestions(questions);
    });

    // Server sends 'question-added' with { id, user_id, text, drawing, created_at, username }
    newSocket.on('question-added', (serverQuestion: {
      id: number;
      user_id: number;
      text: string | null;
      drawing: string | null;
      created_at: string;
      username: string;
      upvotes?: number;
    }) => {
      const questionId = String(serverQuestion.id);

      // Use ref to prevent duplicates from rapid events or React Strict Mode
      if (seenQuestionIds.current.has(questionId)) {
        return; // Already processed this question
      }
      seenQuestionIds.current.add(questionId);

      // Map server format to client format
      const question: Question = {
        odId: questionId,
        odUserId: serverQuestion.user_id,
        odUsername: serverQuestion.username,
        odContent: serverQuestion.text || '',
        odType: serverQuestion.drawing ? 'drawing' : 'text',
        odImageData: serverQuestion.drawing || undefined,
        odUpvotes: serverQuestion.upvotes || 0,
        odHasUpvoted: false,
        odCreatedAt: serverQuestion.created_at,
      };

      setQuestions(prev => [question, ...prev]);
      addFeedItem({
        type: 'question',
        message: `${question.odUsername} asked a question`,
        icon: serverQuestion.drawing ? '🎨' : '❓',
        username: question.odUsername,
      });
    });

    // Server sends { questionId, votes }
    newSocket.on('question-upvoted', (data: { questionId: number | string; votes: number }) => {
      const qId = String(data.questionId);
      setQuestions(prev => prev.map(q =>
        q.odId === qId ? { ...q, odUpvotes: data.votes, odHasUpvoted: true } : q
      ));
    });

    // Reactions
    newSocket.on('reaction-sent', (data: { emoji: string; username: string }) => {
      addFeedItem({
        type: 'achievement',
        message: `${data.username} reacted with ${data.emoji}`,
        icon: data.emoji,
        username: data.username,
      });
    });

    // Pokemon events
    newSocket.on('pokemon-spawned', (pokemon: Pokemon) => {
      setActivePokemon(pokemon);
    });

    newSocket.on('pokemon-caught', (data: { pokemon: Pokemon; xpGained: number; coinsGained: number }) => {
      setCaughtPokemon(prev => [...prev, data.pokemon]);
      setActivePokemon(null);
      setUser(prev => prev ? { ...prev, odPokemon: prev.odPokemon + 1 } : null);
      addFeedItem({
        type: 'pokemon',
        message: `You caught ${data.pokemon.odIsShiny ? 'a shiny ' : ''}${data.pokemon.odName}!`,
        icon: data.pokemon.odIsShiny ? '✨' : '⚡',
      });
    });

    newSocket.on('catch-failed', (data: { pokemonId: number; ballUsed: string }) => {
      // Pokemon broke free, still active
    });

    newSocket.on('pokemon-fled', () => {
      setActivePokemon(null);
    });

    newSocket.on('pokemon-list', (pokemon: Pokemon[]) => {
      setCaughtPokemon(pokemon);
    });

    newSocket.on('zones-data', (data: { zones: Record<string, Zone> }) => {
      setZones(data.zones || data);
    });

    // Inventory
    newSocket.on('ball-inventory', (inventory: BallInventory) => {
      setBallInventory(inventory);
    });

    newSocket.on('stone-inventory', (inventory: StoneInventory) => {
      setStoneInventory(inventory);
    });

    // Achievements
    newSocket.on('achievements-list', (achievementsList: Achievement[]) => {
      setAchievements(achievementsList);
    });

    newSocket.on('achievement-unlocked', (achievement: Achievement) => {
      setUnlockedAchievements(prev => [...prev, achievement.id]);
      addFeedItem({
        type: 'achievement',
        message: `Achievement unlocked: ${achievement.name}!`,
        icon: achievement.icon,
      });
    });

    // DMs
    newSocket.on('dm-list', (dmList: DM[]) => {
      setDms(dmList);
      setUnreadDMCount(dmList.filter(dm => !dm.odRead).length);
    });

    newSocket.on('new-dm', (dm: DM) => {
      setDms(prev => [...prev, dm]);
      setUnreadDMCount(prev => prev + 1);
    });

    // Drinks
    newSocket.on('drink-logged', (data: { tonight: number; total: number }) => {
      setUser(prev => prev ? { ...prev, odDrinksTonight: data.tonight, odDrinksTotal: data.total } : null);
    });

    // Shop
    newSocket.on('purchase-success', (data: { itemId: string; newBalance: number }) => {
      setUser(prev => prev ? { ...prev, odCoins: data.newBalance } : null);
    });

    // Kudos
    newSocket.on('kudos-received', (data: { from: string; message: string; coins: number }) => {
      addFeedItem({
        type: 'kudos',
        message: `${data.from} gave you kudos: "${data.message}" (+${data.coins} coins)`,
        icon: '💖',
        username: data.from,
      });
    });

    // Leaderboards
    newSocket.on('leaderboards', (data: Leaderboards) => {
      setLeaderboards(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const addFeedItem = (item: Omit<FeedItem, 'id' | 'timestamp'>) => {
    setFeed(prev => [{
      ...item,
      id: Date.now().toString(),
      timestamp: new Date(),
    }, ...prev].slice(0, 50)); // Keep last 50 items
  };

  // Connect socket when we have a pending username but socket isn't connected
  useEffect(() => {
    if (socket && !connected && pendingUsername) {
      socket.connect();
    }
  }, [socket, connected, pendingUsername]);

  // Emit join when socket connects and we have a pending username
  useEffect(() => {
    if (socket && connected && pendingUsername) {
      console.log('Emitting join for:', pendingUsername);
      socket.emit('join', { username: pendingUsername });
      setPendingUsername(null);
    }
  }, [socket, connected, pendingUsername]);

  // Actions
  const join = useCallback((username: string) => {
    // Always set pending username - the effect below will handle joining when socket is ready
    setPendingUsername(username);
    if (socket) {
      if (!socket.connected) {
        socket.connect();
      } else {
        // Already connected, emit immediately
        socket.emit('join', { username });
      }
    }
    // If socket is null, the pending username will trigger join when socket initializes
  }, [socket]);

  const sendReaction = useCallback((emoji: string) => {
    socket?.emit('reaction', { emoji });
  }, [socket]);

  const sendQuestion = useCallback((content: string, type: 'text' | 'drawing', imageData?: string) => {
    // Server expects 'send-question' with { text, drawing }
    socket?.emit('send-question', {
      text: content || null,
      drawing: imageData || null
    });
  }, [socket]);

  const upvoteQuestion = useCallback((questionId: string) => {
    socket?.emit('upvote-question', { questionId });
  }, [socket]);

  const catchPokemon = useCallback((odId: string, ballType: string) => {
    socket?.emit('catch-pokemon', { odId, ballType });
  }, [socket]);

  const runFromPokemon = useCallback(() => {
    socket?.emit('run-from-pokemon');
    setActivePokemon(null);
  }, [socket]);

  const changeZone = useCallback((zone: string) => {
    socket?.emit('change-zone', { zone });
    setUser(prev => prev ? { ...prev, odCurrentZone: zone } : null);
  }, [socket]);

  const logDrink = useCallback(() => {
    socket?.emit('log-drink');
  }, [socket]);

  const buyItem = useCallback((itemId: string) => {
    socket?.emit('buy-item', { itemId });
  }, [socket]);

  const evolvePokemon = useCallback((pokemonId: string, stoneType: string) => {
    socket?.emit('evolve-pokemon', { pokemonId, stoneType });
  }, [socket]);

  const sendDM = useCallback((toUsername: string, content: string) => {
    socket?.emit('send-dm', { toUsername, content });
  }, [socket]);

  const sendKudos = useCallback((toUsername: string, message: string) => {
    socket?.emit('send-kudos', { toUsername, message });
  }, [socket]);

  const updateProfile = useCallback((updates: { profilePic?: string; status?: string; title?: string }) => {
    socket?.emit('update-profile', updates);
    // Map the update keys to match the User interface (od-prefixed keys)
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...(updates.profilePic !== undefined && { odProfilePic: updates.profilePic }),
        ...(updates.status !== undefined && { odStatus: updates.status }),
        ...(updates.title !== undefined && { odTitle: updates.title }),
      };
    });
  }, [socket]);

  const leave = useCallback(() => {
    socket?.emit('leave');
    socket?.disconnect();
    setUser(null);
    localStorage.removeItem('otychat_username');
  }, [socket]);

  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      user,
      onlineUsers,
      onlineCount,
      questions,
      feed,
      activePokemon,
      caughtPokemon,
      ballInventory,
      stoneInventory,
      zones,
      achievements,
      unlockedAchievements,
      dms,
      unreadDMCount,
      leaderboards,
      join,
      sendReaction,
      sendQuestion,
      upvoteQuestion,
      catchPokemon,
      runFromPokemon,
      changeZone,
      logDrink,
      buyItem,
      evolvePokemon,
      sendDM,
      sendKudos,
      updateProfile,
      leave,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
