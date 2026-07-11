
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserProfile, TypingStats, KeyboardSettings } from '../types';








import { ParagraphHubDashboard } from './ParagraphHubDashboard';

/* v8 ignore start */


const { mockProfile, mockStats, mockSettings } = vi.hoisted(() => {
  return {
    mockProfile: {
      xp: 150, level: 2, name: 'Test User', selectedAvatar: 'avatar_1', selectedTitle: 'Beginner',
      unlockedAvatars: [], unlockedTitles: [], unlockedThemes: [], typingMode: 'physical_keyboard', coins: 100, username: 'testuser'
    },
    mockStats: {
      bestWpm: 50, avgWpm: 40, bestAccuracy: 95, avgAccuracy: 90, totalSessions: 10, totalMinutes: 60,
      totalCorrectKeystrokes: 1000, totalIncorrectKeystrokes: 50, totalAccuracy: 95, lifetimeAccuracy: 95,
      streak: 5, longestStreak: 10, lastPracticeDate: null, mistypedKeys: {}, history: []
    },
    mockSettings: {
      layout: 'QWERTY' as const, soundEnabled: true, soundVolume: 0.5, soundType: 'mechanical' as const, theme: 'dark', keyboardLayout: 'qwerty',
      backspaceEnabled: true, simulatedConnection: 'none' as const, showFingerGuide: true, blockOnScreenKeyboard: false, fontFamily: 'sans', fontSize: 'base' as const, hapticEnabled: false, language: 'en'
    }
  }
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: '123', displayName: 'Test' },
    loading: false,
    isAnonymous: false,
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
    isFirebaseActive: true,
    profile: mockProfile,
    stats: mockStats
  })
}));

describe('ParagraphHubDashboard', () => {
  it('renders correctly', () => {
    const { container } = render(<ParagraphHubDashboard onSessionComplete={vi.fn()} profile={mockProfile} stats={mockStats} settings={mockSettings} />);
    expect(container).toBeTruthy();
  });
});


/* v8 ignore stop */
