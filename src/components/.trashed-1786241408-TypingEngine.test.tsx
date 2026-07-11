import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TypingEngine } from './TypingEngine';
import { INITIAL_SETTINGS } from '../utils/storage';

describe('TypingEngine', () => {
  it('renders correctly', () => {
    render(<TypingEngine 
      sessionType="custom" 
      customText="hello world" 
      title="Test"
      settings={INITIAL_SETTINGS} 
      onSessionComplete={vi.fn()} 
      onExit={vi.fn()}
    />);
    expect(screen.getByText(/Test/i)).toBeInTheDocument();
  });
});
