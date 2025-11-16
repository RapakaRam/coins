import React from 'react';

const Logo = ({ className = "size-6" }) => {
  return (
    <img
      src="/oneAnna.png"
      alt="Coin Collector Logo"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo;
