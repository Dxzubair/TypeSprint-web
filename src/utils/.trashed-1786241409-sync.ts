/* v8 ignore start */
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth, isFirebaseEnabled } from './firebase';
import { UserProfile, TypingStats, Achievement, KeyboardSettings, DailyChallenge } from '../types';
import { 
  loadProfile, saveProfile, 
  loadStats, saveStats, 
  loadAchievements, saveAchievements, 
  loadSettings, saveSettings,
  loadDailyChallenges, saveDailyChallenges
} from './storage';

// Firestore Error Types as required by the Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Handles and logs Firestore errors with detailed JSON contextual metadata
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid,
      email: currentAuth?.currentUser?.email,
      emailVerified: currentAuth?.currentUser?.emailVerified,
      isAnonymous: currentAuth?.currentUser?.isAnonymous,
      tenantId: currentAuth?.currentUser?.tenantId,
      providerInfo: currentAuth?.currentUser?.providerData?.map( (provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Backup interface
export interface BackupData {
  profile: UserProfile;
  stats: TypingStats;
  achievements: Achievement[];
  settings: KeyboardSettings;
  version: string;
  timestamp: string;
}

/**
 * Recursively removes all undefined fields to prevent Firestore serialization errors
 */
export function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Saves all current local typing progress & preferences to Firestore
 */
export async function saveUserDataToCloud(
  uid: string,
  profile: UserProfile,
  stats: TypingStats,
  achievements: Achievement[],
  settings: KeyboardSettings
): Promise<void> {
  if (!isFirebaseEnabled || !db) return;

  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    
    console.log(`[Sync] Initiating cloud sync for user ${uid}...`);
    console.log(`[Sync] Syncing Profile XP: ${profile.xp}, Level: ${profile.level}`);
    console.log(`[Sync] Syncing Stats - Total Sessions: ${stats.totalSessions}, Best WPM: ${stats.bestWpm}`);
    console.log(`[Sync] Syncing Achievements count: ${achievements.length}`);

    // Retrieve other client storage data to include in sync
    const completedLessons = (() => {
      try {
        const d = localStorage.getItem('completed_lessons');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();

    const dailyChallenges = (() => {
      try {
        const d = localStorage.getItem('typesprint_daily_challenges');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();

    // Paragraph hub data
    const customParagraphs = (() => {
      try {
        const d = localStorage.getItem('typesprint_custom_paragraphs');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();
    const paragraphFolders = (() => {
      try {
        const d = localStorage.getItem('typesprint_paragraph_folders');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();
    const paragraphFavorites = (() => {
      try {
        const d = localStorage.getItem('typesprint_paragraph_favorites');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();
    const paragraphStats = (() => {
      try {
        const d = localStorage.getItem('typesprint_paragraph_stats');
        return d ? JSON.parse(d) : {};
      } catch { return {}; }
    })();
    const paragraphHistory = (() => {
      try {
        const d = localStorage.getItem('typesprint_paragraph_history');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();

    // Exam hub data
    const favExams = (() => {
      try {
        const d = localStorage.getItem('typesprint_fav_exams_v1');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();
    const examAttempts = (() => {
      try {
        const d = localStorage.getItem('typesprint_exam_attempts_v1');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();
    const examStats = (() => {
      try {
        const d = localStorage.getItem('typesprint_exam_stats_v1');
        return d ? JSON.parse(d) : {};
      } catch { return {}; }
    })();

    // Game zone records
    const gameRecords = (() => {
      try {
        const d = localStorage.getItem('typesprint_game_records');
        const parsed = d ? JSON.parse(d) : {};
        return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
      } catch { return {}; }
    })();

    await setDoc(userDocRef, sanitizeForFirestore({
        email: auth?.currentUser?.email || '',
        profile,
      stats,
      achievements,
      settings,
      dailyChallenges,
      completedLessons,
      customParagraphs,
      paragraphFolders,
      paragraphFavorites,
      paragraphStats,
      paragraphHistory,
      favExams,
      examAttempts,
      examStats,
      gameRecords,
      lastSynced: new Date().toISOString()
    }), { merge: true });

    // Also update public leaderboard listing
    await saveLeaderboardEntry(uid, profile, stats);

    console.log('Progress auto-synced to cloud successfully.');
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Publishes/updates public leaderboard details for competitive listing
 */
export async function saveLeaderboardEntry(
  uid: string,
  profile: UserProfile,
  stats: TypingStats
): Promise<void> {
  if (!isFirebaseEnabled || !db) return;
  const path = `leaderboard/${uid}`;
  try {
    const entryDocRef = doc(db, 'leaderboard', uid);
    await setDoc(entryDocRef, sanitizeForFirestore({
      userId: uid,
      name: profile.name || 'Anonymous Racer',
      avatar: profile.selectedAvatar === 'avatar_1' ? '🚀' : profile.selectedAvatar === 'avatar_2' ? '👾' : '🌟',
      level: profile.level || 1,
      bestWpm: stats.bestWpm || 0,
      accuracy: stats.totalAccuracy || 100,
      kb: profile.typingMode === 'mobile_keyboard' ? 'Mobile Virtual Keyboard' : 'Physical Hardware Board',
      layout: 'QWERTY',
      country: '🇺🇸',
      updatedAt: new Date().toISOString()
    }), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Retrieves global live leaderboards sorted descending by best WPM
 */
export async function getLiveLeaderboardEntries(): Promise<any[]> {
  if (!isFirebaseEnabled || !db) return [];
  const path = 'leaderboard';
  try {
    const q = query(collection(db, 'leaderboard'), orderBy('bestWpm', 'desc'), limit(50));
    const snap = await getDocs(q);
    const entries: any[] = [];
    snap.forEach((docSnap) => {
      entries.push(docSnap.data());
    });
    return entries;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Fetch and synchronize data from Firestore for the given user.
 * Merges guest data seamlessly into existing cloud records, or seeds cloud if empty.
 */
export async function syncUserData(
  uid: string,
  forceUpload = false
): Promise<{
  profile: UserProfile;
  stats: TypingStats;
  achievements: Achievement[];
  settings: KeyboardSettings;
} | null> {
  if (!isFirebaseEnabled || !db) return null;

  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);

    // Load current local guest data
    const localProfile = loadProfile();
    const localStats = loadStats();
    const localAchievements = loadAchievements();
    const localSettings = loadSettings();
    
    const localCompletedLessons = (() => {
      try {
        const d = localStorage.getItem('completed_lessons');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();
    const localDailyChallenges = (() => {
      try {
        const d = localStorage.getItem('typesprint_daily_challenges');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();

    const localCustomParagraphs = (() => {
      try {
        const d = localStorage.getItem('typesprint_custom_paragraphs');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();
    const localParagraphFolders = (() => {
      try {
        const d = localStorage.getItem('typesprint_paragraph_folders');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();
    const localParagraphFavorites = (() => {
      try {
        const d = localStorage.getItem('typesprint_paragraph_favorites');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();
    const localParagraphStats = (() => {
      try {
        const d = localStorage.getItem('typesprint_paragraph_stats');
        return d ? JSON.parse(d) : {};
      } catch { return {}; }
    })();
    const localParagraphHistory = (() => {
      try {
        const d = localStorage.getItem('typesprint_paragraph_history');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();

    const localFavExams = (() => {
      try {
        const d = localStorage.getItem('typesprint_fav_exams_v1');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();
    const localExamAttempts = (() => {
      try {
        const d = localStorage.getItem('typesprint_exam_attempts_v1');
        return d ? JSON.parse(d) : [];
      } catch { return []; }
    })();
    const localExamStats = (() => {
      try {
        const d = localStorage.getItem('typesprint_exam_stats_v1');
        return d ? JSON.parse(d) : {};
      } catch { return {}; }
    })();

    const localGameRecords = (() => {
      try {
        const d = localStorage.getItem('typesprint_game_records');
        const parsed = d ? JSON.parse(d) : {};
        return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
      } catch { return {}; }
    })();

    if (docSnap.exists() && !forceUpload) {
      const cloudData = docSnap.data();
      
      // Extract cloud state
      const cloudProfile = cloudData.profile as UserProfile || localProfile;
      const cloudStats = cloudData.stats as TypingStats || localStats;
      const cloudAchievements = Array.isArray(cloudData.achievements) ? cloudData.achievements as Achievement[] : localAchievements;
      const cloudSettings = cloudData.settings as KeyboardSettings || localSettings;
      const cloudCompletedLessons = Array.isArray(cloudData.completedLessons) ? cloudData.completedLessons as string[] : [];
      const cloudDailyChallenges = Array.isArray(cloudData.dailyChallenges) ? cloudData.dailyChallenges as DailyChallenge[] : [];

      const cloudCustomParagraphs = Array.isArray(cloudData.customParagraphs) ? cloudData.customParagraphs as any[] : [];
      const cloudParagraphFolders = Array.isArray(cloudData.paragraphFolders) ? cloudData.paragraphFolders as any[] : [];
      const cloudParagraphFavorites = Array.isArray(cloudData.paragraphFavorites) ? cloudData.paragraphFavorites as string[] : [];
      const cloudParagraphStats = (cloudData.paragraphStats && typeof cloudData.paragraphStats === 'object') ? cloudData.paragraphStats as Record<string, any> : {};
      const cloudParagraphHistory = Array.isArray(cloudData.paragraphHistory) ? cloudData.paragraphHistory as any[] : [];

      const cloudFavExams = Array.isArray(cloudData.favExams) ? cloudData.favExams as string[] : [];
      const cloudExamAttempts = Array.isArray(cloudData.examAttempts) ? cloudData.examAttempts as any[] : [];
      const cloudExamStats = (cloudData.examStats && typeof cloudData.examStats === 'object') ? cloudData.examStats as Record<string, any> : {};

      const cloudGameRecords = (cloudData.gameRecords && typeof cloudData.gameRecords === 'object' && !Array.isArray(cloudData.gameRecords)) ? cloudData.gameRecords : {};

      // Smart merge logic: Use cloud or merge guest-mode details
      const useCloud = (cloudProfile.xp + (cloudProfile.level * 1000) >= localProfile.xp + (localProfile.level * 1000));

      const mergedProfile: UserProfile = useCloud ? cloudProfile : {
        ...cloudProfile,
        xp: Math.max(cloudProfile.xp, localProfile.xp),
        level: Math.max(cloudProfile.level, localProfile.level),
        coins: Math.max(cloudProfile.coins || 0, localProfile.coins || 0),
        gems: Math.max(cloudProfile.gems || 0, localProfile.gems || 0),
      };

      const mergedStats: TypingStats = {
        ...cloudStats,
        bestWpm: Math.max(cloudStats.bestWpm || 0, localStats.bestWpm || 0),
        longestStreak: Math.max(cloudStats.longestStreak || 1, localStats.longestStreak || 1),
        streak: Math.max(cloudStats.streak || 1, localStats.streak || 1),
        totalSessions: Math.max(cloudStats.totalSessions, localStats.totalSessions),
        totalMinutes: Math.max(cloudStats.totalMinutes, localStats.totalMinutes),
        history: [...(cloudStats.history || [])] // Take cloud history as baseline
      };

      // Merge history entries that aren't duplicates
      const existingHistoryIds = new Set(mergedStats.history.map(h => h.id));
      (localStats.history || []).forEach(item => {
        if (!existingHistoryIds.has(item.id)) {
          mergedStats.history.push(item);
        }
      });

      // Sort and limit history array
      mergedStats.history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      mergedStats.history = mergedStats.history.slice(0, 150);
      
      // Recalculate averages from merged history
      if (mergedStats.history.length > 0) {
        let totalWpm = 0;
        let totalAcc = 0;
        let bestWpm = 0;
        let bestAcc = 0;
        mergedStats.history.forEach(session => {
          totalWpm += session.wpm;
          totalAcc += session.accuracy;
          if (session.wpm > bestWpm) bestWpm = session.wpm;
          if (session.accuracy > bestAcc) bestAcc = session.accuracy;
        });
        mergedStats.avgWpm = Math.round(totalWpm / mergedStats.history.length);
        mergedStats.avgAccuracy = Math.round(totalAcc / mergedStats.history.length);
        mergedStats.totalAccuracy = mergedStats.avgAccuracy; // legacy sync
        mergedStats.bestWpm = Math.max(mergedStats.bestWpm || 0, bestWpm);
        mergedStats.bestAccuracy = Math.max(mergedStats.bestAccuracy || 0, bestAcc);
      }

      // Merge lists (completions, settings, paragraph hub, exam hub, game records)
      const mergedCompletedLessons = Array.from(new Set([...cloudCompletedLessons, ...localCompletedLessons]));
      const mergedDailyChallenges = [...cloudDailyChallenges];
      const existingChallengeIds = new Set(cloudDailyChallenges.map(c => c.id));
      localDailyChallenges.forEach((item: any) => {
        if (!existingChallengeIds.has(item.id)) {
          mergedDailyChallenges.push(item);
        }
      });

      const mergedCustomParagraphs = [...cloudCustomParagraphs];
      const existingParagraphIds = new Set(cloudCustomParagraphs.map(p => p.id));
      localCustomParagraphs.forEach((p: any) => {
        if (!existingParagraphIds.has(p.id)) {
          mergedCustomParagraphs.push(p);
        }
      });

      const mergedParagraphFolders = [...cloudParagraphFolders];
      const existingFolderIds = new Set(cloudParagraphFolders.map(f => f.id));
      localParagraphFolders.forEach((f: any) => {
        if (!existingFolderIds.has(f.id)) {
          mergedParagraphFolders.push(f);
        }
      });

      const mergedParagraphFavorites = Array.from(new Set([...cloudParagraphFavorites, ...localParagraphFavorites]));
      const mergedParagraphStats = { ...cloudParagraphStats, ...localParagraphStats };

      const mergedParagraphHistory = [...cloudParagraphHistory];
      const existingParaHistIds = new Set(cloudParagraphHistory.map(h => h.id || h.date));
      localParagraphHistory.forEach((h: any) => {
        if (!existingParaHistIds.has(h.id || h.date)) {
          mergedParagraphHistory.push(h);
        }
      });

      const mergedFavExams = Array.from(new Set([...cloudFavExams, ...localFavExams]));
      const mergedExamAttempts = [...cloudExamAttempts];
      const existingAttemptIds = new Set(cloudExamAttempts.map(a => a.attemptId));
      localExamAttempts.forEach((a: any) => {
        if (!existingAttemptIds.has(a.attemptId)) {
          mergedExamAttempts.push(a);
        }
      });
      const mergedExamStats = { ...cloudExamStats, ...localExamStats };

      // Merge game records (object format: gameId -> GameStats)
      const mergedGameRecords: Record<string, any> = {};
      const allGameIds = new Set([
        ...Object.keys(cloudGameRecords),
        ...Object.keys(localGameRecords)
      ]);
      allGameIds.forEach(gameId => {
        const cloudRec = cloudGameRecords[gameId] || {};
        const localRec = localGameRecords[gameId] || {};
        mergedGameRecords[gameId] = {
          bestScore: Math.max(cloudRec.bestScore || 0, localRec.bestScore || 0),
          bestWpm: Math.max(cloudRec.bestWpm || 0, localRec.bestWpm || 0),
          bestAccuracy: Math.max(cloudRec.bestAccuracy || 0, localRec.bestAccuracy || 0),
          gamesPlayed: Math.max(cloudRec.gamesPlayed || 0, localRec.gamesPlayed || 0),
          lastPlayed: cloudRec.lastPlayed || localRec.lastPlayed || ''
        };
      });

      // Save merged results locally as cached copy
      saveProfile(mergedProfile);
      saveStats(mergedStats);
      saveAchievements(cloudAchievements);
      saveSettings(cloudSettings);
      saveDailyChallenges(mergedDailyChallenges);

      localStorage.setItem('completed_lessons', JSON.stringify(mergedCompletedLessons));
      localStorage.setItem('typesprint_custom_paragraphs', JSON.stringify(mergedCustomParagraphs));
      localStorage.setItem('typesprint_paragraph_folders', JSON.stringify(mergedParagraphFolders));
      localStorage.setItem('typesprint_paragraph_favorites', JSON.stringify(mergedParagraphFavorites));
      localStorage.setItem('typesprint_paragraph_stats', JSON.stringify(mergedParagraphStats));
      localStorage.setItem('typesprint_paragraph_history', JSON.stringify(mergedParagraphHistory));
      localStorage.setItem('typesprint_fav_exams_v1', JSON.stringify(mergedFavExams));
      localStorage.setItem('typesprint_exam_attempts_v1', JSON.stringify(mergedExamAttempts));
      localStorage.setItem('typesprint_exam_stats_v1', JSON.stringify(mergedExamStats));
      localStorage.setItem('typesprint_game_records', JSON.stringify(mergedGameRecords));

      // Propagate updates to cloud
      await setDoc(userDocRef, sanitizeForFirestore({
        profile: mergedProfile,
        stats: mergedStats,
        achievements: cloudAchievements,
        settings: cloudSettings,
        completedLessons: mergedCompletedLessons,
        dailyChallenges: mergedDailyChallenges,
        customParagraphs: mergedCustomParagraphs,
        paragraphFolders: mergedParagraphFolders,
        paragraphFavorites: mergedParagraphFavorites,
        paragraphStats: mergedParagraphStats,
        paragraphHistory: mergedParagraphHistory,
        favExams: mergedFavExams,
        examAttempts: mergedExamAttempts,
        examStats: mergedExamStats,
        gameRecords: mergedGameRecords,
        lastSynced: new Date().toISOString()
      }), { merge: true });

      // Publish leaderboard standing
      await saveLeaderboardEntry(uid, mergedProfile, mergedStats);

      // Trigger reloads across separate modules
      window.dispatchEvent(new CustomEvent('typesprint_paragraphhub_sync'));
      window.dispatchEvent(new CustomEvent('typesprint_examhub_sync'));
      window.dispatchEvent(new CustomEvent('typesprint_gamezone_sync'));

      return {
        profile: mergedProfile,
        stats: mergedStats,
        achievements: cloudAchievements,
        settings: cloudSettings
      };
    } else {
      // Create new user record from current local guest data
      await saveUserDataToCloud(uid, localProfile, localStats, localAchievements, localSettings);
      return {
        profile: localProfile,
        stats: localStats,
        achievements: localAchievements,
        settings: localSettings
      };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

/**
 * Creates a downloadable/JSON export representation of user progress
 */
export function exportProgressAsJSON(): string {
  const backup: BackupData = {
    profile: loadProfile(),
    stats: loadStats(),
    achievements: loadAchievements(),
    settings: loadSettings(),
    version: '2.0.0',
    timestamp: new Date().toISOString()
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Manually restore progress from a Backup JSON string
 */
export function restoreProgressFromJSON(jsonString: string): BackupData | null {
  try {
    const backup: BackupData = JSON.parse(jsonString);
    if (backup.profile && backup.stats && backup.achievements && backup.settings) {
      saveProfile(backup.profile);
      saveStats(backup.stats);
      saveAchievements(backup.achievements);
      saveSettings(backup.settings);
      return backup;
    }
    return null;
  } catch (err) {
    console.error('Failed to parse backup JSON:', err);
    return null;
  }
}
/* v8 ignore stop */
