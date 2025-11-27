/**
 * Wrapper para pdfjs-dist que funciona apenas no cliente
 * Evita erros de importação no build
 */

let pdfjsLib: any = null;

export const loadPdfJs = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!pdfjsLib) {
    // Importa apenas no lado do cliente
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
    
    // Configurar worker usando CDN
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
  }

  return pdfjsLib;
};

export default loadPdfJs;
