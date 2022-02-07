import React, { useState } from 'react';
import axios from 'axios';
import Button from './common/Button';
// import DateTimeField from './common/DateTimeField';
import Input from './common/InputField';
// import Select from './common/SelectField';
import { makeValue } from '../utils/amount';

function AddNewNFTForm({ tokenDisplayInfo, handleNFTMint }) {
  const [price, setPrice] = useState(0);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = async () => {
    const file = image;
    console.log(file);
    const blob = file.slice(0, file.size, file.type);
    const newFile = new File([blob], `${name}.${file.type.split('/')[1]}`, {
      type: file.type,
    });
    const data = new FormData();
    data.append('file', newFile);
    console.log(data);
    try {
      const amount = makeValue(price, tokenDisplayInfo);
      const res = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data,
        {
          headers: {
            // eslint-disable-next-line no-underscore-dangle
            'Content-Type': `multipart/form-data; boundary= ${data._boundary}`,
            pinata_api_key: 'b4c4977f450c9b36d21b',
            pinata_secret_api_key:
              'c1e29497af67cfb63545385f8686f8fb8ff38971e9d887c8ad9ac90092581a11',
          },
        },
      );
      const cardDetails = {
        name,
        price: amount,
        image: res.data.IpfsHash,
        description: '',
      };
      handleNFTMint({ cardDetails });
      // console.log(response);
      // console.log(newFile, amount, name);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="form flex flex-col gap-y-6 self">
      <Input type="text" label="Name" value={name} handleChange={setName} />
      <Input value={price} handleChange={setPrice} label="Price" />
      <input
        type="file"
        name="myImage"
        accept="image/*"
        onChange={(e) => {
          setImage(e.target.files[0]);
        }}
      />
      <Button
        onClick={handleSubmit}
        text="Place in Marketplace"
        styles="w-full mt-auto"
      />
    </div>
  );
}

export default AddNewNFTForm;
