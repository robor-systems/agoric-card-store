import React, { useState } from 'react';
// import axios from 'axios';
import Button from './common/Button';
import Input from './common/InputField';
import { makeValue } from '../utils/amount';
import Select from './common/SelectField';
import Cancel from '../assets/icons/cancel.png';

function AddNewNFTForm({ tokenDisplayInfo, handleNFTMint }) {
  const [Form, setForm] = useState({
    title: '',
    image: '',
    creatorName: '',
    price: '',
    description: '',
  });
  // const [price, setPrice] = useState(null);
  const [attributes, setAttributes] = useState([{ type: '', name: '' }]);

  const handleSubmit = async () => {
    try {
      const amount = makeValue(Form.price, tokenDisplayInfo);
      const cardDetails = {
        name: Form.title,
        price: amount,
        image: Form.image,
        creatorName: Form.creatorName,
        description: Form.description,
        ...attributes,
      };
      handleNFTMint({ cardDetails });
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveAttribute = (index) => {
    const temp = attributes;
    temp.splice(index, 1);
    setAttributes([...temp]);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { type: '', name: '' }]);
  };

  const handleAttributeChange = (e, index) => {
    const { name, value } = e.target;
    const temp = attributes;
    console.log(e.target.value, e.target.name);
    temp[index][name] = value;
    setAttributes([...temp]);
  };
  console.log(attributes);
  console.log(Form);
  return (
    <div className="max-w-3xl mb-8 w-full flex flex-col gap-y-8">
      <Input
        type="text"
        label="NFT Title"
        value={Form.title}
        handleChange={(val) => {
          setForm({ ...Form, title: val });
        }}
      />
      <Input
        value={Form.image}
        handleChange={(val) => {
          setForm({ ...Form, image: val });
        }}
        label="Image url"
        type="text"
      />
      <Input
        value={Form.creatorName}
        handleChange={(val) => {
          setForm({ ...Form, creatorName: val });
        }}
        label="Creator Name"
        type="text"
      />
      <Input
        value={Form.price}
        handleChange={(val) => {
          setForm({ ...Form, price: val });
        }}
        label="Price"
        // type="text"
      />
      <div>
        <p className="text-lg leading-none">
          Description <span className="text-primaryLight">(optional)</span>
        </p>
        <textarea
          value={Form.description}
          onChange={(e) => {
            setForm({ ...Form, description: e.target.value });
          }}
          className="mt-1.5 px-4 py-4 h-36 border border-alternativeLight rounded outline-none focus:outline-none w-full"
          placeholder="Enter description about your item"
        />
      </div>
      <div>
        <p className="text-lg leading-none">
          Attributes <span className="text-primaryLight">(optional)</span>
        </p>
        <p className="text-primaryLight mt-1.5 text-lg leading-none">
          Select a display type and enter name and value
        </p>
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
                      fieldName={'type'}
                      value={attribute.type}
                      style={
                        'border-alternativeLight border bg-white text-primary'
                      }
                    >
                      <option value={''} hidden defaultChecked>
                        Select Type
                      </option>
                      <option value={'date'}>Date</option>
                      <option value={'number'}>Number</option>
                      <option value={'boost percentage'}>
                        Boost Percentage
                      </option>
                      <option value={'boost number'}>Boost Number</option>
                      <option value={'default'}>Default</option>
                    </Select>
                  </div>
                  <div className="w-56">
                    <input
                      type={'text'}
                      className="outline-none rounded-md border-alternativeLight border bg-white text-primary focus:outline-none w-full h-12 pl-4 "
                      placeholder={'Name'}
                      value={attribute.name}
                      name={'name'}
                      onChange={(e) => handleAttributeChange(e, index)}
                    />
                  </div>
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
        <p
          onClick={handleAddAttribute}
          className="text-secondary text-lg mt-3 cursor-pointer w-max"
        >
          + Add More
        </p>
      </div>
      <Button onClick={handleSubmit} text="Create" styles="w-full mt-auto" />
    </div>
  );
}

export default AddNewNFTForm;
