import React from 'react';
import Arrow from '../../assets/icons/arrow-select.png';

function Select() {
  return (
    <div>
      <span className="text-lg leading-none">Sale Type</span>
      {/* <div className="flex bg-fieldBg justify-between pr-4 border border-alternativeLight rounded items-center"> */}
      <select
        style={{
          backgroundImage: `url(${Arrow})`,
          backgroundSize: '15px',
          backgroundPositionY: 'center',
          backgroundPositionX: '95%',
        }}
        className="bg-no-repeat cursor-pointer rounded-md bg-fieldBg w-full h-12 px-3.5 text-lg outline-none focus:outline-none font-normal"
      >
        <option>Fixed Price</option>
      </select>
      {/* <div className="">
          <img src={Arrow} className="w-3 mr-2 h-2" alt="Run" />
        </div> */}
      {/* </div> */}
    </div>
  );
}

export default Select;
