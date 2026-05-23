import { useRoadmapStore, selectActiveRoadmap } from '../store/roadmapStore';

export function PresentationBar() {
  const presentation = useRoadmapStore((s) => s.presentation);
  const toggle = useRoadmapStore((s) => s.togglePresentation);
  const roadmap = useRoadmapStore(selectActiveRoadmap);

  if (!presentation) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center p-3">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-slate-900/80 px-4 py-1.5 text-sm text-white shadow-lg backdrop-blur">
        <span className="font-semibold">{roadmap?.title ?? ''}</span>
        <span className="text-xs opacity-70">Presentation</span>
        <button
          type="button"
          onClick={toggle}
          className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium hover:bg-white/20"
          title="Exit (Esc / F)"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
