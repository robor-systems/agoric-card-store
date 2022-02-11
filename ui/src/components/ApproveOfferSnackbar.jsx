import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { useApplicationContext } from '../context/Application';
import { setNeedToApproveOffer, setBoughtCard } from '../store/store';

const ApproveOfferSnackbar = () => {
  // The snackbar to approve the offer will be closed by code not timeout.
  const { state, dispatch } = useApplicationContext();
  const { needToApproveOffer: open } = state;
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      message="Please approve the offer in your wallet to receive the payment."
      onClose={() => {
        dispatch(setNeedToApproveOffer(false));
        dispatch(setBoughtCard(false));
      }}
    />
  );
};

export default ApproveOfferSnackbar;
