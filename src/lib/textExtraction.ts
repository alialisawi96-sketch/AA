import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(dataUrl: string): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument(dataUrl);
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

export async function extractTextFromImage(dataUrl: string): Promise<string> {
  try {
    const worker = await createWorker('ara');
    const { data: { text } } = await worker.recognize(dataUrl);
    await worker.terminate();
    return text.trim();
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return '';
  }
}
