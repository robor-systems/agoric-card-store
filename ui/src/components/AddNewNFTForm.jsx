import React, { useState } from 'react';
// import axios from 'axios';
import { nanoid } from 'nanoid';
import Button from './common/Button';
import Input from './common/InputField';
import { makeValue } from '../utils/amount';
import AttributeSelectorForm from './AttributeSelectorForm';
import { setAddFormLoader, setCreationSnackbar } from '../store/store';
import { useApplicationContext } from '../context/Application';

function AddNewNFTForm({ tokenDisplayInfo, handleNFTMint }) {
  const { dispatch } = useApplicationContext();
  const [Form, setForm] = useState({
    title: '',
    image: '',
    creatorName: '',
    boughtFor: '',
    description: '',
  });
  const [attributes, setAttributes] = useState([]);

  const handleSubmit = async () => {
    try {
      const amount = makeValue(Form.boughtFor, tokenDisplayInfo);
      const id = nanoid();
      const cardDetails = {
        id,
        name: Form.title,
        boughtFor: amount,
        image: Form.image,
        creatorName: Form.creatorName,
        description: Form.description,
        attributes,
      };
      // console.log(cardDetails);
      setForm({
        title: '',
        image: '',
        creatorName: '',
        boughtFor: '',
        description: '',
      });
      setAttributes([]);
      dispatch(setAddFormLoader(true));
      dispatch(setCreationSnackbar(true));
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
    setAttributes([...attributes, { display_type: '', name: '', value: '' }]);
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
        label="Image CID"
        placeHolder="Please provide a valid ipfs CID"
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
        value={Form.boughtFor}
        handleChange={(val) => {
          setForm({ ...Form, boughtFor: val });
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
        <AttributeSelectorForm
          attributes={attributes}
          handleAttributeChange={handleAttributeChange}
          handleRemoveAttribute={handleRemoveAttribute}
        />
        <button
          onClick={handleAddAttribute}
          className="text-secondary text-lg mt-3 cursor-pointer w-max"
        >
          + Add More
        </button>
      </div>
      <Button onClick={handleSubmit} text="Create" styles="w-full mt-auto" />
    </div>
  );
}

export default AddNewNFTForm;
