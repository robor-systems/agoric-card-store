import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/InputField';
import Select from './common/SelectField';
import { makeValue, stringifyValue } from '../utils/amount';

const CardAuctionForm = ({ tokenPurses, tokenDisplayInfo, onSubmit }) => {
  const [state, setFormState] = useState({
    error: null,
    isSubmitting: false,
  });
  const [selectedPurse, setSelectedPurse] = useState(
    tokenPurses && tokenPurses[0],
  );
  const [amount, setAmount] = useState(0);

  const submitBidOffer = () => {
    if (!onSubmit) {
      return null;
    }

    setFormState({
      isSubmitting: true,
    });
    const price = makeValue(amount, tokenDisplayInfo);
    return onSubmit(price, selectedPurse, setFormState)
      .then(() => {
        console.log('Done with bid');
        setFormState({
          error: null,
        });
      })
      .catch((err) => {
        setFormState({
          error: err.message,
        });
      });
  };

  const { error, isSubmitting } = state;
  return (
    <div className="flex flex-col gap-y-4">
      {error && <p className="red">{error}</p>}
      <div>
        <Select
          label="Purse"
          value={selectedPurse.pursePetname}
          handleChange={(event) => {
            console.log(event.target.value);
            const selectedOption = event.target.value;
            tokenPurses?.forEach((purse) => {
              console.log('for running');
              purse.pursePetname === selectedOption && setSelectedPurse(purse);
            });
          }}
        >
          {tokenPurses.map((p) => {
            return (
              <option
                key={p.pursePetname}
                value={p.pursePetname}
                // disabled={!p.value}
              >
                {p.pursePetname} ({stringifyValue(p.value, p.displayInfo)}{' '}
                {p.brandPetname})
              </option>
            );
          })}
        </Select>
      </div>
      <div>
        <Input
          label="Bid amount"
          type="number"
          value={amount}
          handleChange={(val) => {
            setAmount(val);
          }}
        />
      </div>
      <div className="">
        <Button
          styles={'w-full mt-auto relative'}
          disabled={isSubmitting}
          onClick={submitBidOffer}
          text={isSubmitting ? 'Submitting' : 'Bid'}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
};

export default CardAuctionForm;
