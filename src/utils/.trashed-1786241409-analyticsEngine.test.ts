import { describe, it, expect } from 'vitest';
import { AnalyticsEngine } from './analyticsEngine';

describe('AnalyticsEngine', () => {
  describe('calculateMetrics', () => {
    it('calculates correct WPM and accuracy for a normal session', () => {
      // 50 correct characters, 0 mistakes, in 12 seconds (1/5 min)
      // WPM = (50 / 5) / (12 / 60) = 10 / 0.2 = 50 WPM
      // Accuracy = 50 / 50 * 100 = 100%
      const stats = AnalyticsEngine.calculateMetrics(50, 0, 12, 0, 0);
      expect(stats.wpm).toBe(50);
      expect(stats.accuracy).toBe(100);
      expect(stats.errorRate).toBe(0);
      expect(stats.cpm).toBe(250);
    });

    it('calculates correct WPM and accuracy with mistakes', () => {
      // 45 correct, 5 incorrect, 12 seconds
      // WPM = (45 / 5) / 0.2 = 9 / 0.2 = 45 WPM
      // Accuracy = 45 / 50 * 100 = 90%
      const stats = AnalyticsEngine.calculateMetrics(45, 5, 12, 0, 0);
      expect(stats.wpm).toBe(45);
      expect(stats.accuracy).toBe(90);
      expect(stats.errorRate).toBe(10);
      expect(stats.rawWpm).toBe(50); // (50/5)/0.2
    });

    it('handles zero elapsed time gracefully', () => {
      const stats = AnalyticsEngine.calculateMetrics(5, 0, 0, 0, 0);
      // Fallback is 1/60 min if elapsed = 0
      // WPM = (5/5) / (1/60) = 60
      expect(stats.wpm).toBe(60);
      expect(stats.accuracy).toBe(100);
    });

    it('handles extremely high WPM gracefully', () => {
      const stats = AnalyticsEngine.calculateMetrics(500, 0, 12, 0, 0); // 500 characters in 12 seconds
      // WPM = 100 / 0.2 = 500 WPM
      expect(stats.wpm).toBe(500);
      expect(stats.accuracy).toBe(100);
    });

    it('handles extremely low WPM', () => {
      const stats = AnalyticsEngine.calculateMetrics(5, 0, 60, 0, 0); // 5 characters in 1 minute
      expect(stats.wpm).toBe(1);
    });

    it('handles negative or unusual combinations safely', () => {
      const stats = AnalyticsEngine.calculateMetrics(0, 5, 10, 0, 5);
      expect(stats.wpm).toBe(0);
      expect(stats.accuracy).toBe(0); // 0 / 10 * 100 = 0
    });
  });
});
