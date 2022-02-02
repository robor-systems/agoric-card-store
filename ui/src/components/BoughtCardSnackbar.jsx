import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { useApplicationContext } from '../context/Application';
import { setBoughtCard, setNeedToApproveOffer } from '../store/store';

const BoughtCardSnackbar = () => {
  const { state, dispatch } = useApplicationContext();
  const { boughtCard: open } = state;
  return (
    <Snackbar
      open={open}
      message="You just bought a baseball card! Check your Card purse in
    your wallet to see the cards you own."
      autoHideDuration={5000}
      onClose={() => {
        dispatch(setNeedToApproveOffer(false));
        dispatch(setBoughtCard(false));
      }}
    />
  );
};

export default BoughtCardSnackbar;
