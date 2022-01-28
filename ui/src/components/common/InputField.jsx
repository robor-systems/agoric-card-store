import React from 'react';
import RUN from '../../assets/icons/RUN-logo.png';

function Input({ label, value, handleChange, type = 'number' }) {
  return (
    <div>
      <span className="text-lg leading-none">{label}</span>
      <div className="flex justify-between pr-4 border border-alternativeLight rounded items-center">
        <input
          type={type}
          className="outline-none focus:outline-none w-56 h-12 rounded ml-4 mr-3"
          placeholder={type === 'number' ? '0.00' : label}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        />
        {type === 'number' && (
          <div className="w-20 flex items-center">
            <img src={RUN} className="w-5 mr-2 h-5" alt="Run" />
            <span className="text-lg">RUN</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Input;
