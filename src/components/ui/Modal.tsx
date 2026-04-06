import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  fullScreen?: boolean;
  side?: 'center' | 'left' | 'right';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-2xl',
  icon,
  headerActions,
  fullScreen = false,
  side = 'center'
}) => {
  const getInitial = () => {
    if (fullScreen) return { opacity: 0, y: '100%' };
    if (side === 'left') return { x: '-100%' };
    if (side === 'right') return { x: '100%' };
    return { scale: 0.95, opacity: 0, y: 20 };
  };

  const getAnimate = () => {
    if (fullScreen) return { opacity: 1, y: 0 };
    if (side === 'left' || side === 'right') return { x: 0 };
    return { scale: 1, opacity: 1, y: 0 };
  };

  const getExit = () => {
    if (fullScreen) return { opacity: 0, y: '100%' };
    if (side === 'left') return { x: '-100%' };
    if (side === 'right') return { x: '100%' };
    return { scale: 0.95, opacity: 0, y: 20 };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-50 flex ${
          side === 'left' ? 'justify-start' : 
          side === 'right' ? 'justify-end' : 
          'items-center justify-center'
        } ${fullScreen ? '' : 'p-4'}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-theme/60 backdrop-blur-sm"
          />
          <motion.div
            initial={getInitial()}
            animate={getAnimate()}
            exit={getExit()}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`relative bg-surface shadow-2xl overflow-hidden flex flex-col border border-border-theme ${
              fullScreen ? 'w-full h-full' : 
              side !== 'center' ? 'h-full w-full max-w-md' :
              `w-full ${maxWidth} rounded-3xl max-h-[90vh]`
            }`}
          >
            <div className={`px-6 py-4 border-b border-border-theme flex items-center justify-between bg-background-theme shrink-0 ${fullScreen || side !== 'center' ? 'sticky top-0 z-20' : ''}`}>
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="bg-primary p-2 rounded-xl">
                    {icon}
                  </div>
                )}
                <h3 className="text-xl font-bold text-primary">{title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {headerActions}
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-surface rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-theme" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {children}
            </div>

            {footer && (
              <div className={`p-6 bg-background-theme border-t border-border-theme shrink-0 ${fullScreen || side !== 'center' ? 'sticky bottom-0 z-20' : ''}`}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
