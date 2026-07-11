import React from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Cloud, CloudOff, Settings, Activity, Award, 
  Keyboard, Sun, Moon, Globe, LogOut, ChevronRight, AlertTriangle, RefreshCw, X, Palette
} from 'lucide-react';
import { UserProfile, TypingStats } from '../types';

interface AccountBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  stats: TypingStats;
  isCloudActive: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigateToTab: (tab: any) => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onSwitchAccount: () => void;
  accentTheme: string;
}

export const AccountBottomSheet: React.FC<AccountBottomSheetProps> = ({
  isOpen,
  onClose,
  profile,
  stats,
  isCloudActive,
  isDarkMode,
  onToggleTheme,
  onNavigateToTab,
  onOpenAuthModal,
  onLogout,
  onSwitchAccount,
  accentTheme
}) => {
  if (!isOpen) return null;

  const handleNav = (tab: any) => {
    onNavigateToTab(tab);
    onClose();
  };

  const resolvedName = React.useMemo(() => {
    if (isCloudActive) {
      if (profile?.name && profile?.name.trim() !== '' && profile?.name !== 'Tactile Pilot') {
        return profile.name;
      }
      if (profile?.username && profile?.username.trim() !== '' && profile?.username !== 'tactile_pilot') {
        return profile.username;
      }
      return 'Pilot';
    }
    if (profile?.name && profile?.name.trim() !== '' && profile?.name !== 'Tactile Pilot') {
      return profile.name;
    }
    if (profile?.username && profile?.username.trim() !== '' && profile?.username !== 'tactile_pilot') {
      return profile.username;
    }
    return 'Guest';
  }, [isCloudActive, profile?.name, profile?.username]);

  const usernameText = profile?.username || (resolvedName ? resolvedName.toLowerCase().replace(/\s+/g, '') : 'guest');
  const emailText = profile?.email || 'guest@typesprint.com';

  return (
    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-end justify-center z-50 select-none">
      {/* Overlay click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide up sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-h-[85%] bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-900 rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden z-10"
      >
        {/* Handle bar */}
        <div className="flex justify-center py-2.5 shrink-0">
          <div className="w-12 h-1 bg-slate-300 dark:bg-zinc-800 rounded-full" />
        </div>

        {/* Header block */}
        <div className="flex items-center justify-between px-6 pb-2 border-b border-slate-100 dark:border-zinc-900/60 shrink-0">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Account & Progression
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable List container */}
        <div className="flex-grow overflow-y-auto px-6 py-4 flex flex-col gap-5 scrollbar-none pb-8 text-xs">
          
          {/* USER CARD (Live / Guest) */}
          {isCloudActive ? (
            /* Live Account Card */
            <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt={resolvedName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover border border-zinc-800 shadow-sm"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-950 flex items-center justify-center font-black text-lg font-mono shadow-sm">
                    {resolvedName ? resolvedName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <h4 className="font-black text-slate-100 truncate flex items-center gap-1.5">
                    {resolvedName}
                    <span className="text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                      Lvl {profile.level}
                    </span>
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-zinc-500 shrink-0" /> {emailText}
                  </p>
                </div>
              </div>

              {/* Cloud sync status line */}
              <div className="flex items-center justify-between bg-zinc-950/60 p-2 px-3 rounded-xl border border-zinc-900/80 mt-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Live Cloud Connection
                </span>
                <span className="text-[9px] font-black uppercase text-emerald-400 font-mono">
                  Synced
                </span>
              </div>
            </div>
          ) : (
            /* Guest Experience Card */
            <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-dashed border-amber-500/20 p-4 rounded-2xl flex flex-col gap-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center font-black text-lg text-slate-500 dark:text-zinc-400 font-mono shrink-0">
                  G
                </div>
                <div>
                  <h4 className="font-black text-slate-800 dark:text-zinc-200">Guest Typist</h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal mt-1 flex items-start gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Your levels, XP, and typing milestones are stored only on this device. Sign in to safeguard your progress.</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    onOpenAuthModal('login');
                    onClose();
                  }}
                  className="py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-[10px] uppercase rounded-xl shadow-sm transition-transform hover:scale-102 active:scale-98 cursor-pointer text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuthModal('signup');
                    onClose();
                  }}
                  className="py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300 font-bold text-[10px] uppercase rounded-xl transition-colors cursor-pointer text-center"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* FIRST ACTION SECTION */}
          <div className="flex flex-col gap-1.5">
            <h5 className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1 mb-1">
              General Features
            </h5>

            {/* My Profile */}
            <button
              onClick={() => handleNav('profile')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-700 dark:text-zinc-200">My Profile</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Statistics */}
            <button
              onClick={() => handleNav('stats')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-slate-700 dark:text-zinc-200">Statistics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-black text-slate-500 dark:text-zinc-400">
                  {stats.bestWpm} WPM Best
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </button>

            {/* Achievements */}
            <button
              onClick={() => handleNav('achievements')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-700 dark:text-zinc-200">Achievements</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Keyboard Settings */}
            <button
              onClick={() => handleNav('settings')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Keyboard className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-slate-700 dark:text-zinc-200">Keyboard Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* General Settings */}
            <button
              onClick={() => handleNav('settings')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                <span className="font-bold text-slate-700 dark:text-zinc-200">Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Theme Toggle & Custom Preset Display */}
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {isDarkMode ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span className="font-bold text-slate-700 dark:text-zinc-200">Theme</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  <Palette className="w-3 h-3 text-amber-500" /> {accentTheme}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
              </div>
            </button>

            {/* Language Selection */}
            <button
              onClick={() => handleNav('profile')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-teal-500" />
                <span className="font-bold text-slate-700 dark:text-zinc-200">Language</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md">
                {profile.preferredLanguage || 'English'}
              </span>
            </button>
          </div>

          {/* SECOND ACTION SECTION (DANGEROUS / ACCOUNT ACTIONS) */}
          {isCloudActive && (
            <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-zinc-900/60 pt-4">
              <h5 className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1 mb-1">
                Account Operations
              </h5>

              {/* Switch Account */}
              <button
                onClick={() => {
                  onSwitchAccount();
                  onClose();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 text-blue-500 transition-colors cursor-pointer text-left"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-bold">Switch Account</span>
              </button>

              {/* Log Out */}
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-bold">Log Out from Device</span>
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
