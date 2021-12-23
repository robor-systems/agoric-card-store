import React from 'react';
import BaseballCard from './BaseballCard';
import Button from './common/Button';
import EditProductForm from './EditProductForm';
import SellProductForm from './SellProductForm';
// import Button from './common/Button';

function ModalContent({ type, playerName }) {
  const populateContent = () => {
    switch (type) {
      case 'Sell Product':
        return (
          <div className="flex gap-x-10 mt-11 mx-12 mb-12">
            <BaseballCard imageOnly={true} playerName={playerName} />
            <SellProductForm />
          </div>
        );
      case 'Edit Product':
        return (
          <div className="flex gap-x-10 mt-11 mx-12 mb-12">
            <BaseballCard imageOnly={true} playerName={playerName} />
            <EditProductForm />
          </div>
        );
      case 'Buy Product':
        return (
          <div className="flex flex-col gap-y-10 mt-11 mx-12 mb-12">
            <BaseballCard playerName={playerName} />
            <Button text="Buy for 99 RUN" style="w-full" />
          </div>
        );
      default:
        return '';
    }
  };
  return (
    <>
      <h1 className="text-2xl font-semibold text-center">{type}</h1>
      {populateContent()}
    </>
  );
}

export default ModalContent;
