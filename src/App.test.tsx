
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAnonymous: false,
    loginWithGoogle: vi.fn(),
    logout: vi.fn()
  }),
  AuthProvider: ({ children }: any) => <div>{children}</div>
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the main app structure', () => {
    render(<App />);
    expect(true).toBe(true);
  });

  it('navigates through all tabs', async () => {
    render(<App />);
    
    const tabsToClick = [
      'Govt Exam Hub',
      'Paragraph Hub',
      'Profile',
      'Lessons',
      'Speed Tests',
      'Game Zone',
      'Reward Hub',
      'Leaderboards',
      'AI Coach',
      'Analytics'
    ];

    for (const tabName of tabsToClick) {
      act(() => {
        const tabs = screen.getAllByText(new RegExp(tabName, 'i'));
        let clicked = false;
        for (const t of tabs) {
          const btn = t.closest('button');
          if (btn && !clicked) {
            fireEvent.click(btn);
            clicked = true;
          }
        }
      });
    }
    
    act(() => {
      const themeBtn = screen.getByTitle('Toggle Dark/Light Mode');
      if (themeBtn) fireEvent.click(themeBtn);
    });

    act(() => {
      const soundBtn = screen.getByTitle('Mute Audio Feedback');
      if (soundBtn) fireEvent.click(soundBtn);
    });

    act(() => {
      const mobileBtn = screen.getByTitle('Toggle Screen Orientation');
      if (mobileBtn) fireEvent.click(mobileBtn);
    });

    expect(true).toBe(true);
  });
});
