import React from 'react';

function Select() {
  return (
    <div>
      <span className="text-lg leading-none">Sale Type</span>
      <select className="bg-fieldBg w-full h-12 px-3.5 text-lg border-alternativeLight outline-none focus:outline-none border rounded font-normal">
        <option>Fixed Price</option>
      </select>
    </div>
  );
}

export default Select;
