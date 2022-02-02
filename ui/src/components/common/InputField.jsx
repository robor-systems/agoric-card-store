import React from 'react';
import RUN from '../../assets/icons/RUN-logo.png';

function Input({
  label,
  value,
  handleChange,
  type = 'number',
  noLabel,
  fieldName,
}) {
  return (
    <div>
      {!noLabel && <span className="text-lg leading-none">{label}</span>}
      <div
        className={`flex justify-between  border border-alternativeLight rounded items-center ${
          type === 'number' && 'pr-4'
        }`}
      >
        <input
          type={type}
          className="outline-none focus:outline-none w-full h-12 rounded pl-4 "
          placeholder={type === 'number' ? '0.00' : label}
          value={value}
          required={true}
          name={fieldName}
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
