import React, { useState, useRef } from 'react';
import { Link, FileText, Upload, Loader2, Sparkles } from 'lucide-react';
import { Modal } from './ui/Modal';

interface ImportRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { url?: string; text?: string }) => Promise<void>;
  isImporting: boolean;
}

export const ImportRecipeModal: React.FC<ImportRecipeModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isImporting
}) => {
  const [tab, setTab] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      setTab('text');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'url' && !url) return;
    if (tab === 'text' && !text) return;

    await onImport(tab === 'url' ? { url } : { text });
    setUrl('');
    setText('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Recipe"
      maxWidth="max-w-md"
      icon={<Upload className="text-background-theme w-5 h-5" />}
      footer={
        <button
          onClick={handleSubmit}
          disabled={isImporting || (tab === 'url' ? !url : !text)}
          className="w-full py-4 bg-primary text-background-theme rounded-2xl font-bold hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isImporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Import with AI
            </>
          )}
        </button>
      }
    >
      <div className="flex flex-col h-full bg-background-theme/30">
        <div className="flex border-b border-border-theme bg-background-theme/50 shrink-0 sticky top-0 z-10">
          <button
            onClick={() => setTab('url')}
            className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'url' ? 'text-primary border-b-2 border-primary bg-surface' : 'text-neutral-theme hover:text-primary'
            }`}
          >
            <Link className="w-4 h-4" /> Website URL
          </button>
          <button
            onClick={() => setTab('text')}
            className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'text' ? 'text-primary border-b-2 border-primary bg-surface' : 'text-neutral-theme hover:text-primary'
            }`}
          >
            <FileText className="w-4 h-4" /> Text / File
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {tab === 'url' ? (
            <div className="space-y-4">
              <p className="text-sm text-neutral-theme">
                Enter the URL of a recipe webpage. The AI will attempt to extract the ingredients and directions.
              </p>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/recipe"
                className="w-full px-4 py-3 rounded-xl bg-surface border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-primary"
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-theme">
                  Paste recipe text or upload a text file.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-primary hover:text-secondary transition-colors flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Upload File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".txt,.md"
                  className="hidden"
                />
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste recipe content here..."
                className="w-full h-48 px-4 py-3 rounded-xl bg-surface border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none text-sm text-primary"
                required
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
