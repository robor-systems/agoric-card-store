import React, { useEffect, useState } from 'react';
// import Box from '@material-ui/core/Box';
// import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import AuctionSessionDetail from './AuctionSessionDetail.jsx';
import CardAuctionForm from './CardAuctionForm.jsx';
import Loader from './common/Loader.jsx';

const useStyles = makeStyles((theme) => {
  return {
    root: {
      position: 'relative',
      margin: 'auto', // theme.spacing(4),
      marginTop: theme.spacing(12),
      display: 'flex',
      background: 'white',
      borderRadius: '4px',
      maxWidth: '960px',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    closeBtn: {
      position: 'absolute',
      top: theme.spacing(0.5),
      right: theme.spacing(0.5),
    },
    card: {
      width: '360px',
    },
    detail: {
      padding: theme.spacing(3),
      marginLeft: theme.spacing(2),
      marginBottom: theme.spacing(2),
      flex: 1,
    },
    loading: {
      marginBottom: theme.spacing(2),
    },
    heading: {
      fontWeight: 600,
      fontSize: '20px',
      marginBottom: theme.spacing(1),
    },
    bidForm: {
      marginBottom: theme.spacing(1),
    },
    bidFormItem: {
      marginBottom: theme.spacing(1),
    },
  };
});

const CardDetailModal = ({
  onClose,
  cardDetail,
  tokenPurses,
  tokenPetname,
  tokenDisplayInfo,
  onGetCardDetail,
  onBidCard,
}) => {
  const classes = useStyles();
  const [state, setDetailState] = useState({});

  useEffect(() => {
    let isActive = true;
    const cancelFn = () => {
      isActive = false;
    };

    if (!cardDetail) {
      setDetailState({
        details: null,
        error: null,
      });
      return cancelFn;
    }

    onGetCardDetail(cardDetail.name)
      .then((result) => {
        if (!isActive) {
          return;
        }
        console.log('Cardsdd:', cardDetail);
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
  }, [cardDetail]);

  const submitBidOffer = (...args) => {
    if (!onBidCard) {
      return null;
    }
    return onBidCard(cardDetail, ...args, onClose);
  };
  const { details, error } = state;

  return (
    <div className={classes.detail}>
      {error && <p color="error">{error}</p>}
      {details ? (
        <>
          <AuctionSessionDetail
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
          />
        </>
      ) : (
        <div
          className="flex flex-col items-center mt-10 p-32"
          textAlign="center"
          marginTop="40px"
          padding="120px"
        >
          <Loader />
          <p>Fetching details...</p>
        </div>
      )}
    </div>
  );
};

export default CardDetailModal;
