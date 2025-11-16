import React, { useState, useEffect, useCallback } from 'react';
import CropperModal from './CropperModal';
import getCroppedImg from '../utils/cropImage';
import api from '../services/api';

const AddCoinModal = ({ isOpen, onClose, preselectContinent = '', preselectCountry = '', onSuccess }) => {
  const [continents, setContinents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [preselect, setPreselect] = useState({
    continent: preselectContinent,
    country: preselectCountry
  });
  const [frontImageFile, setFrontImageFile] = useState(null);
  const [backImageFile, setBackImageFile] = useState(null);
  const [frontImagePreview, setFrontImagePreview] = useState('');
  const [backImagePreview, setBackImagePreview] = useState('');
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperTarget, setCropperTarget] = useState(null);
  const [cropShape, setCropShape] = useState('rect');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [denomination, setDenomination] = useState('');
  const [currency, setCurrency] = useState('');
  const [year, setYear] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchContinents();
      setPreselect({
        continent: preselectContinent,
        country: preselectCountry
      });
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preselectContinent, preselectCountry]);

  useEffect(() => {
    if (continents.length > 0 && preselect.continent) {
      const found = continents.find(c => c._id === preselect.continent);
      if (found) {
        setSelectedContinent(preselect.continent);
      } else {
        setSelectedContinent('');
      }
    }
    if (continents.length > 0 && selectedContinent) {
      const found = continents.find(c => c._id === selectedContinent);
      if (!found) setSelectedContinent('');
    }
  }, [continents, preselect.continent, selectedContinent]);

  useEffect(() => {
    if (selectedContinent) {
      fetchCountries(selectedContinent);
    } else {
      setCountries([]);
      setSelectedCountry('');
    }
  }, [selectedContinent]);

  useEffect(() => {
    if (countries.length > 0 && preselect.country) {
      const found = countries.find(c => c._id === preselect.country);
      if (found) {
        setSelectedCountry(preselect.country);
      } else {
        setSelectedCountry('');
      }
    }
    if (countries.length > 0 && selectedCountry) {
      const found = countries.find(c => c._id === selectedCountry);
      if (!found) setSelectedCountry('');
    }
  }, [countries, preselect.country, selectedCountry]);

  const fetchCountries = async (continentId) => {
    try {
      const response = await api.get(`/locations/${continentId}/countries`);
      setCountries(response.data);
    } catch (error) {
      setError('Failed to load countries');
    }
  };

  const fetchContinents = async () => {
    try {
      const response = await api.get('/locations/continents');
      setContinents(response.data);
    } catch (error) {
      setError('Failed to load continents');
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
  const onCropComplete = useCallback((_, croppedPixels) => setCroppedAreaPixels(croppedPixels), []);

  const handleCropperDone = async () => {
    if (!pendingImage || !croppedAreaPixels) return;
    const croppedDataUrl = await getCroppedImg(pendingImage, croppedAreaPixels, cropShape);
    if (cropperTarget === 'front') {
      setFrontImagePreview(croppedDataUrl);
      const file = await fetch(croppedDataUrl).then(r => r.blob()).then(blob => new File([blob], 'front_cropped.png', { type: blob.type }));
      setFrontImageFile(file);
    } else if (cropperTarget === 'back') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedContinent || !selectedCountry || !frontImageFile) {
      setError('Please fill in continent, country, and front image (required)');
      return;
    }

    try {
      setLoading(true);
      
      const frontBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(frontImageFile);
      });

      let backBase64 = null;
      if (backImageFile) {
        backBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result.split(',')[1]);
          };
          reader.readAsDataURL(backImageFile);
        });
      }
        
      await api.post('/coins/upload', {
        continentId: selectedContinent,
        countryId: selectedCountry,
        frontImageBase64: frontBase64,
        backImageBase64: backBase64,
        cropShape: cropShape,
        denomination: denomination || null,
        currency: currency || null,
        year: year ? parseInt(year) : null,
        notes: notes || null
      });

      setSuccess('Coin uploaded successfully!');
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload coin');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold z-10"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-5">Add New Coin</h1>
            <form onSubmit={handleSubmit}>
              {/* Two column layout for selections */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Continent</label>
                  <div className="relative">
                    <select
                      value={selectedContinent}
                      onChange={(e) => {
                        setSelectedContinent(e.target.value);
                        setSelectedCountry('');
                      }}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${preselect.continent ? 'bg-gray-100 text-gray-500' : ''}`}
                      required
                      disabled={Boolean(preselect.continent)}
                      style={preselect.continent ? { appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' } : {}}
                    >
                      <option value="">Select a continent</option>
                      {continents.map((continent) => (
                        <option key={continent._id} value={continent._id}>
                          {continent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Country</label>
                  <div className="relative">
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${preselect.country ? 'bg-gray-100 text-gray-500' : ''}`}
                      required
                      disabled={Boolean(preselect.country) || !selectedContinent || countries.length === 0}
                      style={preselect.country ? { appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' } : {}}
                    >
                      <option value="">Select a country</option>
                      {countries.map((country) => (
                        <option key={country._id} value={country._id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-700">Crop Shape</label>
                <div className="flex gap-2">
                  <button type="button" className={`px-2 py-1 rounded ${cropShape==='rect' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setCropShape('rect')}>Rectangle</button>
                  <button type="button" className={`px-2 py-1 rounded ${cropShape==='square' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setCropShape('square')}>Square</button>
                  <button type="button" className={`px-2 py-1 rounded ${cropShape==='circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setCropShape('circle')}>Circle</button>
                </div>
              </div>

              {/* Two column layout for image uploads */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Front Side of Coin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture
                    onChange={handleFrontImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {frontImagePreview && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600 mb-2">Front Preview:</p>
                      <img
                        src={frontImagePreview}
                        alt="Front Preview"
                        className={`max-w-full max-h-80 shadow-lg mx-auto ${cropShape==='circle' ? 'rounded-full' : 'rounded-lg'}`}
                        style={cropShape==='circle' ? { aspectRatio: '1/1', objectFit: 'cover' } : {}}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFrontImageFile(null);
                          setFrontImagePreview('');
                        }}
                        className="mt-2 text-blue-600 text-sm hover:text-blue-800 underline"
                      >
                        Change Image
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Back Side of Coin <span className="text-gray-500 text-sm">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture
                    onChange={handleBackImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {backImagePreview && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600 mb-2">Back Preview:</p>
                      <img
                        src={backImagePreview}
                        alt="Back Preview"
                        className={`max-w-full max-h-80 shadow-lg mx-auto ${cropShape==='circle' ? 'rounded-full' : 'rounded-lg'}`}
                        style={cropShape==='circle' ? { aspectRatio: '1/1', objectFit: 'cover' } : {}}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBackImageFile(null);
                          setBackImagePreview('');
                        }}
                        className="mt-2 text-blue-600 text-sm hover:text-blue-800 underline"
                      >
                        Change Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Coin Details Section */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Coin Details (Optional)</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Denomination</label>
                    <input
                      type="text"
                      value={denomination}
                      onChange={(e) => setDenomination(e.target.value)}
                      placeholder="e.g., 1, 5, 10, 25"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Currency</label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="e.g., USD, EUR, INR"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold text-gray-700">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., 2023"
                    min="1"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes about this coin..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {error && <div className="text-red-600 mt-3 mb-3">{error}</div>}
              {success && <div className="text-green-600 mt-3 mb-3">{success}</div>}

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload Coin'}
              </button>
            </form>
          </div>
        </div>
      </div>
      {cropperOpen && (
        <CropperModal
          image={pendingImage}
          cropShape={cropShape === 'circle' ? 'round' : 'rect'}
          aspect={cropShape === 'square' || cropShape === 'circle' ? 1 : 4/3}
          crop={crop}
          zoom={zoom}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropComplete}
          onClose={handleCropperCancel}
          onDone={handleCropperDone}
        />
      )}
    </>
  );
};

export default AddCoinModal;
