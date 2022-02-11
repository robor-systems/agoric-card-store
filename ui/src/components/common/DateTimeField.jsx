import React from 'react';
import CalenderIcon from '../../assets/icons/date-icon.png';

function DateTimeField({ noLabels = false, disabled }) {
  return (
    <div>
      {!noLabels && (
        <span
          className={`text-lg leading-none ${
            disabled && 'text-primaryLight select-none'
          }`}
        >
          Sale End Date & Time{' '}
          <span className="text-primaryLight">(optional)</span>
        </span>
      )}
      <div className="flex relative justify-between  border border-alternativeLight rounded items-center">
        <input
          disabled={disabled}
          type="date"
          className="w-full h-12 pl-4 outline-none pr-4 focus:outline-none text-primaryLight"
        />
        <div className="absolute right-4 z-0">
          <img src={CalenderIcon} className="w-5 h-5" alt="Run" />
        </div>
      </div>
    </div>
  );
}

export default DateTimeField;
