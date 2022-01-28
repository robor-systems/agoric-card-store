import React from 'react';
import Loader from './Loader';

function Button({ text, styles, onClick, outLine, isLoading }) {
  return (
    <button
      onClick={onClick}
      className={`${styles} ${
        outLine
          ? 'border-2 border-secondary text-secondary'
          : 'bg-secondary hover:bg-secondaryDark text-white'
      } btn-shadow h-12 transition-colors duration-300  rounded text-lg`}
    >
      {isLoading && <Loader color="white" />}
      {text}
    </button>
  );
}

export default Button;
