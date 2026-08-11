'use client'

import { useState } from 'react';
import { ImageData, MAX_IMAGE_COUNT, MIN_IMAGE_COUNT, ALLOWED_IMAGE_TYPES, estimatedDocxSize } from '@/types';
import ImageUploadBox from './ImageUploadBox';
import { FileText, Download } from 'lucide-react';
import { processImage, isValidImageType, getFileSizeDisplay, rotateImage } from '@/utils/imageProcessor';
import { generateNormalModeDocx, generateFileName } from '@/utils/docxGenerator';

export default function NormalMode() {
  const [imageCount, setImageCount] = useState<string>('');
  const [boxes, setBoxes] = useState<number>(0);
  const [images, setImages] = useState<(ImageData | null)[]>([]);
  const [error, setError] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateBoxes = () => {
    const count = parseInt(imageCount);
    
    // Validation
    if (isNaN(count)) {
      setError('Please enter a valid number');
      return;
    }
    if (count < MIN_IMAGE_COUNT) {
      setError(`Minimum ${MIN_IMAGE_COUNT} image required`);
      return;
    }
    if (count > MAX_IMAGE_COUNT) {
      setError(`Maximum ${MAX_IMAGE_COUNT} images allowed`);
      return;
    }

    setError('');
    setBoxes(count);
    setImages(new Array(count).fill(null));
  };

  const handleImageUpload = async (index: number, file: File) => {
    // File type validation
    if (!isValidImageType(file, ALLOWED_IMAGE_TYPES)) {
      setError('Invalid file type. Please upload JPG, PNG, or BMP images.');
      return;
    }

    setError('');

    try {
      // Show loading state
      const loadingData: ImageData = {
        id: `${Date.now()}-${index}`,
        file,
        preview: '',
        description: '',
      };
      
      const updatedImages = [...images];
      updatedImages[index] = loadingData;
      setImages(updatedImages);

      // Process image: EXIF correction, portrait detection, auto-rotation
      const processed = await processImage(file);
      
      const newImageData: ImageData = {
        id: `${Date.now()}-${index}`,
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
      };

      updatedImages[index] = newImageData;
      setImages(updatedImages);

      // Show success message if image was rotated
      if (processed.wasRotated) {
        console.log(`✓ Image ${index + 1} rotated from portrait to landscape`);
      }
    } catch (err) {
      setError(`Failed to process image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      const updatedImages = [...images];
      updatedImages[index] = null;
      setImages(updatedImages);
    }
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const updatedImages = [...images];
    if (updatedImages[index]) {
      updatedImages[index] = {
        ...updatedImages[index]!,
        description,
      };
      setImages(updatedImages);
    }
  };

  const handleClear = (index: number) => {
    const updatedImages = [...images];
    if (updatedImages[index]?.preview) {
      URL.revokeObjectURL(updatedImages[index]!.preview);
    }
    updatedImages[index] = null;
    setImages(updatedImages);
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

      const updatedImages = [...images];
      updatedImages[index] = {
        ...imageData,
        preview: rotated.preview,
        processedBlob: rotated.blob,
        dimensions: {
          width: rotated.width,
          height: rotated.height,
        },
        rotationAngle: rotated.rotation,
      };
      setImages(updatedImages);
    } catch (err) {
      setError(`Failed to rotate image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleReset = () => {
    // Clean up preview URLs
    images.forEach((img) => {
      if (img?.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setBoxes(0);
    setImages([]);
    setImageCount('');
    setError('');
  };

  const handleDownloadDocx = async () => {
    if (!allImagesUploaded) return;

    setIsGenerating(true);
    setError('');

    try {
      const validImages = images.filter((img) => img !== null) as ImageData[];
      
      console.log('=== DOCX Generation Started ===');
      console.log(`Total images: ${validImages.length}`);
      
      // Verify all images have processedBlob
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
      
      const fileName = generateFileName('Marine_Cargo_Report');
      
      await generateNormalModeDocx(validImages, fileName);
      
      console.log('✅ Document downloaded successfully');
    } catch (err) {
      setError(`Failed to generate document: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('❌ DOCX generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const allImagesUploaded = boxes > 0 && images.every((img) => img !== null);
  const uploadedCount = images.filter((img) => img !== null).length;

  return (
    <div>
      {/* Image Count Input Section */}
      {boxes === 0 ? (
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-8 border border-primary/20">
            <h3 className="text-xl font-bold text-primary mb-4 text-center">
              How many images do you want to upload?
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Images (1-{MAX_IMAGE_COUNT})
                </label>
                <input
                  type="number"
                  min={MIN_IMAGE_COUNT}
                  max={MAX_IMAGE_COUNT}
                  value={imageCount}
                  onChange={(e) => setImageCount(e.target.value)}
                  placeholder="Enter number..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg text-center font-semibold"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerateBoxes}
                disabled={!imageCount}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-dark transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Generate Upload Boxes
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                💡 Tip: All images are required, but descriptions are optional
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Header */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6 border border-primary/20">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary mb-1">
                  Upload Progress
                </h3>
                <p className="text-sm text-gray-600">
                  {uploadedCount} of {boxes} images uploaded
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="text-gray-500">Original quality — no compression applied</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Progress Bar */}
                <div className="w-48 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300"
                    style={{ width: `${(uploadedCount / boxes) * 100}%` }}
                  ></div>
                </div>

                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Reset
                </button>

                <button
                  onClick={handleDownloadDocx}
                  disabled={!allImagesUploaded || isGenerating}
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

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Upload Boxes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: boxes }).map((_, index) => (
              <ImageUploadBox
                key={index}
                index={index}
                imageData={images[index]}
                onImageUpload={handleImageUpload}
                onDescriptionChange={handleDescriptionChange}
                onClear={handleClear}
                onRotate={handleRotate}
              />
            ))}
          </div>

          {/* Bottom Action */}
          {allImagesUploaded && (
            <div className="mt-8 text-center">
              <div className="inline-block bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-lg">
                ✓ All images uploaded! Click "Download DOCX" to generate your document.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
