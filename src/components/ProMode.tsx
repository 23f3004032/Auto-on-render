'use client';

import { useState } from 'react';
import { ImageData, ProModeOptions, DEFAULT_PRO_OPTIONS, FONT_TYPES, FONT_SIZES, FONT_COLORS, BOX_COLORS } from '@/types';
import ImageUploadBox from './ImageUploadBox';
import { processImage } from '@/utils/imageProcessor';
import { generateProModeDocx, generateFileName } from '@/utils/docxGenerator';
import { Download, Settings } from 'lucide-react';

export default function ProMode() {
  const [imageCount, setImageCount] = useState<string>('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [proOptions, setProOptions] = useState<ProModeOptions>(DEFAULT_PRO_OPTIONS);
  const [showConfig, setShowConfig] = useState<boolean>(true);
  const [boxesGenerated, setBoxesGenerated] = useState<boolean>(false);

  const handleImageCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageCount(e.target.value);
    setBoxesGenerated(false);
  };

  const handleGenerateBoxes = () => {
    const count = parseInt(imageCount);
    if (isNaN(count) || count < 1 || count > 200) {
      alert('Please enter a valid number between 1 and 200');
      return;
    }
    const newImages: ImageData[] = Array.from({ length: count }, (_, i) => ({
      id: `image-${i}`,
      file: null as any,
      preview: '',
      description: '',
    }));
    setImages(newImages);
    setBoxesGenerated(true);
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      const processed = await processImage(file);
      
      const newImages = [...images];
      newImages[index] = {
        id: `image-${index}`,
        file,
        preview: processed.preview,
        description: newImages[index]?.description || '',
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

  const allImagesUploaded = boxesGenerated && images.length > 0 && images.every(img => img.file && img.processedBlob);
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
        <div className="mb-6">
          <label htmlFor="imageCount" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Images (1-200)
          </label>
          <div className="flex gap-4 items-end">
            <input
              id="imageCount"
              type="number"
              min="1"
              max="200"
              value={imageCount}
              onChange={handleImageCountChange}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleGenerateBoxes}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Generate Upload Boxes
            </button>
          </div>
        </div>

        {boxesGenerated && images.length > 0 && (
          <>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6 border border-primary/20">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-1">
                    Upload Progress
                  </h3>
                  <p className="text-sm text-gray-600">
                    {uploadedCount} of {images.length} images uploaded
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300"
                      style={{ width: `${(uploadedCount / images.length) * 100}%` }}
                    ></div>
                  </div>

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
                  imageData={image.file ? image : null}
                  onImageUpload={handleImageUpload}
                  onDescriptionChange={handleDescriptionChange}
                  onClear={(idx) => {
                    const newImages = [...images];
                    newImages[idx] = {
                      id: `image-${idx}`,
                      file: null as any,
                      preview: '',
                      description: '',
                    };
                    setImages(newImages);
                  }}
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
