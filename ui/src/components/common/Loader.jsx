import React from 'react';

function Loader() {
  return (
    <div>
      <div
        style={{ borderTopColor: 'transparent' }}
        className="w-8 h-8 border-2 border-secondary border-solid rounded-full animate-spin"
      ></div>
    </div>
  );
}

export default Loader;
