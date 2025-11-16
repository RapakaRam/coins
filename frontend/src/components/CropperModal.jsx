import React from 'react';
import Cropper from 'react-easy-crop';


const CropperModal = ({ image, cropShape, aspect, crop, zoom, onCropChange, onZoomChange, onCropComplete, onClose, onDone }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg p-4 relative w-[90vw] max-w-xl h-[70vh] flex flex-col">
        <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900" onClick={onClose}>&times;</button>
        <div className="flex-1 relative">
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
        <div className="flex items-center gap-4 mt-4">
          <label className="text-sm">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => onZoomChange(Number(e.target.value))}
            className="flex-1"
          />
          <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={onDone}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default CropperModal;
