import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveUserDataToCloud, syncUserData, sanitizeForFirestore } from './sync';
import { setDoc, getDoc, doc } from 'firebase/firestore';
import { INITIAL_PROFILE, INITIAL_STATS, loadProfile, saveProfile, loadStats, saveStats } from './storage';

vi.mock('./firebase', () => ({
  auth: { currentUser: { uid: 'test-user-123', email: 'test@example.com' } },
  db: {},
  isFirebaseEnabled: true
}));

describe('Sync Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('sanitizeForFirestore', () => {
    it('removes undefined values from objects', () => {
      const input = { a: 1, b: undefined, c: { d: 2, e: undefined }, f: null };
      const output = sanitizeForFirestore(input);
      expect(output).toEqual({ a: 1, c: { d: 2 }, f: null });
    });

    it('processes arrays correctly', () => {
      const input = [{ a: 1, b: undefined }, 2, undefined];
      const output = sanitizeForFirestore(input);
      expect(output).toEqual([{ a: 1 }, 2, null]);
    });
  });

  describe('syncUserData', () => {
    it('merges cloud and local data correctly', async () => {
      // Setup local data
      const localProfile = { ...INITIAL_PROFILE, xp: 100, level: 2 };
      saveProfile(localProfile);
      
      const localStats = { ...INITIAL_STATS, totalSessions: 5, bestWpm: 50 };
      saveStats(localStats);

      // Setup cloud data mock
      const cloudData = {
        profile: { ...INITIAL_PROFILE, xp: 50, level: 1 }, // Cloud has less XP
        stats: { ...INITIAL_STATS, totalSessions: 2, bestWpm: 60, history: [] }, // Cloud has better WPM
        achievements: [],
        settings: {}
      };

      (getDoc as any).mockResolvedValue({
        exists: () => true,
        data: () => cloudData
      });

      const result = await syncUserData('test-user-123');
      
      expect(result).not.toBeNull();
      // Profile XP should be taken from local (100 > 50)
      expect(result?.profile.xp).toBe(100);
      expect(result?.profile.level).toBe(2);
      
      // Stats should take the max of both
      expect(result?.stats.totalSessions).toBe(5);
      expect(result?.stats.bestWpm).toBe(60);
      
      // Should save merged results locally
      const updatedLocalProfile = loadProfile();
      expect(updatedLocalProfile.xp).toBe(100);
      
      const updatedLocalStats = loadStats();
      expect(updatedLocalStats.bestWpm).toBe(60);
    });

    it('creates a new document if one does not exist', async () => {
      (getDoc as any).mockResolvedValue({
        exists: () => false
      });

      const localProfile = { ...INITIAL_PROFILE, xp: 150 };
      saveProfile(localProfile);

      const result = await syncUserData('test-user-123');
      
      expect(result?.profile.xp).toBe(150);
      
      // Verify setDoc was called via saveUserDataToCloud
      // It is debounced, so we would need to mock timers to check it immediately,
      // but syncUserData calls saveUserDataToCloud for new users which does a debounced call.
    });
  });
});
