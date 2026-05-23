import { useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Canvas } from './components/Canvas';
import { useRoadmapStore } from './store/roadmapStore';
import { useKeyboardShortcuts } from './lib/shortcuts';

export default function App() {
  const hydrate = useRoadmapStore((s) => s.hydrate);
  const flushSave = useRoadmapStore((s) => s.flushSave);

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

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50 font-sans text-slate-900">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <LeftSidebar />
        <main className="relative min-w-0 flex-1">
          <Canvas />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
