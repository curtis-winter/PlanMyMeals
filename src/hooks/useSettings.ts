import { useState, useEffect } from 'react';
import { OllamaModelsResponse } from '../types';

export function useSettings() {
  const [ollamaSettings, setOllamaSettings] = useState({ url: '', model: '' });
  const [importPrompt, setImportPrompt] = useState('');
  const [suggestPrompt, setSuggestPrompt] = useState('');
  const [suggestOptions, setSuggestOptions] = useState('');
  const [timeoutSuggest, setTimeoutSuggest] = useState(60000);
  const [timeoutImport, setTimeoutImport] = useState(45000);
  const [timeoutIngredients, setTimeoutIngredients] = useState(30000);
  const [timeoutCleanup, setTimeoutCleanup] = useState(45000);
  const [timeoutPantry, setTimeoutPantry] = useState(90000);
  const [cleanupPrompt, setCleanupPrompt] = useState('');
  const [weekStartDay, setWeekStartDay] = useState('Monday');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        
        const selectedUrl = localStorage.getItem('selectedOllamaServer') || data.ollama_url || '';
        
        setOllamaSettings({
          url: selectedUrl,
          model: data.ollama_model || ''
        });
        setImportPrompt(data.import_prompt || '');
        setSuggestPrompt(data.suggest_prompt || '');
        setSuggestOptions(data.suggest_options || '');
        setTimeoutSuggest(parseInt(data.ollama_timeout_suggest) || 60000);
        setTimeoutImport(parseInt(data.ollama_timeout_import) || 45000);
        setTimeoutIngredients(parseInt(data.ollama_timeout_ingredients) || 30000);
        setTimeoutCleanup(parseInt(data.ollama_timeout_cleanup) || 45000);
        setTimeoutPantry(parseInt(data.ollama_timeout_pantry) || 90000);
        setCleanupPrompt(data.cleanup_prompt || '');
        setWeekStartDay(data.week_start_day || 'Monday');
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ollama_url: ollamaSettings.url,
          ollama_model: ollamaSettings.model,
          import_prompt: importPrompt,
          suggest_prompt: suggestPrompt,
          suggest_options: suggestOptions,
          ollama_timeout_suggest: timeoutSuggest,
          ollama_timeout_import: timeoutImport,
          ollama_timeout_ingredients: timeoutIngredients,
          ollama_timeout_cleanup: timeoutCleanup,
          ollama_timeout_pantry: timeoutPantry,
          cleanup_prompt: cleanupPrompt,
          week_start_day: weekStartDay
        })
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save settings:', err);
      return false;
    }
  };

  const testConnection = async (urlToTest?: string) => {
    setTestStatus('testing');
    const url = urlToTest || ollamaSettings.url;
    try {
      const res = await fetch(`/api/ai/test-connection?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (res.ok) {
        setTestStatus('success');
        if (data.models) {
          const modelNames = data.models.map((m) => m.name);
          setAvailableModels(modelNames);
        }
      } else {
        setTestStatus('error');
        setAvailableModels([]);
      }
    } catch (err) {
      setTestStatus('error');
      setAvailableModels([]);
    }
  };

  return {
    ollamaSettings,
    setOllamaSettings,
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
    timeoutCleanup,
    setTimeoutCleanup,
    timeoutPantry,
    setTimeoutPantry,
    cleanupPrompt,
    setCleanupPrompt,
    weekStartDay,
    setWeekStartDay,
    availableModels,
    testStatus,
    darkMode,
    setDarkMode,
    saveSettings,
    testConnection
  };
}
