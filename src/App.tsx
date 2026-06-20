import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import { useHotkeys } from '@/hooks/useHotkeys';
import { applyAccent } from '@/lib/accents';
import { Dock } from '@/components/layout/Dock';
import { TodayView } from '@/components/dashboard/TodayView';
import { ArchiveView } from '@/components/archive/ArchiveView';
import { SettingsView } from '@/components/settings/SettingsView';
import { WeeklyReviewModal } from '@/components/review/WeeklyReviewModal';

// Analytics pulls in the charting library — load it only when opened
// so the initial canvas stays light and startup feels instant.
const AnalyticsView = lazy(() =>
  import('@/components/analytics/AnalyticsView').then((m) => ({ default: m.AnalyticsView })),
);
import { FocusMode } from '@/components/focus/FocusMode';
import { CommandPalette } from '@/components/command/CommandPalette';
import { PlanningPanel } from '@/components/goals/PlanningPanel';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { Toast } from '@/components/ui/Toast';

export default function App() {
  const settings = useStore((s) => s.settings);
  const reconcile = useStore((s) => s.reconcile);
  const view = useUI((s) => s.view);

  useHotkeys();

  // Apply accent whenever it changes.
  useEffect(() => applyAccent(settings.accent), [settings.accent]);

  // Atmosphere toggles on the document root.
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
    document.documentElement.style.setProperty('--grain-opacity', settings.grain ? '0.045' : '0');
  }, [settings.reduceMotion, settings.grain]);

  // Seal past days & roll over — on launch, on focus, and at the minute mark.
  useEffect(() => {
    reconcile();
    const id = window.setInterval(reconcile, 60_000);
    window.addEventListener('focus', reconcile);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', reconcile);
    };
  }, [reconcile]);

  if (!settings.onboarded) {
    return (
      <>
        <div className="app-aurora" />
        <div className="app-grain" />
        <Onboarding />
      </>
    );
  }

  return (
    <>
      <div className="app-aurora" />
      <div className="app-grain" />

      <div className="relative z-10 flex h-full">
        <Dock />
        <main className="scroll-region flex-1 px-5 pb-24 pt-8 sm:px-10 sm:pb-10 sm:pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === 'today' && <TodayView />}
              {view === 'analytics' && (
                <Suspense fallback={<ViewFallback />}>
                  <AnalyticsView />
                </Suspense>
              )}
              {view === 'archive' && <ArchiveView />}
              {view === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <FocusMode />
      <PlanningPanel />
      <WeeklyReviewModal />
      <CommandPalette />
      <Toast />
    </>
  );
}

function ViewFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="h-8 w-40 rounded-lg bg-white/[0.04] shimmer" />
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[var(--radius)] bg-white/[0.03] shimmer" />
        ))}
      </div>
      <div className="mt-4 h-64 rounded-[var(--radius)] bg-white/[0.03] shimmer" />
    </div>
  );
}
