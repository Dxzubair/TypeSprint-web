import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, Trophy, Zap, Flame, Shield, ShieldAlert, Heart, Star, Play, 
  RotateCcw, ArrowLeft, Volume2, VolumeX, AlertTriangle, Key, 
  Sparkles, CheckSquare, Award, Clock, ArrowRight, Activity, Smile
} from 'lucide-react';
import { KeyboardSettings, UserProfile, TypingStats, Achievement, DailyChallenge } from '../types';
import { audioSynth } from '../utils/audio';
import { AnalyticsEngine } from '../utils/analyticsEngine';
import { useAuth } from '../context/AuthContext';

// Word banks for various difficulties in Meteor Strike
const WORD_BANK = {
  easy: [
    'the', 'and', 'cat', 'dog', 'run', 'key', 'tap', 'fun', 'win', 'yes',
    'hot', 'car', 'blue', 'red', 'sky', 'sun', 'star', 'play', 'game', 'hero'
  ],
  medium: [
    'sprint', 'typing', 'android', 'keyboard', 'tactile', 'connect', 'latency',
    'feedback', 'hardware', 'wireless', 'mechanical', 'accuracy', 'precision',
    'practice', 'trainer', 'cooldown', 'multiply', 'victory', 'champion'
  ],
  hard: [
    'developer', 'interface', 'reactjs', 'typescript', 'algorithm', 'function',
    'callback', 'variable', 'synthetic', 'resonance', 'vortex', 'meteor',
    'shielding', 'calibration', 'frequency', 'wavelength', 'oscillate'
  ],
  extreme: [
    'const [state, setState] = useState()', 'document.addEventListener()',
    'export default function App()', 'import { motion } from "motion/react"',
    'console.log("TypeSprint Game Mode!")', 'interface UserProfile { id: string }',
    '() => handleKeyDownInternal()', 'Math.max(0, rawWpm / timeFactor)'
  ]
};

// Sentence banks for Speed Racer
const SENTENCE_BANK = {
  easy: [
    'The quick brown fox jumps over the lazy dog.',
    'Type fast to accelerate your racing car.',
    'Mechanical keyboards have wonderful physical switches.'
  ],
  medium: [
    'TypeSprint Game Zone delivers incredible adrenaline.',
    'Consistent practice with a real physical keyboard is key.',
    'Tactile switches offer amazing typing resistance and acoustics.'
  ],
  hard: [
    'The Android OTG connection allows near-zero latency physical input.',
    'Keep your wrists elevated and fingers on the home row for maximum WPM.',
    'Mastering touch typing unleashes incredible programming productivity.'
  ],
  extreme: [
    'async function startRace(driverId: string) { const car = await getCar(driverId); }',
    'const filteredGames = games.filter(g => difficulty === "all" || g.difficulty === difficulty);',
    'export const processSessionCompletion = (session: TypingSessionResult) => { return rewards; }'
  ]
};

// Key banks for Key Commander (concentric radar key smasher)
const KEY_BANK = {
  easy: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';', 'g', 'h'],
  medium: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
  hard: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '[', ']', ';', "'", ',', '.', '/'],
  extreme: ['A', 'S', 'D', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', ':', '"', '<', '>', '?']
};

interface GameZoneProps {
  profile: UserProfile;
  stats: TypingStats;
  settings: KeyboardSettings;
  onUpdateStatsAndProfile: (xpGained: number, coinsGained: number, wpm: number, accuracy: number, gameTitle: string) => void;
  onNavigateToTab: (tab: any) => void;
}

interface GameStats {
  bestScore: number;
  bestWpm: number;
  bestAccuracy: number;
  gamesPlayed: number;
  lastPlayed: string;
}

