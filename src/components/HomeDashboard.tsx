import React from 'react';
import { 
  Play, Flame, Zap, Award, Activity, Clock, Keyboard, 
  Battery, Wifi, CheckCircle, Calendar, ChevronRight, Bluetooth, Usb, Sparkles
} from 'lucide-react';
import { TypingStats, UserProfile, DailyChallenge, Lesson } from '../types';
import { LESSONS } from '../data/lessons';
import { getCompletedLessons } from '../utils/storage';
import { useKeyboardDetector } from '../utils/keyboardDetector';

interface HomeDashboardProps {
  stats: TypingStats;
  profile: UserProfile;
  dailyChallenges: DailyChallenge[];
  onStartLesson: (lesson: Lesson) => void;
  onNavigateToTab: (tab: any) => void;
  onStartSpeedTest: (duration: number) => void;
  simulatedConnection?: 'bluetooth' | 'usb_otg' | 'none';
  isAuthenticated?: boolean;
  onOpenAuthModal?: () => void;
  onOpenAccountSheet: () => void;
  isCloudActive: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  stats,
  profile,
  dailyChallenges,
  onStartLesson,
  onNavigateToTab,
  onStartSpeedTest,
  simulatedConnection,
  isAuthenticated,
  onOpenAuthModal,
  onOpenAccountSheet,
  isCloudActive
}) => {
  const device = useKeyboardDetector();

  // Calculations for Quick Stats
  const getTodayMinutes = () => {
    const todayStr = new Date().toDateString();
    const todaySessions = stats.history.filter(s => {
      try {
        return new Date(s.date).toDateString() === todayStr;
      } catch {
        return false;
      }
    });
    const totalSeconds = todaySessions.reduce((acc, s) => acc + s.timeSpentSeconds, 0);
    return parseFloat((totalSeconds / 60).toFixed(1));
  };

  const todayMinutes = getTodayMinutes();
  const dailyGoalMinutes = 5; // 5 min daily goal
  const dailyGoalPct = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));
  const lessonsCompletedCount = stats.history.filter(s => s.type === 'lesson').length;

  // Find last lesson practiced or default to first lesson
  const lastSession = stats.history[0];
  let continueLesson = LESSONS[0];
  if (lastSession) {
    const found = LESSONS.find(l => l.title === lastSession.title);
    if (found) continueLesson = found;
  }

  // Generate 7 days calendar overview (Monday to Sunday)
  const getWeeklyCalendar = () => {
    const days = [];
    const today = new Date();
    // Start from 6 days ago
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = d.toLocaleDateString([], { weekday: 'short' });
      const dateString = d.toDateString();
      
      // Check if user completed a session on this date
      const practiced = stats.history.some(session => {
        try {
          return new Date(session.date).toDateString() === dateString;
        } catch {
          return false;
        }
      });
      days.push({ dayName, dateString, practiced, dayNum: d.getDate() });
    }
    return days;
  };

  const calendarDays = getWeeklyCalendar();

  // Weekly Goal Progress (Default goal: 15 minutes)
  const weeklyGoalMinutes = 15;
  const currentWeeklyMinutes = parseFloat((stats.totalMinutes).toFixed(1));
  const weeklyGoalPct = Math.min(100, Math.round((currentWeeklyMinutes / weeklyGoalMinutes) * 100));

  // Connection Details
  const getConnectionDetails = () => {
    switch (device.status) {
      case 'bluetooth':
        return {
          name: device.name || 'Bluetooth Keyboard',
          quality: device.quality || 'Excellent Link (95%)',
          battery: device.battery || '85%',
          icon: <Bluetooth className="w-5 h-5 text-blue-500 animate-pulse" />,
          status: 'Bluetooth Keyboard Connected'
        };
      case 'usb':
        return {
          name: device.name || 'USB Keyboard',
          quality: device.quality || 'Zero Latency OTG (100%)',
          battery: 'N/A (Wired Bus)',
          icon: <Usb className="w-5 h-5 text-emerald-500" />,
          status: 'USB Keyboard Connected'
        };
      case 'none':
      default:
        return {
          name: 'No Physical Keyboard Connected',
          quality: 'Disconnected (0%)',
          battery: '0%',
          icon: <Keyboard className="w-5 h-5 text-rose-500" />,
          status: 'No Keyboard Connected'
        };
    }
  };

  const conn = getConnectionDetails();

  // Recommend a quick start lesson (first incomplete lesson in sequence)
  const completedLessonIds = getCompletedLessons();
  const quickStartLesson = LESSONS.find(l => !completedLessonIds.includes(l.id)) || LESSONS[0];

  const greeting = React.useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const resolvedName = React.useMemo(() => {
    if (isCloudActive) {
      if (profile.name && profile.name.trim() !== '' && profile.name !== 'Tactile Pilot') {
        return profile.name;
      }
      if (profile.username && profile.username.trim() !== '' && profile.username !== 'tactile_pilot') {
        return profile.username;
      }
      return 'Pilot';
    }
    if (profile.name && profile.name.trim() !== '' && profile.name !== 'Tactile Pilot') {
      return profile.name;
    }
    if (profile.username && profile.username.trim() !== '' && profile.username !== 'tactile_pilot') {
      return profile.username;
    }
    return 'Guest';
  }, [isCloudActive, profile.name, profile.username]);

  return (
    <div className="w-full flex flex-col gap-5 pb-8">
      {/* Home Screen Header with Title and Profile Avatar */}
      <div className="flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/40 p-4 px-5 rounded-2xl border border-slate-100 dark:border-zinc-800/50 shrink-0 shadow-sm">
        {isCloudActive ? (
          /* Logged In Personal Greeting */
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-1">
              {greeting} 👋
            </span>
            <h1 className="text-base font-black font-display text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
              {resolvedName}
            </h1>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-slate-500 dark:text-zinc-400">
              <span className="text-slate-600 dark:text-zinc-300">
                Level {profile.level} • {profile.selectedTitle || 'Tactile Pilot'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 font-mono text-[9px] font-extrabold text-slate-400 dark:text-zinc-500">
              <span className="flex items-center gap-0.5">⭐ {profile.xp} XP</span>
              <span className="flex items-center gap-0.5">🔥 {stats.streak} Day Streak</span>
            </div>
          </div>
        ) : (
          /* Guest Experience Greeting */
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xs font-black font-display text-slate-800 dark:text-zinc-100 tracking-tight flex items-center gap-1">
              Welcome, Guest 👋
            </h1>
            <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium">
              Sign in to sync your progress across devices.
            </p>
          </div>
        )}
        
        {/* Profile Avatar with Cloud Indicator */}
        <button
          onClick={onOpenAccountSheet}
          className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border border-slate-200/60 dark:border-zinc-800/60 shadow-sm shrink-0"
        >
          {profile.profilePhoto ? (
            <img
              src={profile.profilePhoto}
              alt={resolvedName}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-950 flex items-center justify-center font-black text-xs font-mono">
              {resolvedName ? resolvedName[0].toUpperCase() : 'G'}
            </div>
          )}
          
          {/* Green Cloud Indicator when Sync Active */}
          {isCloudActive && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full animate-pulse shadow-sm" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LEFT COLUMN: HERO QUICKSTART & LAST LESSON */}
        <div className="md:col-span-2 flex flex-col gap-4">
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-dashed border-amber-500/30 p-3.5 rounded-3xl flex items-center justify-between gap-3 text-slate-800 dark:text-zinc-250 shadow-sm">
            <div className="flex items-start gap-2.5">
              <span className="text-sm shrink-0 mt-0.5">⚠️</span>
              <div>
                <h4 className="font-extrabold text-[10px] text-amber-500 uppercase tracking-wide">Tactile Progression Vulnerable!</h4>
                <p className="text-[9px] text-slate-500 dark:text-zinc-400 leading-tight mt-0.5 font-medium">
                  You are playing in Guest Mode. Back up your levels, XP, and coins to TypeSprint cloud to prevent loss.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-[9px] uppercase rounded-xl shadow-sm hover:scale-102 transition-all shrink-0 cursor-pointer"
            >
              Backup
            </button>
          </div>
        )}

        {/* Quickstart Premium Android Glassmorphism Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-zinc-950 dark:text-zinc-950 p-5 rounded-3xl shadow-lg border border-orange-400/20 dark:border-orange-500/30 flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Keyboard className="w-32 h-32 rotate-12" />
          </div>
          <div>
            <span className="bg-zinc-950/20 dark:bg-zinc-950/25 text-zinc-900 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full inline-block">
              Daily Training Session
            </span>
            <h3 className="text-xl font-black tracking-tight mt-1 font-display">
              Ready to accelerate, {resolvedName}?
            </h3>
            <p className="text-xs text-zinc-900/80 mt-1 max-w-md font-medium">
              Daily training is recommended. Plug in or pair your physical Bluetooth keyboard for real key mechanics and instant layout tracking.
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-4 z-10">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onStartLesson(quickStartLesson)}
                disabled={profile.typingMode === 'external_keyboard' && device.status === 'none'}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 bg-zinc-950 text-amber-400 dark:text-amber-400 font-black text-xs rounded-xl transition-all shadow-md ${
                  (profile.typingMode === 'external_keyboard' && device.status === 'none') 
                    ? 'opacity-40 cursor-not-allowed transform-none hover:scale-100 active:scale-100' 
                    : 'hover:scale-105 active:scale-95'
                }`}
                id="btn_quick_start"
              >
                <Play className="w-4 h-4 fill-amber-400" />
                <span>Quick Start</span>
              </button>
              <button
                onClick={() => onNavigateToTab('practice')}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-zinc-900 font-bold text-xs rounded-xl transition-all"
              >
                Explore Curriculum
              </button>
            </div>
            
            {profile.typingMode === 'external_keyboard' && device.status === 'none' ? (
              <div className="mt-2 flex items-center gap-2 bg-black/10 border border-black/5 px-3.5 py-2 rounded-xl text-zinc-900 font-bold text-[10px] animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                Please connect a physical keyboard (Bluetooth or USB OTG) to start training.
              </div>
            ) : profile.typingMode === 'mobile_keyboard' ? (
              <div className="mt-2 flex items-center gap-2 bg-black/10 border border-black/5 px-3.5 py-2 rounded-xl text-zinc-900 font-bold text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                <strong>Mobile Keyboard Mode Active</strong> — You're ready to start typing using your phone keyboard.
              </div>
            ) : null}
          </div>
        </div>

        {/* Quick Stats Grid section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Today's Practice", value: `${todayMinutes}m`, sub: `Goal: ${dailyGoalMinutes}m`, color: 'text-amber-500' },
            { label: "Best WPM", value: `${stats.bestWpm}`, sub: "All-Time High", color: 'text-orange-500' },
            { label: "Average Accuracy", value: `${stats.totalAccuracy}%`, sub: "Tactile Quality", color: 'text-emerald-500' },
            { label: "Current Level", value: `Lvl ${profile.level}`, sub: `${profile.xp} XP`, color: 'text-blue-500' },
            { label: "Current XP", value: `${profile.xp} XP`, sub: `Next: ${profile.level * 300}`, color: 'text-purple-500' },
            { label: "Daily Goal Progress", value: `${dailyGoalPct}%`, sub: `${todayMinutes}/${dailyGoalMinutes} min`, color: 'text-rose-500' },
            { label: "Lessons Completed", value: `${lessonsCompletedCount}`, sub: "Completed Drills", color: 'text-teal-500' },
            { label: "Current Streak", value: `${stats.streak} Days`, sub: "Active streak", color: 'text-amber-400 font-black animate-pulse' }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-zinc-900 border border-slate-200/40 dark:border-zinc-800/80 p-3 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300"
            >
              <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{item.label}</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-sm font-black font-display tracking-tight ${item.color}`}>
                  {item.value}
                </span>
              </div>
              <span className="text-[8px] text-slate-400 dark:text-zinc-500 mt-0.5 font-semibold leading-none">{item.sub}</span>
            </div>
          ))}
        </div>

        {/* Continue Last Lesson & Daily Challenge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Resume Lesson */}
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Continue Path</span>
                <span className="text-[9px] font-bold text-amber-500 dark:text-amber-400">{continueLesson.difficulty}</span>
              </div>
              <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100 mt-2 line-clamp-1">{continueLesson.title}</h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{continueLesson.description}</p>
            </div>
            <button
              onClick={() => onStartLesson(continueLesson)}
              className="flex items-center justify-between w-full mt-3 p-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/80 border border-slate-200/40 dark:border-zinc-800/80 rounded-xl text-[11px] font-bold text-slate-700 dark:text-zinc-200 transition-colors"
            >
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Resume practice</span>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </button>
          </div>

          {/* Daily Challenge Card */}
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Challenge</span>
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-500">
                  <Flame className="w-3.5 h-3.5 animate-pulse" /> +150 XP
                </span>
              </div>
              {dailyChallenges.map((challenge, idx) => (
                <div key={challenge.id} className="flex items-start gap-2 mt-2">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    challenge.completed 
                      ? 'border-emerald-500 bg-emerald-500 text-white' 
                      : 'border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950/40'
                  }`}>
                    {challenge.completed && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <p className={`text-[10px] font-bold leading-tight ${challenge.completed ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-700 dark:text-zinc-300'}`}>
                    {challenge.description}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => onStartSpeedTest(60)}
              className="w-full text-center mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/80 border border-slate-200/40 dark:border-zinc-800/80 rounded-xl text-[10px] font-bold text-slate-700 dark:text-zinc-200 transition-colors"
            >
              Launch 1-Min Test
            </button>
          </div>
        </div>

        {/* Practice Calendar (Consistency Tracker) */}
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" /> Practice Calendar & Streak Tracker
            </span>
            <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
              <Flame className="w-3.5 h-3.5" /> {stats.streak} Days Active
            </span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {calendarDays.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate-400">{day.dayName}</span>
                <div className={`w-8 h-8 rounded-xl border flex flex-col items-center justify-center mt-1 font-mono text-xs font-bold transition-all ${
                  day.practiced 
                    ? 'bg-amber-500 dark:bg-amber-500/20 text-zinc-950 dark:text-amber-400 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                    : 'bg-slate-50 dark:bg-zinc-950/40 text-slate-500 dark:text-zinc-600 border-slate-200/60 dark:border-zinc-800/60'
                }`}>
                  {day.dayNum}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: CONNECTION AND STATS */}
      <div className="flex flex-col gap-4">
        {/* Keyboard Connection Status & Metadata HUD */}
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keyboard Interface</span>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
              device.status === 'none' 
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            }`}>{conn.status}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-950 flex items-center justify-center border border-slate-200/40 dark:border-zinc-800/60">
              {conn.icon}
            </div>
            <div className="flex-grow">
              <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100 line-clamp-1">{conn.name}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Device Interface Channel</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/30 dark:border-zinc-800/40 p-2 rounded-xl text-center">
              <span className="text-[8px] text-slate-400 uppercase font-black">Link Stability</span>
              <div className="text-[10px] font-black text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1 mt-0.5">
                <Wifi className="w-3 h-3 text-slate-400" /> {conn.quality}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/30 dark:border-zinc-800/40 p-2 rounded-xl text-center">
              <span className="text-[8px] text-slate-400 uppercase font-black">Battery Level</span>
              <div className="text-[10px] font-black text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1 mt-0.5">
                <Battery className="w-3 h-3 text-emerald-500" /> {conn.battery}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Goal Progress HUD */}
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Progress Goal</span>
            <span className="text-[10px] font-extrabold text-amber-500">{weeklyGoalPct}%</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-slate-600 dark:text-zinc-300">Total Practice Time:</span>
            <span className="font-mono text-slate-800 dark:text-zinc-100">{currentWeeklyMinutes}m / {weeklyGoalMinutes}m</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-950 h-2 rounded-full overflow-hidden border border-slate-200/40 dark:border-zinc-800/60">
            <div 
              className="bg-amber-500 h-full rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
              style={{ width: `${weeklyGoalPct}%` }} 
            />
          </div>
          <p className="text-[9px] text-slate-400 leading-tight">
            Goal: Spend 15 minutes typing this week to establish permanent muscle memory and accuracy triggers.
          </p>
        </div>

        {/* Recent Session History HUD */}
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex-grow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
            Recent Sessions Logs
          </span>
          {stats.history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Activity className="w-8 h-8 text-slate-300 dark:text-zinc-700" />
              <p className="text-[10px] text-slate-400 mt-1">No completed sessions recorded yet. Start training above!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.history.slice(0, 3).map((session) => (
                <div key={session.id} className="flex justify-between items-center bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/20 dark:border-zinc-800/20 p-2 rounded-xl">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-800 dark:text-zinc-200 line-clamp-1">{session.title}</h5>
                    <span className="text-[8px] text-slate-400 font-mono block mt-0.5">{session.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-black text-amber-500 font-mono block">{session.wpm} WPM</span>
                    <span className="text-[9px] text-slate-400 font-mono block">{session.accuracy}% Acc</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};
