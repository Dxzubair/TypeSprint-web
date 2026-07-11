import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatsDashboard } from './StatsDashboard';

describe('StatsDashboard', () => {
  it('renders correctly', () => {
    const mockStats = {
      bestWpm: 0, avgWpm: 0, bestAccuracy: 0, avgAccuracy: 0, totalSessions: 0, totalMinutes: 0, totalCorrectKeystrokes: 0, totalIncorrectKeystrokes: 0, history: []
    };
    render(<StatsDashboard stats={mockStats as any} onStatsReset={() => {}} />);
    expect(screen.getByText(/Best Speed/i)).toBeInTheDocument();
  });
});
