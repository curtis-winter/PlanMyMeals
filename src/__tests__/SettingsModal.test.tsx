import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsModal } from '../components/SettingsModal';

describe('SettingsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    darkMode: false,
    setDarkMode: vi.fn(),
    ollamaSettings: { url: 'http://localhost:11434', model: 'llama3' },
    setOllamaSettings: vi.fn(),
    testStatus: 'idle' as const,
    testConnection: vi.fn(),
    availableModels: ['llama3'],
    saveSettings: vi.fn().mockResolvedValue(true),
    servers: [] as { id: number; name: string; url: string }[],
    selectedServer: 'http://localhost:11434',
    onSelectServer: vi.fn(),
    onAddServer: vi.fn().mockResolvedValue(1),
    onRemoveServer: vi.fn(),
    importPrompt: '',
    setImportPrompt: vi.fn(),
    suggestPrompt: '',
    setSuggestPrompt: vi.fn(),
    suggestOptions: '',
    setSuggestOptions: vi.fn(),
    timeoutSuggest: 30,
    setTimeoutSuggest: vi.fn(),
    timeoutImport: 30,
    setTimeoutImport: vi.fn(),
    timeoutIngredients: 30,
    setTimeoutIngredients: vi.fn(),
    cleanupPrompt: '',
    setCleanupPrompt: vi.fn(),
    timeoutCleanup: 30,
    setTimeoutCleanup: vi.fn(),
    timeoutPantry: 30,
    setTimeoutPantry: vi.fn(),
    weekStartDay: 'Monday',
    setWeekStartDay: vi.fn(),
    isLocalHost: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with title when open', () => {
    render(<SettingsModal {...defaultProps} />);
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<SettingsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Configuration')).not.toBeInTheDocument();
  });

  it('should render User Preferences section', () => {
    render(<SettingsModal {...defaultProps} />);
    expect(screen.getByText('User Preferences')).toBeInTheDocument();
  });

  it('should show save button', () => {
    render(<SettingsModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should show close button', () => {
    render(<SettingsModal {...defaultProps} />);
    const closeButtons = document.querySelectorAll('button');
    expect(closeButtons.length).toBeGreaterThan(0);
  });
});