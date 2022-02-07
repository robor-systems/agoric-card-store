import React from 'react';

function Loader({ color, size }) {
  return (
    <div>
      <div
        style={{ borderTopColor: 'transparent' }}
        className={`w-${size !== undefined ? size : 8} h-${
          size !== undefined ? size : 8
        } border-2 border-${
          !color ? 'secondary' : color
        } border-solid rounded-full animate-spin ${
          color && 'absolute right-3'
        }`}
      ></div>
    </div>
  );
}

export default Loader;
