import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, BookOpen, FileText, GraduationCap, Gamepad2, Gift, 
  Trophy, Sparkle, BarChart2, User, Sparkles, Volume2, VolumeX, 
  Smartphone, Keyboard, Play, ChevronLeft, ChevronRight, ChevronDown, Lock, 
  CheckCircle2, Clock, Activity, RotateCcw, Award, AlertCircle,
  Menu, X, Settings
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  UserProfile, TypingStats, Achievement, KeyboardSettings, DailyChallenge, Lesson 
} from './types';
import { 
  loadProfile, saveProfile, loadStats, saveStats, loadAchievements, 
  saveAchievements, loadSettings, saveSettings, loadDailyChallenges, 
  processSessionCompletion, isLessonUnlocked, getLessonProgress 
} from './utils/storage';
import { LESSONS } from './data/lessons';

// Dashboard Components
import { HomeDashboard } from './components/HomeDashboard';
import { ParagraphHubDashboard } from './components/ParagraphHubDashboard';
import { ExamHubDashboard } from './components/ExamHubDashboard';
import { TypingEngine } from './components/TypingEngine';
import { StatsDashboard } from './components/StatsDashboard';
import { ProfileDashboard } from './components/ProfileDashboard';
import { RewardHub } from './components/RewardHub';
import { LeaderboardsDashboard } from './components/LeaderboardsDashboard';
import { AiCoachDashboard } from './components/AiCoachDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { AuthModal } from './components/AuthModal';
import { AccountBottomSheet } from './components/AccountBottomSheet';
import { BetaFeedbackModal } from './components/BetaFeedbackModal';
import { LessonDetails } from './components/LessonDetails';
import { GameZone } from './components/GameZone';

const PASSAGES = [
  {
    id: '1',
    title: 'The Sprinting Mind',
    text: 'Typing is a skill of coordination where muscle memory meets rapid thought. When you type, your fingers glide across the keys as if playing a piano. Practice builds speed, but consistency builds precision. Every keystroke is a silent whisper in the digital ocean of letters, words, and thoughts.',
    difficulty: 'Easy' as const,
  },
  {
    id: '2',
    title: 'A Tale of Technology',
    text: 'Modern computers operate on billions of tiny transistors firing at the speed of light. Writing code is the modern equivalent of magic, turning ideas into logical paths that shape our everyday world. From the simplest loop to complex AI networks, technology is the ultimate magnifier of human potential and design.',
    difficulty: 'Medium' as const,
  },
  {
    id: '3',
    title: 'The Great Exploration',
    text: 'In the depth of space, countless celestial bodies dance in a cosmic choreography governed by gravitational forces. Stars burn through billions of years of nuclear fusion, scattering heavy elements across the void to eventually form planets, oceans, and living organisms. We are, quite literally, stardust exploring the universe.',
    difficulty: 'Hard' as const,
  }
];

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

