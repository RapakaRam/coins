import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ContinentAccordion from '../components/ContinentAccordion';
import AddCoinModal from '../components/AddCoinModal';
import Logo from '../components/Logo';

const Home = () => {
  const [continents, setContinents] = useState([]);
  const [coinSummary, setCoinSummary] = useState([]);
  const [openContinentId, setOpenContinentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  // Country search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchData();
    const openId = sessionStorage.getItem('openContinentId');
    if (openId) setOpenContinentId(openId);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [continentsRes, summaryRes] = await Promise.all([
        api.get('/locations/continents'),
        api.get('/coins/summary')
      ]);

      setContinents(continentsRes.data);
      
      // Convert summary array to object with string keys for quick lookup (use _id from backend)
      const summaryObj = {};
      summaryRes.data.forEach(item => {
        summaryObj[String(item._id)] = item.count;
      });
      setCoinSummary(summaryObj);
    } catch (err) {
      console.error('fetchData error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  };

  // Debounced country search
  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get('/locations/search', { params: { q: trimmedQuery } });
        setResults(data || []);
        setShowDropdown(!!data?.length);
      } catch (e) {
        setResults([]);
        setShowDropdown(false);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelectCountry = (country) => {
    setShowDropdown(false);
    setQuery(country.name);
    navigate(`/gallery/${country._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-green-700 to-green-800 shadow-md p-4 sm:p-5 mb-5 flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Logo className="size-8 sm:size-10 text-white" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Coin Collector</h1>
        </div>
        <div className="flex gap-3 items-center">
          <button
            className="px-4 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm sm:text-base font-semibold flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <span className="hidden sm:inline">+ Add Coin</span>
            <span className="sm:hidden">➕</span>
          </button>
          <button
            className="px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base font-semibold flex items-center gap-2"
            onClick={handleLogout}
          >
            <span className="hidden sm:inline">Logout</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 sm:hidden">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
          </button>
        </div>
      </header>

      <AddCoinModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        preselectContinent={''}
        preselectCountry={''}
        onSuccess={fetchData}
      />

      {/* Country Search */}
      <div className="max-w-6xl mx-auto px-4 sm:px-5">
        <div className="max-w-xl mx-auto mb-5">
          <label className="block mb-2 font-semibold text-gray-700 text-sm sm:text-base">Search Countries</label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              placeholder="Type a country name..."
              className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 text-base"
            />
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                {searchLoading ? (
                  <div className="p-3 text-gray-500 text-sm">Searching...</div>
                ) : results.length === 0 ? (
                  <div className="p-3 text-gray-500 text-sm">No results</div>
                ) : (
                  results.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className="w-full text-left px-4 py-2 sm:py-3 hover:bg-green-50 text-sm sm:text-base"
                    >
                      {c.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-5">
        {continents.map((continent) => (
          <ContinentAccordion
            key={continent._id}
            continent={continent}
            coinSummary={coinSummary}
            openContinentId={openContinentId}
            setOpenContinentId={setOpenContinentId}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;

