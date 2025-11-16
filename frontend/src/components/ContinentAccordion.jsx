import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CountryButton from './CountryButton';

const ContinentAccordion = ({ continent, coinSummary, openContinentId, setOpenContinentId }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isOpen = openContinentId === continent._id;

  const fetchCountries = async () => {
    if (countries.length > 0) return; // Already loaded

    try {
      setLoading(true);
      const response = await api.get(`/locations/${continent._id}/countries`);
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !isOpen;
    if (next) {
      // open this continent and ensure others close
      try { sessionStorage.setItem('openContinentId', continent._id); } catch (e) { }
      setOpenContinentId(continent._id);
      // fetchCountries will be triggered by effect below when isOpen becomes true
    } else {
      try { sessionStorage.removeItem('openContinentId'); } catch (e) { }
      setOpenContinentId(null);
    }
  };

  // When this continent becomes open, ensure countries are loaded
  useEffect(() => {
    if (isOpen) {
      fetchCountries();
    }
  }, [isOpen]);

  return (
    <div className="bg-white rounded-lg mb-4 shadow-md overflow-hidden">
      <div
        className="p-4 sm:p-5 cursor-pointer flex justify-between items-center bg-gradient-to-r from-green-700 to-green-800 text-white hover:from-green-800 hover:to-green-900 transition-all"
        onClick={handleToggle}
      >
        <h2 className="text-lg sm:text-xl font-bold m-0">{continent.name}</h2>
        <span className="text-lg sm:text-xl">{isOpen ? '▼' : '▶'}</span>
      </div>
      {isOpen && (
        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="text-center py-5 text-gray-600 text-sm">Loading countries...</div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
              {countries.map((country) => {
                // Ensure we coerce counts safely (coinSummary may be an object or empty initially)
                const count = Number((coinSummary && coinSummary[country._id]) || 0);
                const hasCoins = count > 0;
                return (
                  <CountryButton
                    key={country._id}
                    country={country}
                    hasCoins={hasCoins}
                    count={count}
                    onClick={() => {
                      try { sessionStorage.setItem('openContinentId', continent._id); } catch (e) { }
                      navigate(`/gallery/${country._id}`);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContinentAccordion;

