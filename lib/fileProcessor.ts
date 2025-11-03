import { Map } from '@/types';
import { compressImage, getBase64Size } from './imageUtils';

const MAX_FILE_SIZE_MB = 4;
const IMAGE_MAX_WIDTH = 1920;
const IMAGE_MAX_HEIGHT = 1080;
const IMAGE_QUALITY = 0.7;

interface ProcessedFile {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Processa arquivo de imagem com compressão
 */
async function processImageFile(file: File): Promise<ProcessedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const dataUrl = event.target?.result as string;
        const compressedDataUrl = await compressImage(
          dataUrl,
          IMAGE_MAX_WIDTH,
          IMAGE_MAX_HEIGHT,
          IMAGE_QUALITY
        );

        const size = getBase64Size(compressedDataUrl);

        if (size > MAX_FILE_SIZE_MB) {
          reject(new Error(
            'Imagem muito grande! Por favor, use uma imagem menor ou de menor qualidade.'
          ));
          return;
        }

        const img = new Image();
        img.onload = () => {
          resolve({
            dataUrl: compressedDataUrl,
            width: img.width,
            height: img.height,
          });
        };
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = compressedDataUrl;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Processa arquivo PDF
 */
async function processPdfFile(file: File): Promise<ProcessedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const dataUrl = event.target?.result as string;
        const size = getBase64Size(dataUrl);

        if (size > MAX_FILE_SIZE_MB) {
          reject(new Error(
            'PDF muito grande! Por favor, converta para imagem primeiro usando o script convert-pdf.sh ou use uma ferramenta online.'
          ));
          return;
        }

        resolve({
          dataUrl,
          width: IMAGE_MAX_WIDTH,
          height: IMAGE_MAX_HEIGHT,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Cria objeto Map a partir de arquivo processado
 */
function createMapFromFile(
  processedFile: ProcessedFile,
  fileName: string,
  name?: string,
  description?: string
): Map {
  return {
    id: Date.now().toString(),
    name: name || fileName,
    description: description || '',
    imageUrl: processedFile.dataUrl,
    imageType: fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
    width: processedFile.width,
    height: processedFile.height,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Processa upload de arquivo e retorna objeto Map
 */
export async function processMapFile(
  file: File,
  name?: string,
  description?: string
): Promise<Map> {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  if (!isImage && !isPdf) {
    throw new Error('Arquivo deve ser uma imagem ou PDF');
  }

  const processedFile = isImage
    ? await processImageFile(file)
    : await processPdfFile(file);

  return createMapFromFile(processedFile, file.name, name, description);
}
