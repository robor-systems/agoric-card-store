import React from 'react';

function Button({ text, styles, onClick, outLine }) {
  return (
    <button
      onClick={onClick}
      className={`${styles} ${
        outLine
          ? 'border-2 border-secondary text-secondary'
          : 'bg-secondary hover:bg-secondaryDark text-white'
      } btn-shadow h-12 transition-colors duration-300  rounded text-lg`}
    >
      {text}
    </button>
  );
}

export default Button;
