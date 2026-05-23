import { useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Canvas } from './components/Canvas';
import { SearchPanel } from './components/SearchPanel';
import { ShortcutsModal } from './components/ShortcutsModal';
import { PresentationBar } from './components/PresentationBar';
import { useRoadmapStore } from './store/roadmapStore';
import { useKeyboardShortcuts } from './lib/shortcuts';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const hydrate = useRoadmapStore((s) => s.hydrate);
  const hydrated = useRoadmapStore((s) => s.hydrated);
  const flushSave = useRoadmapStore((s) => s.flushSave);
  const presentation = useRoadmapStore((s) => s.presentation);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    function onBeforeUnload() {
      flushSave();
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [flushSave]);

  useKeyboardShortcuts();
  useTheme();

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {!presentation && <TopBar />}
      <div className="flex min-h-0 flex-1">
        {!presentation && <LeftSidebar />}
        <main className="relative min-w-0 flex-1">
          <Canvas />
        </main>
        {!presentation && <RightSidebar />}
      </div>
      <SearchPanel />
      <ShortcutsModal />
      <PresentationBar />
    </div>
  );
}
