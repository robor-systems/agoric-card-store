import React from 'react';
import CalenderIcon from '../../assets/icons/date-icon.png';

function DateTimeField() {
  return (
    <div>
      <span className="text-lg leading-none">
        Sale End Date & Time{' '}
        <span className="text-primaryLight">(optional)</span>
      </span>
      <div className="flex justify-between pr-4 border border-alternativeLight rounded items-center">
        <input
          type="date"
          className="w-full h-12 ml-4 outline-none focus:outline-none text-primaryLight"
        />
        <div className="">
          <img src={CalenderIcon} className="w-5 mr-2 h-5" alt="Run" />
        </div>
      </div>
    </div>
  );
}

export default DateTimeField;
