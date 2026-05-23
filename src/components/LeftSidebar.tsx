import { useMemo, useState } from 'react';
import { useRoadmapStore } from '../store/roadmapStore';
import type { NodeKind, Roadmap } from '../types';

const PALETTE: Array<{ kind: NodeKind; label: string; description: string; preview: string }> = [
  { kind: 'topic', label: 'Topic', description: 'Title + description', preview: 'bg-yellow-200 border-yellow-400 text-yellow-900' },
  { kind: 'sticky', label: 'Sticky', description: 'Freeform note', preview: 'bg-yellow-100 border-yellow-300 text-yellow-900' },
  { kind: 'checklist', label: 'Checklist', description: 'Checkable items', preview: 'bg-blue-200 border-blue-400 text-blue-900' },
  { kind: 'linkGroup', label: 'Links', description: 'External resources', preview: 'bg-green-200 border-green-400 text-green-900' },
  { kind: 'image', label: 'Image', description: 'Drop or upload image', preview: 'bg-pink-200 border-pink-400 text-pink-900' },
  { kind: 'markdown', label: 'Markdown', description: 'Rich text / docs', preview: 'bg-slate-200 border-slate-400 text-slate-900' },
  { kind: 'code', label: 'Code', description: 'Syntax-coloured snippet', preview: 'bg-slate-800 border-slate-600 text-slate-100' },
  { kind: 'group', label: 'Group', description: 'Container for clusters', preview: 'bg-indigo-100 border-2 border-dashed border-indigo-400 text-indigo-900' },
];

