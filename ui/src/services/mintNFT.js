import { E } from '@agoric/captp';
// import { AmountMath } from '@agoric/ertp';
import {
  setActiveTab,
  setAddFormLoader,
  setCheckIcon,
  setCreationSnackbar,
  setType,
} from '../store/store';

export const mintNFT = async ({
  cardDetails,
  MAIN_CONTRACT_BOARD_INSTANCE_ID,
  walletP,
  // publicFacet,
  CARD_BRAND_BOARD_ID,
  // cardPurse,
  dispatch,
}) => {
  const zoe = await E(walletP).getZoe();
  const board = await E(walletP).getBoard();
  const instance = await E(board).getValue(MAIN_CONTRACT_BOARD_INSTANCE_ID);
  const depositFacetId = await E(walletP).getDepositFacetId(
    CARD_BRAND_BOARD_ID,
  );
  const depositFacet = await E(board).getValue(depositFacetId);
  const publicFacetMain = await E(zoe).getPublicFacet(instance);
  const mintedCardPayment = await E(publicFacetMain).mintUserCard(cardDetails);
  await E(depositFacet).receive(mintedCardPayment);
  // const AmountForAddition = AmountMath.make(
  //   cardPurse.brand,
  //   harden([cardDetails]),
  // );
  // await E(publicFacet).addToUserSaleHistory(AmountForAddition);
  dispatch(setCreationSnackbar(false));
  dispatch(setCheckIcon(true));
  setTimeout(() => {
    dispatch(setAddFormLoader(false));
    dispatch(setCheckIcon(false));
    dispatch(setActiveTab(0));
    dispatch(setType('Sell Product'));
  }, 1000);
};
