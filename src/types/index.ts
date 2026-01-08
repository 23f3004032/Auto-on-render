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
}

// Mode Types
export type Mode = 'normal' | 'pro' | 'bulk' | null;

// Pro Mode Options
export interface ProModeOptions {
  addBorder: boolean;
  fontSize: number;
  fontColor: string;
  fontType: string;
  boxColor: string;
  layoutMode: 'two-column' | 'one-column';
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
  { name: 'Red', value: 'FF0000', hex: '#FF0000' },
  { name: 'Blue', value: '0000FF', hex: '#0000FF' },
  { name: 'Green', value: '008000', hex: '#008000' },
  { name: 'Navy', value: '000080', hex: '#000080' },
  { name: 'Purple', value: '800080', hex: '#800080' },
  { name: 'Dark Gray', value: '404040', hex: '#404040' },
];

export const BOX_COLORS: ColorOption[] = [
  { name: 'No Color', value: 'FFFFFF', hex: '#FFFFFF' },
  { name: 'Light Gray', value: 'F5F5F5', hex: '#F5F5F5' },
  { name: 'Light Blue', value: 'E3F2FD', hex: '#E3F2FD' },
  { name: 'Light Yellow', value: 'FFFDE7', hex: '#FFFDE7' },
  { name: 'Light Green', value: 'E8F5E9', hex: '#E8F5E9' },
  { name: 'Light Pink', value: 'FCE4EC', hex: '#FCE4EC' },
  { name: 'White', value: 'FFFFFF', hex: '#FFFFFF' },
];

// Validation Constants
export const MAX_IMAGE_COUNT = 200;
export const MIN_IMAGE_COUNT = 1;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'];

// Default Pro Mode Options
export const DEFAULT_PRO_OPTIONS: ProModeOptions = {
  addBorder: false,
  fontSize: 11,
  fontColor: '000000',
  fontType: 'Arial',
  boxColor: 'FFFFFF',
  layoutMode: 'two-column',
};
