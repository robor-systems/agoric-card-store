import React, { useState } from 'react';
import BaseballCard from './BaseballCard';
import Button from './common/Button';
import EditProductForm from './EditProductForm';
import SellProductForm from './SellProductForm';
import CardDetailModal from './CardDetailModal';

function ModalContent({
  makeSwapInvitation,
  onClose,
  type,
  playerName,
  onGetCardDetail,
  onBidCard,
  tokenPurses,
  tokenPetname,
  tokenDisplayInfo,
}) {
  const [hidden, setHidden] = useState(true);
  const populateContent = () => {
    switch (type) {
      case 'Sell Product':
        return (
          <div className="flex gap-x-10 mt-11 mx-12 mb-12">
            <BaseballCard imageOnly={true} playerName={playerName} />
            <SellProductForm
              makeSwapInvitation={makeSwapInvitation}
              tokenDisplayInfo={tokenDisplayInfo}
            />
          </div>
        );
      case 'Edit Product':
        setHidden(false);
        return (
          <div className="flex gap-x-10 mt-11 mx-12 mb-12">
            <BaseballCard imageOnly={true} playerName={playerName} />
            <EditProductForm />
          </div>
        );
      case 'Buy Product':
        return (
          <>
            {!hidden && (
              <>
                <h1 className="text-2xl font-semibold text-center">{type}</h1>
                <CardDetailModal
                  onClose={onClose}
                  onGetCardDetail={onGetCardDetail}
                  onBidCard={onBidCard}
                  playerName={playerName}
                  tokenPurses={tokenPurses}
                  tokenPetname={tokenPetname}
                  tokenDisplayInfo={tokenDisplayInfo}
                />
              </>
            )}
            {hidden && (
              <>
                <h1 className="text-2xl font-semibold text-center">{type}</h1>
                <div className="flex flex-col gap-y-10 mt-11 mx-12 mb-8">
                  <BaseballCard playerName={playerName} />
                  <Button
                    onClick={() => {
                      setHidden(false);
                    }}
                    text="Buy"
                    style="w-full text-white"
                  />
                </div>
              </>
            )}
          </>
        );
      default:
        return '';
    }
  };
  return <>{populateContent()}</>;
}

export default ModalContent;
