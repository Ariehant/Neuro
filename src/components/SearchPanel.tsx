import { useEffect, useMemo, useState } from 'react';
import { useRoadmapStore } from '../store/roadmapStore';
import { searchAll, type SearchHit } from '../lib/search';

export function SearchPanel() {
  const open = useRoadmapStore((s) => s.searchOpen);
  const setOpen = useRoadmapStore((s) => s.setSearchOpen);
  const roadmaps = useRoadmapStore((s) => s.roadmaps);
  const setActive = useRoadmapStore((s) => s.setActiveRoadmap);
  const setSelectedNodes = useRoadmapStore((s) => s.setSelectedNodes);

  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);

  const hits: SearchHit[] = useMemo(() => searchAll(q, roadmaps), [q, roadmaps]);

  useEffect(() => {
    if (!open) {
      setQ('');
      setCursor(0);
    }
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [q]);

  if (!open) return null;

  function go(h: SearchHit) {
    setActive(h.roadmapId);
    if (h.nodeId) setSelectedNodes([h.nodeId]);
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="mt-24 w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
            else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setCursor((c) => Math.min(hits.length - 1, c + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setCursor((c) => Math.max(0, c - 1));
            } else if (e.key === 'Enter') {
              const h = hits[cursor];
              if (h) go(h);
            }
          }}
          placeholder="Search mind maps, tags, or node contents..."
          className="w-full rounded-t-lg border-b border-slate-200 bg-transparent px-4 py-3 text-base outline-none dark:border-slate-700 dark:text-slate-100"
        />
        <ul className="max-h-96 overflow-y-auto">
          {hits.length === 0 && q && (
            <li className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">No matches</li>
          )}
          {hits.map((h, i) => (
            <li key={`${h.roadmapId}-${h.matchType}-${h.nodeId ?? i}`}>
              <button
                type="button"
                onClick={() => go(h)}
                onMouseEnter={() => setCursor(i)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm ${
                  cursor === i ? 'bg-sky-50 dark:bg-sky-900/40' : ''
                }`}
              >
                <span className="w-16 shrink-0 text-xs uppercase text-slate-500 dark:text-slate-400">{h.matchType}</span>
                <span className="flex-1 truncate">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{h.roadmapTitle}</span>
                  <span className="ml-2 text-slate-500 dark:text-slate-400">{h.snippet}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          ↑ ↓ navigate · ⏎ open · Esc close
        </div>
      </div>
    </div>
  );
}
