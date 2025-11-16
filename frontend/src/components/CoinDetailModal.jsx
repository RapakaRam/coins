import React from 'react';

const CoinDetailModal = ({ isOpen, onClose, coin }) => {
  if (!isOpen || !coin) return null;

  const shape = coin.cropShape || 'rect';
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-700 to-green-800 rounded-t-lg sticky top-0">
          <h2 className="text-2xl font-bold text-white">Coin Details</h2>
          <button
            className="text-white hover:text-green-100 text-3xl font-bold leading-none transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Images Section */}
          <div className={`flex ${coin.backImageBase64 ? 'gap-6' : ''} items-center justify-center mb-6`}>
            {/* Front Image */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Front Side</h3>
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                <img
                  src={`data:image/jpeg;base64,${coin.frontImageBase64 || coin.imageBase64}`}
                  alt="Coin Front"
                  className={`max-w-full max-h-96 object-contain ${shapeClass}`}
                />
              </div>
            </div>

            {/* Back Image */}
            {coin.backImageBase64 && (
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Back Side</h3>
                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                  <img
                    src={`data:image/jpeg;base64,${coin.backImageBase64}`}
                    alt="Coin Back"
                    className={`max-w-full max-h-96 object-contain ${shapeClass}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Coin Information */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {coin.denomination && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Denomination</p>
                  <p className="text-lg text-gray-800">{coin.denomination}</p>
                </div>
              )}
              {coin.currency && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Currency</p>
                  <p className="text-lg text-gray-800">{coin.currency}</p>
                </div>
              )}
              {coin.year && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Year</p>
                  <p className="text-lg text-gray-800">{coin.year}</p>
                </div>
              )}
              {coin.cropShape && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Shape</p>
                  <p className="text-lg text-gray-800 capitalize">{coin.cropShape === 'rect' ? 'Rectangle' : coin.cropShape}</p>
                </div>
              )}
            </div>
            {coin.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 font-semibold mb-1">Notes</p>
                <p className="text-gray-800 whitespace-pre-wrap">{coin.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CoinDetailModal);
