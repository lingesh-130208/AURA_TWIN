import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CitizenToastNotification } from '../../types/toast';
import { citizenNotificationService } from '../../services/citizenNotificationService';
import { CitizenToastItem } from './CitizenToastItem';

export const CitizenToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<CitizenToastNotification[]>([]);

  useEffect(() => {
    setToasts(citizenNotificationService.getToasts());

    const unsub = citizenNotificationService.subscribe(() => {
      setToasts([...citizenNotificationService.getToasts()]);
    });

    return unsub;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex flex-col space-y-3 w-full max-w-sm sm:max-w-md pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full"
          >
            <CitizenToastItem
              toast={toast}
              onDismiss={(id) => citizenNotificationService.dismiss(id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
