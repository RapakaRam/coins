import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ContinentAccordion from '../components/ContinentAccordion';
import AddCoinModal from '../components/AddCoinModal';

const Home = () => {
  const [continents, setContinents] = useState([]);
  const [coinSummary, setCoinSummary] = useState([]);
  const [openContinentId, setOpenContinentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
    // restore last-open continent (if any)
    try {
      const openId = sessionStorage.getItem('openContinentId');
      if (openId) setOpenContinentId(openId);
    } catch (e) {
      // ignore
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
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
      <header className="bg-white shadow-md p-5 mb-5 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">🪙 Coin Collector</h1>
        <div className="flex gap-3">
          <button
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            + Add Coin
          </button>
      <AddCoinModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        preselectContinent={''}
        preselectCountry={''}
        onSuccess={fetchData}
      />
          <button
            className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-5">
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

