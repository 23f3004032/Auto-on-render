'use client';

import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  ImageData,
  ProModeOptions,
  DEFAULT_PRO_OPTIONS,
  FONT_TYPES,
  FONT_SIZES,
  FONT_COLORS,
  BOX_COLORS,
  MAX_IMAGE_COUNT,
  AUTO_NUMBER_KEYWORDS,
  COMPRESSION_PRESETS,
  CompressionPreset,
  estimatedDocxSize,
  ALLOWED_IMAGE_TYPES,
} from '@/types';
import ImageUploadBox from './ImageUploadBox';
import { processImage, rotateImage } from '@/utils/imageProcessor';
import { generateProModeDocx, generateFileName } from '@/utils/docxGenerator';
import { Download, Settings, Upload, Folder } from 'lucide-react';

export default function ProMode() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [proOptions, setProOptions] = useState<ProModeOptions>(DEFAULT_PRO_OPTIONS);
  const [showConfig, setShowConfig] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // ── Derived helpers ──────────────────────────────────────────────────────
  // The keyword actually used in descriptions (preset or custom)
  const effectiveKeyword = proOptions.isCustomKeyword
    ? (proOptions.customKeyword || 'Photo')
    : proOptions.autoNumberKeyword;
  // The number descriptions count from
  const startNum = proOptions.useCustomNumberStart ? (proOptions.numberStartFrom || 1) : 1;

  const onDrop = async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > MAX_IMAGE_COUNT) {
      alert(`Maximum ${MAX_IMAGE_COUNT} images allowed. You can upload ${MAX_IMAGE_COUNT - images.length} more images.`);
      return;
    }

    setIsProcessing(true);

    const startingIndex = images.length;

    const { maxDimension, quality } = COMPRESSION_PRESETS[proOptions.compressionPreset];

    const newImagesPromises = acceptedFiles.map(async (file, index) => {
      try {
        const processed = await processImage(file, maxDimension, quality);
        
        // Auto-generate description if auto-numbering is enabled
        const autoDescription = proOptions.autoNumberDescription 
          ? `${effectiveKeyword} ${startingIndex + index + startNum}`
          : '';
        
        return {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: processed.preview,
          description: autoDescription,
          rotated: processed.wasRotated,
          processedBlob: processed.blob,
          originalOrientation: processed.originalOrientation,
          dimensions: {
            width: processed.width,
            height: processed.height,
          },
        } as ImageData;
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        return null;
      }
    });

    const processedImages = await Promise.all(newImagesPromises);
    const validImages = processedImages.filter((img): img is ImageData => img !== null);

    setImages((prev) => [...prev, ...validImages]);
    setIsProcessing(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/bmp': ['.bmp'],
    },
    multiple: true,
  });

  const handleImageUpload = async (index: number, file: File) => {
    try {
      const { maxDimension, quality } = COMPRESSION_PRESETS[proOptions.compressionPreset];
      const processed = await processImage(file, maxDimension, quality);
      
      const newImages = [...images];
      newImages[index] = {
        ...newImages[index],
        file,
        preview: processed.preview,
        rotated: processed.wasRotated,
        processedBlob: processed.blob,
        originalOrientation: processed.originalOrientation,
        dimensions: {
          width: processed.width,
          height: processed.height,
        },
      };
      
      setImages(newImages);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    }
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const newImages = [...images];
    if (newImages[index]) {
      newImages[index].description = description;
      setImages(newImages);
    }
  };

  const handleAutoNumberToggle = (enabled: boolean) => {
    setProOptions({ ...proOptions, autoNumberDescription: enabled });
    
    // If enabling auto-numbering, update all existing images
    if (enabled) {
      const updatedImages = images.map((img, index) => ({
        ...img,
        description: `${effectiveKeyword} ${index + startNum}`,
      }));
      setImages(updatedImages);
    }
  };

  const handleKeywordChange = (keyword: string) => {
    setProOptions({ ...proOptions, autoNumberKeyword: keyword, isCustomKeyword: false });

    // Re-number all existing images with the new keyword
    if (proOptions.autoNumberDescription) {
      const updatedImages = images.map((img, index) => ({
        ...img,
        description: `${keyword} ${index + startNum}`,
      }));
      setImages(updatedImages);
    }
  };

  const handleCustomKeywordChange = (value: string) => {
    setProOptions({ ...proOptions, customKeyword: value, isCustomKeyword: true });

    // Live-renumber all existing images with the new custom keyword
    if (proOptions.autoNumberDescription) {
      const updatedImages = images.map((img, index) => ({
        ...img,
        description: `${value || 'Photo'} ${index + startNum}`,
      }));
      setImages(updatedImages);
    }
  };

  const handleCustomKeywordSelect = () => {
    setProOptions({ ...proOptions, isCustomKeyword: true });

    if (proOptions.autoNumberDescription) {
      const kw = proOptions.customKeyword || 'Photo';
      const updatedImages = images.map((img, index) => ({
        ...img,
        description: `${kw} ${index + startNum}`,
      }));
      setImages(updatedImages);
    }
  };

  const handleNumberStartChange = (value: number, enabled: boolean) => {
    const newStart = enabled ? (value || 1) : 1;
    setProOptions({ ...proOptions, useCustomNumberStart: enabled, numberStartFrom: value });

    // Re-number all existing images with the new start
    if (proOptions.autoNumberDescription) {
      const updatedImages = images.map((img, index) => ({
        ...img,
        description: `${effectiveKeyword} ${index + newStart}`,
      }));
      setImages(updatedImages);
    }
  };

  const handleRotate = async (index: number) => {
    const imageData = images[index];
    if (!imageData || !imageData.processedBlob) return;

    try {
      const { quality } = COMPRESSION_PRESETS[proOptions.compressionPreset];
      const currentRotation = imageData.rotationAngle || 0;
      const rotated = await rotateImage(imageData.processedBlob, currentRotation, quality);

      // Revoke old preview URL
      if (imageData.preview) {
        URL.revokeObjectURL(imageData.preview);
      }

      const newImages = [...images];
      newImages[index] = {
        ...imageData,
        preview: rotated.preview,
        processedBlob: rotated.blob,
        dimensions: {
          width: rotated.width,
          height: rotated.height,
        },
        rotationAngle: rotated.rotation,
      };
      setImages(newImages);
    } catch (error) {
      console.error('Error rotating image:', error);
      alert('Failed to rotate image. Please try again.');
    }
  };

  const handleDownloadDocx = async () => {
    const validImages = images.filter(img => img.file && img.processedBlob);
    
    if (validImages.length === 0) {
      alert('Please upload at least one image before downloading.');
      return;
    }

    const hasAllProcessed = validImages.every(img => img.processedBlob);
    if (!hasAllProcessed) {
      alert('Please wait for all images to finish processing.');
      return;
    }

    try {
      console.log('=== Pro Mode DOCX Generation Started ===');
      console.log(`Total images: ${validImages.length}`);
      console.log('Options:', proOptions);
      
      for (let i = 0; i < validImages.length; i++) {
        const img = validImages[i];
        console.log(`Image ${i + 1}:`, {
          name: img.file.name,
          hasProcessedBlob: !!img.processedBlob,
          blobSize: img.processedBlob?.size || 0,
          rotated: img.rotated,
        });
        
        if (!img.processedBlob) {
          throw new Error(`Image ${i + 1} (${img.file.name}) is missing processed blob!`);
        }
      }
      
      const fileName = generateFileName('Marine_Cargo_Report_Pro');
      
      await generateProModeDocx(validImages, proOptions, fileName);
      
      console.log('✅ Pro Mode document downloaded successfully');
    } catch (error) {
      console.error('Failed to generate DOCX:', error);
      alert(`Failed to generate document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    if (newImages[index]?.preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleClearAll = () => {
    if (images.length === 0) return;
    
    if (confirm(`Are you sure you want to remove all ${images.length} images?`)) {
      images.forEach((img) => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      setImages([]);
    }
  };

  const allImagesUploaded = images.length > 0 && images.every(img => img.file && img.processedBlob);
  const uploadedCount = images.filter(img => img.file && img.processedBlob).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Pro Mode - Advanced Configuration</h2>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            {showConfig ? 'Hide' : 'Show'} Settings
          </button>
        </div>

        {showConfig && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg">

            {/* ── Compression Preset ───────────────────────────────────── */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                📦 Compression Quality
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.entries(COMPRESSION_PRESETS) as [CompressionPreset, typeof COMPRESSION_PRESETS[CompressionPreset]][]).map(
                  ([key, cfg]) => (
                    <label
                      key={key}
                      className={`flex flex-col gap-1 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        proOptions.compressionPreset === key
                          ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="compressionPreset"
                        value={key}
                        checked={proOptions.compressionPreset === key}
                        onChange={() => setProOptions({ ...proOptions, compressionPreset: key })}
                        className="sr-only"
                      />
                      <span className="font-semibold text-sm">{cfg.label}</span>
                      <span className="text-xs opacity-75">{cfg.description}</span>
                      <span className="text-xs font-mono opacity-60 mt-0.5">
                        {cfg.maxDimension}px · q={cfg.quality}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Border
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={proOptions.addBorder}
                  onChange={(e) => setProOptions({ ...proOptions, addBorder: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  {proOptions.addBorder ? 'On' : 'Off'}
                </span>
              </label>
            </div>

            {proOptions.addBorder && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Show Description
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={proOptions.showDescription}
                      onChange={(e) => setProOptions({ ...proOptions, showDescription: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-700">
                      {proOptions.showDescription ? 'On' : 'Off'}
                    </span>
                  </label>
                </div>

                {proOptions.showDescription && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-Number Descriptions
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={proOptions.autoNumberDescription}
                          onChange={(e) => handleAutoNumberToggle(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-sm font-medium text-gray-700">
                          {proOptions.autoNumberDescription ? 'On' : 'Off'}
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-generate &quot;{effectiveKeyword} {startNum}, {startNum + 1}, {startNum + 2}...&quot;
                      </p>
                    </div>

                    {proOptions.autoNumberDescription && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Photo Number Keyword
                        </label>
                        <div className="flex flex-col gap-2">
                          {/* ── Preset keywords (unchanged) ── */}
                          {AUTO_NUMBER_KEYWORDS.map((keyword) => (
                            <label
                              key={keyword}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                                !proOptions.isCustomKeyword && proOptions.autoNumberKeyword === keyword
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="autoNumberKeyword"
                                value={keyword}
                                checked={!proOptions.isCustomKeyword && proOptions.autoNumberKeyword === keyword}
                                onChange={() => handleKeywordChange(keyword)}
                                className="accent-blue-600"
                              />
                              <span className="text-xs font-medium">{keyword}</span>
                            </label>
                          ))}

                          {/* ── Manual / custom keyword ── */}
                          <label
                            className={`flex flex-col gap-1.5 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                              proOptions.isCustomKeyword
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="autoNumberKeyword"
                                value="custom"
                                checked={proOptions.isCustomKeyword}
                                onChange={handleCustomKeywordSelect}
                                className="accent-blue-600"
                              />
                              <span className="text-xs font-medium">Custom keyword</span>
                            </div>
                            {proOptions.isCustomKeyword && (
                              <input
                                type="text"
                                value={proOptions.customKeyword}
                                onChange={(e) => handleCustomKeywordChange(e.target.value)}
                                placeholder="e.g. Cargo Photo No."
                                className="w-full mt-1 px-2 py-1.5 text-xs border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-white"
                                autoFocus
                              />
                            )}
                          </label>
                        </div>

                        {/* ── Photo numbering start ── */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">
                              Set Starting Number
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={proOptions.useCustomNumberStart}
                                onChange={(e) => handleNumberStartChange(proOptions.numberStartFrom, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              <span className="ms-2 text-xs font-medium text-gray-600">
                                {proOptions.useCustomNumberStart ? 'On' : 'Off'}
                              </span>
                            </label>
                          </div>
                          {proOptions.useCustomNumberStart ? (
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-500 shrink-0">Start from:</label>
                              <input
                                type="number"
                                min={1}
                                value={proOptions.numberStartFrom}
                                onChange={(e) => handleNumberStartChange(Number(e.target.value), true)}
                                className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-center font-semibold"
                              />
                              <span className="text-xs text-gray-400">
                                → photos numbered {proOptions.numberStartFrom}, {proOptions.numberStartFrom + 1}, {proOptions.numberStartFrom + 2}...
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">Default: starts from 1, 2, 3...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <select
                value={proOptions.fontSize}
                onChange={(e) => setProOptions({ ...proOptions, fontSize: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {FONT_SIZES.map(size => (
                  <option key={size} value={size}>{size} pt</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Type
              </label>
              <select
                value={proOptions.fontType}
                onChange={(e) => setProOptions({ ...proOptions, fontType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {FONT_TYPES.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Color
              </label>
              <div className="flex gap-2">
                {FONT_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setProOptions({ ...proOptions, fontColor: color.value })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      proOptions.fontColor === color.value
                        ? 'border-blue-600 ring-2 ring-blue-300 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Color
              </label>
              <div className="flex gap-2">
                {BOX_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setProOptions({ ...proOptions, boxColor: color.value })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      proOptions.boxColor === color.value
                        ? 'border-blue-600 ring-2 ring-blue-300 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div
          {...getRootProps()}
          className={`border-4 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-6 ${
            isDragActive
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 bg-primary/10 rounded-full">
              <Upload className="w-12 h-12 text-primary" />
            </div>
            {isDragActive ? (
              <div>
                <p className="text-xl font-semibold text-primary">Drop images here...</p>
                <p className="text-sm text-gray-600 mt-2">Release to upload</p>
              </div>
            ) : (
              <div>
                <p className="text-xl font-semibold text-gray-700">
                  Drag & Drop Images Here
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports JPG, PNG, BMP (Max {MAX_IMAGE_COUNT} images)
                </p>
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center gap-2 text-primary">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                <span className="text-sm font-medium">Processing images...</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Folder select button + hidden input ─────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400 shrink-0">or</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>
        <div className="flex justify-center mb-6">
          <input
            ref={folderInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/bmp"
            {...({ webkitdirectory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
            className="hidden"
            onChange={async (e) => {
              const allFiles = Array.from(e.target.files || []);
              const imageFiles = allFiles.filter(f => ALLOWED_IMAGE_TYPES.includes(f.type));
              if (imageFiles.length === 0) {
                alert('No supported images found in the selected folder.\nSupported formats: JPG, PNG, BMP');
                e.target.value = '';
                return;
              }
              await onDrop(imageFiles);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Folder className="w-5 h-5" />
            Select Folder
          </button>
        </div>

        {images.length > 0 && (
          <>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6 border border-primary/20">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                <h3 className="text-xl font-bold text-primary mb-1">
                  {images.length} {images.length === 1 ? 'Image' : 'Images'} Uploaded
                </h3>
                <p className="text-sm text-gray-600">
                  {uploadedCount} processed • Configure options above
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Estimated DOCX size:{' '}
                  <span className="font-semibold text-gray-600">
                    {estimatedDocxSize(uploadedCount, proOptions.compressionPreset)}
                  </span>
                  {' '}· {COMPRESSION_PRESETS[proOptions.compressionPreset].label} preset
                </p>
              </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    Clear All
                  </button>

                  <button
                    onClick={handleDownloadDocx}
                    disabled={!allImagesUploaded}
                    className="px-6 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                  >
                    <Download size={18} />
                    Download DOCX
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {images.map((image, index) => (
                <ImageUploadBox
                  key={image.id}
                  index={index}
                  imageData={image}
                  onImageUpload={handleImageUpload}
                  onDescriptionChange={handleDescriptionChange}
                  onRotate={handleRotate}
                  onClear={handleRemoveImage}
                  hideDescription={proOptions.addBorder && !proOptions.showDescription}
                />
              ))}
            </div>

            {allImagesUploaded && (
              <div className="mt-6 text-center">
                <div className="inline-block bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-lg">
                  ✓ All images uploaded! Click "Download DOCX" to generate your document.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
