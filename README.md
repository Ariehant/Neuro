# Neuro

A fully-local, browser-based mind map / roadmap creator. No backend, no
signup — your data lives in your browser (IndexedDB) and travels with you
via JSON / Markdown / OPML / PNG / SVG / PDF export. Self-host on any
static web server.

## Stack

- Vite + React 18 + TypeScript
- [`@xyflow/react`](https://reactflow.dev/) for the infinite canvas
- [Zustand](https://github.com/pmndrs/zustand) for state with per-map undo/redo
- Tailwind CSS for styling (dark mode included)
- `idb-keyval` for IndexedDB persistence
- `vite-plugin-pwa` for installable offline app
- `marked` + `DOMPurify` for Markdown nodes
- `jspdf` + `html-to-image` for image / PDF export

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Features

### 8 node types in the palette
- **Topic** — colored box with title + description (roadmap.sh style)
- **Sticky** — freeform note
- **Checklist** — list of checkable items
- **Link group** — cluster of external resources
- **Image** — drag/drop or paste an image
- **Markdown** — rich-text rendered from Markdown
- **Code** — language-tagged code snippet
- **Group** — resizable container for clustering nodes

### Editing freedom
- **Inline editing** — double-click any node label/text to edit in place
- **Per-node color picker** (12 colors)
- **Text style** — bold / italic / alignment / font size
- **Edge labels** + style picker — straight / step / smoothstep / bezier, animated, dashed, arrowheads, stroke width, color
- **Multi-select** with rubber-band or Shift-click; bulk recolor / move / delete
- **Copy / cut / paste** within and across mind maps
- **Snap-to-grid** toggle

### Canvas
- Dots / lines / cross / blank backgrounds
- Mini-map (toggleable) with color-aware nodes
- Zoom / pan controls
- **Dark mode** (system / manual)
- **Presentation mode** — full-screen, read-only

### Organization
- **Multiple mind maps** stored locally, listed in the left sidebar
- **Folders** — drag maps into folders, collapse / expand
- **Tags** per mind map
- **Cross-map search** (Cmd/Ctrl + K) — searches titles, tags, and node contents
- **Template gallery** — Blank, Frontend roadmap, Project plan, Retrospective, Brainstorm, OKRs

### History & saving
- **Per-map undo / redo** with 50-step history
- **Auto-save** debounced to IndexedDB
- Save indicator in top bar; Cmd/Ctrl+S force flush

### Import / Export
- **Export**: PNG, SVG, PDF, JSON, Markdown outline
- **Import**: JSON, Markdown outline, OPML

### Keyboard shortcuts (press `?` to see them all)
| Keys | Action |
| --- | --- |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z / Cmd/Ctrl + Y | Redo |
| Cmd/Ctrl + S | Force save |
| Cmd/Ctrl + C / X / V | Copy / Cut / Paste |
| Cmd/Ctrl + D | Duplicate selection |
| Cmd/Ctrl + A | Select all |
| Cmd/Ctrl + K | Search |
| Cmd/Ctrl + N | New mind map |
| Cmd/Ctrl + . | Toggle dark mode |
| Delete / Backspace | Delete selection |
| Arrow keys | Move selection (Shift = 10×) |
| F | Toggle presentation mode |
| G | Toggle snap-to-grid |
| ? | Show shortcuts |
| Esc | Clear selection / close dialog |

### Accessibility
- Full keyboard navigation, visible focus rings
- ARIA labels on canvas controls
- High-contrast palette in light + dark
- `prefers-color-scheme` respected when theme is "system"

### Offline / PWA
The build emits a service worker so the app keeps working without
internet and is installable as a standalone app.

## Self-host

### Static hosting
Any static host (nginx, Caddy, S3, Netlify, GitHub Pages, etc.) works:

```bash
npm run build
# upload dist/ to your host
```

Make sure unknown paths fall back to `/index.html`.

### Docker
A `Dockerfile` + `docker/nginx.conf` are included:

```bash
docker build -t neuro .
docker run --rm -p 8080:80 neuro
```

The image builds the static bundle and serves it via nginx with SPA
fallback and PWA-friendly caching.

## Data shape

```json
{
  "id": "...",
  "title": "Frontend Roadmap",
  "nodes": [
    {
      "id": "...",
      "type": "topic",
      "position": { "x": 0, "y": 0 },
      "data": { "kind": "topic", "label": "...", "color": "yellow" }
    }
  ],
  "edges": [
    {
      "id": "...",
      "source": "...",
      "target": "...",
      "type": "smoothstep",
      "label": "depends on",
      "style": { "dashed": true, "animated": false }
    }
  ],
  "folderId": null,
  "tags": ["learning"],
  "createdAt": 0,
  "updatedAt": 0
}
```

Persisted under the IndexedDB key `neuro.state.v2`. Legacy
`neuro.state.v1` is auto-migrated.
