import React, { useState } from 'react';
import BaseballCard from './BaseballCard';
import Button from './common/Button';
import EditProductForm from './EditProductForm';
import SellProductForm from './SellProductForm';
import CardDetailModal from './CardDetailModal';
import { useApplicationContext } from '../context/Application';

function ModalContent({
  makeSwapInvitation,
  makeMatchingSeatInvitation,
  removeCardFromSale,
  onClose,
  onGetCardDetail,
  onBidCard,
  handleClick,
}) {
  const [isLoading, setLoading] = useState(false);
  const { state } = useApplicationContext();
  const {
    type,
    activeCard: cardDetail,
    tokenPurses,
    tokenPetname,
    tokenDisplayInfo,
  } = state;

  const populateContent = () => {
    switch (type) {
      case 'Sell Product':
        return cardDetail.sellingPrice ? (
          <>
            <h1 className="text-2xl font-semibold text-center">
              Remove from Sale
            </h1>
            <div className="flex flex-col gap-y-10 mt-11 mx-12 mb-8">
              <BaseballCard
                cardDetail={cardDetail}
                handleClick={handleClick}
                // imageOnly={true}
                type={type}
                onSale={cardDetail.sellingPrice}
                noButton={true}
              />
              <Button
                text="Remove"
                style="w-full text-white"
                onClick={async () => {
                  setLoading(true);
                  const result = await removeCardFromSale();
                  setLoading(false);
                  onClose();
                }}
                styles="relative"
                isLoading={isLoading}
              />
            </div>
          </>
        ) : (
          <div className="flex gap-x-10 mt-11 mx-12 mb-12">
            <BaseballCard
              imageOnly={true}
              cardDetail={cardDetail}
              handleClick={handleClick}
              noButton={true}
              type={type}
            />
            <SellProductForm
              makeSwapInvitation={makeSwapInvitation}
              tokenDisplayInfo={tokenDisplayInfo}
              cardPrice={cardDetail.boughtFor || cardDetail.price}
              onClose={onClose}
            />
          </div>
        );

      case 'Edit Product':
        return (
          <div className="flex gap-x-10 mt-11 mx-12 mb-12">
            <BaseballCard
              imageOnly={true}
              cardDetail={cardDetail}
              noButton={true}
            />
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
              <BaseballCard
                cardDetail={cardDetail}
                handleClick={handleClick}
                type={type}
                noButton={true}
              />
              <Button
                text="Buy"
                style="w-full text-white"
                onClick={async () => {
                  setLoading(true);
                  await makeMatchingSeatInvitation({
                    cardDetail,
                    setLoading,
                    onClose,
                  });
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
