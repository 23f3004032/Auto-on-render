import loadImage from 'blueimp-load-image';

export interface ProcessedImageResult {
  blob: Blob;
  preview: string;
  width: number;
  height: number;
  wasRotated: boolean;
  originalOrientation: 'portrait' | 'landscape';
}

export async function processImage(file: File): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    loadImage(
      file,
      async (img) => {
        if (img instanceof Event) {
          reject(new Error('Failed to load image'));
          return;
        }

        const canvas = img as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        let width = canvas.width;
        let height = canvas.height;
        const originalOrientation = width < height ? 'portrait' : 'landscape';
        let wasRotated = false;

        if (height > width) {
          const rotatedCanvas = document.createElement('canvas');
          rotatedCanvas.width = height;
          rotatedCanvas.height = width;
          const rotatedCtx = rotatedCanvas.getContext('2d');

          if (!rotatedCtx) {
            reject(new Error('Failed to create rotation canvas'));
            return;
          }

          rotatedCtx.translate(height / 2, width / 2);
          rotatedCtx.rotate((-90 * Math.PI) / 180);
          rotatedCtx.drawImage(canvas, -width / 2, -height / 2);

          rotatedCanvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob from rotated canvas'));
                return;
              }

              console.log(`✓ Created rotated blob: ${blob.size} bytes, type: ${blob.type}`);
              
              const preview = URL.createObjectURL(blob);
              resolve({
                blob,
                preview,
                width: rotatedCanvas.width,
                height: rotatedCanvas.height,
                wasRotated: true,
                originalOrientation,
              });
            },
            'image/jpeg',
            0.92
          );

          wasRotated = true;
        } else {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob from canvas'));
                return;
              }

              console.log(`✓ Created landscape blob: ${blob.size} bytes, type: ${blob.type}`);

              const preview = URL.createObjectURL(blob);
              resolve({
                blob,
                preview,
                width: canvas.width,
                height: canvas.height,
                wasRotated: false,
                originalOrientation,
              });
            },
            'image/jpeg',
            0.92
          );
        }
      },
      {
        maxWidth: 3000,
        maxHeight: 3000,
        canvas: true,
        orientation: true,
      }
    );
  });
}

export function isValidImageType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function getFileSizeDisplay(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if image is portrait orientation
 */
export function isPortraitImage(width: number, height: number): boolean {
  return height > width;
}

/**
 * Create a thumbnail preview
 */
export async function createThumbnail(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400
): Promise<string> {
  return new Promise((resolve, reject) => {
    loadImage(
      file,
      (img) => {
        if (img instanceof Event) {
          reject(new Error('Failed to load thumbnail'));
          return;
        }

        const canvas = img as HTMLCanvasElement;
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      },
      {
        maxWidth,
        maxHeight,
        canvas: true,
        orientation: true,
      }
    );
  });
}

/**
 * Convert blob to base64 for DOCX embedding
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data:image/jpeg;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert blob to Uint8Array for DOCX (browser-compatible)
 */
export function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(e.target.result));
      } else {
        reject(new Error('Failed to read blob as ArrayBuffer'));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Convert File to ArrayBuffer for processing
 */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Rotate an image by 90 degrees anti-clockwise
 */
export async function rotateImage(blob: Blob, currentRotation: number = 0): Promise<{ blob: Blob; preview: string; width: number; height: number; rotation: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Swap width and height for 90-degree rotation
      canvas.width = img.height;
      canvas.height = img.width;

      // Rotate anti-clockwise (counter-clockwise) by 90 degrees
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((-90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob(
        (rotatedBlob) => {
          if (!rotatedBlob) {
            reject(new Error('Failed to create rotated blob'));
            return;
          }

          const preview = URL.createObjectURL(rotatedBlob);
          const newRotation = (currentRotation + 90) % 360;

          resolve({
            blob: rotatedBlob,
            preview,
            width: canvas.width,
            height: canvas.height,
            rotation: newRotation,
          });
        },
        'image/jpeg',
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for rotation'));
    };

    img.src = url;
  });
}
