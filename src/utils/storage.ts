/* v8 ignore start */
import { TypingStats, Achievement, DailyChallenge, UserProfile, TypingSessionResult, KeyboardSettings } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_lesson',
    title: 'First Lesson',
    description: 'Launch and complete your first typing lesson successfully.',
    xpReward: 100,
    coinsReward: 50,
    category: 'Beginner',
    icon: 'Play',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'words_1000',
    title: '1000 Words',
    description: 'Type a total of 1,000 words across all drills and matches.',
    xpReward: 200,
    coinsReward: 100,
    category: 'Volume',
    icon: 'Keyboard',
    unlocked: false,
    progress: 0,
    maxProgress: 1000
  },
  {
    id: 'lessons_10',
    title: '10 Lessons',
    description: 'Complete 10 progressive keyboard practice drills.',
    xpReward: 300,
    coinsReward: 150,
    category: 'Training',
    icon: 'Calendar',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'wpm_100',
    title: '100 WPM',
    description: 'Achieve a blazing speed of 100 WPM in a speed test.',
    xpReward: 500,
    coinsReward: 300,
    category: 'Speed',
    icon: 'Crown',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'streak_7',
    title: '7-Day Streak',
    description: 'Practice for 7 consecutive days to build muscle memory.',
    xpReward: 400,
    coinsReward: 200,
    category: 'Consistency',
    icon: 'Flame',
    unlocked: false,
    progress: 0,
    maxProgress: 7
  },
  {
    id: 'streak_30',
    title: '30-Day Streak',
    description: 'Practice for 30 consecutive days to master tactile speed.',
    xpReward: 1000,
    coinsReward: 500,
    category: 'Consistency',
    icon: 'Flame',
    unlocked: false,
    progress: 0,
    maxProgress: 30
  },
  {
    id: 'perfect_acc',
    title: 'Perfect Accuracy',
    description: 'Complete any test or drill with a flawless 100% accuracy.',
    xpReward: 300,
    coinsReward: 150,
    category: 'Precision',
    icon: 'Target',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Log a session and type late at night (between 10 PM and 5 AM).',
    xpReward: 200,
    coinsReward: 100,
    category: 'Endurance',
    icon: 'Hourglass',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Cross the 80 WPM milestone on an external keyboard.',
    xpReward: 450,
    coinsReward: 250,
    category: 'Speed',
    icon: 'Award',
    unlocked: false,
    progress: 0,
    maxProgress: 80
  }
];

export const INITIAL_STATS: TypingStats = {
  bestWpm: 0,
  avgWpm: 0,
  bestAccuracy: 0,
  avgAccuracy: 0,
  totalSessions: 0,
  totalMinutes: 0,
  totalCorrectKeystrokes: 0,
  totalIncorrectKeystrokes: 0,
  totalAccuracy: 0,
  lifetimeAccuracy: 0,
  streak: 1,
  longestStreak: 1,
  lastPracticeDate: null,
  mistypedKeys: {},
  history: []
};

export const INITIAL_PROFILE: UserProfile = {
  xp: 0,
  level: 1,
  name: 'Tactile Pilot',
  coins: 500, // Boost starting coins for rich shop interaction
  gems: 15,    // Premium starter gems
  selectedAvatar: 'avatar_1',
  selectedTitle: 'Noob Typist',
  unlockedAvatars: ['avatar_1', 'avatar_2'],
  unlockedTitles: ['Noob Typist', 'Tactile Novice'],
  unlockedThemes: ['Midnight Orange', 'Sunset Gold'],
  unlockedSkins: ['Default Gray'],
  selectedSkin: 'Default Gray',
  
  // Customization defaults
  selectedFrame: 'none',
  selectedNameColor: 'default',
  selectedSfxPack: 'mechanical',
  selectedTypingEffect: 'none',
  selectedCursorStyle: 'pulse',
  selectedFont: 'Inter',
  
  unlockedFrames: ['none'],
  unlockedNameColors: ['default'],
  unlockedSfxPacks: ['mechanical', 'chiclet'],
  unlockedTypingEffects: ['none'],
  unlockedCursorStyles: ['pulse'],
  unlockedFonts: ['Inter'],
  
  // Daily login status
  calendarClaimedDays: [],
  calendarLastClaimDate: '',
  
  // Streaks
  streakDaily: 1,
  streakWeekly: 1,
  streakMonthly: 1,
  streakYearly: 1,
  
  // Battle pass progression
  battlePassXp: 0,
  battlePassTier: 1,
  battlePassPremium: false,
  claimedFreeTiers: [],
  claimedPremiumTiers: [],

  // Multi-Input defaults
  typingMode: 'mobile_keyboard',
  keyboardType: 'none',
  deviceName: 'No Physical Keyboard Connected',
  onboardingCompleted: false
};

