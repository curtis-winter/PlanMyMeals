import { useState, useEffect } from 'react';

export interface OllamaServer {
  id: number;
  name: string;
  url: string;
  created_at: string;
}

export function useOllamaServers() {
  const [servers, setServers] = useState<OllamaServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>(() => {
    return localStorage.getItem('selectedOllamaServer') || '';
  });

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/ollama-servers');
      const data = await res.json();
      setServers(data);
    } catch (err) {
      console.error('Failed to fetch ollama servers:', err);
    }
  };

  const addServer = async (name: string, url: string) => {
    try {
      const res = await fetch('/api/ollama-servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url })
      });
      const data = await res.json();
      if (data.success) {
        await fetchServers();
        return data.id;
      }
    } catch (err) {
      console.error('Failed to add server:', err);
    }
    return null;
  };

  const removeServer = async (id: number) => {
    try {
      await fetch(`/api/ollama-servers/${id}`, { method: 'DELETE' });
      await fetchServers();
    } catch (err) {
      console.error('Failed to remove server:', err);
    }
  };

  const selectServer = (url: string) => {
    setSelectedServer(url);
    localStorage.setItem('selectedOllamaServer', url);
  };

  return {
    servers,
    selectedServer,
    addServer,
    removeServer,
    selectServer,
    fetchServers
  };
}