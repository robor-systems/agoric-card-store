import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { useApplicationContext } from '../context/Application';
import {
  setBoughtCard,
  setNeedToApproveOffer,
  setMessage,
} from '../store/store';

const BoughtCardSnackbar = () => {
  const { state, dispatch } = useApplicationContext();
  const { boughtCard: open, message } = state;
  return (
    <Snackbar
      open={open}
      message={message}
      autoHideDuration={7000}
      onClose={() => {
        dispatch(setNeedToApproveOffer(false));
        dispatch(setBoughtCard(false));
        dispatch(setMessage(null));
      }}
    />
  );
};

export default BoughtCardSnackbar;
