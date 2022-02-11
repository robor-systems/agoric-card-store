import React from 'react';
import Select from './common/SelectField';
import Cancel from '../assets/icons/cancel.png';
import CalenderIcon from '../assets/icons/date-icon.png';

export default function AttributeSelectorForm({
  attributes,
  handleAttributeChange,
  handleRemoveAttribute,
}) {
  return (
    <div className="mt-3 flex flex-col gap-y-3">
      {attributes.map((attribute, index) => {
        return (
          <div
            key={index}
            style={{ background: '#F8FCFF', height: '72px' }}
            className="flex gap-x-3 border-secondary justify-between items-center border rounded border-dashed p-3"
          >
            <div className="flex gap-x-3">
              <div className="w-56">
                <Select
                  handleChange={(e) => handleAttributeChange(e, index)}
                  fieldName={'display_type'}
                  value={attribute.display_type}
                  style={'border-alternativeLight border bg-white text-primary'}
                >
                  <option value={''} hidden defaultChecked>
                    Select Type
                  </option>
                  <option value={'date'}>Date</option>
                  <option value={'number'}>Number</option>
                  <option value={'boost percentage'}>Boost Percentage</option>
                  <option value={'boost number'}>Boost Number</option>
                  <option value={'default'}>Default</option>
                </Select>
              </div>
              <div className="w-56">
                <input
                  type={'text'}
                  className="outline-none rounded-md border-alternativeLight border bg-white text-primary focus:outline-none w-full h-12 pl-4 "
                  placeholder={'Enter Name'}
                  value={attribute.name}
                  name={'name'}
                  onChange={(e) => handleAttributeChange(e, index)}
                />
              </div>

              {attribute.display_type === 'date' && (
                <div className=" w-56">
                  <div className="flex relative justify-between  border border-alternativeLight rounded items-center">
                    <input
                      type="date"
                      value={attribute.value}
                      onChange={(e) => handleAttributeChange(e, index)}
                      name={'value'}
                      className="w-full h-12 pl-4 outline-none pr-4 focus:outline-none text-primaryLight"
                    />
                    <div className="absolute right-4 z-0">
                      <img src={CalenderIcon} className="w-5 h-5" alt="Run" />
                    </div>
                  </div>
                </div>
              )}
              {attribute.display_type === 'number' && (
                <div className=" w-56">
                  <input
                    className="outline-none rounded-md border-alternativeLight border bg-white text-primary focus:outline-none w-full h-12 pl-4 "
                    placeholder={'Value'}
                    value={attribute.value}
                    name={'value'}
                    onChange={(e) => handleAttributeChange(e, index)}
                  />
                </div>
              )}
              {attribute.display_type === 'boost number' && (
                <div className="w-56 flex bg-white items-center">
                  <input
                    className="outline-none rounded-l-md border-alternativeLight border bg-white text-primary focus:outline-none w-2/5 h-12 pl-4 "
                    placeholder={'Value'}
                    value={attribute.value}
                    name={'value'}
                    onChange={(e) => handleAttributeChange(e, index)}
                  />
                  <div className="w-1/5 border-alternativeLight h-12 flex text-primaryLight items-center justify-center border">
                    of
                  </div>
                  <input
                    readOnly
                    className="outline-none rounded-r-md border-alternativeLight border bg-white text-primary focus:outline-none w-2/5 h-12 pl-4 "
                    placeholder={'Value'}
                    value={10}
                  />
                </div>
                // <BoostNumberInput attribute={attribute} index={index} />
              )}
              {attribute.display_type === 'boost percentage' && (
                <div className="relative w-56 flex items-center">
                  <input
                    type="number"
                    className="outline-none rounded-md border-alternativeLight border bg-white text-primary focus:outline-none w-full h-12 pl-4 "
                    placeholder={'Value'}
                    value={attribute.value}
                    name={'value'}
                    onChange={(e) => handleAttributeChange(e, index)}
                  />
                  <span className="text-lg text-primaryLight absolute right-4">
                    %
                  </span>
                </div>
                // <BoostPercentageInput attribute={attribute} index={index} />
              )}
              {attribute.display_type === 'default' && (
                <div className=" w-56">
                  <input
                    type={'text'}
                    className="outline-none rounded-md border-alternativeLight border bg-white text-primary focus:outline-none w-full h-12 pl-4 "
                    placeholder={'Value'}
                    value={attribute.value}
                    name={'value'}
                    onChange={(e) => handleAttributeChange(e, index)}
                  />
                </div>
              )}
            </div>
            <div className="w-max">
              <img
                src={Cancel}
                width="14px"
                height="14px"
                alt="cancel"
                onClick={() => handleRemoveAttribute(index)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
