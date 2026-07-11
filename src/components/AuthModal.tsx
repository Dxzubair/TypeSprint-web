import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Lock, User, Globe, Languages, LogOut, Key, 
  CheckCircle, AlertTriangle, Download, RefreshCw, Eye, EyeOff, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { exportProgressAsJSON, restoreProgressFromJSON } from '../utils/sync';
import { UserProfile, KeyboardSettings, Achievement, TypingStats } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  stats: TypingStats;
  achievements: Achievement[];
  settings: KeyboardSettings;
  onUpdateAllData: (data: {
    profile: UserProfile;
    stats: TypingStats;
    achievements: Achievement[];
    settings: KeyboardSettings;
  }) => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  profile,
  stats,
  achievements,
  settings,
  onUpdateAllData,
  initialMode
}) => {
  const { 
    user, 
    isAnonymous, 
    loginWithEmail, 
    signupWithEmail, 
    loginWithGoogle, 
    loginWithApple, 
    loginAnonymously, 
    logout, 
    resetPassword,
    triggerSync,
    isFirebaseActive
  } = useAuth();

  // Auth screen mode: 'login' | 'signup' | 'forgot' | 'profile'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');

  React.useEffect(() => {
    if (isOpen) {
      if (initialMode) {
        setMode(initialMode);
      } else {
        setMode('login');
      }
    }
  }, [isOpen, initialMode]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('United States');
  const [language, setLanguage] = useState('English');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Backup state
  const [pasteBackup, setPasteBackup] = useState('');
  const [backupStatus, setBackupStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const mapAuthError = (err: any, provider?: string): string => {
    // Log the original Firebase exception to console (which goes to Logcat in Android WebView)
    console.error('Firebase Auth Exception:', err);

    const code = err?.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'Incorrect email or password.';
    }
    if (code === 'auth/operation-not-allowed') {
      return `This authentication method (${provider || 'Email/Password'}) is disabled in the Firebase Console. Please open the Firebase Console for your project "typesprint-e476d", go to Authentication > Sign-in method, and enable ${provider === 'anonymous' ? 'Anonymous' : provider === 'google' ? 'Google' : 'Email/Password'} sign-in.`;
    }
    if (code === 'auth/email-already-in-use') {
      return 'The email address is already in use by another account.';
    }
    if (code === 'auth/invalid-email') {
      return 'The email address is badly formatted.';
    }
    if (code === 'auth/weak-password') {
      return 'The password must be 6 characters long or stronger.';
    }
    return `Firebase error (${code || 'unknown'}): ${err?.message || String(err) || 'An unexpected authentication error occurred.'}`;
  };

  const validateSignup = (emailStr: string, passwordStr: string, displayNameStr: string, usernameStr: string): string | null => {
    if (!displayNameStr || !displayNameStr.trim()) {
      return 'Display Name cannot be empty.';
    }
    if (!usernameStr || !usernameStr.trim()) {
      return 'Username cannot be empty.';
    }
    // Simple robust email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailStr || !emailStr.trim() || !emailRegex.test(emailStr)) {
      return 'Please enter a valid email address.';
    }
    if (!passwordStr || passwordStr.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseActive) {
      setError('Firebase is not configured correctly. The firebase-applet-config.json file may be missing or contains invalid credentials. Please provision Firebase or configure your database keys under Settings.');
      return;
    }

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      setSuccess('Successfully signed in!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(mapAuthError(err, 'email'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseActive) {
      setError('Firebase is not configured correctly. The firebase-applet-config.json file may be missing or contains invalid credentials. Please provision Firebase or configure your database keys under Settings.');
      return;
    }

    const validationError = validateSignup(email, password, displayName, username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await signupWithEmail(email, password, displayName);
      
      // Update local storage with custom fields to be merged on sync
      const nextProfile = {
        ...profile,
        name: displayName,
        username: username || displayName.toLowerCase().replace(/\s+/g, ''),
        country,
        preferredLanguage: language
      };
      localStorage.setItem('typesprint_profile', JSON.stringify(nextProfile));

      setSuccess('Account created successfully!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(mapAuthError(err, 'email'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseActive) {
      setError('Firebase is not configured correctly. The firebase-applet-config.json file may be missing or contains invalid credentials. Please provision Firebase or configure your database keys under Settings.');
      return;
    }

    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess('Password reset link sent to your email.');
    } catch (err: any) {
      setError(mapAuthError(err, 'email'));
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'apple' | 'anonymous') => {
    if (!isFirebaseActive && provider !== 'anonymous') {
      setError('Firebase is not configured correctly. The firebase-applet-config.json file may be missing or contains invalid credentials. Please provision Firebase or configure your database keys under Settings.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else if (provider === 'apple') {
        await loginWithApple();
      } else {
        await loginAnonymously();
      }
      setSuccess('Connected successfully!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(mapAuthError(err, provider));
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      await triggerSync(true); // Force upload to cloud
      setSuccess('Progress backed up to cloud!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    try {
      const dataStr = exportProgressAsJSON();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `typesprint_backup_${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      setError('Export failed');
    }
  };

  const handleRestore = () => {
    if (!pasteBackup.trim()) return;
    const restored = restoreProgressFromJSON(pasteBackup);
    if (restored) {
      onUpdateAllData(restored);
      setBackupStatus('success');
      setPasteBackup('');
      setTimeout(() => setBackupStatus('idle'), 3000);
    } else {
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-black text-slate-800 dark:text-zinc-100 flex items-center gap-1.5 uppercase tracking-wide">
              {user && !isAnonymous ? 'Cloud Profile Stance' : 'Cloud Sync Account'}
            </h2>
            <p className="text-[10px] text-slate-400">
              {user && !isAnonymous ? 'Synchronize typing stats, achievements, & cosmetics' : 'Sign in to safeguard your tactile progression'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700 dark:text-zinc-300 font-sans">
          
          {/* Current Account Status Indicator */}
          <div className="mb-4 p-3.5 rounded-2xl border flex items-center justify-between gap-3 bg-slate-50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl flex items-center justify-center ${user && !isAnonymous ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {user && !isAnonymous ? (
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-[11px] uppercase tracking-wide">
                  Account Status
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {user && !isAnonymous 
                    ? `Signed in: ${user.displayName || user.email || 'Cloud User'}` 
                    : isAnonymous 
                      ? 'Guest Mode (Anonymous Session)' 
                      : 'Offline Guest Mode (Unauthenticated)'}
                </span>
              </div>
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
              user && !isAnonymous 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              {user && !isAnonymous ? 'Signed In' : 'Guest'}
            </span>
          </div>

          {/* Status Banners */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-2.5 text-red-500">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold leading-tight">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5 text-emerald-500">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold leading-tight">{success}</p>
            </div>
          )}

          {/* User state check */}
          {user && !isAnonymous ? (
            /* Signed In Stance */
            <div className="flex flex-col gap-5">
              
              {/* Profile Card */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 border border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center font-black text-lg text-zinc-950 font-mono">
                    {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-100 flex items-center gap-2">
                      {user.displayName || 'Cloud Typist'}
                    </h3>
                    <p className="text-[10px] text-slate-400">{user.email || 'No email attached'}</p>
                  </div>
                </div>
              </div>

              {/* Profile Fields for syncing */}
              <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-150 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-500" /> Supplemental Profile details
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-500 dark:text-zinc-400">Username:</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold">
                      {profile?.username || 'Not configured'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-500 dark:text-zinc-400">Input System:</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold uppercase">
                      {profile.typingMode === 'external_keyboard' ? 'External Keyboard' : 'Mobile Device'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-500 dark:text-zinc-400">Country:</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold">
                      {profile.country || 'United States'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-500 dark:text-zinc-400">Language:</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold">
                      {profile.preferredLanguage || 'English'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Synchronization Actions */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cloud Sync Stance Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleManualSync}
                    disabled={syncing}
                    className="flex items-center justify-center gap-2 py-2.5 bg-amber-500 disabled:bg-amber-500/50 text-zinc-950 font-bold rounded-xl shadow hover:scale-102 active:scale-98 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-750 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Local Backup</span>
                  </button>
                </div>
              </div>

              {/* Manual JSON Restore */}
              <div className="border-t border-slate-150 dark:border-zinc-800 pt-4 mt-1 flex flex-col gap-2">
                <label className="font-bold text-slate-600 dark:text-zinc-400 block">Manual Restore Backup (Paste JSON):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pasteBackup}
                    onChange={(e) => setPasteBackup(e.target.value)}
                    placeholder='Paste backup JSON text here...'
                    className="flex-grow bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-[10px] font-mono focus:outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-100"
                  />
                  <button
                    onClick={handleRestore}
                    disabled={!pasteBackup.trim()}
                    className="px-3 py-2 bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-750 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    Restore
                  </button>
                </div>
                {backupStatus === 'success' && (
                  <p className="text-[10px] font-bold text-emerald-500">✓ Progress restored successfully!</p>
                )}
                {backupStatus === 'error' && (
                  <p className="text-[10px] font-bold text-rose-500">✗ Failed to restore. Invalid backup structure.</p>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                onClick={async () => {
                  try {
                    await logout();
                    setSuccess('Signed out successfully.');
                    setTimeout(() => {
                      setSuccess(null);
                      onClose();
                    }, 1000);
                  } catch (err: any) {
                    setError('Logout failed');
                  }
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl font-bold transition-all text-center cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out from Device</span>
              </button>
            </div>
          ) : (
            /* Guest / Unauthenticated Mode - Do NOT hide the authentication forms! */
            <div>
              
              {/* Tabs */}
              <div className="flex bg-slate-50 dark:bg-zinc-950/40 p-1 border border-slate-150 dark:border-zinc-800 rounded-2xl select-none mb-4">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-grow py-2 text-center rounded-xl font-bold transition-all cursor-pointer ${
                    mode === 'login' 
                      ? 'bg-amber-500 text-zinc-950 font-black' 
                      : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-grow py-2 text-center rounded-xl font-bold transition-all cursor-pointer ${
                    mode === 'signup' 
                      ? 'bg-amber-500 text-zinc-950 font-black' 
                      : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className={`flex-grow py-2 text-center rounded-xl font-bold transition-all cursor-pointer ${
                    mode === 'forgot' 
                      ? 'bg-amber-500 text-zinc-950 font-black' 
                      : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  Reset
                </button>
              </div>

              {/* Interactive forms */}
              <AnimatePresence mode="wait">
                {mode === 'login' && (
                  <motion.form 
                    key="login-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleLogin}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pilot@typesprint.com"
                        className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-100 font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-100 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black rounded-xl shadow-md active:scale-98 transition-all disabled:opacity-50 uppercase tracking-wide cursor-pointer"
                    >
                      {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                  </motion.form>
                )}

                {mode === 'signup' && (
                  <motion.form 
                    key="signup-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleSignup}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Display Nickname
                      </label>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Tactile Pilot"
                        className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-100 font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Desired Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="tactile_pilot"
                        className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-100 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> Country
                        </label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="United States"
                          className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-100 font-bold text-[11px]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                          <Languages className="w-3.5 h-3.5" /> Language
                        </label>
                        <input
                          type="text"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          placeholder="English"
                          className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-100 font-bold text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pilot@typesprint.com"
                        className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-100 font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-100 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black rounded-xl shadow-md active:scale-98 transition-all disabled:opacity-50 uppercase tracking-wide cursor-pointer"
                    >
                      {loading ? 'Registering...' : 'Create Account'}
                    </button>
                  </motion.form>
                )}

                {mode === 'forgot' && (
                  <motion.form 
                    key="forgot-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleForgotPassword}
                    className="flex flex-col gap-3"
                  >
                    <div className="p-3 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 rounded-2xl flex items-start gap-2 text-slate-500 dark:text-zinc-400">
                      <Key className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                      <p className="text-[10px] leading-snug font-sans">
                        Enter your registered email address below, and we will dispatch a safe, temporary password reset link directly to your inbox.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pilot@typesprint.com"
                        className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 rounded-xl focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black rounded-xl shadow-md active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Sending link...' : 'Send Password Reset Link'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Federated Authentication Dividers */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-150 dark:border-zinc-800"></div>
                </div>
                <span className="relative bg-white dark:bg-zinc-900 px-4 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                  Or authenticating with
                </span>
              </div>

              {/* Provider Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={() => handleProviderLogin('google')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 font-bold transition-all shadow-sm cursor-pointer text-slate-700 dark:text-zinc-200"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#ea4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.281 1.956 15.485 1 12.24 1 5.48 1 0 6.48 0 13.2s5.48 12.2 12.24 12.2c7.055 0 11.75-4.965 11.75-11.95 0-.805-.085-1.415-.19-1.926H12.24z"/>
                  </svg>
                  <span>Google</span>
                </button>

                {/* Apple Sign In */}
                <button
                  type="button"
                  onClick={() => handleProviderLogin('apple')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 font-bold transition-all shadow-sm cursor-pointer text-slate-700 dark:text-zinc-200"
                >
                  <svg className="w-4 h-4 fill-current text-slate-800 dark:text-slate-100" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94.1.08 1.15.08 2.81-1.33z"/>
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>

              {/* Continue / Play as Guest Connection or Exit Guest Session */}
              <div className="flex flex-col gap-2 mt-6">
                <button
                  type="button"
                  onClick={async () => {
                    if (!user) {
                      await handleProviderLogin('anonymous');
                    } else {
                      onClose();
                    }
                  }}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-2xl font-black shadow-md transition-all text-center cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  <span>🚀 Continue as Guest</span>
                </button>

                {isAnonymous && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await logout();
                        setSuccess('Guest session ended successfully.');
                        setTimeout(() => {
                          setSuccess(null);
                          onClose();
                        }, 1000);
                      } catch (err: any) {
                        setError('Failed to end guest session.');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl font-bold transition-all text-center cursor-pointer text-[10px]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out (End Guest Session)</span>
                  </button>
                )}
              </div>
            </div>
          )}
          
        </div>
      </motion.div>
    </div>
  );
};
