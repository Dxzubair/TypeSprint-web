import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';

// Unmock Firebase to perform real operations
vi.unmock('firebase/app');
vi.unmock('firebase/auth');
vi.unmock('firebase/firestore');

import App from '../App';
import { db } from '../utils/firebase';
import { collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../utils/firebase';

vi.mock('../utils/sync', () => ({
  syncUserData: vi.fn(),
  saveUserDataToCloud: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123' },
    loading: false,
    isAnonymous: false,
    triggerSync: vi.fn(),
  }),
  AuthProvider: ({ children }: any) => <div>{children}</div>
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Beta Feedback End-to-End', () => {
  beforeAll(async () => {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn('Failed to sign in anonymously for test:', e);
    }
  });
  it('triggers the BetaFeedbackModal, fills form, submits, and verifies in Firestore', async () => {
    // Generate a unique message to verify in Firestore
    const uniqueMessage = `Test E2E Feedback ${Date.now()}`;

    render(<App />);

    // Trigger the BetaFeedbackModal
    // Assuming there's a Settings tab we can click first
    const settingsTab = screen.getAllByText(/Settings/i).find(el => el.closest('button'));
    if (settingsTab) {
      fireEvent.click(settingsTab.closest('button')!);
    } else {
      throw new Error('Settings tab not found');
    }

    // Click "Send Beta Feedback" inside SettingsPanel
    const feedbackBtn = await screen.findByRole('button', { name: /Send Beta Feedback/i });
    fireEvent.click(feedbackBtn);

    // Verify modal is open
    try {
      expect(await screen.findByRole('heading', { name: /Beta Feedback/i }, { timeout: 3000 })).toBeTruthy();
    } catch (e) {
      screen.debug(undefined, 300000);
      throw e;
    }

    // Fill out the rating (click the 5th star)
    // Find the category select
    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: 'Feature Request' } });

    // Find the textarea
    const textarea = screen.getByPlaceholderText(/Tell us what you think/i);
    fireEvent.change(textarea, { target: { value: uniqueMessage } });

    // Find star buttons
    // The stars are right before the Category select inside a container.
    // Instead of guessing index, we can just click the 5th svg star wrapper.
    // They are buttons. We can find all buttons inside the modal.
    // Let's just find the heading's parent (the modal)
    const heading = screen.getByRole('heading', { name: /Beta Feedback/i });
    const modal = heading.closest('div')!.parentElement!;
    
    // Find all buttons in the modal
    const modalButtons = Array.from(modal.querySelectorAll('button'));
    
    // The stars are likely buttons 1 to 5 (index 0 is close button usually).
    // Let's just click index 5 (which should be 5th star, as close is 0, star1 is 1, star2 is 2... star5 is 5)
    if (modalButtons.length >= 6) {
      fireEvent.click(modalButtons[5]);
    }

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit Feedback/i });
    fireEvent.click(submitBtn);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Thank You!/i)).toBeTruthy();
    }, { timeout: 5000 });

    // Verify data in Firestore
    const q = query(
      collection(db, 'beta_feedback'),
      where('message', '==', uniqueMessage)
    );
    const querySnapshot = await getDocs(q);
    
    expect(querySnapshot.empty).toBe(false);
    
    const docData = querySnapshot.docs[0].data();
    expect(docData.message).toBe(uniqueMessage);
    expect(docData.category).toBe('Feature Request');
    expect(docData.rating).toBe(5);
  }, 15000); // Give it enough time
});
