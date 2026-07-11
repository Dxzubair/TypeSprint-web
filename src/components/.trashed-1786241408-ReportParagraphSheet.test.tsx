
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReportParagraphSheet } from './ReportParagraphSheet';

// Mock the feedback utility
vi.mock('../utils/feedback', () => ({
  submitParagraphReport: vi.fn(),
}));

const mockParagraph = {
  id: 'p1',
  title: 'Test Paragraph',
  category: 'Test Category',
  difficulty: 'Easy'
};

const mockProfile = {
  name: 'Test User',
  username: 'testuser',
  avatar: '',
  xp: 0,
  level: 1,
  achievements: [],
  settings: { layout: 'QWERTY' }
};

const mockSettings = {
  keyboardType: 'mechanical',
  layout: 'QWERTY',
  backspaceEnabled: true,
  soundEnabled: true
};

describe('ReportParagraphSheet', () => {
  it('renders and submits a report', async () => {
    const onClose = vi.fn();
    render(
      <ReportParagraphSheet 
        isOpen={true} 
        onClose={onClose} 
        paragraph={mockParagraph} 
        profile={mockProfile}
        settings={mockSettings}
      />
    );

    expect(screen.getByText(/Report Paragraph/i)).toBeTruthy();

    const submitBtn = screen.getByRole('button', { name: /Submit Report/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Report Submitted!/i)).toBeTruthy();
    });

    expect(onClose).not.toHaveBeenCalled(); // Should wait for auto-close
  });
});
