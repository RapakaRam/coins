
import React, { useState, useEffect, useCallback } from 'react';
import CropperModal from '../components/CropperModal';
import getCroppedImg from '../utils/cropImage';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const AddCoin = ({ asModal = false, preselectContinent = '', preselectCountry = '', onClose, onSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [continents, setContinents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [preselect, setPreselect] = useState({
    continent: preselectContinent || location.state?.preselectContinent || '',
    country: preselectCountry || location.state?.preselectCountry || ''
  });
  const [frontImageFile, setFrontImageFile] = useState(null);
  const [backImageFile, setBackImageFile] = useState(null);
  const [frontImagePreview, setFrontImagePreview] = useState('');
  const [backImagePreview, setBackImagePreview] = useState('');
  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperTarget, setCropperTarget] = useState(null); // 'front' or 'back'
  const [cropShape, setCropShape] = useState('rect'); // 'rect' | 'square' | 'circle'
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  useEffect(() => {
    fetchContinents();
  }, []);

  // After continents are loaded, set preselected continent if valid
  useEffect(() => {
    if (continents.length > 0 && preselect.continent) {
      const found = continents.find(c => c._id === preselect.continent);
      if (found) {
        setSelectedContinent(preselect.continent);
      } else {
        setSelectedContinent('');
      }
    }
    // If no preselect, but selectedContinent is set, ensure it's valid
    if (continents.length > 0 && selectedContinent) {
      const found = continents.find(c => c._id === selectedContinent);
      if (!found) setSelectedContinent('');
    }
  }, [continents, preselect.continent]);

  // Fetch countries when continent changes
  useEffect(() => {
    if (selectedContinent) {
      fetchCountries(selectedContinent);
    } else {
      setCountries([]);
      setSelectedCountry('');
    }
    // eslint-disable-next-line
  }, [selectedContinent]);

  // After countries are loaded, set preselected country if valid
  useEffect(() => {
    if (countries.length > 0 && preselect.country) {
      const found = countries.find(c => c._id === preselect.country);
      if (found) {
        setSelectedCountry(preselect.country);
      } else {
        setSelectedCountry('');
      }
    }
    // If no preselect, but selectedCountry is set, ensure it's valid
    if (countries.length > 0 && selectedCountry) {
      const found = countries.find(c => c._id === selectedCountry);
      if (!found) setSelectedCountry('');
    }
  }, [countries, preselect.country]);

  // Modified fetchCountries to accept preselectCountry
  const fetchCountries = async (continentId = selectedContinent) => {
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

  // (Old fetchCountries replaced above)

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

  // Cropper handlers
  const onCropChange = useCallback((c) => setCrop(c), []);
  const onZoomChange = useCallback((z) => setZoom(z), []);
  const onCropComplete = useCallback((_, croppedPixels) => setCroppedAreaPixels(croppedPixels), []);

  const handleCropShapeChange = (shape) => setCropShape(shape);

  const handleCropperDone = async () => {
    if (!pendingImage || !croppedAreaPixels) return;
    const croppedDataUrl = await getCroppedImg(pendingImage, croppedAreaPixels, cropShape);
    if (cropperTarget === 'front') {
      setFrontImagePreview(croppedDataUrl);
      // Convert dataURL to File
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
      
      // Convert front image to base64
      const frontBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(frontImageFile);
      });

      // Convert back image to base64 if provided
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
        backImageBase64: backBase64
      });

      setSuccess('Coin uploaded successfully!');
      if (onSuccess) onSuccess();
      if (asModal && onClose) {
        setTimeout(() => onClose(), 1000);
      } else {
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload coin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={asModal ? '' : 'min-h-screen bg-gray-100 flex justify-center items-center p-5'}>
        <div className={asModal ? 'p-6' : 'bg-white p-10 rounded-lg shadow-2xl w-full max-w-2xl'}>
          <h1 className="text-3xl font-bold text-gray-800 mb-5">Add New Coin</h1>
          {!asModal && (
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mb-5"
              onClick={() => navigate('/home')}
            >
              ← Back to Home
            </button>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
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


          <div className="mb-5">
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

          {/* Crop shape options - only once, before front image */}
          <div className="flex gap-2 mb-5">
            <span className="text-xs text-gray-500">Crop as:</span>
            <button type="button" className={`px-2 py-1 rounded ${cropShape==='rect' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setCropShape('rect')}>Rectangle</button>
            <button type="button" className={`px-2 py-1 rounded ${cropShape==='square' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setCropShape('square')}>Square</button>
            <button type="button" className={`px-2 py-1 rounded ${cropShape==='circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setCropShape('circle')}>Circle</button>
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-700">
              Front Side of Coin <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
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
              </div>
            )}
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-700">
              Back Side of Coin <span className="text-gray-500 text-sm">(Optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBackImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {backImagePreview && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Back Preview:</p>
                <img
                  src={backImagePreview}
                  alt="Back Preview"
                  className="max-w-full max-h-80 shadow-lg mx-auto rounded-lg"
                />
              </div>
            )}
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
      {/* Cropper Modal */}
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

export default AddCoin;

