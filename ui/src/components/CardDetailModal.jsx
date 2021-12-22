import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import CancelIcon from '../assets/icons/cancel.png';

import BaseballCard from './BaseballCard.jsx';
// import AuctionSessionDetail from './AuctionSessionDetail.jsx';
// import CardAuctionForm from './CardAuctionForm.jsx';
import SellProductForm from './SellProductForm';

const CardDetailModal = ({
  open,
  onClose,
  playerName,
  // tokenPurses,
  // tokenPetname,
  // tokenDisplayInfo,
  onGetCardDetail,
  // onBidCard,
}) => {
  const [state, setDetailState] = useState({});

  useEffect(() => {
    let isActive = true;
    const cancelFn = () => {
      isActive = false;
    };

    if (!playerName) {
      setDetailState({
        details: null,
        error: null,
      });
      return cancelFn;
    }

    onGetCardDetail(playerName)
      .then((result) => {
        if (!isActive) {
          return;
        }
        setDetailState({
          details: result,
          error: null,
        });
      })
      .catch((error) => {
        setDetailState({
          details: null,
          error: error.message,
        });
      });

    return cancelFn;
  }, [playerName]);

  // const submitBidOffer = (...args) => {
  //   if (!onBidCard) {
  //     return null;
  //   }
  //   return onBidCard(playerName, ...args).then(onClose);
  // };
  const { details, error } = state;
  return (
    open && (
      <>
        <div className="modal-shadow justify-center mx-auto items-center flex fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-3xl">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              <div className="flex justify-end mr-6 mt-6 mb-2.5">
                <button onClick={onClose}>
                  <img src={CancelIcon} alt="close" className="w-3.5 h-3.5" />
                </button>
              </div>
              <h1 className="text-2xl font-semibold text-center">
                Sell Product
              </h1>
              <div className="flex gap-x-10 mt-11 mx-12 mb-12">
                <BaseballCard imageOnly playerName={playerName} />
                {error && <Typography color="error">{error}</Typography>}
                {details ? (
                  <>
                    <SellProductForm />
                    {/* <AuctionSessionDetail
                      bidDuration={details.bidDuration}
                      bids={details.bids}
                      closesAfter={details.closesAfter}
                      minimumBid={details.minimumBid}
                      winnerPriceOption={details.winnerPriceOption}
                      tokenPetname={tokenPetname}
                      tokenDisplayInfo={tokenDisplayInfo}
                    />
                    <CardAuctionForm
                      minimumBid={details.minimumBid}
                      winnerPriceOption={details.winnerPriceOption}
                      tokenPetname={tokenPetname}
                      tokenPurses={tokenPurses}
                      tokenDisplayInfo={tokenDisplayInfo}
                      onSubmit={submitBidOffer}
                    /> */}
                  </>
                ) : (
                  <Box textAlign="center" marginTop="40px">
                    <CircularProgress size="2rem" />
                    <Typography>Fetching details...</Typography>
                  </Box>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          onClick={onClose}
          className="opacity-25 absolute w-full h-full inset-0 z-40 bg-black"
        ></div>
      </>
    )
  );
};

export default CardDetailModal;
