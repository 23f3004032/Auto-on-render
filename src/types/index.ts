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

// ─── Compression ─────────────────────────────────────────────────────────────

export type CompressionPreset = 'high' | 'balanced' | 'small';

export interface CompressionConfig {
  label: string;
  description: string;
  maxDimension: number; // px — applied to both width & height
  quality: number;      // 0–1 JPEG quality passed to canvas.toBlob
  approxKBPerImage: number; // used for estimated size display
}

export const COMPRESSION_PRESETS: Record<CompressionPreset, CompressionConfig> = {
  high: {
    label: 'High Quality',
    description: 'Best visuals, larger file (~250 KB/photo)',
    maxDimension: 1400,
    quality: 0.82,
    approxKBPerImage: 250,
  },
  balanced: {
    label: 'Balanced',
    description: 'Great quality, reasonable size (~120 KB/photo)',
    maxDimension: 1100,
    quality: 0.72,
    approxKBPerImage: 120,
  },
  small: {
    label: 'Small File',
    description: 'Smallest output, suitable for email (~65 KB/photo)',
    maxDimension: 750,
    quality: 0.60,
    approxKBPerImage: 65,
  },
};

// ─── Pro Mode Options ─────────────────────────────────────────────────────────

export interface ProModeOptions {
  addBorder: boolean;
  showDescription: boolean;
  autoNumberDescription: boolean;
  autoNumberKeyword: string;
  isCustomKeyword: boolean;
  customKeyword: string;
  useCustomNumberStart: boolean;
  numberStartFrom: number;
  fontSize: number;
  fontColor: string;
  fontType: string;
  boxColor: string;
  compressionEnabled: boolean;
  compressionPreset: CompressionPreset;
}

export const AUTO_NUMBER_KEYWORDS = [
  'Survey Photo No.',
  'QC Inspection Photo No.',
] as const;

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

// ─── Validation Constants ─────────────────────────────────────────────────────

export const MAX_IMAGE_COUNT = 10000;
export const MIN_IMAGE_COUNT = 1;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'];

// ─── Default Options ──────────────────────────────────────────────────────────

export const DEFAULT_PRO_OPTIONS: ProModeOptions = {
  addBorder: false,
  showDescription: true,
  autoNumberDescription: false,
  autoNumberKeyword: 'Survey Photo No.',
  isCustomKeyword: false,
  customKeyword: '',
  useCustomNumberStart: false,
  numberStartFrom: 1,
  fontSize: 11,
  fontColor: '000000',
  fontType: 'Arial',
  boxColor: '000000',
  compressionEnabled: false,
  compressionPreset: 'balanced',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a human-readable estimated DOCX size string given image count
 * and chosen compression preset.
 */
export function estimatedDocxSize(imageCount: number, preset: CompressionPreset): string {
  if (imageCount === 0) return '—';
  const config = COMPRESSION_PRESETS[preset];
  const totalKB = imageCount * config.approxKBPerImage;
  // DOCX ZIP typically achieves ~10% further reduction on JPEG payloads
  const compressedKB = totalKB * 0.9;
  if (compressedKB < 1024) return `~${Math.round(compressedKB)} KB`;
  const mb = compressedKB / 1024;
  if (mb < 1024) return `~${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  return `~${(mb / 1024).toFixed(1)} GB`;
}
