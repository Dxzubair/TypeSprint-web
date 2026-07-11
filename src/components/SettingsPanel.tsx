import React, { useState } from 'react';
import { 
  Settings, User, Palette, Type, Shield, 
  Volume2, Keyboard, Wifi, Languages, Copy, 
  Download, RefreshCw, Check, AlertTriangle, MessageSquare
} from 'lucide-react';
import { KeyboardSettings, UserProfile } from '../types';
import { useKeyboardDetector } from '../utils/keyboardDetector';
import { useAuth } from '../context/AuthContext';
import { Cloud, CloudOff, Database } from 'lucide-react';

/* v8 ignore start */


interface SettingsPanelProps {
  settings: KeyboardSettings;
  profile: UserProfile;
  onUpdateSettings: (settings: KeyboardSettings) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetProgress: () => void;
  onOpenAuthModal?: () => void;
  onOpenFeedback?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  profile,
  onUpdateSettings,
  onUpdateProfile,
  onResetProgress,
  onOpenAuthModal,
  onOpenFeedback
}) => {
  const { user, isAnonymous, triggerSync } = useAuth();
  const device = useKeyboardDetector();
  const isCloudActive = !!user && !isAnonymous;

  const resolvedName = React.useMemo(() => {
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

  const [profileName, setProfileName] = useState(resolvedName);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.selectedAvatar);
  const [selectedTitle, setSelectedTitle] = useState(profile.selectedTitle);
  const [copied, setCopied] = useState(false);
  const [backupInput, setBackupInput] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync state if profile prop or resolved name changes (e.g. on mount/auth/switch)
  React.useEffect(() => {
    setProfileName(resolvedName);
  }, [resolvedName]);

  React.useEffect(() => {
    setSelectedAvatar(profile.selectedAvatar);
    setSelectedTitle(profile.selectedTitle);
  }, [profile.selectedAvatar, profile.selectedTitle]);

  // Keyboard diagnostic tester state
  const [testTypedKey, setTestTypedKey] = useState<string>('');
  const [testHistory, setTestHistory] = useState<string[]>([]);

  React.useEffect(() => {
    const handleTestKeyDown = (e: KeyboardEvent) => {
      // Ignore keys when typing inside input elements to avoid duplicate capture or blocking
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      setTestTypedKey(e.key);
      setTestHistory(prev => [e.key, ...prev.slice(0, 11)]);
    };
    window.addEventListener('keydown', handleTestKeyDown);
    return () => {
      window.removeEventListener('keydown', handleTestKeyDown);
    };
  }, []);

  // Theme presets
  const themes = [
    { name: 'Midnight Orange', class: 'border-orange-500 text-orange-500' },
    { name: 'Emerald Velvet', class: 'border-emerald-500 text-emerald-500' },
    { name: 'Solar Flare', class: 'border-amber-500 text-amber-500' },
    { name: 'Cobalt Steel', class: 'border-blue-500 text-blue-500' },
    { name: 'Cyber Indigo', class: 'border-indigo-500 text-indigo-500' },
    { name: 'Cyberpunk Neon', class: 'border-fuchsia-500 text-fuchsia-500' }
  ];

  // Font options
  const fonts = ['Inter', 'Space Grotesk', 'JetBrains Mono', 'Outfit'];

  // Font size options
  const fontSizes: Array<'xs' | 'sm' | 'base' | 'lg' | 'xl'> = ['xs', 'sm', 'base', 'lg', 'xl'];

  // Sound options
  const soundTypes: Array<{ id: KeyboardSettings['soundType']; name: string }> = [
    { id: 'cherry_mx_blue', name: 'Cherry MX Blue' },
    { id: 'linear_red', name: 'Linear Red (Smooth)' },
    { id: 'silent_tactile', name: 'Silent Tactile (Muted)' },
    { id: 'topre', name: 'Topre (Thock)' },
    { id: 'buckling_spring', name: 'Buckling Spring (IBM)' },
    { id: 'mechanical', name: 'Generic Mechanical' },
    { id: 'chiclet', name: 'Chiclet Low Profile' },
    { id: 'typewriter', name: 'Vintage Typewriter' },
    { id: 'mute', name: 'No Sound (Muted)' }
  ];

  // Language options
  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese'];

  // Avatar presets
  const avatars = [
    { id: 'avatar_1', label: '🚀 Cosmic Pilot' },
    { id: 'avatar_2', label: '👾 Retro Gamer' },
    { id: 'avatar_3', label: '🐱 Code Kitten' },
    { id: 'avatar_4', label: '🤖 Tactile Android' }
  ];

  // Titles presets
  const titles = [
    { id: 'Tactile Novice', label: 'Tactile Novice' },
    { id: 'Finger Maestro', label: 'Finger Maestro' },
    { id: 'Speed Demon', label: 'Speed Demon' },
    { id: 'Tactile God', label: 'Tactile God' }
  ];

  const handleSaveProfile = () => {
    onUpdateProfile({
      ...profile,
      name: profileName || 'Typing Rookie',
      selectedAvatar,
      selectedTitle
    });
  };

  const handleCopyBackup = () => {
    const config = { settings, profile };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestoreBackup = () => {
    try {
      const parsed = JSON.parse(backupInput);
      if (parsed.settings && parsed.profile) {
        onUpdateSettings(parsed.settings);
        onUpdateProfile(parsed.profile);
        setRestoreSuccess(true);
        setBackupInput('');
        setTimeout(() => setRestoreSuccess(false), 3000);
      } else {
        alert('Invalid backup schema file format');
      }
    } catch {
      alert('Could not parse config text');
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-8 text-xs">
      {/* 0. Cloud Backup & Authentication Sync */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 p-4 rounded-3xl shadow-sm flex flex-col gap-3 text-white">
        <h4 className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800/80 pb-1.5 text-zinc-400">
          <Database className="w-4 h-4 text-amber-500" /> TypeSprint Cloud Synchronization Stance
        </h4>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${user ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {user ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-extrabold text-[11px] leading-tight">
                {user ? (user.displayName || 'Authenticated Guest') : 'Guest Play Mode'}
              </p>
              <p className="text-[9px] text-zinc-400 leading-none mt-0.5">
                {user ? (user.email || 'Anonymous Guest Cloud Record') : 'Tactile progression stored in browser cache'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-[10px] uppercase rounded-xl shadow-md cursor-pointer hover:scale-102 active:scale-98 transition-all shrink-0"
          >
            {user ? 'Manage Profile' : 'Backup Progress'}
          </button>
        </div>
      </div>

      {/* 1. Profile Editor */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <User className="w-4 h-4 text-amber-500" /> Pilot Identity Card
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-700 dark:text-zinc-300">Nickname</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/60 dark:border-zinc-800/60 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 dark:text-zinc-100 font-bold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-700 dark:text-zinc-300">Selected Title</label>
            <select
              value={selectedTitle}
              onChange={(e) => setSelectedTitle(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/60 dark:border-zinc-800/60 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 dark:text-zinc-100 font-bold"
            >
              {titles.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <label className="font-bold text-slate-700 dark:text-zinc-300">Choose Character Avatar</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {avatars.map(av => (
              <button
                key={av.id}
                onClick={() => setSelectedAvatar(av.id)}
                className={`py-2 px-3 border rounded-xl font-bold transition-all ${
                  selectedAvatar === av.id 
                    ? 'border-amber-500 bg-amber-500/5 text-amber-500' 
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {av.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-xl font-bold shadow-md hover:bg-amber-600 hover:scale-102 active:scale-98 transition-all"
          >
            Save Profile Card
          </button>
        </div>
      </div>

      {/* 2. Visual Theme & Typography Presets */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
          <Palette className="w-4 h-4 text-amber-500" /> Premium Workspace Presets
        </h4>

        {/* Themes list */}
        <div>
          <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">Aesthetic Accent Theme</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {themes.map(t => (
              <button
                key={t.name}
                onClick={() => onUpdateSettings({ ...settings, theme: t.name })}
                className={`py-2 px-2 border rounded-xl font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                  settings.theme === t.name 
                    ? 'border-amber-500 bg-amber-500/5 text-amber-500' 
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  t.name === 'Midnight Orange' ? 'bg-orange-500' :
                  t.name === 'Emerald Velvet' ? 'bg-emerald-500' :
                  t.name === 'Solar Flare' ? 'bg-amber-500' :
                  t.name === 'Cobalt Steel' ? 'bg-blue-500' :
                  t.name === 'Cyber Indigo' ? 'bg-indigo-500' : 'bg-fuchsia-500'
                }`} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font and sizing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
              <Type className="w-3.5 h-3.5" /> Workspace Font Family
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {fonts.map(f => (
                <button
                  key={f}
                  onClick={() => onUpdateSettings({ ...settings, fontFamily: f })}
                  className={`py-1.5 px-1 rounded-lg border text-[10px] font-bold ${
                    settings.fontFamily === f 
                      ? 'border-amber-500 bg-amber-500/5 text-amber-500' 
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-slate-600 dark:text-zinc-400'
                  }`}
                  style={{ fontFamily: f }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-700 dark:text-zinc-300">Target Size Index</label>
            <div className="flex bg-slate-50 dark:bg-zinc-950/40 p-1 border border-slate-200/40 dark:border-zinc-800/80 rounded-xl select-none">
              {fontSizes.map(sz => (
                <button
                  key={sz}
                  onClick={() => onUpdateSettings({ ...settings, fontSize: sz })}
                  className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all ${
                    settings.fontSize === sz 
                      ? 'bg-amber-500 text-zinc-950 font-black' 
                      : 'text-slate-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Audio Mechanical Feedback Controls */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
          <Volume2 className="w-4 h-4 text-amber-500" /> Audio Synthesizer Presets
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {soundTypes.map(snd => (
            <button
              key={snd.id}
              onClick={() => onUpdateSettings({ ...settings, soundType: snd.id })}
              className={`py-2 px-2 border rounded-xl font-bold transition-all ${
                settings.soundType === snd.id 
                  ? 'border-amber-500 bg-amber-500/5 text-amber-500' 
                  : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-slate-600 dark:text-zinc-400'
              }`}
            >
              {snd.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Keyboard Connection and Layout configs */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
          <Keyboard className="w-4 h-4 text-amber-500" /> Keyboard Hardware Stance
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Hardware Connection */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5" /> Hardware Connection
            </label>
            <div className={`px-3 py-2 rounded-xl border font-bold text-xs flex flex-col justify-center min-h-[38px] ${
              device.status === 'none' 
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
              <span>
                {device.status === 'bluetooth' ? 'Bluetooth Keyboard Connected' :
                 device.status === 'usb' ? 'USB Keyboard Connected' : 'No Keyboard Connected'}
              </span>
              {device.name && device.status !== 'none' && (
                <span className="text-[9px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium line-clamp-1">
                  {device.name}
                </span>
              )}
            </div>
          </div>

          {/* Layout config */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-600 dark:text-zinc-400">Keyboard Layout</label>
            <select
              value={settings.layout}
              onChange={(e) => onUpdateSettings({ ...settings, layout: e.target.value as any })}
              className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/60 dark:border-zinc-800/60 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 dark:text-zinc-100 font-bold"
            >
              <option value="QWERTY">QWERTY Layout</option>
              <option value="QWERTZ">QWERTZ Layout</option>
              <option value="AZERTY">AZERTY Layout</option>
            </select>
          </div>

          {/* Language selector */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5" /> App Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => onUpdateSettings({ ...settings, language: e.target.value })}
              className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/60 dark:border-zinc-800/60 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 dark:text-zinc-100 font-bold"
            >
              {languages.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-1 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={settings.showFingerGuide}
              onChange={(e) => onUpdateSettings({ ...settings, showFingerGuide: e.target.checked })}
              className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
            />
            Show Virtual Finger Guide
          </label>
          <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={settings.blockOnScreenKeyboard}
              onChange={(e) => onUpdateSettings({ ...settings, blockOnScreenKeyboard: e.target.checked })}
              className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
            />
            Disable OS On-Screen Board
          </label>
        </div>

        {/* Multi-Input Mode Switching */}
        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <label className="font-bold text-slate-700 dark:text-zinc-300">Active Input System Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => {
                onUpdateProfile({ ...profile, typingMode: 'mobile_keyboard' });
              }}
              className={`py-2 px-3 border rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                profile.typingMode === 'mobile_keyboard'
                  ? 'border-orange-500 bg-orange-500/5 text-orange-500 font-extrabold shadow-sm'
                  : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-slate-600 dark:text-zinc-400'
              }`}
            >
              <span className="text-sm">📱</span>
              <span className="text-[10px] font-black">Mobile Keyboard Mode</span>
            </button>

            <button
              onClick={() => {
                onUpdateProfile({ ...profile, typingMode: 'external_keyboard' });
              }}
              className={`py-2 px-3 border rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                profile.typingMode === 'external_keyboard'
                  ? 'border-amber-500 bg-amber-500/5 text-amber-500 font-extrabold shadow-sm'
                  : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-slate-600 dark:text-zinc-400'
              }`}
            >
              <span className="text-sm">⌨️</span>
              <span className="text-[10px] font-black">External Keyboard Mode</span>
            </button>

            <div className="py-2 px-3 border border-dashed border-slate-200 dark:border-zinc-850 bg-slate-50/20 dark:bg-zinc-950/20 text-slate-400 dark:text-zinc-600 rounded-xl font-bold flex flex-col items-center justify-center gap-1 opacity-65">
              <span className="text-sm">💻</span>
              <span className="text-[10px] font-black">Computer Mode (Soon)</span>
            </div>
          </div>
        </div>

        {/* Real-time Keyboard Tester Diagnostics Panel */}
        <div className="flex flex-col gap-2 mt-2 p-3 bg-slate-50 dark:bg-zinc-950/40 border border-slate-150 dark:border-zinc-800/80 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              ⚡ LIVE KEYBOARD LATENCY & DIAGNOSTICS TESTER
            </span>
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold">
              Type anything to verify
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center mt-1">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 p-2 rounded-xl flex flex-col items-center justify-center h-16 relative overflow-hidden">
              <span className="text-[8px] font-extrabold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 absolute top-1.5">LATEST KEY</span>
              <span className="text-lg font-black font-mono text-amber-500 mt-2">
                {testTypedKey ? (testTypedKey === ' ' ? 'Space' : testTypedKey) : '—'}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 p-2 rounded-xl h-16 overflow-y-auto">
              <span className="text-[8px] font-extrabold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 block mb-1">KEYSTROKE STREAM</span>
              <div className="flex flex-wrap gap-1">
                {testHistory.length === 0 ? (
                  <span className="text-[9px] text-zinc-400 italic">Press any key</span>
                ) : (
                  testHistory.map((key, i) => (
                    <span 
                      key={i} 
                      className={`px-1 rounded text-[9px] font-mono font-extrabold ${
                        i === 0 
                          ? 'bg-amber-500 text-zinc-950 animate-pulse' 
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-750 dark:text-zinc-400'
                      }`}
                    >
                      {key === ' ' ? 'Space' : key}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Beta Feedback */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
          <MessageSquare className="w-4 h-4 text-amber-500" /> Beta Tester Program
        </h4>
        <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug">
          Help us improve TypeSprint. Found a bug, have a feature idea, or experiencing keyboard compatibility issues? Let us know!
        </p>
        <button
          onClick={onOpenFeedback}
          className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" /> Send Beta Feedback
        </button>
      </div>

      {/* 6. Backup & Restore */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/40 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
          <Download className="w-4 h-4 text-amber-500" /> Backup & Restore Configuration
        </h4>
        <div className="flex gap-2">
          <button
            onClick={handleCopyBackup}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-950/40 text-slate-700 dark:text-zinc-300 rounded-xl font-bold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>Copy Config JSON</span>
          </button>
        </div>
        
        <div className="flex flex-col gap-2 mt-1">
          <label className="font-bold text-slate-700 dark:text-zinc-300">Paste Configuration Text to Restore:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={backupInput}
              onChange={(e) => setBackupInput(e.target.value)}
              placeholder='Paste JSON text here {"settings":..., "profile":...}'
              className="flex-grow bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/60 dark:border-zinc-800/60 px-3 py-2 rounded-xl text-[10px] font-mono focus:outline-none placeholder-slate-400"
            />
            <button
              onClick={handleRestoreBackup}
              disabled={!backupInput.trim()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-40"
            >
              Restore
            </button>
          </div>
          {restoreSuccess && (
            <p className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Workspace profiles restored successfully!
            </p>
          )}
        </div>
      </div>

      {/* 6. Destructive Actions */}
      <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex flex-col gap-3">
        <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-rose-500" /> Pilot Hard Reset Controls
        </h4>
        <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug">
          Resetting will flush all lessons completed, coins balance, achievements milestone badges, and speed practice history records forever.
        </p>

        {showResetConfirm ? (
          <div className="flex flex-col gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
            <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 animate-bounce" /> Double Confirm Reset Action
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onResetProgress();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-[10px]"
              >
                Yes, Clear Progress
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-1.5 bg-slate-200 dark:bg-zinc-850 text-slate-700 dark:text-zinc-200 font-bold rounded-lg text-[10px]"
              >
                Cancel Action
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl font-bold transition-all text-center"
          >
            Clear Typing Progress & Reset Pilot Stats
          </button>
        )}
      </div>
    </div>
  );
};


/* v8 ignore stop */
