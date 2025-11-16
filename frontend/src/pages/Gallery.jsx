import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import AddCoinModal from '../components/AddCoinModal';
import EditCoinModal from '../components/EditCoinModal';

const Gallery = () => {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [countryName, setCountryName] = useState('');
  const [continentId, setContinentId] = useState('');
  // no modal state needed — both sides will be shown inline
  const [coinToDelete, setCoinToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCoinId, setEditCoinId] = useState(null);

  useEffect(() => {
    fetchCoins();
  }, [countryId]);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      const [coinsResponse, locationResponse] = await Promise.all([
        api.get(`/coins/${countryId}`),
        api.get(`/locations/${countryId}`)
      ]);
      setCoins(coinsResponse.data);
      setCountryName(locationResponse.data.name);
      // For a country, parent is the continent
      setContinentId(locationResponse.data.parent || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load coins');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (coin) => {
    // images are displayed inline now; no click action required
  };

  const handleDeleteClick = (e, coin) => {
    e.stopPropagation(); // Prevent image modal from opening
    setCoinToDelete(coin);
  };

  const handleEditClick = (e, coin) => {
    e.stopPropagation();
    setEditCoinId(coin._id);
  };

  const handleConfirmDelete = async () => {
    if (!coinToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/coins/${coinToDelete._id}`);
      
      // Remove coin from state
      setCoins(coins.filter(coin => coin._id !== coinToDelete._id));
      setCoinToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete coin');
      setCoinToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setCoinToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading coins...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <header className="bg-white rounded-lg shadow-md p-5 mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {countryName || 'Coin Gallery'}
          </h1>
          <p className="text-gray-600 text-lg">
            {coins.length} {coins.length === 1 ? 'coin' : 'coins'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back
          </button>
          {coins.length > 0 && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowAddModal(true)}
            >
              + Add Coin
            </button>
          )}
        </div>
      </header>

      {coins.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-10 text-center">
          <p className="text-xl text-gray-600 mb-5">
            No coins uploaded for this country yet.
          </p>
          <button
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            Add First Coin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {coins.map((coin) => {
            const shape = coin.cropShape || 'rect';
            const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
            const imageStyle = shape === 'circle' ? { aspectRatio: '1/1', objectFit: 'cover' } : {};
            
            return (
              <div
                key={coin._id}
                className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:-translate-y-2 hover:shadow-xl relative group"
              >
                {/* Card inner padding to create a rectangular card around images */}
                <div className="p-4">
                  <div className={`flex ${coin.backImageBase64 ? 'gap-3' : ''} items-center justify-center`}>
                    {/* Front image */}
                    <div className={`${coin.backImageBase64 ? 'flex-1' : 'w-full'} ${shape === 'circle' ? 'aspect-square' : 'h-48'} flex items-center justify-center bg-gray-50`}>
                      <img
                        src={`data:image/jpeg;base64,${coin.frontImageBase64 || coin.imageBase64}`}
                        alt="Coin Front"
                        className={`${shape === 'circle' ? 'w-full h-full' : 'w-full h-full'} object-contain ${shapeClass}`}
                        loading="lazy"
                      />
                    </div>

                    {/* Back image (if present) */}
                    {coin.backImageBase64 && (
                      <div className={`flex-1 ${shape === 'circle' ? 'aspect-square' : 'h-48'} flex items-center justify-center bg-gray-50`}>
                        <img
                          src={`data:image/jpeg;base64,${coin.backImageBase64}`}
                          alt="Coin Back"
                          className={`${shape === 'circle' ? 'w-full h-full' : 'w-full h-full'} object-contain ${shapeClass}`}
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>

              {/* Move edit/delete icons to bottom-right of the card */}
              <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => handleEditClick(e, coin)}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg"
                  title="Edit coin"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, coin)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
                  title="Delete coin (both sides)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Images are shown inline now; no modal is used */}

      {coinToDelete && (
        <ConfirmModal
          isOpen={!!coinToDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Coin"
          message="Are you sure you want to delete this coin (both front and back sides)? This action cannot be undone."
        />
      )}
      <AddCoinModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        preselectContinent={continentId}
        preselectCountry={countryId}
        onSuccess={fetchCoins}
      />

      <EditCoinModal
        isOpen={!!editCoinId}
        onClose={() => setEditCoinId(null)}
        coinId={editCoinId}
        onSuccess={fetchCoins}
      />
    </div>
  );
};

export default Gallery;

