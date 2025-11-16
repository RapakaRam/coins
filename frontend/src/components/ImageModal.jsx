import React, { useEffect, useState } from 'react';

const ImageModal = ({ frontImageSrc, backImageSrc, onClose }) => {
  const [viewMode, setViewMode] = useState('both'); // 'both', 'front', 'back'

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[1000] cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative max-w-[95%] max-h-[95%] bg-white rounded-lg p-5 cursor-default overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 text-2xl flex items-center justify-center cursor-pointer hover:bg-opacity-80 transition-all z-10"
          onClick={onClose}
        >
          ×
        </button>
        
        {backImageSrc && (
          <div className="absolute top-2 left-2 flex gap-2 z-10">
            <button
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                viewMode === 'both' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setViewMode('both')}
            >
              Both Sides
            </button>
            <button
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                viewMode === 'front' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setViewMode('front')}
            >
              Front Only
            </button>
            <button
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                viewMode === 'back' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setViewMode('back')}
            >
              Back Only
            </button>
          </div>
        )}

        <div className="mt-12">
          {viewMode === 'both' && backImageSrc ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Front Side</h3>
                <img
                  src={frontImageSrc}
                  alt="Coin Front"
                  className="max-w-full max-h-[75vh] block rounded mx-auto shadow-lg"
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Back Side</h3>
                <img
                  src={backImageSrc}
                  alt="Coin Back"
                  className="max-w-full max-h-[75vh] block rounded mx-auto shadow-lg"
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                {viewMode === 'front' ? 'Front Side' : 'Back Side'}
              </h3>
              <img
                src={viewMode === 'front' ? frontImageSrc : (backImageSrc || frontImageSrc)}
                alt={viewMode === 'front' ? 'Coin Front' : 'Coin Back'}
                className="max-w-full max-h-[80vh] block rounded mx-auto shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

