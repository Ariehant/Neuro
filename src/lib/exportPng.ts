import { toPng } from 'html-to-image';

export async function exportCanvasPng(filename = 'mindmap.png'): Promise<void> {
  const wrapper = document.querySelector<HTMLElement>('.react-flow');
  if (!wrapper) throw new Error('Canvas not found');
  const dataUrl = await toPng(wrapper, {
    backgroundColor: '#f8fafc',
    pixelRatio: 2,
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true;
      return !node.classList.contains('react-flow__minimap')
        && !node.classList.contains('react-flow__controls')
        && !node.classList.contains('react-flow__attribution')
        && !node.classList.contains('react-flow__panel');
    },
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function downloadJson(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
