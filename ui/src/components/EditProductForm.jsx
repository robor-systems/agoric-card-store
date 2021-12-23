import React from 'react';
import Button from './common/Button';
import DateTimeField from './common/DateTimeField';
import Input from './common/InputField';

function EditProductForm() {
  return (
    <div className="form flex flex-col gap-y-6 self">
      <Input label="New Price" />
      <DateTimeField />
      <div className="flex flex-col gap-y-3 items-center mt-auto">
        <Button text="Confirm" styles="w-full" />
        <p className="text-lg text-primaryLight">or</p>
        <Button text="Remove from Marketplace" styles="w-full" outLine={true} />
      </div>
    </div>
  );
}

export default EditProductForm;
