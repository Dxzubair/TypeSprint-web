import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsPanel } from './SettingsPanel';
import { UserProfile } from "../types";
import { INITIAL_SETTINGS } from '../utils/storage';

describe('SettingsPanel', () => {
  it('renders correctly', () => {
    render(<SettingsPanel profile={{name: "Test User", username: "test"} as unknown as UserProfile} 
      settings={INITIAL_SETTINGS as any}
      onUpdateSettings={() => {}}
      onUpdateProfile={() => {}}
      onResetProgress={() => {}}
    />);
    expect(screen.getByText(/Pilot Identity Card/i)).toBeInTheDocument();
  });
});
