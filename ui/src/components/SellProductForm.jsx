import React, { useState } from 'react';
import Button from './common/Button';
import DateTimeField from './common/DateTimeField';
import Input from './common/InputField';
import Select from './common/SelectField';
import { makeValue } from '../utils/amount';

function SellProductForm({ makeSwapInvitation, tokenDisplayInfo, onClose }) {
  const [price, setPrice] = useState(0);
  return (
    <div className="form flex flex-col gap-y-6 self">
      <Select />
      <Input value={price} handleChange={setPrice} label="Price" />
      <DateTimeField />
      <Button
        onClick={async () => {
          const amount = makeValue(price, tokenDisplayInfo);
          console.log('amount is:', amount);

          const result = await makeSwapInvitation({ price: amount });
          if (result) {
            onClose();
          }
        }}
        text="Place in Marketplace"
        styles="w-full mt-auto"
      />
    </div>
  );
}

export default SellProductForm;
