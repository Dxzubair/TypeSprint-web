import React, { useState, useMemo, useEffect } from 'react';
import { 
  Award, Users, Globe, Trophy, Play, Flame, 
  ChevronRight, Car, User, Sparkles, Clock, 
  Search, Keyboard, SlidersHorizontal
} from 'lucide-react';
import { UserProfile, TypingStats } from '../types';
import { TEST_BANK } from '../data/lessons';
import { useAuth } from '../context/AuthContext';
import { getLiveLeaderboardEntries } from '../utils/sync';

/* v8 ignore start */


interface LeaderboardsProps {
  profile: UserProfile;
  stats: TypingStats;
  onTriggerRace: (text: string, title: string) => void;
}

export const LeaderboardsDashboard: React.FC<LeaderboardsProps> = ({
  profile,
  stats,
  onTriggerRace
}) => {
  const { user, isAnonymous } = useAuth();
  const isCloudActive = !!user && !isAnonymous;
  const resolvedName = useMemo(() => {
    if (isCloudActive && user?.displayName) {
      return user.displayName;
    }
    if (profile?.name && profile?.name.trim() !== '' && profile?.name !== 'Tactile Pilot') {
      return profile.name;
    }
    if (profile?.username && profile?.username.trim() !== '' && profile?.username !== 'tactile_pilot') {
      return profile.username;
    }
    return isCloudActive ? 'Pilot' : 'Guest';
  }, [isCloudActive, user?.displayName, profile?.name, profile?.username]);

  // Tabs: racing, global, country, friends, weekly, monthly
  const [subTab, setSubTab] = useState<'racing' | 'global' | 'country' | 'friends' | 'weekly' | 'monthly'>('racing');
  
  // Search & layout filters
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutFilter, setLayoutFilter] = useState<'ALL' | 'QWERTY' | 'QWERTZ' | 'AZERTY'>('ALL');

  // Input System Leaderboard category
  const [leaderboardMode, setLeaderboardMode] = useState<'overall' | 'mobile_keyboard' | 'bluetooth' | 'usb'>('overall');

  // Live database entries
  const [liveEntries, setLiveEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetchLiveLeaderboard = async () => {
      try {
        const entries = await getLiveLeaderboardEntries();
        if (entries && entries.length > 0) {
          setLiveEntries(entries);
        }
      } catch (err) {
        console.error('Failed to load live leaderboard:', err);
      }
    };
    fetchLiveLeaderboard();
  }, []);

  // Simulated Global Typists Data
  const baseLeaderboardData = useMemo(() => [
    { rank: 1, avatar: '🚀', name: 'FingersOfFury', level: 45, bestWpm: 142, accuracy: 99.8, kb: 'Custom 60% Linear', layout: 'QWERTY', country: '🇰🇷' },
    { rank: 2, avatar: '👾', name: 'TypingDaemon', level: 38, bestWpm: 128, accuracy: 99.1, kb: 'HHKB Professional', layout: 'QWERTY', country: '🇯🇵' },
    { rank: 3, avatar: '🐱', name: 'LinusTypeTips', level: 33, bestWpm: 119, accuracy: 98.7, kb: 'Cherry MX Brown Custom', layout: 'QWERTZ', country: '🇩🇪' },
    { rank: 4, avatar: '🤖', name: 'WPM_Overlord', level: 31, bestWpm: 112, accuracy: 98.2, kb: 'Keychron Q1 Blue', layout: 'QWERTY', country: '🇺🇸' },
    { rank: 5, avatar: '🦊', name: 'HyperlightKey', level: 27, bestWpm: 104, accuracy: 97.9, kb: 'Chiclet Wireless Thin', layout: 'AZERTY', country: '🇫🇷' },
    { rank: 6, avatar: '🦄', name: 'AndroidSprint', level: 25, bestWpm: 98, accuracy: 97.5, kb: 'Bluetooth mechanical', layout: 'QWERTY', country: '🇧🇷' },
    { rank: 7, avatar: '🐯', name: 'TactileTiger', level: 21, bestWpm: 92, accuracy: 96.8, kb: 'Standard Membrane USB', layout: 'QWERTY', country: '🇮🇳' },
    { rank: 8, avatar: '🐼', name: 'KeycapPanda', level: 19, bestWpm: 85, accuracy: 96.2, kb: 'Ergonomic split wireless', layout: 'QWERTY', country: '🇨🇳' },
    { rank: 9, avatar: '🦁', name: 'SpeedyLion', level: 15, bestWpm: 76, accuracy: 95.5, kb: 'Mechanical clicky keys', layout: 'QWERTZ', country: '🇦🇹' },
    { rank: 10, avatar: '🦉', name: 'NightOwlTypist', level: 12, bestWpm: 68, accuracy: 94.9, kb: 'Low profile chiclet', layout: 'AZERTY', country: '🇧🇪' }
  ], []);

  // Add user to the data dynamically with mode-specific performance records
  const fullLeaderboardData = useMemo(() => {
    let userWpm = 0;
    let userKb = 'External Hardware Board';

    if (leaderboardMode === 'overall') {
      userWpm = Math.max(stats.bestWpm, 0);
      userKb = profile.typingMode === 'mobile_keyboard' ? 'Mobile Virtual Keyboard' : 'Physical Hardware Board';
    } else if (leaderboardMode === 'mobile_keyboard') {
      const mobileSessions = stats.history.filter(h => h.typingMode === 'mobile_keyboard' || !h.typingMode);
      userWpm = mobileSessions.length > 0 ? Math.max(...mobileSessions.map(s => s.wpm)) : 0;
      userKb = 'Mobile Keyboard (Touch)';
    } else if (leaderboardMode === 'bluetooth') {
      const btSessions = stats.history.filter(h => h.typingMode === 'external_keyboard' && h.keyboardType === 'bluetooth');
      userWpm = btSessions.length > 0 ? Math.max(...btSessions.map(s => s.wpm)) : 0;
      userKb = 'Bluetooth Mechanical Board';
    } else if (leaderboardMode === 'usb') {
      const usbSessions = stats.history.filter(h => h.typingMode === 'external_keyboard' && h.keyboardType === 'usb');
      userWpm = usbSessions.length > 0 ? Math.max(...usbSessions.map(s => s.wpm)) : 0;
      userKb = 'USB OTG Mechanical Board';
    }

    const userAcc = stats.totalAccuracy || 100;
    const userEntry = {
      rank: 0,
      avatar: '🌟',
      name: `${resolvedName} (You)`,
      level: profile.level,
      bestWpm: userWpm,
      accuracy: userAcc,
      kb: userKb,
      layout: 'QWERTY',
      country: '🇺🇸'
    };

    // Adapt simulated players specifically for the selected leaderboard mode
    const mappedBase = baseLeaderboardData.map(player => {
      let speed = player.bestWpm;
      let keyboard = player.kb;

      if (leaderboardMode === 'mobile_keyboard') {
        speed = Math.round(player.bestWpm * 0.65); // Mobile typists average lower speeds
        keyboard = 'Gboard Touch Keyboard';
      } else if (leaderboardMode === 'bluetooth') {
        keyboard = `${player.name.includes('Daemon') ? 'HHKB Pro' : 'Keychron Q1'} Bluetooth`;
      } else if (leaderboardMode === 'usb') {
        keyboard = `${player.name.includes('Fury') ? 'Custom 60%' : 'IBM Model M'} USB OTG`;
      }

      return {
        ...player,
        bestWpm: speed,
        kb: keyboard
      };
    });

    // Map live entries
    const mappedLive = liveEntries.map(entry => ({
      avatar: entry.avatar || '🚀',
      name: entry.name,
      level: entry.level || 1,
      bestWpm: entry.bestWpm,
      accuracy: entry.accuracy,
      kb: entry.kb || 'Hardware Keyboard',
      layout: entry.layout || 'QWERTY',
      country: entry.country || '🇺🇸'
    }));

    // Filter out our own name from base or live entries to prevent duplications
    const cleanBase = mappedBase.filter(p => p.name !== resolvedName);
    const cleanLive = mappedLive.filter(p => p.name !== resolvedName && p.name !== `${resolvedName} (You)`);

    const combined = [...cleanBase, ...cleanLive, userEntry];
    // Sort by bestWpm descending
    combined.sort((a, b) => b.bestWpm - a.bestWpm);
    
    // Assign proper ranks
    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }, [baseLeaderboardData, liveEntries, resolvedName, profile.level, stats.bestWpm, stats.totalAccuracy, stats.history, leaderboardMode, profile.typingMode]);

  // Handle data filter logic depending on current sub-tab
  const filteredLeaderboard = useMemo(() => {
    let list = [...fullLeaderboardData];

    // Filter by Tab Specific views
    if (subTab === 'country') {
      // Focus on same country or list by groups
      list = list.filter(item => item.country === '🇺🇸' || item.country === '🇰🇷' || item.country === '🇯🇵');
    } else if (subTab === 'friends') {
      // Keep only specific users as 'friends' plus yourself
      const friendsNames = ['FingersOfFury', 'HyperlightKey', 'KeycapPanda', resolvedName, `${resolvedName} (You)`];
      list = list.filter(item => friendsNames.includes(item.name));
    } else if (subTab === 'weekly') {
      // Slightly randomize scores for weekly volatility
      list = list.map(item => ({
        ...item,
        bestWpm: Math.round(item.bestWpm * 0.95 + (item.rank % 3))
      })).sort((a, b) => b.bestWpm - a.bestWpm).map((e, i) => ({ ...e, rank: i + 1 }));
    } else if (subTab === 'monthly') {
      // Slightly scale scores for monthly
      list = list.map(item => ({
        ...item,
        bestWpm: Math.round(item.bestWpm * 1.02)
      })).sort((a, b) => b.bestWpm - a.bestWpm).map((e, i) => ({ ...e, rank: i + 1 }));
    }

    // Apply Search Query filter
    if (searchQuery.trim()) {
      list = list.filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Apply Layout filter
    if (layoutFilter !== 'ALL') {
      list = list.filter(item => item.layout === layoutFilter);
    }

    return list;
  }, [fullLeaderboardData, subTab, searchQuery, layoutFilter, resolvedName]);

  // Simulated Tournaments
  const tournaments = [
    { id: 't1', title: 'Tactile Championship Sprint', prize: '1,500 Coins + Master Title', remaining: '4 hours left', participants: 342, entryFee: 50, active: true },
    { id: 't2', title: 'Beginners Accuracy Cup', prize: '500 Coins + Novice Badge', remaining: '1 day left', participants: 184, entryFee: 20, active: true },
    { id: 't3', title: 'Weekly Mechanical Race', prize: '2,500 Coins + Champion Keycap', remaining: '4 days left', participants: 812, entryFee: 100, active: false },
  ];

  // Racing State
  const [raceActive, setRaceActive] = useState(false);
  const [raceText, setRaceText] = useState('');
  const [ghosts, setGhosts] = useState([
    { name: 'Ghost Racer Turbo', speedWpm: 42, progress: 0, avatar: '🏎️', color: 'bg-emerald-500' },
    { name: 'Linear Sprinter', speedWpm: 50, progress: 0, avatar: '🚀', color: 'bg-purple-500' },
    { name: 'Chiclet Ghost', speedWpm: 35, progress: 0, avatar: '🤖', color: 'bg-cyan-500' }
  ]);
  const [raceSeconds, setRaceSeconds] = useState(0);

  // Setup simulated race text
  const startMockRace = () => {
    const txt = TEST_BANK[Math.floor(Math.random() * TEST_BANK.length)];
    setRaceText(txt);
    
    const userSpeed = Math.max(stats.bestWpm, 40);
    setGhosts([
      { name: 'Ghost Turbo', speedWpm: Math.round(userSpeed - 5), progress: 0, avatar: '🏎️', color: 'bg-emerald-500' },
      { name: 'Mechanic Pro', speedWpm: Math.round(userSpeed + 3), progress: 0, avatar: '🚀', color: 'bg-purple-500' },
      { name: 'Novice Bot', speedWpm: Math.round(userSpeed - 12), progress: 0, avatar: '🤖', color: 'bg-cyan-500' }
    ]);
    
    setRaceSeconds(0);
    setRaceActive(true);
  };

  // Simulated Race Engine timer to update ghost progress visual bars
  React.useEffect(() => {
    if (!raceActive) return;

    const interval = setInterval(() => {
      setRaceSeconds(prev => {
        const nextSec = prev + 1;
        const totalChars = raceText.length || 200;

        setGhosts(prevGhosts => {
          return prevGhosts.map(g => {
            const charsTyped = (g.speedWpm * nextSec) / 12;
            const pct = Math.min(100, Math.round((charsTyped / totalChars) * 100));
            return { ...g, progress: pct };
          });
        });

        return nextSec;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [raceActive, raceText]);

  const handleLaunchRaceTrackPractice = () => {
    onTriggerRace(raceText, 'Grand Prix Race');
    setRaceActive(false);
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-8">
      {/* Dynamic Leaderboard Subtabs */}
      <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200/40 dark:border-zinc-800/60 select-none overflow-x-auto scrollbar-none shrink-0 gap-1">
        {[
          { id: 'racing', label: 'Multiplayer Racing', icon: <Car className="w-3.5 h-3.5" /> },
          { id: 'global', label: 'Global', icon: <Globe className="w-3.5 h-3.5" /> },
          { id: 'country', label: 'Country', icon: <Globe className="w-3.5 h-3.5" /> },
          { id: 'friends', label: 'Friends', icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'weekly', label: 'Weekly', icon: <Award className="w-3.5 h-3.5" /> },
          { id: 'monthly', label: 'Monthly', icon: <Trophy className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
              subTab === tab.id 
                ? 'bg-white dark:bg-zinc-900 text-amber-500 shadow-sm border border-slate-200/10 dark:border-zinc-800/40' 
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE SUBTAB PANEL */}
      {subTab === 'racing' ? (
        <div className="bg-white dark:bg-zinc-900/95 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm">
          {!raceActive ? (
            <div className="text-center py-6 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 dark:bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-3">
                <Car className="w-6 h-6 text-amber-500 animate-bounce" />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100">Tactile Racing circuit</h3>
              <p className="text-[10px] text-slate-400 max-w-sm mt-1 leading-relaxed">
                Enter the multiplayer drag strip! Line up alongside automated ghosts calibrated to replicate linear, clicky, and tactile typing mechanics.
              </p>
              
              <button
                onClick={startMockRace}
                className="mt-4 flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-zinc-950 font-black text-xs rounded-xl shadow-md hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4 fill-zinc-950" /> Matchmake & Ready Up
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <div>
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">TypeSprint Circuit</span>
                  <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100">Tactile Grand Prix</h4>
                </div>
                <div className="text-right font-mono text-[10px] font-bold text-slate-400">
                  Elapsed: {raceSeconds}s
                </div>
              </div>

              {/* Tracks */}
              <div className="flex flex-col gap-3 py-2 bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-slate-200/40 dark:border-zinc-800/60">
                {ghosts.map((ghost, idx) => (
                  <div key={idx} className="relative flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                        <span>{ghost.avatar}</span> {ghost.name} ({ghost.speedWpm} WPM)
                      </span>
                      <span className="text-slate-400">{ghost.progress}%</span>
                    </div>
                    <div className="relative w-full bg-slate-200 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${ghost.color}`} 
                        style={{ width: `${ghost.progress}%` }} 
                      />
                    </div>
                  </div>
                ))}

                <div className="relative flex flex-col gap-1 pt-2 border-t border-dashed border-slate-200 dark:border-zinc-800">
                  <div className="flex justify-between items-center text-[9px] font-black text-amber-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-500" /> YOU ({resolvedName})
                    </span>
                    <span>Lineup Ready</span>
                  </div>
                  <div className="relative w-full bg-slate-200 dark:bg-zinc-900 h-3 rounded-full overflow-hidden border-2 border-amber-500/20">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `0%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-100/50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200/30 dark:border-zinc-800/30 text-xs font-mono select-none">
                <span className="text-[9px] font-bold text-slate-400 block mb-1">Target Paragraph:</span>
                <p className="text-slate-600 dark:text-zinc-300 leading-normal line-clamp-2 italic">"{raceText}"</p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRaceActive(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold text-[10px] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLaunchRaceTrackPractice}
                  className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-black text-[10px] rounded-xl shadow-md hover:bg-amber-600 transition-all flex items-center gap-1"
                >
                  <Car className="w-3.5 h-3.5" /> Start Race Sprint
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD SCOREBOARD VIEWS WITH FILTERS */
        <div className="bg-white dark:bg-zinc-900/95 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
          {/* Input System Mode Toggles */}
          <div className="flex bg-slate-50 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200/40 dark:border-zinc-800/80 gap-1 overflow-x-auto scrollbar-none select-none">
            {[
              { id: 'overall', label: '🌐 Overall' },
              { id: 'mobile_keyboard', label: '📱 Mobile' },
              { id: 'bluetooth', label: '🔌 Bluetooth' },
              { id: 'usb', label: '⌨️ USB OTG' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setLeaderboardMode(m.id as any)}
                className={`flex-1 py-1 px-3 text-[9px] uppercase font-black tracking-wider rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                  leaderboardMode === m.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-zinc-950 shadow-sm scale-[1.02]'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Dynamic Filter Section */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <div className="relative w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search pilot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-full bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/40 dark:border-zinc-800/80 rounded-lg text-[10px] font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto select-none">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex bg-slate-50 dark:bg-zinc-950/50 p-0.5 border border-slate-200/40 dark:border-zinc-800/80 rounded-lg text-[8px] font-bold">
                {(['ALL', 'QWERTY', 'QWERTZ', 'AZERTY'] as const).map(layout => (
                  <button
                    key={layout}
                    onClick={() => setLayoutFilter(layout)}
                    className={`px-2 py-1 rounded-md transition-all ${
                      layoutFilter === layout 
                        ? 'bg-amber-500 text-zinc-950 font-black' 
                        : 'text-slate-400'
                    }`}
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ranking list */}
          <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto scrollbar-none pr-0.5">
            {filteredLeaderboard.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-bold">
                No pilots match the search filters.
              </div>
            ) : (
              filteredLeaderboard.map((userRow, index) => {
                const isUser = userRow.name.includes(resolvedName);

                return (
                  <div 
                    key={userRow.name + index}
                    className={`flex justify-between items-center p-2.5 rounded-xl border ${
                      isUser 
                        ? 'bg-amber-500/5 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.05)] font-black' 
                        : 'bg-slate-50 dark:bg-zinc-950/40 border-slate-200/20 dark:border-zinc-800/20 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 text-center font-bold font-mono text-slate-400 dark:text-zinc-500">
                        {userRow.rank === 1 ? '🥇' : userRow.rank === 2 ? '🥈' : userRow.rank === 3 ? '🥉' : userRow.rank}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-xs shadow-inner">
                        {userRow.avatar}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-800 dark:text-zinc-100 flex items-center gap-1">
                          <span className="text-[10px]">{userRow.country}</span> {userRow.name}
                          {isUser && <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1 rounded font-mono font-bold">YOU</span>}
                        </h4>
                        <p className="text-[8px] text-slate-400 font-semibold uppercase font-mono tracking-wider">Level {userRow.level} • {userRow.kb} ({userRow.layout})</p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-black text-amber-500 text-xs block">{userRow.bestWpm} WPM</span>
                      <span className="text-[8px] text-slate-400 block">{userRow.accuracy}% Acc</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};


/* v8 ignore stop */
