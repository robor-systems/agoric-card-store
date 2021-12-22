import React from 'react';

function Button({ styles }) {
  return (
    <button
      className={`${styles} bg-secondary h-12 hover:bg-secondaryDark btn-shadow rounded text-white text-lg`}
    >
      Place in Marketplace
    </button>
  );
}

export default Button;