export function LeftSidebar() {
  const roadmaps = useRoadmapStore((s) => s.roadmaps);
  const folders = useRoadmapStore((s) => s.folders);
  const activeId = useRoadmapStore((s) => s.activeRoadmapId);
  const setActive = useRoadmapStore((s) => s.setActiveRoadmap);
  const createRoadmap = useRoadmapStore((s) => s.createRoadmap);
  const deleteRoadmap = useRoadmapStore((s) => s.deleteRoadmap);
  const duplicateRoadmap = useRoadmapStore((s) => s.duplicateRoadmap);
  const renameRoadmap = useRoadmapStore((s) => s.renameRoadmap);
  const createFolder = useRoadmapStore((s) => s.createFolder);
  const renameFolder = useRoadmapStore((s) => s.renameFolder);
  const deleteFolder = useRoadmapStore((s) => s.deleteFolder);
  const setRoadmapFolder = useRoadmapStore((s) => s.setRoadmapFolder);
  const setSearchOpen = useRoadmapStore((s) => s.setSearchOpen);

  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  function onDragStart(e: React.DragEvent, kind: NodeKind) {
    e.dataTransfer.setData('application/x-neuro-node', kind);
    e.dataTransfer.effectAllowed = 'move';
  }

  const grouped = useMemo(() => {
    const byFolder: Record<string, Roadmap[]> = { __none: [] };
    Object.values(folders).forEach((f) => (byFolder[f.id] = []));
    Object.values(roadmaps).forEach((r) => {
      const key = r.folderId ?? '__none';
      if (!byFolder[key]) byFolder[key] = [];
      byFolder[key].push(r);
    });
    Object.values(byFolder).forEach((arr) => arr.sort((a, b) => b.updatedAt - a.updatedAt));
    return byFolder;
  }, [roadmaps, folders]);

  function renderMap(rm: Roadmap) {
    const isActive = rm.id === activeId;
    const isEditing = editingMapId === rm.id;
    return (
      <li
        key={rm.id}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('application/x-neuro-map-move', rm.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        className={`group flex items-center gap-1 rounded px-2 py-1.5 text-sm ${
          isActive
            ? 'bg-sky-50 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100'
            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
        }`}
      >
        {isEditing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              if (draft.trim()) renameRoadmap(rm.id, draft.trim());
              setEditingMapId(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (draft.trim()) renameRoadmap(rm.id, draft.trim());
                setEditingMapId(null);
              } else if (e.key === 'Escape') {
                setEditingMapId(null);
              }
            }}
            className="flex-1 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-sm outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-800"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(rm.id)}
            onDoubleClick={() => {
              setEditingMapId(rm.id);
              setDraft(rm.title);
            }}
            className="flex-1 truncate text-left"
            title="Double-click to rename"
          >
            {rm.title}
            {rm.tags.length > 0 && (
              <span className="ml-1 text-xs opacity-60">·{rm.tags.length}</span>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => duplicateRoadmap(rm.id)}
          className="invisible rounded px-1 text-xs text-slate-500 hover:bg-slate-200 group-hover:visible dark:hover:bg-slate-700"
          title="Duplicate"
        >
          ⧉
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Delete "${rm.title}"?`)) deleteRoadmap(rm.id);
          }}
          className="invisible rounded px-1 text-xs text-slate-500 hover:bg-red-100 hover:text-red-700 group-hover:visible dark:hover:bg-red-900/50"
          title="Delete"
        >
          ×
        </button>
      </li>
    );
  }

  function FolderDropTarget({
    folderId,
    children,
  }: {
    folderId: string | null;
    children: React.ReactNode;
  }) {
    return (
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('application/x-neuro-map-move')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }
        }}
        onDrop={(e) => {
          const id = e.dataTransfer.getData('application/x-neuro-map-move');
          if (id) setRoadmapFolder(id, folderId);
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Palette</div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {PALETTE.map((item) => (
            <div
              key={item.kind}
              draggable
              onDragStart={(e) => onDragStart(e, item.kind)}
              className={`cursor-grab select-none rounded-md border-2 px-2 py-1.5 text-xs active:cursor-grabbing ${item.preview}`}
              title={`Drag to canvas — ${item.description}`}
            >
              <div className="font-semibold">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-3 pt-3 pb-2 dark:border-slate-700">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mind maps</div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              title="Search (Cmd/Ctrl+K)"
              className="rounded px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              🔍
            </button>
            <button
              type="button"
              onClick={() => createFolder('New folder')}
              title="New folder"
              className="rounded px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              📁
            </button>
            <button
              type="button"
              onClick={() => createRoadmap()}
              className="rounded bg-sky-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-sky-700"
              title="New mind map"
            >
              + New
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2">
          {Object.values(folders).sort((a, b) => a.createdAt - b.createdAt).map((f) => {
            const collapsed = collapsedFolders[f.id];
            const list = grouped[f.id] ?? [];
            return (
              <FolderDropTarget key={f.id} folderId={f.id}>
                <div className="mb-1">
                  <div className="group flex items-center gap-1 rounded px-1 py-1 text-xs text-slate-600 dark:text-slate-300">
                    <button
                      type="button"
                      onClick={() => setCollapsedFolders((s) => ({ ...s, [f.id]: !collapsed }))}
                      className="w-4 text-left"
                    >
                      {collapsed ? '▸' : '▾'}
                    </button>
                    {editingFolderId === f.id ? (
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => {
                          if (draft.trim()) renameFolder(f.id, draft.trim());
                          setEditingFolderId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (draft.trim()) renameFolder(f.id, draft.trim());
                            setEditingFolderId(null);
                          } else if (e.key === 'Escape') {
                            setEditingFolderId(null);
                          }
                        }}
                        className="flex-1 rounded border border-slate-300 bg-white px-1 py-0.5 text-xs outline-none dark:border-slate-600 dark:bg-slate-800"
                      />
                    ) : (
                      <button
                        type="button"
                        onDoubleClick={() => {
                          setEditingFolderId(f.id);
                          setDraft(f.name);
                        }}
                        className="flex-1 truncate text-left font-semibold uppercase tracking-wide"
                      >
                        {f.name} <span className="opacity-50">({list.length})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete folder "${f.name}"? Mind maps inside will move to root.`)) {
                          deleteFolder(f.id);
                        }
                      }}
                      className="invisible rounded px-1 hover:bg-red-100 hover:text-red-700 group-hover:visible dark:hover:bg-red-900/50"
                    >
                      ×
                    </button>
                  </div>
                  {!collapsed && <ul className="ml-3 space-y-0.5">{list.map(renderMap)}</ul>}
                </div>
              </FolderDropTarget>
            );
          })}
          <FolderDropTarget folderId={null}>
            <ul className="space-y-0.5">{(grouped.__none ?? []).map(renderMap)}</ul>
          </FolderDropTarget>
        </div>
      </div>
    </aside>
  );
}
