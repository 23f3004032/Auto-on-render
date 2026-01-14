import { X, Upload, Image as ImageIcon, RotateCw } from 'lucide-react';
import { ImageData } from '@/types';
import { ChangeEvent, useRef } from 'react';
import { getFileSizeDisplay } from '@/utils/imageProcessor';

interface ImageUploadBoxProps {
  index: number;
  imageData: ImageData | null;
  onImageUpload: (index: number, file: File) => void;
  onDescriptionChange: (index: number, description: string) => void;
  onClear: (index: number) => void;
}

export default function ImageUploadBox({
  index,
  imageData,
  onImageUpload,
  onDescriptionChange,
  onClear,
}: ImageUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(index, file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary transition-all duration-200 hover:shadow-lg">
      {/* Box Number */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-white bg-primary px-3 py-1 rounded-full">
          Image {index + 1}
        </span>
        {imageData && (
          <button
            onClick={() => onClear(index)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
            title="Clear"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Image Preview Area */}
      <div className="mb-3">
        {imageData ? (
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden group">
            <img
              src={imageData.preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-contain"
            />
            {/* Rotation indicator */}
            {imageData.rotated && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 shadow-lg">
                <RotateCw size={12} />
                Auto-rotated
              </div>
            )}
            {/* Image info overlay on hover */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <p>Size: {getFileSizeDisplay(imageData.file.size)}</p>
              {imageData.dimensions && (
                <p>Dimensions: {imageData.dimensions.width} × {imageData.dimensions.height}</p>
              )}
              {imageData.originalOrientation && (
                <p>Original: {imageData.originalOrientation}</p>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={handleUploadClick}
            className="w-full h-48 bg-secondary-light border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
          >
            <ImageIcon size={48} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">Click to upload</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, BMP (No size limit)</p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/jpg,image/png,image/bmp"
        className="hidden"
        aria-label={`Upload image ${index + 1}`}
      />
      
      <button
        onClick={handleUploadClick}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-all mb-3 flex items-center justify-center gap-2 ${
          imageData
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-primary text-white hover:bg-primary-dark'
        }`}
      >
        <Upload size={18} />
        {imageData ? 'Change Image' : 'Upload Image'}
      </button>

      {/* Description Textarea */}
      <textarea
        placeholder="Description (optional)"
        value={imageData?.description || ''}
        onChange={(e) => onDescriptionChange(index, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
        rows={3}
      />

      {/* Character count */}
      {imageData?.description && (
        <p className="text-xs text-gray-400 mt-1 text-right">
          {imageData.description.length} characters
        </p>
      )}
    </div>
  );
}
