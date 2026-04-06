import React from 'react';
import { Settings, Moon, Sun, Globe, Loader2, CheckCircle2, AlertCircle, Cpu, Sparkles } from 'lucide-react';
import { Modal } from './ui/Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  ollamaSettings: { url: string; model: string };
  setOllamaSettings: React.Dispatch<React.SetStateAction<{ url: string; model: string }>>;
  testStatus: 'idle' | 'testing' | 'success' | 'error';
  testConnection: () => void;
  availableModels: string[];
  saveSettings: () => Promise<boolean>;
  importPrompt: string;
  setImportPrompt: (prompt: string) => void;
  suggestPrompt: string;
  setSuggestPrompt: (prompt: string) => void;
  suggestOptions: string;
  setSuggestOptions: (options: string) => void;
  timeoutSuggest: number;
  setTimeoutSuggest: (timeout: number) => void;
  timeoutImport: number;
  setTimeoutImport: (timeout: number) => void;
  timeoutIngredients: number;
  setTimeoutIngredients: (timeout: number) => void;
  cleanupPrompt: string;
  setCleanupPrompt: (prompt: string) => void;
  timeoutCleanup: number;
  setTimeoutCleanup: (timeout: number) => void;
  weekStartDay: string;
  setWeekStartDay: (day: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  setDarkMode,
  ollamaSettings,
  setOllamaSettings,
  testStatus,
  testConnection,
  availableModels,
  saveSettings,
  importPrompt,
  setImportPrompt,
  suggestPrompt,
  setSuggestPrompt,
  suggestOptions,
  setSuggestOptions,
  timeoutSuggest,
  setTimeoutSuggest,
  timeoutImport,
  setTimeoutImport,
  timeoutIngredients,
  setTimeoutIngredients,
  cleanupPrompt,
  setCleanupPrompt,
  timeoutCleanup,
  setTimeoutCleanup,
  weekStartDay,
  setWeekStartDay
}) => {
  const handleSave = async () => {
    const success = await saveSettings();
    if (success) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration"
      side="left"
      icon={<Settings className="text-background-theme w-5 h-5" />}
      footer={
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-primary text-background-theme font-bold hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20"
        >
          Save Configuration
        </button>
      }
    >
      <div className="p-6 space-y-8">
        {/* Group 0: User Preferences */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest border-b border-border-theme pb-2">User Preferences</h3>
          
          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-background-theme">
              <div className="flex items-center gap-3">
                <div className="bg-surface p-2 rounded-lg">
                  {darkMode ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Appearance</p>
                  <p className="text-[10px] text-neutral-theme">{darkMode ? 'Dark Mode Active' : 'Light Mode Active'}</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full transition-all relative ${darkMode ? 'bg-primary' : 'bg-neutral-theme/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-background-theme transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {/* Week Start Day */}
            <div>
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2">
                Week Start Day
              </label>
              <select
                value={weekStartDay}
                onChange={(e) => setWeekStartDay(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer text-primary"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Group 1: Recipe Generation */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest border-b border-border-theme pb-2">Recipe Generation</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Suggest Recipe Prompt Template
              </label>
              <p className="text-[10px] text-neutral-theme mb-2">Use <code className="bg-background-theme px-1 rounded">{"{{content}}"}</code> for ingredients, <code className="bg-background-theme px-1 rounded">{"{{dietaryOptions}}"}</code> for preferences, and <code className="bg-background-theme px-1 rounded">{"{{additionalInstructions}}"}</code> for custom notes.</p>
              <textarea
                value={suggestPrompt}
                onChange={(e) => setSuggestPrompt(e.target.value)}
                placeholder="Enter your custom prompt for recipe suggestion..."
                className="w-full h-32 px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none text-sm text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Suggest Recipe Options
              </label>
              <p className="text-[10px] text-neutral-theme mb-2">Comma-separated list of toggleable dietary preferences.</p>
              <input
                type="text"
                value={suggestOptions}
                onChange={(e) => setSuggestOptions(e.target.value)}
                placeholder="FODMAP, Low Calorie, Vegetarian..."
                className="w-full px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2">
                Generation Timeout (ms)
              </label>
              <input
                type="number"
                value={timeoutSuggest}
                onChange={(e) => setTimeoutSuggest(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary"
              />
            </div>
          </div>
        </section>

        {/* Group 2: Recipe Import */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest border-b border-border-theme pb-2">Recipe Import</h3>
          
          <div>
            <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Import Prompt Template
            </label>
            <p className="text-[10px] text-neutral-theme mb-2">Use <code className="bg-background-theme px-1 rounded">{"{{content}}"}</code> as a placeholder for the imported text or URL content.</p>
            <textarea
              value={importPrompt}
              onChange={(e) => setImportPrompt(e.target.value)}
              placeholder="Enter your custom prompt for recipe extraction..."
              className="w-full h-32 px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none text-sm text-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2">
              Import Timeout (ms)
            </label>
            <input
              type="number"
              value={timeoutImport}
              onChange={(e) => setTimeoutImport(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary"
            />
          </div>
        </section>

        {/* Group 4: Recipe Cleanup */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest border-b border-border-theme pb-2">Recipe Cleanup</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Cleanup Prompt Template
              </label>
              <p className="text-[10px] text-neutral-theme mb-2">Use <code className="bg-background-theme px-1 rounded">{"{{content}}"}</code> as a placeholder for the recipe JSON.</p>
              <textarea
                value={cleanupPrompt}
                onChange={(e) => setCleanupPrompt(e.target.value)}
                placeholder="Enter your custom prompt for recipe cleanup..."
                className="w-full h-32 px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none text-sm text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2">
                Cleanup Timeout (ms)
              </label>
              <input
                type="number"
                value={timeoutCleanup}
                onChange={(e) => setTimeoutCleanup(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary"
              />
            </div>
          </div>
        </section>

        {/* Group 3: AI Settings */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest border-b border-border-theme pb-2">AI Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2 flex items-center gap-2">
                <Globe className="w-3 h-3" /> Ollama Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ollamaSettings.url}
                  onChange={(e) => setOllamaSettings(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="http://localhost:11434"
                  className="flex-1 px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-primary"
                />
                <button
                  onClick={testConnection}
                  disabled={testStatus === 'testing'}
                  className={`px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 shrink-0 ${
                    testStatus === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    testStatus === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-background-theme border-border-theme text-neutral-theme hover:bg-surface'
                  }`}
                  title="Test Connection"
                >
                  {testStatus === 'testing' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : testStatus === 'success' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : testStatus === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Globe className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2 flex items-center gap-2">
                <Cpu className="w-3 h-3" /> Model Name
              </label>
              {availableModels.length > 0 ? (
                <select
                  value={ollamaSettings.model}
                  onChange={(e) => setOllamaSettings(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer text-primary"
                >
                  <option value="" disabled>Select a model</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={ollamaSettings.model}
                    onChange={(e) => setOllamaSettings(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="llama3 (or test connection to see list)"
                    className="w-full px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-primary"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-neutral-theme font-bold uppercase">
                    Manual Entry
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2">
                Ingredient Generation Timeout (ms)
              </label>
              <input
                type="number"
                value={timeoutIngredients}
                onChange={(e) => setTimeoutIngredients(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary"
              />
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
};
