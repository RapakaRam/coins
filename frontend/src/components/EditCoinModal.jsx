import React, { useState, useEffect, useCallback } from 'react';
import CropperModal from './CropperModal';
import getCroppedImg from '../utils/cropImage';
import api from '../services/api';

const EditCoinModal = ({ isOpen, onClose, coinId, onSuccess }) => {
  const [continents, setContinents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [frontImageFile, setFrontImageFile] = useState(null);
  const [backImageFile, setBackImageFile] = useState(null);
  const [frontImagePreview, setFrontImagePreview] = useState('');
  const [backImagePreview, setBackImagePreview] = useState('');
  const [currentFrontImage, setCurrentFrontImage] = useState('');
  const [currentBackImage, setCurrentBackImage] = useState('');
  const [removeBackImage, setRemoveBackImage] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperTarget, setCropperTarget] = useState(null);
  const [cropShape, setCropShape] = useState('rect');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [originalFrontImage, setOriginalFrontImage] = useState(null);
  const [originalBackImage, setOriginalBackImage] = useState(null);
  const [frontCroppedPixels, setFrontCroppedPixels] = useState(null);
  const [backCroppedPixels, setBackCroppedPixels] = useState(null);
  const [denomination, setDenomination] = useState('');
  const [currency, setCurrency] = useState('');
  const [year, setYear] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchData();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, coinId]);

  useEffect(() => {
    if (selectedContinent) {
      fetchCountries();
    }
  }, [selectedContinent]);

  // Auto re-crop images when crop shape changes
  useEffect(() => {
    const recropImages = async () => {
      if (originalFrontImage && frontCroppedPixels) {
        const croppedDataUrl = await getCroppedImg(originalFrontImage, frontCroppedPixels, cropShape);
        setFrontImagePreview(croppedDataUrl);
        const file = await fetch(croppedDataUrl).then(r => r.blob()).then(blob => new File([blob], 'front_cropped.png', { type: blob.type }));
        setFrontImageFile(file);
      }
      if (originalBackImage && backCroppedPixels) {
        const croppedDataUrl = await getCroppedImg(originalBackImage, backCroppedPixels, cropShape);
        setBackImagePreview(croppedDataUrl);
        const file = await fetch(croppedDataUrl).then(r => r.blob()).then(blob => new File([blob], 'back_cropped.png', { type: blob.type }));
        setBackImageFile(file);
      }
    };
    recropImages();
  }, [cropShape]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const [continentsRes, coinRes] = await Promise.all([
        api.get('/locations/continents'),
        api.get(`/coins/coin/${coinId}`)
      ]);

      setContinents(continentsRes.data);
      const coin = coinRes.data;

      if (coin) {
        setSelectedContinent(coin.continentId);
        setSelectedCountry(coin.countryId);
        
        const frontImg = `data:image/jpeg;base64,${coin.frontImageBase64 || coin.imageBase64}`;
        setCurrentFrontImage(frontImg);
        
        // Load front image to get dimensions and set as original for re-cropping
        const frontImage = new Image();
        frontImage.onload = () => {
          setOriginalFrontImage(frontImg);
          setFrontCroppedPixels({
            x: 0,
            y: 0,
            width: frontImage.width,
            height: frontImage.height
          });
        };
        frontImage.src = frontImg;
        
        if (coin.backImageBase64) {
          const backImg = `data:image/jpeg;base64,${coin.backImageBase64}`;
          setCurrentBackImage(backImg);
          
          // Load back image to get dimensions and set as original for re-cropping
          const backImage = new Image();
          backImage.onload = () => {
            setOriginalBackImage(backImg);
            setBackCroppedPixels({
              x: 0,
              y: 0,
              width: backImage.width,
              height: backImage.height
            });
          };
          backImage.src = backImg;
        }
        
        setCropShape(coin.cropShape || 'rect');
        setDenomination(coin.denomination || '');
        setCurrency(coin.currency || '');
        setYear(coin.year ? coin.year.toString() : '');
        setNotes(coin.notes || '');
      }
    } catch (error) {
      setError('Failed to load coin data');
    } finally {
      setFetching(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await api.get(`/locations/${selectedContinent}/countries`);
      setCountries(response.data);
    } catch (error) {
      setError('Failed to load countries');
    }
  };

  const handleFrontImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPendingImage(ev.target.result);
        setCropperTarget('front');
        setCropperOpen(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRemoveBackImage(false);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPendingImage(ev.target.result);
        setCropperTarget('back');
        setCropperOpen(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropChange = useCallback((c) => setCrop(c), []);
  const onZoomChange = useCallback((z) => setZoom(z), []);
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropperDone = async () => {
    if (!pendingImage || !croppedAreaPixels) return;
    const croppedDataUrl = await getCroppedImg(pendingImage, croppedAreaPixels, cropShape);
    if (cropperTarget === 'front') {
      setOriginalFrontImage(pendingImage);
      setFrontCroppedPixels(croppedAreaPixels);
      setFrontImagePreview(croppedDataUrl);
      const file = await fetch(croppedDataUrl).then(r => r.blob()).then(blob => new File([blob], 'front_cropped.png', { type: blob.type }));
      setFrontImageFile(file);
    } else if (cropperTarget === 'back') {
      setOriginalBackImage(pendingImage);
      setBackCroppedPixels(croppedAreaPixels);
      setBackImagePreview(croppedDataUrl);
      const file = await fetch(croppedDataUrl).then(r => r.blob()).then(blob => new File([blob], 'back_cropped.png', { type: blob.type }));
      setBackImageFile(file);
    }
    setCropperOpen(false);
    setPendingImage(null);
    setCropperTarget(null);
    setCroppedAreaPixels(null);
  };

  const handleCropperCancel = () => {
    setCropperOpen(false);
    setPendingImage(null);
    setCropperTarget(null);
    setCroppedAreaPixels(null);
  };

  const handleRemoveBackImage = () => {
    setBackImageFile(null);
    setBackImagePreview('');
    setRemoveBackImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedContinent || !selectedCountry) {
      setError('Please select continent and country');
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        continentId: selectedContinent,
        countryId: selectedCountry,
        cropShape,
        denomination: denomination || null,
        currency: currency || null,
        year: year ? parseInt(year) : null,
        notes: notes || null
      };

      if (frontImageFile) {
        const frontBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result.split(',')[1]);
          };
          reader.readAsDataURL(frontImageFile);
        });
        updateData.frontImageBase64 = frontBase64;
      }

      if (backImageFile) {
        const backBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result.split(',')[1]);
          };
          reader.readAsDataURL(backImageFile);
        });
        updateData.backImageBase64 = backBase64;
      } else if (removeBackImage) {
        updateData.backImageBase64 = null;
      }
        
      await api.put(`/coins/${coinId}`, updateData);

      setSuccess('Coin updated successfully!');
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 300);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update coin');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full relative max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-green-700 to-green-800 rounded-t-lg">
          <h1 className="text-lg sm:text-2xl font-bold text-white">Edit Coin</h1>
          <button
            className="text-white hover:text-green-100 text-2xl sm:text-3xl font-bold leading-none transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {fetching ? (
            <div className="text-center py-10">
              <div className="text-lg sm:text-2xl text-gray-600">Loading...</div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                {/* Main layout: responsive single column on mobile, two columns on larger screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Left Column - All Fields */}
                  <div>
                    {/* Continent and Country */}
                    <div className="mb-5">
                      <label className="block mb-2 font-semibold text-gray-700">Continent</label>
                      <select
                        value={selectedContinent}
                        onChange={(e) => setSelectedContinent(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                        required
                      >
                        <option value="">Select a continent</option>
                        {continents.map((continent) => (
                          <option key={continent._id} value={continent._id}>
                            {continent.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-5">
                      <label className="block mb-2 font-semibold text-gray-700">Country</label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                        disabled={!selectedContinent}
                      >
                        <option value="">Select a country</option>
                        {countries.map((country) => (
                          <option key={country._id} value={country._id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Coin Details */}
                    <div className="mb-5">
                      <label className="block mb-2 font-semibold text-gray-700">Denomination</label>
                      <input
                        type="text"
                        value={denomination}
                        onChange={(e) => setDenomination(e.target.value)}
                        placeholder="e.g., 1, 5, 10, 25"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                      />
                    </div>

                    <div className="mb-5">
                      <label className="block mb-2 font-semibold text-gray-700">Currency</label>
                      <input
                        type="text"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        placeholder="e.g., USD, EUR, INR"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                      />
                    </div>

                    <div className="mb-5">
                      <label className="block mb-2 font-semibold text-gray-700">Year</label>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="e.g., 2023"
                        min="1"
                        max={new Date().getFullYear()}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                      />
                    </div>

                    <div className="mb-5">
                      <label className="block mb-2 font-semibold text-gray-700">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any additional notes about this coin..."
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Column - Image Uploads */}
                  <div>
                    {/* Crop Shape Selector */}
                    <div className="mb-5">
                      <label className="block mb-2 font-semibold text-gray-700">Crop Shape</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setCropShape('rect')}
                          className={`px-4 py-2 rounded-lg border-2 transition ${
                            cropShape === 'rect'
                              ? 'bg-green-700 text-white border-green-700'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                          }`}
                        >
                          Rectangle
                        </button>
                        <button
                          type="button"
                          onClick={() => setCropShape('square')}
                          className={`px-4 py-2 rounded-lg border-2 transition ${
                            cropShape === 'square'
                              ? 'bg-green-700 text-white border-green-700'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                          }`}
                        >
                          Square
                        </button>
                        <button
                          type="button"
                          onClick={() => setCropShape('circle')}
                          className={`px-4 py-2 rounded-lg border-2 transition ${
                            cropShape === 'circle'
                              ? 'bg-green-700 text-white border-green-700'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                          }`}
                        >
                          Circle
                        </button>
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block mb-2 font-semibold text-gray-700">
                        Front Side of Coin <span className="text-red-500">*</span>
                      </label>
                      {currentFrontImage && !frontImagePreview && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">Current:</p>
                          <img
                            src={currentFrontImage}
                            alt="Current Front"
                            className="max-w-full max-h-40 rounded-lg shadow-lg mx-auto"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        capture
                        onChange={handleFrontImageChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                      />
                    {frontImagePreview && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">New Preview:</p>
                        <img
                          src={frontImagePreview}
                          alt="Front Preview"
                          className="max-w-full max-h-60 rounded-lg shadow-lg mx-auto"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mb-5">
                    <label className="block mb-2 font-semibold text-gray-700">
                      Back Side of Coin <span className="text-gray-500 text-sm">(Optional)</span>
                    </label>
                    {currentBackImage && !backImagePreview && !removeBackImage && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Current:</p>
                        <img
                          src={currentBackImage}
                          alt="Current Back"
                          className="max-w-full max-h-40 rounded-lg shadow-lg mx-auto"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveBackImage}
                          className="mt-2 text-red-600 text-sm hover:text-red-800 underline"
                        >
                          Remove Back Image
                        </button>
                      </div>
                    )}
                    {removeBackImage && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">Back image will be removed on save.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setRemoveBackImage(false);
                            setBackImagePreview('');
                          }}
                          className="mt-2 text-blue-600 text-sm hover:text-blue-800 underline"
                        >
                          Cancel removal
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture
                      onChange={handleBackImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                    />
                    {backImagePreview && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">New Preview:</p>
                        <img
                          src={backImagePreview}
                          alt="Back Preview"
                          className="max-w-full max-h-60 rounded-lg shadow-lg mx-auto"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveBackImage}
                          className="mt-2 text-red-600 text-sm hover:text-red-800"
                        >
                          Remove Back Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm sm:text-base mt-3 mb-3">{error}</div>}
              {success && <div className="text-green-600 text-sm sm:text-base mt-3 mb-3">{success}</div>}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Coin'}
              </button>
            </form>
            </>
          )}
        </div>
      </div>

      {cropperOpen && pendingImage && (
        <CropperModal
          image={pendingImage}
          cropShape={cropShape === 'circle' ? 'round' : 'rect'}
          aspect={cropShape === 'square' || cropShape === 'circle' ? 1 : 4/3}
          crop={crop}
          zoom={zoom}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropComplete}
          onDone={handleCropperDone}
          onClose={handleCropperCancel}
        />
      )}
    </div>
  );
};

export default EditCoinModal;