export function GameZone({ profile, stats, settings, onUpdateStatsAndProfile, onNavigateToTab }: GameZoneProps) {
  const { user, isAnonymous } = useAuth();
  const isCloudActive = !!user && !isAnonymous;
  const resolvedName = useMemo(() => {
    if (isCloudActive && user?.displayName) {
      return user.displayName;
    }
    if (profile.name && profile.name.trim() !== '' && profile.name !== 'Tactile Pilot') {
      return profile.name;
    }
    if (profile.username && profile.username.trim() !== '' && profile.username !== 'tactile_pilot') {
      return profile.username;
    }
    return isCloudActive ? 'Pilot' : 'Guest';
  }, [isCloudActive, user?.displayName, profile.name, profile.username]);

  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extreme' | 'all'>('all');
  const [soundEnabled, setSoundEnabled] = useState(settings.soundType !== 'mute');
  const [simulationMode, setSimulationMode] = useState(false);

  // Persistent game records
  const [gameRecords, setGameRecords] = useState<Record<string, GameStats>>(() => {
    try {
      const saved = localStorage.getItem('typesprint_game_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) { /* ignore */ }
    return {
      meteor_strike: { bestScore: 0, bestWpm: 0, bestAccuracy: 0, gamesPlayed: 0, lastPlayed: '' },
      speed_racer: { bestScore: 0, bestWpm: 0, bestAccuracy: 0, gamesPlayed: 0, lastPlayed: '' },
      key_commander: { bestScore: 0, bestWpm: 0, bestAccuracy: 0, gamesPlayed: 0, lastPlayed: '' }
    };
  });

  const saveGameRecord = (gameId: string, score: number, wpm: number, accuracy: number) => {
    const updated = { ...gameRecords };
    const current = updated[gameId] || { bestScore: 0, bestWpm: 0, bestAccuracy: 0, gamesPlayed: 0, lastPlayed: '' };
    
    updated[gameId] = {
      bestScore: Math.max(current.bestScore, score),
      bestWpm: Math.max(current.bestWpm, wpm),
      bestAccuracy: Math.max(current.bestAccuracy, accuracy),
      gamesPlayed: current.gamesPlayed + 1,
      lastPlayed: new Date().toLocaleDateString()
    };

    setGameRecords(updated);
    localStorage.setItem('typesprint_game_records', JSON.stringify(updated));
  };

  const games: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
    xpBonus: string;
    accentColor: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'meteor_strike',
      title: 'Meteor Strike',
      subtitle: 'Word Defense Arcade',
      description: 'Defend your shields against falling words! Type correct words to blast them with high-voltage lasers. Fast combos activate shield-repair nanites.',
      category: 'Arcade',
      difficulty: 'Medium',
      xpBonus: '80 XP',
      accentColor: 'from-amber-500 to-orange-600',
      icon: <Shield className="w-8 h-8 text-amber-500" />
    },
    {
      id: 'speed_racer',
      title: 'Speed Racer',
      subtitle: 'Grand Prix Circuit',
      description: 'Race your formula car against competitive AI drivers. Your real-time typing WPM determines your engine acceleration. Easy, Medium, Hard, and Extreme circuits available!',
      category: 'Racing',
      difficulty: 'Hard',
      xpBonus: '100 XP',
      accentColor: 'from-rose-500 to-red-600',
      icon: <Activity className="w-8 h-8 text-rose-500" />
    },
    {
      id: 'key_commander',
      title: 'Key Commander',
      subtitle: 'Reflex Key Arena',
      description: 'Concentric radar sectors appear instantly on the screen with coordinates. Press the correct key combinations before they collapse to survive!',
      category: 'Reflex',
      difficulty: 'Extreme',
      xpBonus: '90 XP',
      accentColor: 'from-cyan-500 to-blue-600',
      icon: <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
    }
  ];

  const filteredGames = games.filter(
    (g) => selectedDifficulty === 'all' || g.difficulty.toLowerCase() === selectedDifficulty
  );

  // Recently played list
  const recentlyPlayed = useMemo(() => {
    return (Object.entries(gameRecords) as [string, GameStats][])
      .filter(([_, data]) => data.gamesPlayed > 0)
      .map(([id, data]) => {
        const game = games.find((g) => g.id === id);
        return {
          id,
          title: game?.title || 'Unknown Game',
          lastPlayed: data.lastPlayed,
          highScore: data.bestScore,
          bestWpm: data.bestWpm,
          accentColor: game?.accentColor || 'from-zinc-500 to-zinc-600'
        };
      })
      .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime());
  }, [gameRecords]);

  // Featured Game: Selects highest reward or first game
  const featuredGame = games[0];

  return (
    <div className="flex flex-col flex-grow h-full overflow-y-auto select-none scrollbar-none">
      <AnimatePresence mode="wait">
        {!activeGame ? (
          /* ==============================================================
             GAME ZONE LOBBY SCREEN
             ============================================================== */
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-4 flex-grow"
          >
            {/* Top Stats bar & Level badge */}
            <div className="grid grid-cols-3 gap-2.5 bg-slate-100 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200/50 dark:border-zinc-850 shadow-sm">
              <div className="text-center border-r border-slate-200/60 dark:border-zinc-800">
                <span className="text-[8px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center justify-center gap-1">
                  <Gamepad2 className="w-3 h-3 text-orange-500" /> Level
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-zinc-100 font-display mt-0.5 block">{profile.level}</span>
              </div>
              <div className="text-center border-r border-slate-200/60 dark:border-zinc-800">
                <span className="text-[8px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-red-500" /> Active Streak
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-zinc-100 font-display mt-0.5 block">{stats.streak} Days</span>
              </div>
              <div className="text-center">
                <span className="text-[8px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" /> Game XP
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-zinc-100 font-display mt-0.5 block">{profile.xp} XP</span>
              </div>
            </div>

            {/* FEATURED GAME SECTION */}
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Featured Android Arcade Game
              </h3>
              
              <div className={`relative rounded-3xl p-5 overflow-hidden bg-gradient-to-r ${featuredGame.accentColor} text-white shadow-lg flex flex-col justify-between border-2 border-white/10`}>
                <div className="absolute top-0 right-0 p-8 opacity-15 rotate-12">
                  <Gamepad2 className="w-40 h-40" />
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 bg-black/30 border border-white/20 rounded-full text-[8.5px] font-black uppercase tracking-wider">
                      {featuredGame.category} • {featuredGame.difficulty} Mode
                    </span>
                    <h2 className="text-lg md:text-xl font-black font-display tracking-tight mt-1.5">{featuredGame.title}</h2>
                    <p className="text-[10px] opacity-90 font-medium max-w-md leading-relaxed mt-1">
                      {featuredGame.description}
                    </p>
                  </div>
                  <div className="bg-white/15 p-2 rounded-2xl border border-white/20 hidden sm:block">
                    {featuredGame.icon}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/15">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-white/80 flex items-center gap-1 uppercase font-mono bg-black/20 px-2 py-1 rounded-lg">
                      <Sparkles className="w-3 h-3 text-amber-300" /> +{featuredGame.xpBonus} Reward
                    </span>
                    {gameRecords[featuredGame.id]?.bestScore > 0 && (
                      <span className="text-[9px] font-black text-amber-300 flex items-center gap-1 uppercase font-mono">
                        🏆 Best: {gameRecords[featuredGame.id].bestScore} pts
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      audioSynth.playClick(settings.soundType);
                      setActiveGame(featuredGame.id);
                    }}
                    className="px-5 py-2 bg-white text-zinc-950 hover:bg-zinc-100 font-black text-[10px] rounded-xl flex items-center gap-1.5 shadow-md uppercase tracking-wider transform active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Play Now
                  </button>
                </div>
              </div>
            </div>

            {/* DIFFICULTY SELECTION FILTER */}
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Filter by Difficulty</span>
              <div className="flex gap-1 overflow-x-auto select-none scrollbar-none">
                {(['all', 'easy', 'medium', 'hard', 'extreme'] as const).map((diff) => {
                  const active = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => {
                        audioSynth.playClick(settings.soundType);
                        setSelectedDifficulty(diff);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shrink-0 border uppercase cursor-pointer ${
                        active
                          ? 'bg-orange-500 text-white border-orange-500 dark:bg-amber-500 dark:text-zinc-950 dark:border-amber-500'
                          : 'bg-white dark:bg-zinc-900 border-slate-200/60 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GAMES LIST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/60 rounded-3xl p-4 flex flex-col justify-between hover:border-orange-500 dark:hover:border-amber-500 transition-all shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{game.category}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${
                          game.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                          game.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                          game.difficulty === 'Hard' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-rose-500/10 text-rose-500'
                        }`}>{game.difficulty}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100 font-display mt-1">{game.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{game.description}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800 p-2 rounded-2xl border border-slate-100 dark:border-zinc-700/50 group-hover:scale-110 transition-transform">
                      {game.icon}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-[8.5px] font-black text-orange-500 dark:text-amber-400 flex items-center gap-0.5 uppercase font-mono">
                      🏆 Best: {gameRecords[game.id]?.bestScore || 0} pts
                    </span>

                    <button
                      onClick={() => {
                        audioSynth.playClick(settings.soundType);
                        setActiveGame(game.id);
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-orange-500 dark:bg-zinc-800 dark:hover:bg-amber-500 text-slate-700 hover:text-white dark:text-zinc-300 dark:hover:text-zinc-950 font-black text-[9px] rounded-lg transition-all flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                    >
                      Play <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RECENTLY PLAYED SECTION */}
            {recentlyPlayed.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Recently Played Circuit Logs</span>
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/60 rounded-3xl p-3 divide-y divide-slate-100 dark:divide-zinc-800">
                  {recentlyPlayed.map((log) => (
                    <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${log.accentColor}`} />
                        <div>
                          <h5 className="text-[11px] font-black text-slate-800 dark:text-zinc-200">{log.title}</h5>
                          <span className="text-[8px] text-slate-400 font-bold block mt-0.5">Played on {log.lastPlayed}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-800 dark:text-zinc-100 font-mono block">{log.highScore} <span className="text-[8px] text-slate-400 font-bold">pts</span></span>
                        <span className="text-[8px] text-emerald-500 font-extrabold uppercase tracking-wide">{log.bestWpm} Peak WPM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : activeGame === 'meteor_strike' ? (
          /* ==============================================================
             GAME 1: METEOR STRIKE (WORD DEFENSE ARCADE)
             ============================================================== */
          <MeteorStrikeGame
            profile={profile}
            settings={settings}
            onBack={() => setActiveGame(null)}
            onGameOver={(score, wpm, accuracy) => {
              saveGameRecord('meteor_strike', score, wpm, accuracy);
              // Grant real user rewards
              const xpAward = 40 + Math.floor(score / 15);
              const coinsAward = 10 + Math.floor(score / 50);
              onUpdateStatsAndProfile(xpAward, coinsAward, wpm, accuracy, 'Meteor Strike');
            }}
          />
        ) : activeGame === 'speed_racer' ? (
          /* ==============================================================
             GAME 2: SPEED RACER (TYPING GRAND PRIX)
             ============================================================== */
          <SpeedRacerGame
            profile={profile}
            settings={settings}
            onBack={() => setActiveGame(null)}
            onGameOver={(score, wpm, accuracy) => {
              saveGameRecord('speed_racer', score, wpm, accuracy);
              // Grant real user rewards
              const xpAward = 50 + Math.floor(score / 10);
              const coinsAward = 15 + Math.floor(score / 40);
              onUpdateStatsAndProfile(xpAward, coinsAward, wpm, accuracy, 'Speed Racer GP');
            }}
          />
        ) : (
          /* ==============================================================
             GAME 3: KEY COMMANDER (REFLEX SMASHER)
             ============================================================== */
          <KeyCommanderGame
            profile={profile}
            settings={settings}
            onBack={() => setActiveGame(null)}
            onGameOver={(score, wpm, accuracy) => {
              saveGameRecord('key_commander', score, wpm, accuracy);
              // Grant real user rewards
              const xpAward = 35 + Math.floor(score * 2.5);
              const coinsAward = 10 + Math.floor(score / 3);
              onUpdateStatsAndProfile(xpAward, coinsAward, wpm, accuracy, 'Key Commander');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================================
   SUB-COMPONENT: METEOR STRIKE (WORD DEFENSE ARCADE)
   ============================================================================ */
interface Meteor {
  id: number;
  word: string;
  x: number; // percentage width 10-90%
  y: number; // percentage height 0-100%
  speed: number;
}

function MeteorStrikeGame({ profile, settings, onBack, onGameOver }: {
  profile: UserProfile;
  settings: KeyboardSettings;
  onBack: () => void;
  onGameOver: (score: number, wpm: number, accuracy: number) => void;
}) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extreme'>('easy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Game states
  const [health, setHealth] = useState(3); // 3 hearts
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [typedText, setTypedText] = useState('');
  const [selectedMeteorId, setSelectedMeteorId] = useState<number | null>(null);

  // Key tracking
  const [totalCharsTyped, setTotalCharsTyped] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [laserEffect, setLaserEffect] = useState<{ x: number; active: boolean } | null>(null);

  // Refs for loop
  const requestRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<any>(null);
  const lastUpdateRef = useRef<number>(0);
  const meteorIdCounter = useRef(0);
  const isPlayingRef = useRef(false);

  // Get difficulty parameters
  const params = useMemo(() => {
    switch (difficulty) {
      case 'easy': return { speed: 0.12, spawnInterval: 3500, bank: WORD_BANK.easy };
      case 'medium': return { speed: 0.18, spawnInterval: 2800, bank: WORD_BANK.medium };
      case 'hard': return { speed: 0.25, spawnInterval: 2200, bank: WORD_BANK.hard };
      case 'extreme': return { speed: 0.35, spawnInterval: 1700, bank: WORD_BANK.extreme };
    }
  }, [difficulty]);

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setHealth(3);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setMeteors([]);
    setTypedText('');
    setSelectedMeteorId(null);
    setTotalCharsTyped(0);
    setMistakesCount(0);
    
    lastUpdateRef.current = Date.now();
    isPlayingRef.current = true;
    meteorIdCounter.current = 0;
  };

  // Spawn Meteor
  const spawnMeteor = () => {
    if (!isPlayingRef.current || isPaused) return;

    const wordList = params.bank;
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    const x = 10 + Math.random() * 70; // 10% to 80% horizontal range

    const newMeteor: Meteor = {
      id: ++meteorIdCounter.current,
      word,
      x,
      y: 0,
      speed: params.speed + (Math.random() * 0.05)
    };

    setMeteors((prev) => [...prev, newMeteor]);
  };

  // Spawn loop
  useEffect(() => {
    if (isPlaying && !isPaused) {
      spawnTimerRef.current = setInterval(spawnMeteor, params.spawnInterval);
      // Spawn one immediately
      spawnMeteor();
    }
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [isPlaying, isPaused, difficulty]);

  // Physics game loop
  const updateGamePhysics = (time: number) => {
    if (!isPlayingRef.current || isPaused) {
      requestRef.current = requestAnimationFrame(updateGamePhysics);
      return;
    }

    const now = Date.now();
    const delta = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;

    setMeteors((prevMeteors) => {
      let hitGround = false;
      const nextMeteors = prevMeteors.map((m) => {
        const nextY = m.y + m.speed * 60 * delta; // speed factor
        if (nextY >= 100) hitGround = true;
        return { ...m, y: nextY };
      }).filter((m) => m.y < 100);

      if (hitGround) {
        audioSynth.playError();
        setCombo(0);
        setHealth((h) => {
          const nextH = h - 1;
          if (nextH <= 0) {
            triggerGameOver();
          }
          return nextH;
        });
        // Clear active selection on hit
        setSelectedMeteorId(null);
        setTypedText('');
      }

      return nextMeteors;
    });

    requestRef.current = requestAnimationFrame(updateGamePhysics);
  };

  const triggerGameOver = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    
    // Calculate final metrics
    const accuracy = totalCharsTyped > 0 
      ? Math.round(((totalCharsTyped - mistakesCount) / totalCharsTyped) * 100) 
      : 100;
    const estimatedWpm = Math.max(15, Math.round((totalCharsTyped / 5) * 2)); // rough estimation for game length
    
    onGameOver(score, estimatedWpm, accuracy);
  };

  // Start Animation Frame Loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGamePhysics);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isPaused]);

  // Input capturer logic (focus-free physical keyboard hook)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused) return;

      // Ignore inputs on normal fields
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key;

      // System controls
      if (key === 'Escape') {
        setIsPaused((p) => !p);
        e.preventDefault();
        return;
      }

      // Ignore standard triggers
      if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta' || key === 'CapsLock' || key === 'Tab') {
        return;
      }

      e.preventDefault();
      setTotalCharsTyped((t) => t + 1);

      // Determine candidate meteor to target
      setMeteors((currentMeteors) => {
        let activeMeteorId = selectedMeteorId;
        let activeTyped = typedText;

        // If no meteor selected, find one starting with this key
        if (activeMeteorId === null) {
          const candidate = currentMeteors.find((m) => m.word.startsWith(key));
          if (candidate) {
            activeMeteorId = candidate.id;
            setSelectedMeteorId(candidate.id);
            activeTyped = key;
            setTypedText(key);
            audioSynth.playClick(settings.soundType);
          } else {
            setMistakesCount((m) => m + 1);
            setCombo(0);
            audioSynth.playError();
          }
        } else {
          // Verify with selected meteor
          const targetMeteor = currentMeteors.find((m) => m.id === activeMeteorId);
          if (targetMeteor) {
            const nextExpectedChar = targetMeteor.word[activeTyped.length];
            if (key === nextExpectedChar) {
              const updatedTyped = activeTyped + key;
              audioSynth.playClick(settings.soundType);

              // Check if completed word
              if (updatedTyped === targetMeteor.word) {
                // Zap effect!
                setLaserEffect({ x: targetMeteor.x, active: true });
                setTimeout(() => setLaserEffect(null), 250);

                // Reward score
                setScore((s) => s + targetMeteor.word.length * 10 * (1 + Math.floor(combo / 10)));
                setCombo((c) => {
                  const nextC = c + 1;
                  setMaxCombo((mC) => Math.max(mC, nextC));
                  return nextC;
                });

                // Blast meteor
                setSelectedMeteorId(null);
                setTypedText('');
                return currentMeteors.filter((m) => m.id !== activeMeteorId);
              } else {
                setTypedText(updatedTyped);
              }
            } else {
              setMistakesCount((m) => m + 1);
              setCombo(0);
              audioSynth.playError();
            }
          } else {
            // Target is lost, clear state
            setSelectedMeteorId(null);
            setTypedText('');
          }
        }

        return currentMeteors;
      });
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isPlaying, isPaused, selectedMeteorId, typedText, combo, settings]);

  const activeMeteor = meteors.find((m) => m.id === selectedMeteorId);

  return (
    <div className="flex flex-col flex-grow bg-zinc-950 text-white rounded-3xl p-4 overflow-hidden relative border border-zinc-800 h-full min-h-[460px]">
      
      {/* HUD Header Bar */}
      <div className="flex justify-between items-center bg-zinc-900/80 p-3 rounded-2xl border border-zinc-850 z-10 select-none">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              isPlayingRef.current = false;
              onBack();
            }}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h4 className="text-xs font-black font-display text-zinc-100 flex items-center gap-1">
              METEOR STRIKE <span className="text-[7.5px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-mono uppercase">{difficulty}</span>
            </h4>
          </div>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-4">
            {/* Lives (Hearts) */}
            <div className="flex gap-1">
              {[1, 2, 3].map((heart) => (
                <Heart 
                  key={heart} 
                  className={`w-4 h-4 ${
                    heart <= health ? 'text-red-500 fill-red-500' : 'text-zinc-700'
                  }`} 
                />
              ))}
            </div>

            {/* score */}
            <div className="text-right font-mono">
              <span className="text-[8px] text-zinc-500 uppercase block font-black">Score</span>
              <span className="text-sm font-black text-amber-400">{score} pts</span>
            </div>

            {/* Combo */}
            <div className="text-right font-mono relative">
              <span className="text-[8px] text-zinc-500 uppercase block font-black">Combo</span>
              <span className={`text-sm font-black transition-all ${combo > 0 ? 'text-orange-500 animate-pulse' : 'text-zinc-600'}`}>
                {combo}x {combo > 10 ? '🔥' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isPlaying ? (
          /* PRE-GAME LEVEL SELECT */
          <motion.div 
            key="pregame"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex-grow flex flex-col items-center justify-center text-center p-6"
          >
            <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-500/20 rounded-3xl flex items-center justify-center text-amber-500 mb-4 animate-pulse">
              <Shield className="w-9 h-9" />
            </div>
            
            <h3 className="text-lg font-black tracking-tight font-display text-zinc-100">Shield Defense: Meteor Strike</h3>
            <p className="text-[11px] text-zinc-400 max-w-sm mt-1.5 leading-relaxed font-semibold">
              Meteors carrying alphanumeric syntax payloads are falling towards Android Core. Type correct word coordinates to fire tactical laser defenses!
            </p>

            {/* Difficulty Selector */}
            <div className="flex gap-1.5 my-5 justify-center">
              {(['easy', 'medium', 'hard', 'extreme'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                    difficulty === diff
                      ? 'bg-amber-500 text-zinc-950 border-amber-500 font-bold shadow-md'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <button
              onClick={startGame}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 uppercase tracking-widest transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Initialize Battery
            </button>
          </motion.div>
        ) : (
          /* ACTIVE GAME VIEW */
          <div className="flex-grow relative mt-2 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-900/60 flex flex-col justify-between">
            {/* Falling arena (Absolute overlay bounds) */}
            <div className="absolute inset-0 pb-12 z-0">
              {meteors.map((m) => {
                const isSelected = m.id === selectedMeteorId;
                return (
                  <motion.div
                    key={m.id}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${m.x}%`, top: `${m.y}%` }}
                    transition={{ type: 'tween' }}
                  >
                    <div className={`p-2 rounded-xl border text-center relative ${
                      isSelected 
                        ? 'bg-orange-500/20 border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.3)] scale-105' 
                        : 'bg-zinc-900/90 border-zinc-800'
                    }`}>
                      {/* Meteor fire tail visual */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-gradient-to-t from-orange-500 to-transparent blur-[1px]" />
                      
                      {/* Text highlighting layout */}
                      <span className="font-mono text-[11px] font-black leading-none block">
                        {isSelected ? (
                          <>
                            <span className="text-emerald-400">{typedText}</span>
                            <span className="text-zinc-500 underline decoration-orange-500 font-bold">
                              {m.word[typedText.length]}
                            </span>
                            <span className="text-zinc-100">{m.word.slice(typedText.length + 1)}</span>
                          </>
                        ) : (
                          <span className="text-zinc-100">{m.word}</span>
                        )}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Laser defense beam animation */}
            {laserEffect && laserEffect.active && (
              <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
                <line 
                  x1="50%" 
                  y1="100%" 
                  x2={`${laserEffect.x}%`} 
                  y2="15%" 
                  stroke="#fb923c" 
                  strokeWidth="3.5" 
                  className="animate-pulse"
                />
                <circle cx={`${laserEffect.x}%`} cy="15%" r="12" fill="#fb923c" opacity="0.6" className="animate-ping" />
              </svg>
            )}

            {/* Ground / Shield Defense Base */}
            <div className="mt-auto h-12 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between px-5 relative z-10 shadow-inner">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-zinc-400 font-black tracking-widest uppercase">Android Core Shields</span>
              </div>

              {/* Turret center mount */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-16 h-12 bg-zinc-800 rounded-t-full border border-zinc-700/60 flex items-center justify-center">
                <div className="w-3.5 h-7 bg-zinc-600 rounded-full rotate-0 origin-bottom border border-zinc-500" style={{
                  transform: activeMeteor ? `rotate(${(activeMeteor.x - 50) * 0.9}deg)` : 'rotate(0deg)',
                  transition: 'transform 0.1s ease'
                }} />
              </div>

              <div className="text-[9px] text-zinc-500 font-bold font-mono">
                {activeMeteor ? `Target locked: ${activeMeteor.word}` : 'Radar scanning...'}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================================
   SUB-COMPONENT: SPEED RACER (TYPING GRAND PRIX)
   ============================================================================ */
function SpeedRacerGame({ profile, settings, onBack, onGameOver }: {
  profile: UserProfile;
  settings: KeyboardSettings;
  onBack: () => void;
  onGameOver: (score: number, wpm: number, accuracy: number) => void;
}) {
  const { user, isAnonymous } = useAuth();
  const isCloudActive = !!user && !isAnonymous;
  const resolvedName = useMemo(() => {
    if (isCloudActive && user?.displayName) {
      return user.displayName;
    }
    if (profile.name && profile.name.trim() !== '' && profile.name !== 'Tactile Pilot') {
      return profile.name;
    }
    if (profile.username && profile.username.trim() !== '' && profile.username !== 'tactile_pilot') {
      return profile.username;
    }
    return isCloudActive ? 'Pilot' : 'Guest';
  }, [isCloudActive, user?.displayName, profile.name, profile.username]);

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extreme'>('easy');
  const [gameState, setGameState] = useState<'SELECT' | 'MATCHMAKING' | 'COUNTDOWN' | 'RACING' | 'RESULTS'>('SELECT');
  const [countdown, setCountdown] = useState<number | string>(3);

  // Matchmaking states
  const [matchmakingStatus, setMatchmakingStatus] = useState('Initializing racing network...');
  const [visibleOpponents, setVisibleOpponents] = useState<any[]>([]);
  const [gridAssigned, setGridAssigned] = useState(false);

  // Racing states
  const [playerDistance, setPlayerDistance] = useState(0); // 0 to 100%
  const [opponents, setOpponents] = useState<any[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [typedText, setTypedText] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);

  // Results scoreboard
  const [finalResult, setFinalResult] = useState<{
    wpm: number;
    accuracy: number;
    time: number;
    rank: number;
    score: number;
    xp: number;
    coins: number;
  } | null>(null);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const opponentFinishTimes = useRef<Record<string, number>>({});

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Difficulty settings
  const difficultyParams = useMemo(() => {
    switch (difficulty) {
      case 'easy': return { aiWpm: 23, sentences: SENTENCE_BANK.easy };
      case 'medium': return { aiWpm: 42, sentences: SENTENCE_BANK.medium };
      case 'hard': return { aiWpm: 65, sentences: SENTENCE_BANK.hard };
      case 'extreme': return { aiWpm: 95, sentences: SENTENCE_BANK.extreme };
    }
  }, [difficulty]);

  // Generate bot competitors based on difficulty
  const generateOpponents = (diff: 'easy' | 'medium' | 'hard' | 'extreme') => {
    const bots = {
      easy: [
        { id: 'bot1', name: 'CutePanda', avatar: '🐼', avgWpm: 21, currentWpm: 21, distance: 0, isBot: true },
        { id: 'bot2', name: 'SlowSnail', avatar: '🐌', avgWpm: 17, currentWpm: 17, distance: 0, isBot: true }
      ],
      medium: [
        { id: 'bot1', name: 'TypeBeast', avatar: '🏎️', avgWpm: 38, currentWpm: 38, distance: 0, isBot: true },
        { id: 'bot2', name: 'FastRabbit', avatar: '🐰', avgWpm: 34, currentWpm: 34, distance: 0, isBot: true }
      ],
      hard: [
        { id: 'bot1', name: 'KeyDaemon', avatar: '🚀', avgWpm: 63, currentWpm: 63, distance: 0, isBot: true },
        { id: 'bot2', name: 'CyberRacer', avatar: '🤖', avgWpm: 58, currentWpm: 58, distance: 0, isBot: true }
      ],
      extreme: [
        { id: 'bot1', name: 'HyperSonic', avatar: '⚡', avgWpm: 92, currentWpm: 92, distance: 0, isBot: true },
        { id: 'bot2', name: 'ApexFinger', avatar: '🦁', avgWpm: 86, currentWpm: 86, distance: 0, isBot: true }
      ]
    };
    return bots[diff];
  };

  // Synthesize Web Audio API countdown tones (sine for tick, triangle for GO)
  const playCountdownTone = (isGo: boolean) => {
    if (settings.soundType === 'mute') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const time = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isGo ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isGo ? 880 : 440, time);

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + (isGo ? 0.45 : 0.15));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + (isGo ? 0.5 : 0.2));
    } catch (e) {
      console.warn('Countdown audio failed:', e);
    }
  };

  // Matchmaking simulation
  const handleSelectCircuit = (selectedDiff: 'easy' | 'medium' | 'hard' | 'extreme') => {
    setDifficulty(selectedDiff);
    setGameState('MATCHMAKING');
    setMatchmakingStatus('Searching for active raceways...');
    setVisibleOpponents([]);
    setGridAssigned(false);
    setPlayerDistance(0);
    setPromptIndex(0);
    setErrorsCount(0);
    setTypedText('');
    setElapsedTime(0);
    opponentFinishTimes.current = {};

    const bots = generateOpponents(selectedDiff);
    setOpponents(bots);

    // Opponent 1 joins
    setTimeout(() => {
      setVisibleOpponents([bots[0]]);
      setMatchmakingStatus('racer connected: ' + bots[0].name + ' ' + bots[0].avatar);
      audioSynth.playClick(settings.soundType);
    }, 800);

    // Opponent 2 joins
    setTimeout(() => {
      setVisibleOpponents([bots[0], bots[1]]);
      setMatchmakingStatus('racer connected: ' + bots[1].name + ' ' + bots[1].avatar);
      audioSynth.playClick(settings.soundType);
    }, 1600);

    // Finalize grid
    setTimeout(() => {
      setGridAssigned(true);
      setMatchmakingStatus('Lobby complete! Assigning starting grid...');
    }, 2200);

    // Transition to countdown
    setTimeout(() => {
      triggerCountdown(selectedDiff, bots);
    }, 2900);
  };

  // Countdown timer loop
  const triggerCountdown = (selectedDiff: 'easy' | 'medium' | 'hard' | 'extreme', bots: any[]) => {
    setGameState('COUNTDOWN');
    setCountdown(3);
    playCountdownTone(false);

    let currentCount = 3;
    const intervalId = setInterval(() => {
      currentCount -= 1;
      if (currentCount === 0) {
        setCountdown('GO!');
        playCountdownTone(true);

        // Mobile brief haptics
        if (profile.typingMode === 'mobile_keyboard') {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(120);
          }
        }

        setTimeout(() => {
          clearInterval(intervalId);
          startActiveRace(selectedDiff, bots);
        }, 750);
      } else {
        setCountdown(currentCount);
        playCountdownTone(false);
      }
    }, 1000);
  };

  // Start actual race clock and unlock typing
  const startActiveRace = (selectedDiff: 'easy' | 'medium' | 'hard' | 'extreme', bots: any[]) => {
    setGameState('RACING');
    setPlayerDistance(0);
    setElapsedTime(0);
    setPromptIndex(0);
    setErrorsCount(0);
    setTypedText('');

    const sentences = SENTENCE_BANK[selectedDiff];
    setCurrentPrompt(sentences[0]);

    lastTimeRef.current = Date.now();
    startTimeRef.current = Date.now();

    const resetBots = bots.map(b => ({ ...b, distance: 0 }));
    setOpponents(resetBots);

    // Claim automatic focus immediately
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 40);
  };

  // Segment prompt advance
  const loadNextRacePrompt = (index: number) => {
    const sentences = SENTENCE_BANK[difficulty];
    if (index < sentences.length) {
      setCurrentPrompt(sentences[index]);
      setTypedText('');
    } else {
      triggerRaceFinish();
    }
  };

  // Complete and trigger parent reward hooks
  const triggerRaceFinish = () => {
    setGameState('RESULTS');
    audioSynth.playSuccess();

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const sentences = SENTENCE_BANK[difficulty];
    const totalChars = sentences.reduce((acc, s) => acc + s.length, 0);
    const finalStats = AnalyticsEngine.calculateMetrics(totalChars, errorsCount, elapsed);
    const calculatedWpm = finalStats.wpm;
    const calculatedAcc = finalStats.accuracy;

    // Evaluate standings
    const playerTime = elapsed;
    const bot1Time = opponentFinishTimes.current['bot1'] || (playerDistance < opponents[0].distance ? playerTime - 1.2 : playerTime + 4.5);
    const bot2Time = opponentFinishTimes.current['bot2'] || (playerDistance < opponents[1].distance ? playerTime - 0.8 : playerTime + 6.2);

    const positions = [
      { id: 'player', name: `${resolvedName} (You)`, time: playerTime },
      { id: 'bot1', name: opponents[0].name, time: bot1Time },
      { id: 'bot2', name: opponents[1].name, time: bot2Time }
    ].sort((a, b) => a.time - b.time);

    const finalRank = positions.findIndex(p => p.id === 'player') + 1;

    // Scoring and real reward models
    const placementBonus = finalRank === 1 ? 550 : finalRank === 2 ? 380 : 200;
    const finalScore = Math.round(placementBonus + (calculatedWpm * 4) + calculatedAcc);
    const xpGained = 50 + Math.floor(finalScore / 10);
    const coinsGained = 15 + Math.floor(finalScore / 40);

    setFinalResult({
      wpm: calculatedWpm,
      accuracy: calculatedAcc,
      time: elapsed,
      rank: finalRank,
      score: finalScore,
      xp: xpGained,
      coins: coinsGained
    });

    // Notify backend parent of real completion values
    onGameOver(finalScore, calculatedWpm, calculatedAcc);
  };

  // Real-time animation physics and bots loop
  const updateRacePhysics = () => {
    if (gameStateRef.current !== 'RACING') {
      requestRef.current = requestAnimationFrame(updateRacePhysics);
      return;
    }

    const now = Date.now();
    const delta = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    const elapsed = (now - startTimeRef.current) / 1000;
    setElapsedTime(elapsed);

    const sentences = SENTENCE_BANK[difficulty];
    const totalTrackChars = sentences.reduce((acc, s) => acc + s.length, 0);

    setOpponents((prevBots) => {
      return prevBots.map((bot) => {
        if (bot.distance >= 100) {
          if (!opponentFinishTimes.current[bot.id]) {
            opponentFinishTimes.current[bot.id] = elapsed;
          }
          return bot;
        }

        // Add interesting dynamic human fluctuation to bots speed
        const speedOscillation = Math.sin(now / 1500 + bot.name.charCodeAt(0)) * 4.5;
        const currentWpm = Math.max(12, bot.avgWpm + speedOscillation);

        const progressIncrement = ((currentWpm * 5) / 60) * delta;
        const distanceAdd = (progressIncrement / totalTrackChars) * 100;
        const updatedDistance = Math.min(100, bot.distance + distanceAdd);

        if (updatedDistance >= 100 && !opponentFinishTimes.current[bot.id]) {
          opponentFinishTimes.current[bot.id] = elapsed;
        }

        return {
          ...bot,
          currentWpm: Math.round(currentWpm),
          distance: updatedDistance
        };
      });
    });

    requestRef.current = requestAnimationFrame(updateRacePhysics);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateRacePhysics);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [difficulty]);

  // Auto focus guardian
  useEffect(() => {
    if (gameState === 'RACING') {
      textareaRef.current?.focus();
    }
  }, [gameState]);

  // Seamless keyboard typing input handler
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (gameState !== 'RACING') return;

    const val = e.target.value;
    if (val.length > typedText.length) {
      const typedChar = val[val.length - 1];
      const expectedChar = currentPrompt[typedText.length];

      if (typedChar === expectedChar) {
        const nextTyped = typedText + typedChar;
        setTypedText(nextTyped);
        audioSynth.playClick(settings.soundType);

        // Progress player distance bar
        const sentences = SENTENCE_BANK[difficulty];
        const sentenceWeight = 100 / sentences.length;
        const letterFactor = sentenceWeight / currentPrompt.length;
        setPlayerDistance((prev) => Math.min(100, prev + letterFactor));

        if (nextTyped === currentPrompt) {
          const nextIdx = promptIndex + 1;
          setPromptIndex(nextIdx);
          loadNextRacePrompt(nextIdx);
        }
      } else {
        setErrorsCount((prev) => prev + 1);
        audioSynth.playError();
      }
    }
  };

  // Computes the total completed correct typings for live speed updates
  const charsTypedSoFar = useMemo(() => {
    const sentences = SENTENCE_BANK[difficulty];
    const previousChars = sentences.slice(0, promptIndex).reduce((acc, s) => acc + s.length, 0);
    return previousChars + typedText.length;
  }, [promptIndex, typedText, difficulty]);

  const liveWpm = useMemo(() => {
    if (elapsedTime <= 0.6) return 0;
    return Math.round((charsTypedSoFar / 5) / (elapsedTime / 60));
  }, [charsTypedSoFar, elapsedTime]);

  // Real time racer positions (1st, 2nd, 3rd)
  const liveRacerStandings = useMemo(() => {
    const standings = [
      { id: 'player', name: 'Player', distance: playerDistance },
      ...opponents.map(o => ({ id: o.id, name: o.name, distance: o.distance }))
    ];
    standings.sort((a, b) => b.distance - a.distance);
    return standings.findIndex(s => s.id === 'player') + 1;
  }, [playerDistance, opponents]);

  // Circuits details array
  const CIRCUITS = [
    { id: 'easy' as const, name: 'Grizzly Pass', diff: 'Easy', target: '23 WPM', gradient: 'from-emerald-500 to-teal-600', desc: 'A gorgeous drive winding through towering redwoods. Perfect for entry-level racing.' },
    { id: 'medium' as const, name: 'Neon Boulevard', diff: 'Medium', target: '42 WPM', gradient: 'from-blue-500 to-indigo-600', desc: 'A slick neon cityscape covered in rainfall and holo displays. Competitive competitors.' },
    { id: 'hard' as const, name: 'Vortex Speedway', diff: 'Hard', target: '65 WPM', gradient: 'from-orange-500 to-rose-600', desc: 'High-speed banked loops on a zero-gravity stadium track. Fast fingers needed to win.' },
    { id: 'extreme' as const, name: 'Hyperion Ring', diff: 'Extreme', target: '95 WPM', gradient: 'from-purple-600 to-fuchsia-700', desc: 'An deep-space orbital circuit with supersonic speed boosts. Flawless execution only.' }
  ];

  return (
    <div className="flex flex-col flex-grow bg-zinc-950 text-white rounded-3xl p-4 overflow-hidden relative border border-zinc-800 h-full min-h-[460px]">
      {/* HEADER HUD BAR */}
      <div className="flex justify-between items-center bg-zinc-900/80 p-3 rounded-2xl border border-zinc-850 z-10 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (requestRef.current) cancelAnimationFrame(requestRef.current);
              onBack();
            }}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h4 className="text-xs font-black font-display text-zinc-100 flex items-center gap-1">
              GRAND PRIX CIRCUIT <span className="text-[7.5px] px-1.5 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/20 rounded font-mono uppercase">{difficulty}</span>
            </h4>
          </div>
        </div>

        {gameState === 'RACING' && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1">
              Live Position: {liveRacerStandings === 1 ? '🏆 1st' : liveRacerStandings === 2 ? '🥈 2nd' : '🥉 3rd'}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* STAGE 1: CIRCUIT SELECTION */}
        {gameState === 'SELECT' && (
          <motion.div
            key="circuit_select"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-grow flex flex-col justify-center p-2 md:p-4 overflow-y-auto"
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-2">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-black tracking-tight font-display text-zinc-100">Select Grand Prix Race</h3>
              <p className="text-[10px] text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed font-semibold">
                Engines are primed. Choose your race circuit to instantly initiate matchmaking and launch the grid!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto w-full">
              {CIRCUITS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => {
                    audioSynth.playClick(settings.soundType);
                    handleSelectCircuit(track.id);
                  }}
                  className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-rose-500/50 rounded-2xl p-3.5 text-left transition-all duration-200 group flex flex-col justify-between h-36 cursor-pointer relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${track.gradient} opacity-5 blur-xl group-hover:opacity-10 transition-opacity`} />
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] uppercase tracking-widest font-black text-zinc-500">{track.diff} Course</span>
                      <span className="text-[9px] font-mono font-black text-rose-400">Target: {track.target}</span>
                    </div>
                    <h4 className="text-sm font-black text-white group-hover:text-rose-400 transition-colors">{track.name}</h4>
                    <p className="text-[9.5px] text-zinc-400 font-semibold leading-relaxed mt-1 line-clamp-2">
                      {track.desc}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-850">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3 h-3 text-rose-500" /> Live Opponents
                    </span>
                    <span className="text-[9px] bg-rose-500 text-white font-black uppercase px-2 py-0.5 rounded-md text-[7.5px] tracking-widest flex items-center gap-1 group-hover:scale-105 transition-transform">
                      Race <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STAGE 2: MATCHMAKING */}
        {gameState === 'MATCHMAKING' && (
          <motion.div
            key="matchmaking"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-grow flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="relative w-20 h-20 flex items-center justify-center mb-4">
              <div className="absolute inset-0 border-4 border-rose-500/20 rounded-full animate-ping" />
              <div className="absolute inset-2 border-4 border-rose-500/30 rounded-full animate-pulse" />
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400">
                <Activity className="w-7 h-7 animate-spin-slow" />
              </div>
            </div>

            <h3 className="text-base font-black font-display text-white tracking-wide">MATCHMAKING LOBBY</h3>
            <p className="text-[10px] text-zinc-400 max-w-xs mt-1 animate-pulse font-mono tracking-wide">
              {matchmakingStatus}
            </p>

            <div className="mt-6 w-full max-w-sm bg-zinc-900 border border-zinc-850 p-4 rounded-3xl text-left flex flex-col gap-3">
              <span className="text-[8.5px] font-black uppercase tracking-widest text-zinc-500">Confirmed Racers</span>
              
              <div className="flex flex-col gap-2.5">
                {/* User Row */}
                <div className="flex items-center justify-between p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-850">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👤</span>
                    <div>
                      <span className="text-xs font-black text-white">{resolvedName} (You)</span>
                      <span className="text-[8px] text-zinc-500 font-black block uppercase font-mono tracking-wider mt-0.5">Rating: Pro Typist</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded text-[8px] font-black uppercase tracking-wider font-mono">GRID 1st</span>
                </div>

                {/* Simulated Opponents */}
                {opponents.map((bot, idx) => {
                  const isVisible = visibleOpponents.some(vo => vo.id === bot.id);
                  return (
                    <div
                      key={bot.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                        isVisible
                          ? 'bg-zinc-950/80 border-zinc-800'
                          : 'bg-zinc-900/40 border-dashed border-zinc-850 opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{isVisible ? bot.avatar : '❓'}</span>
                        <div>
                          <span className="text-xs font-black text-white">
                            {isVisible ? bot.name : 'Waiting for racer...'}
                          </span>
                          <span className="text-[8px] text-zinc-500 font-black block uppercase font-mono tracking-wider mt-0.5">
                            {isVisible ? `Target: ${bot.avgWpm} WPM` : 'Searching regional lobbies...'}
                          </span>
                        </div>
                      </div>
                      {isVisible && (
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded text-[8px] font-black uppercase tracking-wider font-mono">
                          GRID {idx + 2}nd
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: COUNTDOWN */}
        {gameState === 'COUNTDOWN' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col items-center justify-center text-center p-6 select-none"
          >
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 font-mono mb-2">
              GET READY...
            </span>

            <motion.div
              key={countdown}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
              className={`text-6xl md:text-8xl font-extrabold font-display leading-none tracking-tight ${
                countdown === 'GO!'
                  ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                  : 'text-rose-500'
              }`}
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 4: RACING */}
        {gameState === 'RACING' && (
          <motion.div
            key="racing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col justify-between mt-3 gap-4"
          >
            {/* RACING VISUAL TRACKS */}
            <div className="bg-zinc-900/80 p-3.5 rounded-3xl border border-zinc-850 flex flex-col gap-4 relative overflow-hidden select-none">
              <div className="absolute inset-y-0 right-10 w-2 h-full bg-[repeating-linear-gradient(45deg,#fff,#fff_4px,#000_4px,#000_8px)] opacity-15" />

              {/* Lane 1: Player */}
              <div className="relative h-10 border-b border-zinc-850 pb-2.5 flex items-center">
                <span className="absolute left-1 text-[8px] font-black text-zinc-500 uppercase tracking-wider font-mono">Player</span>
                <div
                  className="absolute transition-all duration-100 ease-out flex items-center gap-1 z-10"
                  style={{ left: `calc(${playerDistance}% * 0.82 + 55px)` }}
                >
                  <span className="text-xl">🏎️</span>
                  <div className="px-1.5 py-0.5 bg-gradient-to-r from-orange-500 to-rose-600 text-zinc-950 font-black text-[6.5px] uppercase rounded leading-none shadow-sm">
                    {resolvedName} (You)
                  </div>
                </div>
              </div>

              {/* Lane 2: Opponent 1 */}
              <div className="relative h-10 border-b border-zinc-850 pb-2.5 flex items-center">
                <span className="absolute left-1 text-[8px] font-black text-zinc-500 uppercase tracking-wider font-mono">Grid 2</span>
                <div
                  className="absolute transition-all duration-100 ease-out flex items-center gap-1 z-10"
                  style={{ left: `calc(${opponents[0]?.distance || 0}% * 0.82 + 55px)` }}
                >
                  <span className="text-xl">{opponents[0]?.avatar}</span>
                  <div className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 font-black text-[6.5px] uppercase rounded leading-none">
                    {opponents[0]?.name}
                  </div>
                </div>
              </div>

              {/* Lane 3: Opponent 2 */}
              <div className="relative h-10 flex items-center">
                <span className="absolute left-1 text-[8px] font-black text-zinc-500 uppercase tracking-wider font-mono">Grid 3</span>
                <div
                  className="absolute transition-all duration-100 ease-out flex items-center gap-1 z-10"
                  style={{ left: `calc(${opponents[1]?.distance || 0}% * 0.82 + 55px)` }}
                >
                  <span className="text-xl">{opponents[1]?.avatar}</span>
                  <div className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 font-black text-[6.5px] uppercase rounded leading-none">
                    {opponents[1]?.name}
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE TYPING VIEWPORT */}
            <div
              onClick={() => textareaRef.current?.focus()}
              className="bg-zinc-900 border border-zinc-850 p-4.5 rounded-3xl flex-grow flex flex-col justify-center relative cursor-text group"
            >
              <div className="flex items-center justify-between text-[8px] font-black uppercase text-zinc-500 tracking-wider mb-2.5 select-none">
                <span>RACE SEGMENT {promptIndex + 1} OF 3</span>
                <span className="text-rose-400 font-mono tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 animate-bounce" /> Current Speed: {liveWpm} WPM
                </span>
              </div>

              {/* The letter-by-letter correct highlight box */}
              <div className="bg-zinc-950 p-4.5 rounded-2xl border border-zinc-850 text-center select-none relative min-h-[90px] flex items-center justify-center overflow-hidden">
                {/* INVISIBLE CAPTURER ELEMENT */}
                <textarea
                  ref={textareaRef}
                  className="absolute inset-0 w-full h-full p-4.5 opacity-0 resize-none outline-none overflow-hidden z-20 cursor-text"
                  value={typedText}
                  onChange={handleTextareaChange}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  disabled={gameState !== 'RACING'}
                  placeholder="The race is on! Keep typing the characters displayed here..."
                />

                <p className="font-mono text-xs md:text-sm leading-relaxed font-bold tracking-wide select-none z-10 pointer-events-none text-left">
                  {currentPrompt.split('').map((char, index) => {
                    let colorClass = 'text-zinc-500';
                    let underlineClass = '';
                    if (index < typedText.length) {
                      colorClass = 'text-emerald-400 font-black';
                    } else if (index === typedText.length) {
                      colorClass = 'text-rose-500 font-black inline-block animate-pulse scale-[1.05]';
                      underlineClass = 'underline decoration-rose-500 decoration-2';
                    }
                    return (
                      <span key={index} className={`${colorClass} ${underlineClass}`}>
                        {char}
                      </span>
                    );
                  })}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2.5 text-[8px] text-zinc-500 uppercase font-black select-none font-mono">
                <span>Completed: {promptIndex} / 3 Sentences</span>
                <span className="text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-500" /> TIME: {elapsedTime.toFixed(1)}s
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 5: RESULTS SCREEN */}
        {gameState === 'RESULTS' && finalResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-grow flex flex-col justify-center p-3 md:p-5 overflow-y-auto"
          >
            <div className="text-center mb-4">
              <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest font-mono flex items-center justify-center gap-1">
                <Award className="w-4 h-4 animate-bounce" /> RACE COMPLETED!
              </span>
              <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight mt-0.5">
                {finalResult.rank === 1 ? '🥇 PODIUM CHAMPION!' : finalResult.rank === 2 ? '🥈 SECOND PLACE FINISH!' : '🥉 THIRD PLACE FINISH!'}
              </h2>
            </div>

            {/* STATS BENTO MATRIX */}
            <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto w-full mb-4 font-mono">
              <div className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl text-center">
                <span className="text-[7.5px] uppercase text-zinc-500 block font-black">Velocity</span>
                <span className="text-base font-black text-white">{finalResult.wpm} <span className="text-[9px] text-zinc-500 font-bold">WPM</span></span>
              </div>
              <div className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl text-center">
                <span className="text-[7.5px] uppercase text-zinc-500 block font-black">Accuracy</span>
                <span className="text-base font-black text-emerald-400">{finalResult.accuracy}%</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl text-center">
                <span className="text-[7.5px] uppercase text-zinc-500 block font-black">Lap Time</span>
                <span className="text-base font-black text-sky-400">{finalResult.time.toFixed(1)}s</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl text-center">
                <span className="text-[7.5px] uppercase text-zinc-500 block font-black">Score</span>
                <span className="text-base font-black text-amber-400">{finalResult.score}</span>
              </div>
            </div>

            {/* REWARDS SUMMARY CARD */}
            <div className="bg-gradient-to-r from-rose-950/20 to-orange-950/20 border-2 border-orange-500/15 p-4 rounded-3xl max-w-md mx-auto w-full mb-4 text-center">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest block mb-2 font-mono">Prizepool Rewards Secured</span>
              <div className="flex justify-center gap-6 items-center">
                <div className="flex items-center gap-1.5 bg-zinc-950/50 border border-zinc-800 px-3.5 py-2 rounded-2xl">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-black text-white">+{finalResult.xp} XP</span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-950/50 border border-zinc-800 px-3.5 py-2 rounded-2xl">
                  <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
                  <span className="text-xs font-black text-white">+{finalResult.coins} Coins</span>
                </div>
              </div>
            </div>

            {/* LEADERBOARD SCOREBOARD */}
            <div className="bg-zinc-900 border border-zinc-850 p-3.5 rounded-2xl max-w-md mx-auto w-full mb-5 text-left font-mono text-[9px]">
              <span className="text-[8.5px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Detailed Standings</span>
              
              <div className="flex flex-col gap-1.5">
                {[
                  { name: `${resolvedName} (You)`, avatar: '🏎️', rank: finalResult.rank, wpm: finalResult.wpm, isUser: true },
                  { name: opponents[0].name, avatar: opponents[0].avatar, rank: finalResult.rank === 1 ? 2 : finalResult.rank === 2 ? 1 : 1, wpm: opponents[0].avgWpm, isUser: false },
                  { name: opponents[1].name, avatar: opponents[1].avatar, rank: finalResult.rank === 3 ? 2 : 3, wpm: opponents[1].avgWpm, isUser: false }
                ].sort((a, b) => a.rank - b.rank).map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      r.isUser
                        ? 'bg-rose-500/10 border-rose-500/20 text-white'
                        : 'bg-zinc-950/60 border-zinc-850 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs w-4">{r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : '🥉'}</span>
                      <span className="text-xs">{r.avatar}</span>
                      <span className="font-black text-[11px]">{r.name}</span>
                    </div>
                    <span className="font-black">{r.wpm} WPM</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-center gap-3 select-none">
              <button
                onClick={() => {
                  audioSynth.playClick(settings.soundType);
                  setGameState('SELECT');
                }}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 rounded-xl font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Change Track
              </button>
              <button
                onClick={() => {
                  audioSynth.playClick(settings.soundType);
                  handleSelectCircuit(difficulty);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-zinc-950 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Race Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================================
   SUB-COMPONENT: KEY COMMANDER (REFLEX SMASHER)
   ============================================================================ */
interface RadarSector {
  id: number;
  key: string;
  size: number; // starts at 100% shrinks down to 0%
  x: number;
  y: number;
  color: string;
}

function KeyCommanderGame({ profile, settings, onBack, onGameOver }: {
  profile: UserProfile;
  settings: KeyboardSettings;
  onBack: () => void;
  onGameOver: (score: number, wpm: number, accuracy: number) => void;
}) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extreme'>('easy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [sectors, setSectors] = useState<RadarSector[]>([]);

  const requestRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);
  const sectorCounter = useRef(0);
  const isPlayingRef = useRef(false);

  // Difficulty settings
  const config = useMemo(() => {
    switch (difficulty) {
      case 'easy': return { decaySpeed: 18, spawnInterval: 1400, bank: KEY_BANK.easy };
      case 'medium': return { decaySpeed: 28, spawnInterval: 1100, bank: KEY_BANK.medium };
      case 'hard': return { decaySpeed: 38, spawnInterval: 900, bank: KEY_BANK.hard };
      case 'extreme': return { decaySpeed: 50, spawnInterval: 750, bank: KEY_BANK.extreme };
    }
  }, [difficulty]);

  const colorsList = ['border-cyan-500 text-cyan-400', 'border-amber-500 text-amber-400', 'border-rose-500 text-rose-400', 'border-indigo-500 text-indigo-400'];

  const spawnSector = () => {
    if (!isPlayingRef.current) return;

    const keyList = config.bank;
    const targetKey = keyList[Math.floor(Math.random() * keyList.length)];
    const x = 15 + Math.random() * 70;
    const y = 15 + Math.random() * 60;
    const color = colorsList[Math.floor(Math.random() * colorsList.length)];

    const newSector: RadarSector = {
      id: ++sectorCounter.current,
      key: targetKey,
      size: 100,
      x,
      y,
      color
    };

    setSectors((prev) => [...prev, newSector]);
  };

  const startCommander = () => {
    setIsPlaying(true);
    setScore(0);
    setMisses(0);
    setCombo(0);
    setMaxCombo(0);
    setSectors([]);
    
    lastTimeRef.current = Date.now();
    isPlayingRef.current = true;
    sectorCounter.current = 0;
  };

  useEffect(() => {
    if (isPlaying) {
      spawnTimerRef.current = setInterval(spawnSector, config.spawnInterval);
      spawnSector();
    }
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [isPlaying, difficulty]);

  // Main game physics loop
  const updateCommanderPhysics = () => {
    if (!isPlayingRef.current) return;

    const now = Date.now();
    const delta = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    setSectors((prevSectors) => {
      let registeredMiss = false;
      const nextSectors = prevSectors.map((s) => {
        const nextSize = s.size - config.decaySpeed * delta;
        if (nextSize <= 0) registeredMiss = true;
        return { ...s, size: nextSize };
      }).filter((s) => s.size > 0);

      if (registeredMiss) {
        audioSynth.playError();
        setCombo(0);
        setMisses((m) => {
          const nextM = m + 1;
          if (nextM >= 3) {
            triggerGameOver();
          }
          return nextM;
        });
      }

      return nextSectors;
    });

    requestRef.current = requestAnimationFrame(updateCommanderPhysics);
  };

  const triggerGameOver = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);

    // key metrics
    const finalAccuracy = Math.max(40, 100 - misses * 15);
    const estimatedWpm = Math.max(25, 30 + score * 1.5);
    onGameOver(score, estimatedWpm, finalAccuracy);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateCommanderPhysics);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, difficulty]);

  // key listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key;

      if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta' || key === 'CapsLock' || key === 'Tab') {
        return;
      }

      e.preventDefault();

      setSectors((currentSectors) => {
        // Find oldest/smallest sector matching this key
        const match = currentSectors
          .filter((s) => s.key === key)
          .sort((a, b) => a.size - b.size)[0];

        if (match) {
          audioSynth.playClick(settings.soundType);
          setScore((s) => s + 1);
          setCombo((c) => {
            const nextC = c + 1;
            setMaxCombo((mC) => Math.max(mC, nextC));
            return nextC;
          });
          return currentSectors.filter((s) => s.id !== match.id);
        } else {
          audioSynth.playError();
          setCombo(0);
          return currentSectors;
        }
      });
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col flex-grow bg-zinc-950 text-white rounded-3xl p-4 overflow-hidden relative border border-zinc-800 h-full min-h-[460px]">
      
      {/* HUD Bar */}
      <div className="flex justify-between items-center bg-zinc-900/80 p-3 rounded-2xl border border-zinc-850 z-10 select-none">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              isPlayingRef.current = false;
              onBack();
            }}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h4 className="text-xs font-black font-display text-zinc-100 flex items-center gap-1">
              KEY COMMANDER <span className="text-[7.5px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded font-mono uppercase">{difficulty}</span>
            </h4>
          </div>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-4">
            {/* Miss Indicator */}
            <div className="flex gap-1.5 items-center">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Misses</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((heart) => (
                  <div 
                    key={heart} 
                    className={`w-2.5 h-2.5 rounded-full border border-zinc-700 ${
                      heart <= misses ? 'bg-red-500 border-red-400 animate-pulse' : 'bg-zinc-900'
                    }`} 
                  />
                ))}
              </div>
            </div>

            {/* score */}
            <div className="text-right font-mono">
              <span className="text-[8px] text-zinc-500 uppercase block font-black">Smash Hits</span>
              <span className="text-sm font-black text-cyan-400">{score}</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isPlaying ? (
          /* PRE-GAME RADAR CONFIG */
          <motion.div 
            key="pregame"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex-grow flex flex-col items-center justify-center text-center p-6"
          >
            <div className="w-16 h-16 bg-cyan-500/10 border-2 border-cyan-500/20 rounded-3xl flex items-center justify-center text-cyan-400 mb-4 animate-spin-slow">
              <Key className="w-9 h-9" />
            </div>
            
            <h3 className="text-lg font-black tracking-tight font-display text-zinc-100">Key Commander: Concentric Radar</h3>
            <p className="text-[11px] text-zinc-400 max-w-sm mt-1.5 leading-relaxed font-semibold">
              Concentric sector coordinates are collapsing across the physical keyboard matrix. Type keys quickly before the outer ring completely decays!
            </p>

            {/* Difficulty Selector */}
            <div className="flex gap-1.5 my-5 justify-center">
              {(['easy', 'medium', 'hard', 'extreme'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                    difficulty === diff
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-500 font-bold shadow-md'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {diff} Matrix
                </button>
              ))}
            </div>

            <button
              onClick={startCommander}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 uppercase tracking-widest transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Calibrate Matrix
            </button>
          </motion.div>
        ) : (
          /* RADAR SCREEN INTERACTION CANVAS */
          <div className="flex-grow relative mt-2 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-900/60 select-none">
            
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:30px_30px] opacity-10" />

            {/* Glowing radar target sectors */}
            {sectors.map((s) => (
              <div 
                key={s.id} 
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                {/* Collapsing boundary circle */}
                <div 
                  className={`absolute rounded-full border-2 transition-all opacity-50 ${s.color.split(' ')[0]}`}
                  style={{ 
                    width: `${s.size + 40}px`, 
                    height: `${s.size + 40}px` 
                  }}
                />

                {/* Main Key bubble */}
                <div className={`w-11 h-11 rounded-full border-2 bg-zinc-900/90 flex items-center justify-center font-mono text-base font-black shadow-[0_0_15px_rgba(6,182,212,0.15)] ${s.color}`}>
                  {s.key}
                </div>
              </div>
            ))}

            {sectors.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Sector scanning...
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
