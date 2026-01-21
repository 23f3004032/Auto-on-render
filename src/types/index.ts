// Image and Upload Types
export interface ImageData {
  id: string;
  file: File;
  preview: string;
  description?: string;
  rotated?: boolean;
  processedBlob?: Blob;
  originalOrientation?: 'portrait' | 'landscape';
  dimensions?: {
    width: number;
    height: number;
  };
  rotationAngle?: number;
}

// Mode Types
export type Mode = 'normal' | 'pro' | 'bulk' | null;

// Pro Mode Options
export interface ProModeOptions {
  addBorder: boolean;
  showDescription: boolean;
  fontSize: number;
  fontColor: string;
  fontType: string;
  boxColor: string;
}

// Font Options
export const FONT_TYPES = [
  'Arial',
  'Calibri',
  'Times New Roman',
  'Georgia',
  'Verdana',
] as const;

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20] as const;

// Color Options
export interface ColorOption {
  name: string;
  value: string;
  hex?: string;
}

export const FONT_COLORS: ColorOption[] = [
  { name: 'Black', value: '000000', hex: '#000000' },
  { name: 'White', value: 'FFFFFF', hex: '#FFFFFF' },
  { name: 'Navy Blue', value: '000080', hex: '#000080' },
  { name: 'Dark Gray', value: '404040', hex: '#404040' },
  { name: 'Dark Green', value: '006400', hex: '#006400' },
];

export const BOX_COLORS: ColorOption[] = [
  { name: 'Black', value: '000000', hex: '#000000' },
  { name: 'Gray', value: '808080', hex: '#808080' },
  { name: 'Navy', value: '000080', hex: '#000080' },
  { name: 'Brown', value: '8B4513', hex: '#8B4513' },
];

// Validation Constants
export const MAX_IMAGE_COUNT = 200;
export const MIN_IMAGE_COUNT = 1;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'];

// Default Pro Mode Options
export const DEFAULT_PRO_OPTIONS: ProModeOptions = {
  addBorder: false,
  showDescription: true,
  fontSize: 11,
  fontColor: '000000',
  fontType: 'Arial',
  boxColor: '000000',
};
