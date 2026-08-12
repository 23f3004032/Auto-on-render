'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageData, ALLOWED_IMAGE_TYPES, MAX_IMAGE_COUNT, estimatedDocxSize } from '@/types';
import { processImage, rotateImage } from '@/utils/imageProcessor';
import { generateNormalModeDocx, generateFileName } from '@/utils/docxGenerator';
import { Upload, X, Download, Image as ImageIcon, GripVertical, RotateCcw, RotateCw } from 'lucide-react';

export default function BulkMode() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > MAX_IMAGE_COUNT) {
      alert(`Maximum ${MAX_IMAGE_COUNT} images allowed. You can upload ${MAX_IMAGE_COUNT - images.length} more images.`);
      return;
    }

    setIsProcessing(true);

    const newImagesPromises = acceptedFiles.map(async (file) => {
      try {
        const processed = await processImage(file);
        
        return {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: processed.preview,
          description: '',
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


  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    if (newImages[index]?.preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], description };
    setImages(newImages);
  };

  const handleRotate = async (index: number) => {
    const imageData = images[index];
    if (!imageData || !imageData.processedBlob) return;

    try {
      const currentRotation = imageData.rotationAngle || 0;
      const rotated = await rotateImage(imageData.processedBlob, currentRotation);

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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDownloadDocx = async () => {
    if (images.length === 0) {
      alert('Please upload at least one image before downloading.');
      return;
    }

    setIsGenerating(true);

    try {
      console.log('=== Bulk Mode DOCX Generation Started ===');
      console.log(`Total images: ${images.length}`);

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
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

      const fileName = generateFileName('Marine_Cargo_Report_Bulk');

      await generateNormalModeDocx(images, fileName);

      console.log('✅ Bulk Mode document downloaded successfully');
    } catch (error) {
      console.error('Failed to generate DOCX:', error);
      alert(`Failed to generate document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
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

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-4 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
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

      {images.length > 0 && (
        <>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary mb-1">
                  {images.length} {images.length === 1 ? 'Image' : 'Images'} Uploaded
                </h3>
                <p className="text-sm text-gray-600">
                  Drag images to reorder • Click × to remove
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="text-gray-500">Original quality — no compression applied</span>
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
                  disabled={isGenerating}
                  className="px-6 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download DOCX
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative bg-white border-2 rounded-lg overflow-hidden transition-all cursor-move hover:shadow-lg group ${
                  draggedIndex === index
                    ? 'opacity-50 scale-95 border-primary'
                    : 'border-gray-200 hover:border-primary'
                }`}
              >
                <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  #{index + 1}
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                  {image.rotated && (
                    <>
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <RotateCw size={12} />
                        Auto-rotated
                      </div>
                      <button
                        onClick={() => handleRotate(index)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full transition-colors shadow-lg"
                        title="Rotate 90° anti-clockwise"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-gray-800 text-white p-1 rounded">
                    <GripVertical size={16} />
                  </div>
                </div>

                <div className="aspect-square relative">
                  {image.preview ? (
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="p-2 bg-white border-t border-gray-200">
                  <input
                    type="text"
                    value={image.description || ''}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    placeholder="Add description..."
                    className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-gray-400 mt-1 truncate" title={image.file.name}>
                    {image.file.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
