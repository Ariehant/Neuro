import { useState } from 'react';
import { useRoadmapStore } from '../store/roadmapStore';
import type { NodeKind } from '../types';

const PALETTE: Array<{ kind: NodeKind; label: string; description: string; preview: string }> = [
  { kind: 'topic', label: 'Topic block', description: 'Roadmap-style colored box', preview: 'bg-yellow-200 border-yellow-400' },
  { kind: 'checklist', label: 'Checklist', description: 'List with checkable items', preview: 'bg-blue-200 border-blue-400' },
  { kind: 'linkGroup', label: 'Link group', description: 'Cluster of resource links', preview: 'bg-green-200 border-green-400' },
  { kind: 'sticky', label: 'Sticky note', description: 'Freeform text', preview: 'bg-yellow-100 border-yellow-300' },
];

export function LeftSidebar() {
  const roadmaps = useRoadmapStore((s) => s.roadmaps);
  const activeId = useRoadmapStore((s) => s.activeRoadmapId);
  const setActive = useRoadmapStore((s) => s.setActiveRoadmap);
  const createRoadmap = useRoadmapStore((s) => s.createRoadmap);
  const deleteRoadmap = useRoadmapStore((s) => s.deleteRoadmap);
  const renameRoadmap = useRoadmapStore((s) => s.renameRoadmap);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  function onDragStart(e: React.DragEvent, kind: NodeKind) {
    e.dataTransfer.setData('application/x-neuro-node', kind);
    e.dataTransfer.effectAllowed = 'move';
  }

  const sorted = Object.values(roadmaps).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Palette</div>
        <div className="mt-2 space-y-2">
          {PALETTE.map((item) => (
            <div
              key={item.kind}
              draggable
              onDragStart={(e) => onDragStart(e, item.kind)}
              className={`cursor-grab rounded-md border-2 px-3 py-2 active:cursor-grabbing ${item.preview}`}
              title="Drag onto the canvas"
            >
              <div className="text-sm font-semibold text-slate-900">{item.label}</div>
              <div className="text-xs text-slate-700">{item.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mind maps</div>
          <button
            type="button"
            onClick={() => createRoadmap()}
            className="rounded bg-sky-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-sky-700"
            title="New mind map"
          >
            + New
          </button>
        </div>
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
          {sorted.map((rm) => {
            const isActive = rm.id === activeId;
            const isEditing = editingId === rm.id;
            return (
              <li
                key={rm.id}
                className={`group flex items-center gap-1 rounded px-2 py-1.5 text-sm ${
                  isActive ? 'bg-sky-50 text-sky-900' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                {isEditing ? (
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={() => {
                      if (draftTitle.trim()) renameRoadmap(rm.id, draftTitle.trim());
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (draftTitle.trim()) renameRoadmap(rm.id, draftTitle.trim());
                        setEditingId(null);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    className="flex-1 rounded border border-slate-300 px-1.5 py-0.5 text-sm outline-none focus:border-sky-500"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setActive(rm.id)}
                    onDoubleClick={() => {
                      setEditingId(rm.id);
                      setDraftTitle(rm.title);
                    }}
                    className="flex-1 truncate text-left"
                    title="Double-click to rename"
                  >
                    {rm.title}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${rm.title}"? This cannot be undone.`)) {
                      deleteRoadmap(rm.id);
                    }
                  }}
                  className="invisible rounded px-1 text-xs text-slate-500 hover:bg-red-100 hover:text-red-700 group-hover:visible"
                  title="Delete"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