export const INITIAL_SETTINGS: KeyboardSettings = {
  layout: 'QWERTY',
  soundType: 'mechanical',
  backspaceEnabled: true,
  simulatedConnection: 'bluetooth',
  showFingerGuide: true,
  blockOnScreenKeyboard: true,
  theme: 'Midnight Orange',
  fontFamily: 'Inter',
  fontSize: 'base',
  hapticEnabled: true,
  language: 'English'
};

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'daily_speed',
    description: 'Achieve 45 WPM or higher in any session today.',
    targetWpm: 45,
    targetAccuracy: 90,
    xpReward: 150,
    coinsReward: 75,
    completed: false
  },
  {
    id: 'daily_accuracy',
    description: 'Achieve 96% accuracy or higher in a 1-minute test.',
    targetWpm: 35,
    targetAccuracy: 96,
    xpReward: 150,
    coinsReward: 75,
    completed: false
  }
];

// LocalStorage helpers
const KEY_PROFILE = 'typesprint_profile';
const KEY_STATS = 'typesprint_stats';
const KEY_ACHIEVEMENTS = 'typesprint_achievements';
const KEY_SETTINGS = 'typesprint_settings';
const KEY_DAILY_CHALLENGES = 'typesprint_daily_challenges';

export function loadProfile(): UserProfile {
  const data = localStorage.getItem(KEY_PROFILE);
  if (!data) return INITIAL_PROFILE;
  try {
    const parsed = JSON.parse(data);
    // Graceful migration merge for profile structure updates
    return {
      ...INITIAL_PROFILE,
      ...parsed,
      unlockedAvatars: parsed.unlockedAvatars || INITIAL_PROFILE.unlockedAvatars,
      unlockedTitles: parsed.unlockedTitles || INITIAL_PROFILE.unlockedTitles,
      unlockedThemes: parsed.unlockedThemes || INITIAL_PROFILE.unlockedThemes,
      unlockedSkins: parsed.unlockedSkins || INITIAL_PROFILE.unlockedSkins,
      
      // Merge new lists with defaults
      unlockedFrames: parsed.unlockedFrames || INITIAL_PROFILE.unlockedFrames,
      unlockedNameColors: parsed.unlockedNameColors || INITIAL_PROFILE.unlockedNameColors,
      unlockedSfxPacks: parsed.unlockedSfxPacks || INITIAL_PROFILE.unlockedSfxPacks,
      unlockedTypingEffects: parsed.unlockedTypingEffects || INITIAL_PROFILE.unlockedTypingEffects,
      unlockedCursorStyles: parsed.unlockedCursorStyles || INITIAL_PROFILE.unlockedCursorStyles,
      unlockedFonts: parsed.unlockedFonts || INITIAL_PROFILE.unlockedFonts,
      
      calendarClaimedDays: parsed.calendarClaimedDays || INITIAL_PROFILE.calendarClaimedDays,
      claimedFreeTiers: parsed.claimedFreeTiers || INITIAL_PROFILE.claimedFreeTiers,
      claimedPremiumTiers: parsed.claimedPremiumTiers || INITIAL_PROFILE.claimedPremiumTiers,
    };
  } catch {
    return INITIAL_PROFILE;
  }
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(KEY_PROFILE, JSON.stringify(profile));
}

export function loadStats(): TypingStats {
  const data = localStorage.getItem(KEY_STATS);
  if (!data) return INITIAL_STATS;
  try {
    const parsed = JSON.parse(data);
    return {
      ...INITIAL_STATS,
      ...parsed,
      history: parsed.history || []
    };
  } catch {
    return INITIAL_STATS;
  }
}

