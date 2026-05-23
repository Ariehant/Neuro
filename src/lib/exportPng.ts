import { toPng, toSvg } from 'html-to-image';

type ExportOptions = {
  background?: string;
  pixelRatio?: number;
};

function filter(node: HTMLElement): boolean {
  if (!(node instanceof HTMLElement)) return true;
  return (
    !node.classList.contains('react-flow__minimap') &&
    !node.classList.contains('react-flow__controls') &&
    !node.classList.contains('react-flow__attribution') &&
    !node.classList.contains('react-flow__panel')
  );
}

export async function exportCanvasPng(filename: string, opts: ExportOptions = {}): Promise<void> {
  const wrapper = document.querySelector<HTMLElement>('.react-flow');
  if (!wrapper) throw new Error('Canvas not found');
  const dataUrl = await toPng(wrapper, {
    backgroundColor: opts.background ?? '#f8fafc',
    pixelRatio: opts.pixelRatio ?? 2,
    filter,
    cacheBust: true,
  });
  triggerDownload(dataUrl, filename);
}

export async function exportCanvasSvg(filename: string, opts: ExportOptions = {}): Promise<void> {
  const wrapper = document.querySelector<HTMLElement>('.react-flow');
  if (!wrapper) throw new Error('Canvas not found');
  const dataUrl = await toSvg(wrapper, {
    backgroundColor: opts.background ?? '#f8fafc',
    filter,
    cacheBust: true,
  });
  triggerDownload(dataUrl, filename);
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
}

export function downloadJson(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}

export function downloadText(text: string, filename: string, mime = 'text/plain'): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}
