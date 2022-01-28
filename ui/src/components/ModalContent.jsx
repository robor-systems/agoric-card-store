import React, { useState } from 'react';
import BaseballCard from './BaseballCard';
import Button from './common/Button';
import EditProductForm from './EditProductForm';
import SellProductForm from './SellProductForm';
import CardDetailModal from './CardDetailModal';

function ModalContent({
  makeSwapInvitation,
  makeMatchingSeatInvitation,
  onClose,
  type,
  cardDetail,
  onGetCardDetail,
  onBidCard,
  tokenPurses,
  tokenPetname,
  tokenDisplayInfo,
  handleClick,
}) {
  const [isLoading, setLoading] = useState(false);
  console.log(isLoading);
  const populateContent = () => {
    switch (type) {
      case 'Sell Product':
        return (
          <div className="flex gap-x-10 mt-11 mx-12 mb-12">
            <BaseballCard
              imageOnly={true}
              cardDetail={cardDetail}
              handleClick={handleClick}
            />
            <SellProductForm
              makeSwapInvitation={makeSwapInvitation}
              tokenDisplayInfo={tokenDisplayInfo}
              onClose={onClose}
            />
          </div>
        );
      case 'Edit Product':
        return (
          <div className="flex gap-x-10 mt-11 mx-12 mb-12">
            <BaseballCard imageOnly={true} cardDetail={cardDetail} />
            <EditProductForm />
          </div>
        );
      case 'Bid Product':
        return (
          <>
            <h1 className="text-2xl font-semibold text-center">{type}</h1>
            <CardDetailModal
              onClose={onClose}
              onGetCardDetail={onGetCardDetail}
              onBidCard={onBidCard}
              cardDetail={cardDetail}
              tokenPurses={tokenPurses}
              tokenPetname={tokenPetname}
              tokenDisplayInfo={tokenDisplayInfo}
            />
          </>
        );
      case 'Buy Product':
        return (
          <>
            <h1 className="text-2xl font-semibold text-center">{type}</h1>
            <div className="flex flex-col gap-y-10 mt-11 mx-12 mb-8">
              <BaseballCard cardDetail={cardDetail} handleClick={handleClick} />
              <Button
                text="Buy"
                style="w-full text-white"
                onClick={async () => {
                  setLoading(true);
                  const result = await makeMatchingSeatInvitation({
                    cardDetail,
                  });
                  console.log('result:', result);
                  setLoading(false);
                  onClose();
                }}
                styles="relative"
                isLoading={isLoading}
              />
            </div>
          </>
        );
      default:
        return '';
    }
  };
  return <>{populateContent()}</>;
}

export default ModalContent;