export function saveStats(stats: TypingStats) {
  localStorage.setItem(KEY_STATS, JSON.stringify(stats));
}

export function loadAchievements(): Achievement[] {
  const data = localStorage.getItem(KEY_ACHIEVEMENTS);
  if (!data) return INITIAL_ACHIEVEMENTS;
  try {
    const loaded: Achievement[] = JSON.parse(data);
    return INITIAL_ACHIEVEMENTS.map(initial => {
      const found = loaded.find(l => l.id === initial.id);
      return found ? { 
        ...initial, 
        unlocked: found.unlocked, 
        progress: found.progress, 
        unlockedAt: found.unlockedAt 
      } : initial;
    });
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveAchievements(achievements: Achievement[]) {
  localStorage.setItem(KEY_ACHIEVEMENTS, JSON.stringify(achievements));
}

export function loadSettings(): KeyboardSettings {
  const data = localStorage.getItem(KEY_SETTINGS);
  if (!data) return INITIAL_SETTINGS;
  try {
    const parsed = JSON.parse(data);
    return {
      ...INITIAL_SETTINGS,
      ...parsed
    };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: KeyboardSettings) {
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
}

export function loadDailyChallenges(): DailyChallenge[] {
  const data = localStorage.getItem(KEY_DAILY_CHALLENGES);
  if (!data) return DAILY_CHALLENGES;
  
  // Reset daily challenges if it is a new day
  const today = new Date().toDateString();
  const lastSavedDate = localStorage.getItem('typesprint_daily_challenges_date');
  
  if (lastSavedDate !== today) {
    localStorage.setItem('typesprint_daily_challenges_date', today);
    localStorage.setItem(KEY_DAILY_CHALLENGES, JSON.stringify(DAILY_CHALLENGES));
    return DAILY_CHALLENGES;
  }
  
  try {
    return JSON.parse(data);
  } catch {
    return DAILY_CHALLENGES;
  }
}

export function saveDailyChallenges(challenges: DailyChallenge[]) {
  localStorage.setItem(KEY_DAILY_CHALLENGES, JSON.stringify(challenges));
}

// Global functions to handle XP and Coin gain
export function addRewards(xpGained: number, coinsGained: number): { profile: UserProfile; leveledUp: boolean } {
  const profile = loadProfile();
  let xp = profile.xp + xpGained;
  let level = profile.level;
  let leveledUp = false;
  let gemsGained = 0;

  while (xp >= level * 300) {
    xp -= level * 300;
    level += 1;
    leveledUp = true;
    gemsGained += 2; // Reward 2 Gems on leveling up!
  }

  // Battle Pass progression
  let bpXp = (profile.battlePassXp || 0) + Math.max(5, Math.round(xpGained / 3));
  let bpTier = profile.battlePassTier || 1;
  while (bpXp >= 100) {
    bpXp -= 100;
    bpTier += 1;
  }

  // Random Gem drops
  if (xpGained > 0 && Math.random() < 0.15) {
    gemsGained += 1;
  }

  const updatedProfile: UserProfile = { 
    ...profile, 
    xp, 
    level, 
    coins: profile.coins + coinsGained,
    gems: (profile.gems || 0) + gemsGained,
    battlePassXp: bpXp,
    battlePassTier: bpTier
  };
  saveProfile(updatedProfile);
  return { profile: updatedProfile, leveledUp };
}

// Main logic when a session is completed
export function processSessionCompletion(
  session: Omit<TypingSessionResult, 'id' | 'date'>
): {
  unlockedAchievements: Achievement[];
  xpGained: number;
  coinsGained: number;
  leveledUp: boolean;
  streakUpdated: boolean;
  newPersonalBest: boolean;
} {
  const stats = loadStats();
  const achievements = loadAchievements();
  const dailyChallenges = loadDailyChallenges();
  const todayStr = new Date().toDateString();
  
  const xpEarnedBase = 60; // baseline completion XP
  const coinsEarnedBase = 15; // baseline completion coins
  
  const newSession: TypingSessionResult = {
    ...session,
    id: `session_${Date.now()}`,
    date: new Date().toLocaleString(),
    coinsEarned: coinsEarnedBase,
    xpEarned: xpEarnedBase
  };

  // 1. Practice History & Basic Stats
  const updatedHistory = [newSession, ...stats.history].slice(0, 150);
  const totalSessions = stats.totalSessions + 1;
  const totalMinutes = stats.totalMinutes + (session.timeSpentSeconds / 60);
  
  const originalBestWpm = stats.bestWpm;
  const bestWpm = Math.max(stats.bestWpm, session.wpm);
  const newPersonalBest = session.wpm > originalBestWpm;
  const avgWpm = Math.round(
    ((stats.avgWpm * stats.totalSessions) + session.wpm) / totalSessions
  );
  const totalAccuracy = Math.round(
    ((stats.totalAccuracy * stats.totalSessions) + session.accuracy) / totalSessions
  );
  
  const bestAccuracy = Math.max(stats.bestAccuracy || 0, session.accuracy);
  const avgAccuracy = Math.round(
    (((stats.avgAccuracy || 0) * stats.totalSessions) + session.accuracy) / totalSessions
  );
  
  const totalCorrectKeystrokes = (stats.totalCorrectKeystrokes || 0) + (session.correctCharacters || 0);
  const totalIncorrectKeystrokes = (stats.totalIncorrectKeystrokes || 0) + (session.incorrectCharacters || 0);
  
  const lifetimeTotal = totalCorrectKeystrokes + totalIncorrectKeystrokes;
  const lifetimeAccuracy = lifetimeTotal > 0 
    ? Math.round((totalCorrectKeystrokes / lifetimeTotal) * 100) 
    : 0;

  // 2. Daily Streak Calculation
  let streak = stats.streak;
  let longestStreak = stats.longestStreak || 1;
  let streakUpdated = false;
  if (stats.lastPracticeDate) {
    const lastDate = new Date(stats.lastPracticeDate);
    const today = new Date();
    
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak += 1;
      if (streak > longestStreak) longestStreak = streak;
      streakUpdated = true;
    } else if (diffDays > 1) {
      streak = 1; // Reset streak
      streakUpdated = true;
    }
  } else {
    streak = 1;
    streakUpdated = true;
  }

  // Save base statistics
  const updatedStats: TypingStats = {
    ...stats,
    bestWpm,
    avgWpm,
    bestAccuracy,
    avgAccuracy,
    totalSessions,
    totalMinutes,
    totalCorrectKeystrokes,
    totalIncorrectKeystrokes,
    totalAccuracy,
    lifetimeAccuracy,
    streak,
    longestStreak,
    lastPracticeDate: new Date().toISOString(),
    history: updatedHistory
  };
  saveStats(updatedStats);

  // 3. Evaluate Achievements
  const newlyUnlocked: Achievement[] = [];
  let xpFromBonus = 0;
  let coinsFromBonus = 0;

  const finalAchievements = achievements.map(ach => {
    if (ach.unlocked) return ach;

    let updatedProgress = ach.progress;
    let unlockCondition = false;

    switch (ach.id) {
      case 'first_lesson':
        updatedProgress = 1;
        unlockCondition = totalSessions >= 1;
        break;
      case 'words_1000':
        {
          const totalWords = updatedHistory.reduce((acc, s) => acc + Math.round(s.totalKeysPressed / 5), 0);
          updatedProgress = Math.min(1000, totalWords);
          unlockCondition = totalWords >= 1000;
        }
        break;
      case 'lessons_10':
        {
          const totalLessons = updatedHistory.filter(s => s.type === 'lesson').length;
          updatedProgress = Math.min(10, totalLessons);
          unlockCondition = totalLessons >= 10;
        }
        break;
      case 'wpm_100':
        updatedProgress = Math.min(100, Math.round(bestWpm));
        unlockCondition = bestWpm >= 100;
        break;
      case 'streak_7':
        updatedProgress = Math.min(7, streak);
        unlockCondition = streak >= 7;
        break;
      case 'streak_30':
        updatedProgress = Math.min(30, streak);
        unlockCondition = streak >= 30;
        break;
      case 'perfect_acc':
        if (session.accuracy === 100) {
          updatedProgress = 100;
          unlockCondition = true;
        }
        break;
      case 'night_owl':
        {
          const hr = new Date().getHours();
          if (hr >= 22 || hr < 5) {
            updatedProgress = 1;
            unlockCondition = true;
          }
        }
        break;
      case 'speed_demon':
        updatedProgress = Math.min(80, Math.round(bestWpm));
        unlockCondition = bestWpm >= 80;
        break;
    }

    if (unlockCondition && !ach.unlocked) {
      newlyUnlocked.push(ach);
      xpFromBonus += ach.xpReward;
      coinsFromBonus += (ach.coinsReward || 50);
      return {
        ...ach,
        progress: ach.maxProgress,
        unlocked: true,
        unlockedAt: todayStr
      };
    }

    return { ...ach, progress: updatedProgress };
  });

  saveAchievements(finalAchievements);

  // 4. Daily Challenges Assessment
  const updatedDailyChallenges = dailyChallenges.map(challenge => {
    if (challenge.completed) return challenge;

    let isCompleted = false;
    if (challenge.id === 'daily_speed') {
      if (session.wpm >= challenge.targetWpm && session.accuracy >= challenge.targetAccuracy) {
        isCompleted = true;
      }
    } else if (challenge.id === 'daily_accuracy') {
      if (session.accuracy >= challenge.targetAccuracy && session.timeSpentSeconds >= 30) {
        isCompleted = true;
      }
    }

    if (isCompleted) {
      xpFromBonus += challenge.xpReward;
      coinsFromBonus += (challenge.coinsReward || 50);
      return { ...challenge, completed: true };
    }
    return challenge;
  });
  saveDailyChallenges(updatedDailyChallenges);

  const totalXpGained = xpEarnedBase + xpFromBonus;
  const totalCoinsGained = coinsEarnedBase + coinsFromBonus;

  // 5. Add rewards to profile
  const { leveledUp } = addRewards(totalXpGained, totalCoinsGained);

  // Trigger sync to cloud
  window.dispatchEvent(new CustomEvent('typesprint_request_sync'));

  return {
    unlockedAchievements: newlyUnlocked,
    xpGained: totalXpGained,
    coinsGained: totalCoinsGained,
    leveledUp,
    streakUpdated,
    newPersonalBest
  };
}

export function registerMistypedKey(key: string) {
  if (key.length !== 1) return;
  const stats = loadStats();
  const k = key.toLowerCase();
  
  const mistypedKeys = { ...stats.mistypedKeys };
  mistypedKeys[k] = (mistypedKeys[k] || 0) + 1;
  
  saveStats({ ...stats, mistypedKeys });
}

export function getCompletedLessons(): string[] {
  try {
    const data = localStorage.getItem('completed_lessons');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function markLessonCompleted(lessonId: string) {
  try {
    const completed = getCompletedLessons();
    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
      localStorage.setItem('completed_lessons', JSON.stringify(completed));
    }
  } catch (e) {
    // ignore
  }
}

export function isLessonUnlocked(lessonId: string, lessonsList: { id: string }[]): boolean {
  const index = lessonsList.findIndex(l => l.id === lessonId);
  if (index <= 0) return true; // First lesson is always unlocked
  
  const prevLesson = lessonsList[index - 1];
  const completed = getCompletedLessons();
  return completed.includes(prevLesson.id);
}


export function getLessonProgress(lessonId: string): number {
  try {
    const data = localStorage.getItem('lesson_progress');
    const progressMap = data ? JSON.parse(data) : {};
    return progressMap[lessonId] || 0;
  } catch (e) {
    return 0;
  }
}

export function saveLessonProgress(lessonId: string, percentage: number) {
  try {
    const data = localStorage.getItem('lesson_progress');
    const progressMap = data ? JSON.parse(data) : {};
    const current = progressMap[lessonId] || 0;
    if (percentage > current) {
      progressMap[lessonId] = Math.min(100, Math.round(percentage));
      localStorage.setItem('lesson_progress', JSON.stringify(progressMap));
    }
  } catch (e) {
    // ignore
  }
}
/* v8 ignore stop */
