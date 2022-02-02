import React, { useState } from 'react';
import Button from './common/Button';
import DateTimeField from './common/DateTimeField';
import Input from './common/InputField';
import Select from './common/SelectField';
import { makeValue } from '../utils/amount';
// import Loader from 'react-loader-spinner';

function SellProductForm({ makeSwapInvitation, tokenDisplayInfo, onClose }) {
  const [isLoading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
  return (
    <div className="form flex flex-col gap-y-6 self">
      <Select label="Sale Type" style={'bg-fieldBg'}>
        <option>Fixed Price</option>
      </Select>
      <Input value={price} handleChange={setPrice} label="Price" />
      <DateTimeField />
      <Button
        onClick={async () => {
          setLoading(true);
          const amount = makeValue(price, tokenDisplayInfo);
          console.log('amount is:', amount);

          const result = await makeSwapInvitation({ price: amount });
          if (result) {
            setLoading(false);
            onClose();
          }
        }}
        isLoading={isLoading}
        text="Place in Marketplace"
        styles="w-full mt-auto relative"
      />
    </div>
  );
}

export default SellProductForm;
