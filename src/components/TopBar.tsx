import { useRef, useState } from 'react';
import { selectActiveRoadmap, useRoadmapStore } from '../store/roadmapStore';
import { downloadJson, exportCanvasPng } from '../lib/exportPng';
import { exportRoadmapJson, parseRoadmapJson } from '../lib/storage';

function formatTime(ts: number | null) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function SaveIndicator() {
  const status = useRoadmapStore((s) => s.saveStatus);
  const lastSavedAt = useRoadmapStore((s) => s.lastSavedAt);
  const label =
    status === 'saved'
      ? lastSavedAt
        ? `Saved at ${formatTime(lastSavedAt)}`
        : 'Saved'
      : 'Saving...';
  return (
    <span
      className={`text-xs ${status === 'saved' ? 'text-emerald-700' : 'text-amber-700'}`}
      title="Auto-saved to your browser's local storage"
    >
      {label}
    </span>
  );
}

export function TopBar() {
  const roadmap = useRoadmapStore(selectActiveRoadmap);
  const renameRoadmap = useRoadmapStore((s) => s.renameRoadmap);
  const importRoadmap = useRoadmapStore((s) => s.importRoadmap);
  const undo = useRoadmapStore((s) => s.undo);
  const redo = useRoadmapStore((s) => s.redo);
  const canUndo = useRoadmapStore((s) => s.canUndo());
  const canRedo = useRoadmapStore((s) => s.canRedo());

  const fileInput = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  if (!roadmap) return null;

  async function onExportPng() {
    if (!roadmap) return;
    setBusy(true);
    try {
      const safe = roadmap.title.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 40) || 'mindmap';
      await exportCanvasPng(`${safe}.png`);
    } catch (err) {
      console.error(err);
      alert('Failed to export PNG.');
    } finally {
      setBusy(false);
    }
  }

  function onExportJson() {
    if (!roadmap) return;
    const safe = roadmap.title.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 40) || 'mindmap';
    downloadJson(exportRoadmapJson(roadmap), `${safe}.json`);
  }

  function onImportClick() {
    fileInput.current?.click();
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseRoadmapJson(text);
      importRoadmap(parsed);
    } catch (err) {
      console.error(err);
      alert('Could not import: file is not a valid mind map JSON.');
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-sky-600 text-white">
          <span className="text-sm font-bold">N</span>
        </div>
        <input
          value={roadmap.title}
          onChange={(e) => renameRoadmap(roadmap.id, e.target.value)}
          className="w-72 rounded border border-transparent px-2 py-1 text-base font-semibold text-slate-900 hover:border-slate-200 focus:border-sky-500 focus:outline-none"
          placeholder="Untitled mind map"
        />
        <SaveIndicator />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          title="Undo (Cmd/Ctrl+Z)"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          title="Redo (Cmd/Ctrl+Shift+Z)"
        >
          Redo
        </button>
        <div className="mx-1 h-6 w-px bg-slate-200" />
        <button
          type="button"
          onClick={onImportClick}
          className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
        >
          Import JSON
        </button>
        <button
          type="button"
          onClick={onExportJson}
          className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={onExportPng}
          disabled={busy}
          className="rounded bg-sky-600 px-2.5 py-1 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {busy ? 'Exporting...' : 'Export PNG'}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          onChange={onFileChosen}
          className="hidden"
        />
      </div>
    </header>
  );
}
