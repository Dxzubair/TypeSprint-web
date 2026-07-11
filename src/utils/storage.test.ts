import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  loadProfile, saveProfile, 
  loadStats, saveStats, 
  loadAchievements, saveAchievements,
  processSessionCompletion, addRewards, registerMistypedKey, markLessonCompleted, INITIAL_PROFILE, INITIAL_STATS, INITIAL_SETTINGS
} from './storage';

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset any mocks if necessary
  });

  describe('Profile Storage', () => {
    it('loads initial profile when empty', () => {
      const profile = loadProfile();
      expect(profile).toEqual(INITIAL_PROFILE);
    });

    it('saves and loads custom profile', () => {
      const customProfile = { ...INITIAL_PROFILE, xp: 500, level: 2, name: 'Test User' };
      saveProfile(customProfile);
      const loaded = loadProfile();
      expect(loaded).toEqual(customProfile);
    });
  });

  describe('Stats & XP System', () => {
    it('adds rewards and levels up correctly', () => {
      // Base XP is 0, level 1. Next level needs 100 XP.
      const initialProfile = loadProfile();
      expect(initialProfile.level).toBe(1);
      
      const { leveledUp } = addRewards(350, 50); // Gives 150 XP, enough for level 2
      expect(leveledUp).toBe(true);
      
      const newProfile = loadProfile();
      expect(newProfile.level).toBe(2);
      expect(newProfile.xp).toBe(50); // 350 - 300 = 50 remainder
      expect(newProfile.coins).toBe(550);
    });

    it('accumulates XP across multiple levels', () => {
      // Need 100 for level 2, 200 for level 3, 300 for level 4 (total 600)
      addRewards(350 + 600 + 50, 0); 
      const profile = loadProfile();
      expect(profile.level).toBe(3); // 300 + 600
      expect(profile.xp).toBe(100);
    });
  });

  describe('Session Processing', () => {
    it('processes a completed session correctly', () => {
      const sessionData: any = {
        type: 'lesson',
        title: 'Test Session',
        wpm: 80,
        cpm: 400,
        accuracy: 95,
        totalKeysPressed: 420,
        mistakesCount: 20,
        timeSpentSeconds: 60,
      };
      
      const result = processSessionCompletion(sessionData);
      
      expect(result.xpGained).toBeGreaterThan(0);
      expect(result.coinsGained).toBeGreaterThan(0);
      
      const stats = loadStats();
      expect(stats.history.length).toBe(1);
      expect(stats.bestWpm).toBe(80);
      expect(stats.totalSessions).toBe(1);
      expect(stats.avgWpm).toBe(80);
      
      // Streak should be updated since lastPracticeDate was null
      expect(stats.streak).toBeGreaterThanOrEqual(1);
      expect(stats.longestStreak).toBeGreaterThanOrEqual(1);
    });

    it('identifies new personal bests', () => {
      processSessionCompletion({
        type: 'lesson', title: 'test', wpm: 60, cpm: 300, accuracy: 100, totalKeysPressed: 300, mistakesCount: 0, timeSpentSeconds: 60
      } as any);
      const res2 = processSessionCompletion({
        type: 'lesson', title: 'test2', wpm: 85, cpm: 425, accuracy: 98, totalKeysPressed: 430, mistakesCount: 5, timeSpentSeconds: 60
      } as any);
      
      expect(res2.newPersonalBest).toBe(true);
      
      const res3 = processSessionCompletion({
        type: 'lesson', title: 'test3', wpm: 70, cpm: 350, accuracy: 95, totalKeysPressed: 365, mistakesCount: 15, timeSpentSeconds: 60
      } as any);
      expect(res3.newPersonalBest).toBe(false);
    });
  });
  
  describe('Mistyped Keys', () => {
    it('registers mistyped keys', () => {
      registerMistypedKey('a');
      registerMistypedKey('A'); // should normalize to 'a'
      registerMistypedKey('b');
      
      const stats = loadStats();
      expect(stats.mistypedKeys['a']).toBe(2);
      expect(stats.mistypedKeys['b']).toBe(1);
    });
  });
});
