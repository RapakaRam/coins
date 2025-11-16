import React from 'react';

const CountryButton = ({ country, hasCoins, onClick, count }) => {
  return (
    <button
      className={`px-4 py-3 rounded-lg text-white font-semibold text-base cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-1 hover:shadow-lg active:translate-y-0 ${
        hasCoins
          ? 'bg-green-600 hover:bg-green-700 ring-2 ring-green-400/30'
          : 'bg-gray-500 hover:bg-gray-600'
      }`}
      onClick={onClick}
    >
      <span className="truncate">{country.name}</span>
      {hasCoins && <span className="ml-2 text-sm font-bold">({count})</span>}
    </button>
  );
};

export default CountryButton;

