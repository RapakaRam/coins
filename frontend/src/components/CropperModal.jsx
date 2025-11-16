import React from 'react';
import Cropper from 'react-easy-crop';

const CropperModal = ({ image, cropShape, aspect, crop, zoom, onCropChange, onZoomChange, onCropComplete, onClose, onDone }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getShapeLabel = () => {
    if (cropShape === 'round') return 'Circle';
    if (cropShape === 'rect' && aspect === 1) return 'Square';
    if (cropShape === 'rect' && aspect !== 1) return 'Rectangle (2:1)';
    return cropShape;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70" onClick={handleBackdropClick}>
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Crop Image</h2>
            <p className="text-xs text-gray-500 mt-1">Shape: <span className="font-medium text-gray-700">{getShapeLabel()}</span></p>
          </div>
          <button 
            className="text-gray-500 hover:text-gray-700 transition text-2xl font-light" 
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Cropper Container */}
        <div className="flex-1 relative min-h-[300px] overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={true}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-t border-gray-200 space-y-4">
          {/* Zoom Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Zoom</label>
              <span className="text-sm text-gray-600">{zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={e => onZoomChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-700"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1x</span>
              <span>3x</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button 
              type="button"
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium text-sm cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button"
              className="px-6 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium text-sm shadow-sm cursor-pointer"
              onClick={onDone}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropperModal;
