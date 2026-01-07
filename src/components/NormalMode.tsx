'use client'

import { useState } from 'react';
import { ImageData, MAX_IMAGE_COUNT, MIN_IMAGE_COUNT, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/types';
import ImageUploadBox from './ImageUploadBox';
import { FileText } from 'lucide-react';

export default function NormalMode() {
  const [imageCount, setImageCount] = useState<string>('');
  const [boxes, setBoxes] = useState<number>(0);
  const [images, setImages] = useState<(ImageData | null)[]>([]);
  const [error, setError] = useState<string>('');

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

  const handleImageUpload = (index: number, file: File) => {
    // File type validation
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, or BMP images.');
      return;
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setError('');

    // Create preview URL
    const preview = URL.createObjectURL(file);
    
    const newImageData: ImageData = {
      id: `${Date.now()}-${index}`,
      file,
      preview,
      description: '',
    };

    const updatedImages = [...images];
    updatedImages[index] = newImageData;
    setImages(updatedImages);
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
                  disabled={!allImagesUploaded}
                  className="px-6 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                >
                  <FileText size={18} />
                  Download DOCX
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
