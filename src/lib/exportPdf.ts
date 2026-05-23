import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function exportCanvasPdf(filename: string, background = '#ffffff'): Promise<void> {
  const wrapper = document.querySelector<HTMLElement>('.react-flow');
  if (!wrapper) throw new Error('Canvas not found');
  const dataUrl = await toPng(wrapper, {
    backgroundColor: background,
    pixelRatio: 2,
    cacheBust: true,
    filter: (node) =>
      !(node instanceof HTMLElement) ||
      (!node.classList.contains('react-flow__minimap') &&
        !node.classList.contains('react-flow__controls') &&
        !node.classList.contains('react-flow__attribution') &&
        !node.classList.contains('react-flow__panel')),
  });

  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('Failed to load PNG for PDF'));
    img.src = dataUrl;
  });

  const orientation = img.width >= img.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'px', format: [img.width, img.height] });
  pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
  pdf.save(filename);
}
