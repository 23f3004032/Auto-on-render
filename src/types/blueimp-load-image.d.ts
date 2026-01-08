/// <reference types="blueimp-load-image" />

declare module 'blueimp-load-image' {
  interface LoadImageOptions {
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
    canvas?: boolean;
    orientation?: boolean | number;
    crop?: boolean;
    crossOrigin?: string;
    noRevoke?: boolean;
  }

  interface LoadImage {
    (
      file: File | Blob | string,
      callback: (img: HTMLCanvasElement | HTMLImageElement | Event) => void,
      options?: LoadImageOptions
    ): void;
  }

  const loadImage: LoadImage;
  export = loadImage;
}
