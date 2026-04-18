import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { Toast } from '../../hooks/useToast';

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${
              toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
              toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            <span className="flex-1 text-sm text-text-theme">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-neutral-theme hover:text-text-theme"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}