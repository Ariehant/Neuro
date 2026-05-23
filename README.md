# Neuro

A fully-local, browser-based mind map / roadmap creator. No backend, no signup — your data lives in your browser's `localStorage`.

## Stack

- Vite + React 18 + TypeScript
- [`@xyflow/react`](https://reactflow.dev/) (React Flow) for the canvas
- [Zustand](https://github.com/pmndrs/zustand) for state with undo/redo history
- Tailwind CSS for styling
- `html-to-image` for PNG export

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Features

- **Palette → Canvas drag-and-drop** for four node types: Topic block, Checklist, Link group, Sticky note
- **Properties panel** on the right edits the selected node (label, color, items, links, etc.)
- **Multiple mind maps**, listed in the left sidebar (double-click to rename, hover to delete)
- **Auto-save** to `localStorage` (debounced ~600ms)
- **Undo / redo** with up to 50 history steps per mind map
- **Keyboard shortcuts**:
  - `Cmd/Ctrl+Z` — undo
  - `Cmd/Ctrl+Shift+Z` / `Cmd/Ctrl+Y` — redo
  - `Cmd/Ctrl+S` — force flush save
  - `Cmd/Ctrl+D` — duplicate selected node
  - `Delete` / `Backspace` — delete selected node or edge
- **Export PNG** (WYSIWYG) and **Export / Import JSON**

## Data shape

Each mind map is stored as:

```json
{
  "id": "...",
  "title": "Frontend Roadmap",
  "nodes": [{ "id": "...", "type": "topic", "position": { "x": 0, "y": 0 }, "data": { "kind": "topic", "label": "...", "color": "yellow" } }],
  "edges": [{ "id": "...", "source": "...", "target": "...", "type": "smoothstep" }],
  "createdAt": 0,
  "updatedAt": 0
}
```

All mind maps live under a single `neuro.state.v1` localStorage key.

## Build

```bash
npm run build
npm run preview
```
