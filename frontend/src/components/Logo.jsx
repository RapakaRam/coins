import React, { useState } from 'react';

const Logo = ({ className = "size-6" }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return <span className={className}>🪙</span>;
  }

  return (
    <img
      src="/oneAnna.png"
      alt="Coin Collector Logo"
      className={className}
      style={{ objectFit: 'contain' }}
      onError={() => setImageError(true)}
    />
  );
};

export default Logo;
