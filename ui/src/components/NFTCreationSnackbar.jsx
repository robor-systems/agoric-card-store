import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { useApplicationContext } from '../context/Application';
import { setCreationSnackbar } from '../store/store';

const NFTCreationSnackbar = () => {
  const { state, dispatch } = useApplicationContext();
  const { creationSnackbar: open } = state;
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      message="Thank you. The NFT is being created and you will be redirected to My Card tab once done."
      onClose={() => {
        dispatch(setCreationSnackbar(false));
      }}
    />
  );
};

export default NFTCreationSnackbar;