function MainAppContent() {
  const { user, isAnonymous, logout } = useAuth();
  const isCloudActive = !!user && !isAnonymous;

  // Active Screen & Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'lessons' | 'practice' | 'exams' | 'profile' | 'rewards' | 'leaderboards' | 'coach' | 'analytics' | 'game' | 'test' | 'settings'>('home');
  const [activeSession, setActiveSession] = useState<{ type: 'lesson' | 'test' | 'custom'; title: string; lessonData?: Lesson; customText?: string; timeLimit?: number } | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Storage-backed states
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [stats, setStats] = useState<TypingStats>(() => loadStats());
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadAchievements());
  const [settings, setSettings] = useState<KeyboardSettings>(() => loadSettings());
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(() => loadDailyChallenges());

  // Collapsible category triggers for Lessons listing
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Speed test selector configurations
  const [selectedPassage, setSelectedPassage] = useState(PASSAGES[0]);
  const [selectedDuration, setSelectedDuration] = useState(60); // 1 minute default

  // Modals / sheets
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Layout preference overrides
  const [isPortrait, setIsPortrait] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync state helpers on mount and during events
  useEffect(() => {
    const handleSyncComplete = () => {
      setProfile(loadProfile());
      setStats(loadStats());
      setAchievements(loadAchievements());
      setDailyChallenges(loadDailyChallenges());
    };

    const handleLogout = () => {
      setProfile(loadProfile());
      setStats(loadStats());
      setAchievements(loadAchievements());
      setDailyChallenges(loadDailyChallenges());
    };

    window.addEventListener('typesprint_sync_complete', handleSyncComplete);
    window.addEventListener('typesprint_logout', handleLogout);
    return () => {
      window.removeEventListener('typesprint_sync_complete', handleSyncComplete);
      window.removeEventListener('typesprint_logout', handleLogout);
    };
  }, []);

  // Theme support
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleAudio = () => {
    const updated = { 
      ...settings, 
      soundType: (settings.soundType === 'mute' ? 'mechanical' : 'mute') as any 
    };
    setSettings(updated);
    saveSettings(updated);
    setAudioMuted(updated.soundType === 'mute');
  };

  // Callback navigations mapping
  const handleNavigateToTab = (tab: string) => {
    setSelectedLesson(null);
    setMobileMenuOpen(false);
    if (tab === 'home') setActiveTab('home');
    else if (tab === 'practice') setActiveTab('practice');
    else if (tab === 'exams') setActiveTab('exams');
    else if (tab === 'rewards') setActiveTab('rewards');
    else if (tab === 'profile') setActiveTab('profile');
    else if (tab === 'leaderboards') setActiveTab('leaderboards');
    else if (tab === 'coach') setActiveTab('coach');
    else if (tab === 'analytics') setActiveTab('analytics');
    else if (tab === 'lessons') setActiveTab('lessons');
    else if (tab === 'game') setActiveTab('game');
    else if (tab === 'settings') setActiveTab('settings');
  };

  // Speed test initiation trigger
  const handleStartSpeedTest = (timeLimit: number) => {
    const p = PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
    setActiveSession({
      type: 'test',
      title: p.title,
      customText: p.text,
      timeLimit: timeLimit,
    });
  };

  const handleParagraphComplete = (results: any) => {
    setProfile(loadProfile());
    setStats(loadStats());
    setAchievements(loadAchievements());
    setDailyChallenges(loadDailyChallenges());
  };

  const handleExamComplete = (results: any) => {
    setProfile(loadProfile());
    setStats(loadStats());
    setAchievements(loadAchievements());
    setDailyChallenges(loadDailyChallenges());
  };

  const handleGameComplete = (xpGained: number, coinsGained: number, wpm: number, accuracy: number, gameTitle: string) => {
    processSessionCompletion({
      type: 'game',
      title: gameTitle,
      wpm: wpm,
      accuracy: accuracy,
      timeSpentSeconds: 60,
      mistakesCount: 0,
      totalKeysPressed: Math.round(wpm * 5),
      correctCharacters: Math.round(wpm * 5 * (accuracy / 100)),
      incorrectCharacters: 0,
    });

    setProfile(loadProfile());
    setStats(loadStats());
    setAchievements(loadAchievements());
    setDailyChallenges(loadDailyChallenges());
  };

  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Render Lessons tab curriculum list
  const renderLessonsList = () => {
    const categories: Array<{ id: string; name: string; desc: string }> = [
      { id: 'home_row', name: 'Home Row Drills', desc: 'Master anchor finger positioning, G, and H keys.' },
      { id: 'top_row', name: 'Top Row Drills', desc: 'Train stretching upward with rings, pinkies, and middle fingers.' },
      { id: 'bottom_row', name: 'Bottom Row Drills', desc: 'Conquer the trickiest finger drops on the keyboard.' },
      { id: 'numbers', name: 'Number Row Drills', desc: 'Build blind reach stability on 1 to 0 keys.' },
      { id: 'symbols', name: 'Special Symbol Drills', desc: 'Master shift keys, brackets, punctuation, and modifiers.' },
      { id: 'sentences', name: 'Sentences & Quotes', desc: 'Build organic transition flows between arbitrary words.' },
      { id: 'coding', name: 'Coding Playground', desc: 'Type production-ready React hooks, loops, and HTML tags.' },
      { id: 'email', name: 'Business Transcripts', desc: 'Simulate high-stakes office messaging and formal correspondence.' }
    ];

    return (
      <div className="flex flex-col gap-6" id="lessons_tab_viewport">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" /> progressive typing curriculum
          </h2>
          <p className="text-xs text-slate-400 mt-1">Unlock next-level lessons sequentially by completing previous drills.</p>
        </div>

        <div className="flex flex-col gap-4">
          {categories.map((cat) => {
            const catLessons = LESSONS.filter(l => l.category === cat.id);
            const isCollapsed = !!collapsedCategories[cat.id];
            
            return (
              <div 
                key={cat.id} 
                className="bg-white dark:bg-zinc-900 border border-slate-200/40 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleCategoryCollapse(cat.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-all cursor-pointer border-b border-transparent dark:border-transparent"
                >
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{cat.desc}</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>

                {!isCollapsed && (
                  <div className="p-4 border-t border-slate-100 dark:border-zinc-800/40 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {catLessons.map((lesson) => {
                      const isUnlocked = isLessonUnlocked(lesson.id, LESSONS);
                      const progress = getLessonProgress(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            if (isUnlocked) {
                              setSelectedLesson(lesson);
                            }
                          }}
                          className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden ${
                            isUnlocked 
                              ? 'bg-slate-50/50 dark:bg-zinc-950/20 border-slate-200/60 dark:border-zinc-800/60 hover:border-amber-500/40 dark:hover:border-amber-500/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer' 
                              : 'bg-slate-100/40 dark:bg-zinc-900/40 border-slate-200/20 dark:border-zinc-800/20 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200 line-clamp-1">{lesson.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{lesson.description}</p>
                            </div>
                            <div className="shrink-0">
                              {isUnlocked ? (
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                  lesson.difficulty === 'Beginner' 
                                    ? 'bg-emerald-500/10 text-emerald-500' 
                                    : lesson.difficulty === 'Intermediate' 
                                      ? 'bg-amber-500/10 text-amber-500' 
                                      : 'bg-rose-500/10 text-rose-500'
                                }`}>
                                  {lesson.difficulty}
                                </span>
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                          </div>

                          {isUnlocked && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 mb-1">
                                <span>PROGRESSION:</span>
                                <span className="font-mono">{progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-slate-200/20 dark:border-zinc-800/20">
                                <div 
                                  className="bg-amber-500 h-full rounded-full transition-all duration-300" 
                                  style={{ width: `${progress}%` }} 
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Speed Tests selector view
  const renderSpeedTestsView = () => {
    return (
      <div className="flex flex-col gap-6" id="speed_test_tab_viewport">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-500" /> Tactile Velocity Assessment
          </h2>
          <p className="text-xs text-slate-400 mt-1">Select a typing passage difficulty and practice duration to launch your clock test.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/40 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Select Passage Challenge</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PASSAGES.map((p) => {
                  const isSelected = selectedPassage.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPassage(p)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-amber-500/10 border-amber-500/40 dark:border-amber-500/30' 
                          : 'bg-slate-50/50 dark:bg-zinc-950/20 border-slate-200/60 dark:border-zinc-800/60 hover:border-slate-300'
                      }`}
                    >
                      <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100 line-clamp-1">{p.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{p.difficulty} MODE</p>
                      <div className="text-[9px] text-slate-500 mt-2 font-mono line-clamp-2 leading-relaxed select-none">
                        {p.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200/40 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Configure Test Timer</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 30, label: '30 Sec' },
                  { value: 60, label: '1 Min' },
                  { value: 120, label: '2 Min' },
                  { value: 300, label: '5 Min' },
                ].map((d) => {
                  const isSelected = selectedDuration === d.value;
                  return (
                    <button
                      key={d.value}
                      onClick={() => setSelectedDuration(d.value)}
                      className={`py-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-500 text-zinc-950 border-amber-500 font-black shadow-md' 
                          : 'bg-slate-50/50 dark:bg-zinc-950/20 border-slate-200/60 dark:border-zinc-800/60 hover:bg-slate-50 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/40 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Evaluation Rules</h3>
              <ul className="text-[10px] text-slate-500 leading-normal flex flex-col gap-2 list-disc pl-4 text-left">
                <li>Gross WPM measures raw keystroke speed (5 key presses = 1 word).</li>
                <li>Net WPM applies strict correction penalization.</li>
                <li>Accuracy must stay above 92% to level up your Profile index.</li>
                <li>Ensure high focus on spelling and correct casing.</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setActiveSession({
                  type: 'test',
                  title: selectedPassage.title,
                  customText: selectedPassage.text,
                  timeLimit: selectedDuration
                });
              }}
              className="w-full py-4.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs uppercase rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-zinc-950" /> LAUNCH TYPING RUN
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveView = () => {
    if (activeSession) {
      return (
        <TypingEngine
          sessionType={activeSession.type}
          title={activeSession.title}
          lessonData={activeSession.lessonData}
          customText={activeSession.customText}
          timeLimit={activeSession.timeLimit}
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
          }}
          onSessionComplete={(results) => {
            processSessionCompletion({
              type: activeSession.type,
              title: activeSession.title,
              wpm: results.wpm,
              accuracy: results.accuracy,
              timeSpentSeconds: activeSession.timeLimit || 60,
              mistakesCount: results.mistakesCount,
              totalKeysPressed: Math.round(results.wpm * 5),
              correctCharacters: Math.round(results.wpm * 5 * (results.accuracy / 100)),
              incorrectCharacters: results.mistakesCount,
            });

            setProfile(loadProfile());
            setStats(loadStats());
            setAchievements(loadAchievements());
            setDailyChallenges(loadDailyChallenges());
            
           
          }}
          onExit={() => {
            setActiveSession(null);
          }}
          onOpenFeedback={() => {
            setFeedbackModalOpen(true);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeDashboard
            stats={stats}
            profile={profile}
            dailyChallenges={dailyChallenges}
            onStartLesson={(lesson) => {
              setSelectedLesson(lesson);
              setActiveTab('lessons');
            }}
            onNavigateToTab={handleNavigateToTab}
            onStartSpeedTest={handleStartSpeedTest}
            simulatedConnection={settings.simulatedConnection}
            isAuthenticated={!!user}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onOpenAccountSheet={() => setAccountSheetOpen(true)}
            isCloudActive={isCloudActive}
          />
        );
      case 'lessons':
        if (selectedLesson) {
          return (
            <LessonDetails
              lesson={selectedLesson}
              stats={stats}
              profile={profile}
              onBack={() => setSelectedLesson(null)}
              onStartPractice={(l) => {
                setActiveSession({
                  type: 'lesson',
                  title: l.title,
                  lessonData: l
                });
              }}
              onNavigateToLesson={(l) => setSelectedLesson(l)}
            />
          );
        }
        return renderLessonsList();
      case 'practice':
        return (
          <ParagraphHubDashboard
            profile={profile}
            stats={stats}
            settings={settings}
            onSessionComplete={handleParagraphComplete}
          />
        );
      case 'exams':
        return (
          <ExamHubDashboard
            settings={settings}
            profile={profile}
            onSessionComplete={handleExamComplete}
            onNavigateToTab={handleNavigateToTab}
          />
        );
      case 'game':
        return (
          <GameZone
            profile={profile}
            stats={stats}
            settings={settings}
            onUpdateStatsAndProfile={handleGameComplete}
            onNavigateToTab={handleNavigateToTab}
          />
        );
      case 'rewards':
        return (
          <RewardHub
            profile={profile}
            stats={stats}
            settings={settings}
            achievements={achievements}
            dailyChallenges={dailyChallenges}
            onUpdateProfile={(p) => { setProfile(p); saveProfile(p); }}
            onUpdateStats={(s) => { setStats(s); saveStats(s); }}
            onUpdateAchievements={(a) => { setAchievements(a); saveAchievements(a); }}
            onNavigateToTab={handleNavigateToTab}
          />
        );
      case 'leaderboards':
        return (
          <LeaderboardsDashboard
            profile={profile}
            stats={stats}
            onTriggerRace={(text, title) => {
              setActiveSession({
                type: 'custom',
                title: title,
                customText: text,
                timeLimit: 120
              });
            }}
          />
        );
      case 'coach':
        return (
          <AiCoachDashboard
            stats={stats}
            profile={profile}
          />
        );
      case 'analytics':
        return (
          <StatsDashboard
            stats={stats}
            onStatsReset={() => {
              setStats(loadStats());
            }}
          />
        );
      case 'profile':
        return (
          <ProfileDashboard
            profile={profile}
            stats={stats}
            achievements={achievements}
            settings={settings}
            onUpdateProfile={(p) => { setProfile(p); saveProfile(p); }}
            onUpdateSettings={(s) => { setSettings(s); saveSettings(s); }}
          />
        );
      case 'test':
        return renderSpeedTestsView();
      case 'settings':
        return (
          <SettingsPanel
            settings={settings}
            profile={profile}
            onUpdateSettings={(s) => { setSettings(s); saveSettings(s); }}
            onUpdateProfile={(p) => { setProfile(p); saveProfile(p); }}
            onResetProgress={() => {
              localStorage.removeItem('typesprint_profile');
              localStorage.removeItem('typesprint_stats');
              localStorage.removeItem('typesprint_achievements');
              localStorage.removeItem('typesprint_daily_challenges');
              localStorage.removeItem('completed_lessons');
              localStorage.removeItem('lesson_progress');
              setProfile(loadProfile());
              setStats(loadStats());
              setAchievements(loadAchievements());
              setDailyChallenges(loadDailyChallenges());
            }}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onOpenFeedback={() => setFeedbackModalOpen(true)}
          />
        );
      default:
        return <div className="p-4 text-center">Dashboard screen coming soon!</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col md:flex-row relative overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-zinc-900 border-r border-slate-200/60 dark:border-zinc-800/60 flex flex-col shrink-0 transition-all duration-300 ease-in-out
        ${isPortrait ? 'fixed' : 'md:static md:translate-x-0'}
        ${isSidebarCollapsed ? 'md:w-20 w-64' : 'w-64'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo / Title */}
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-amber-500 shrink-0">
              <Keyboard className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="animate-fade-in">
                <span className="text-sm font-black tracking-tight text-slate-800 dark:text-zinc-100 block font-display">TypeSprint PRO</span>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block font-mono">Tactile Trainer</span>
              </div>
            )}
          </div>
          {/* Collapse/Expand toggle for Tablet/Desktop */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 rounded-lg text-slate-500 dark:text-zinc-400 cursor-pointer border border-slate-200/50 dark:border-zinc-800/50"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 rounded-lg text-slate-500 dark:text-zinc-400 cursor-pointer"
            title="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <nav className="flex-grow p-4 flex flex-col gap-1 overflow-y-auto">
          {[
            { id: 'home', label: 'Home', icon: LayoutDashboard },
            { id: 'lessons', label: 'Lessons', icon: BookOpen },
            { id: 'practice', label: 'Paragraph Hub', icon: FileText },
            { id: 'exams', label: 'Govt Exam Hub', icon: GraduationCap },
            { id: 'game', label: 'Game Zone', icon: Gamepad2 },
            { id: 'rewards', label: 'Reward Hub', icon: Gift },
            { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
            { id: 'coach', label: 'AI Coach', icon: Sparkle },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'test', label: 'Speed Tests', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedLesson(null);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center transition-all text-left cursor-pointer group ${
                  isSidebarCollapsed 
                    ? 'md:justify-center md:p-3 p-3.5 gap-3 rounded-xl' 
                    : 'gap-3 px-3.5 py-2.5 rounded-xl'
                } ${
                  isActive 
                    ? 'bg-amber-500 dark:bg-amber-500/10 text-zinc-950 dark:text-amber-400 shadow-sm border border-amber-500/20' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
                title={isSidebarCollapsed ? tab.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-950 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300'}`} />
                {(!isSidebarCollapsed) && <span className="text-xs font-bold block">{tab.label}</span>}
                {(isSidebarCollapsed) && <span className="text-xs font-bold md:hidden block">{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer controls & Settings */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800/40 flex flex-col gap-3 shrink-0">
          <div className={`grid gap-1.5 ${isSidebarCollapsed ? 'md:grid-cols-1 grid-cols-3' : 'grid-cols-3'}`}>
            <button
              title="Toggle Dark/Light Mode"
              onClick={toggleTheme}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/80 border border-slate-200/40 dark:border-zinc-800/40 rounded-xl flex items-center justify-center transition-all cursor-pointer text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              title="Mute Audio Feedback"
              onClick={toggleAudio}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/80 border border-slate-200/40 dark:border-zinc-800/40 rounded-xl flex items-center justify-center transition-all cursor-pointer text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100"
            >
              {audioMuted ? <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              title="Toggle Screen Orientation"
              onClick={() => setIsPortrait(!isPortrait)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/80 border border-slate-200/40 dark:border-zinc-800/40 rounded-xl flex items-center justify-center transition-all cursor-pointer text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setActiveTab('profile');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center bg-slate-50/50 hover:bg-slate-50 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/40 border border-slate-200/30 dark:border-zinc-800/30 rounded-xl cursor-pointer transition-all overflow-hidden ${
              isSidebarCollapsed ? 'md:justify-center md:p-1.5 p-1.5 gap-2.5' : 'gap-2.5 p-1.5 text-left'
            }`}
            title={isSidebarCollapsed ? `${profile.name} (Level ${profile.level})` : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center font-black font-mono text-xs shrink-0">
              {profile.name ? profile.name[0].toUpperCase() : 'G'}
            </div>
            {(!isSidebarCollapsed) && (
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black text-slate-700 dark:text-zinc-250 block truncate leading-none">{profile.name}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1 font-mono">Level {profile.level}</span>
              </div>
            )}
            {(isSidebarCollapsed) && (
              <div className="min-w-0 flex-1 md:hidden block">
                <span className="text-[10px] font-black text-slate-700 dark:text-zinc-250 block truncate leading-none">{profile.name}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1 font-mono">Level {profile.level}</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-grow flex-shrink-0 flex flex-col h-screen min-w-0 bg-slate-50 dark:bg-zinc-950 w-full md:w-auto">
        {/* Top bar for small screens */}
        <header className={`bg-white dark:bg-zinc-900 border-b border-slate-200/60 dark:border-zinc-800/60 p-3 items-center justify-between z-10 shrink-0 ${isPortrait ? 'flex' : 'md:hidden flex'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 rounded-lg text-slate-500 dark:text-zinc-400 cursor-pointer"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-xs">TypeSprint PRO</span>
            </div>
          </div>
          
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-1.5 p-1 bg-slate-50/50 hover:bg-slate-50 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/40 border border-slate-200/30 dark:border-zinc-800/30 rounded-lg text-left cursor-pointer transition-all"
            title="View Profile"
          >
            <div className="w-6 h-6 rounded bg-amber-500 text-zinc-950 flex items-center justify-center font-black font-mono text-[10px]">
              {profile.name ? profile.name[0].toUpperCase() : 'G'}
            </div>
            <span className="text-[9px] font-black text-slate-700 dark:text-zinc-200 truncate max-w-[80px] hidden sm:block">
              {profile.name}
            </span>
          </button>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-grow p-4 md:p-6 min-h-0 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </div>
      </main>

      {/* Modals & sheets */}
      <AnimatePresence>
        {authModalOpen && (
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            profile={profile}
            stats={stats}
            achievements={achievements}
            settings={settings}
            onUpdateAllData={(data) => {
              setProfile(data.profile);
              setStats(data.stats);
              setAchievements(data.achievements);
              setSettings(data.settings);
            }}
          />
        )}
        {accountSheetOpen && (
          <AccountBottomSheet
            isOpen={accountSheetOpen}
            onClose={() => setAccountSheetOpen(false)}
            profile={profile}
            stats={stats}
            isCloudActive={isCloudActive}
            isDarkMode={document.documentElement.classList.contains('dark')}
            onToggleTheme={toggleTheme}
            onNavigateToTab={(tab) => {
              handleNavigateToTab(tab);
              setAccountSheetOpen(false);
            }}
            onOpenAuthModal={(mode) => {
              setAuthModalOpen(true);
              setAccountSheetOpen(false);
            }}
            onLogout={() => {
              logout();
              setAccountSheetOpen(false);
            }}
            onSwitchAccount={() => {
              setAuthModalOpen(true);
              setAccountSheetOpen(false);
            }}
            accentTheme={settings.theme}
          />
        )}
        {feedbackModalOpen && (
          <BetaFeedbackModal
            isOpen={feedbackModalOpen}
            onClose={() => setFeedbackModalOpen(false)}
            profile={profile}
            settings={settings}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
