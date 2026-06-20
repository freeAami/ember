import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUI } from '@/store/useUI';

export function Toast() {
  const toast = useUI((s) => s.toast);
  const clearToast = useUI((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(clearToast, 2200);
    return () => window.clearTimeout(id);
  }, [toast, clearToast]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass sheen pointer-events-auto rounded-full px-4 py-2 text-sm text-white/85"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
