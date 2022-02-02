// The code in this file requires an understanding of Autodux.
// See: https://github.com/ericelliott/autodux
import autodux from 'autodux';
import { v4 as uuidv4 } from 'uuid';
import agoricLogo from 'assets/crypto-icons/agoric-logo.png';
import bldLogo from 'assets/crypto-icons/bld-logo.png';
import kirkLogo from 'assets/crypto-icons/kirk-logo.png';
import usdcLogo from 'assets/crypto-icons/usdc-logo.png';
import { stringifyPurseValue } from '@agoric/ui-components';

export const {
  reducer,
  initial: defaultState,
  actions: {
    setApproved,
    setConnected,
    setPurses,
    mergeBrandToInfo,
    addToBrandToInfo,
    setCollaterals,
    resetState,
    setTreasury,
    setVaultCollateral,
    setVaultConfiguration,
    createVault,
    setVaultToManageId,
    updateVault,
    updateOffers,
    resetVault,
    setAutoswap,
    setAssets,
    setError,
  },
} = autodux({
  slice: 'treasury',
  initial: {
    approved: true,
    connected: false,
    account: null,
    purses: null,
    error: {},
  },
  actions: {},
});
