import { AmountMath } from '@agoric/ertp';
import { E } from '@agoric/eventual-send';
import dappConstants from '../utils/constants';
import { setBoughtCard, setMessage } from '../store/store';

/*
 * This function should be called when the buyer buys a card from
 * secondary market place
 */

const makeMatchingInvitation = async ({
  cardPurse,
  tokenPurses,
  cardDetail,
  sellingPrice,
  boughtFor,
  walletP,
  publicFacetSimpleExchange,
  cardOffer,
  setLoading,
  onClose,
  dispatch,
}) => {
  console.log('cardPursePetname:', cardPurse.pursePetname);
  console.log('cardbrand:', cardPurse.brand);
  console.log(tokenPurses, 'tokenPurse');
  console.log(cardDetail, 'cardDetail');
  console.log(sellingPrice, 'sellingPrice');
  console.log(boughtFor, 'boughtFor');
  console.log(walletP, 'walletp');
  console.log(publicFacetSimpleExchange);
  console.log(cardOffer);

  const offerId = await E(publicFacetSimpleExchange).makeBuyerOffer({
    cardPurse,
    tokenPurses,
    cardDetail,
    sellingPrice,
    boughtFor,
    walletP,
    cardOffer,
    _id: Date.now(),
    simpleExchangeInstallationBoardId:
      dappConstants.SIMPLE_EXCHANGE_INSTALLATION_BOARD_ID,
    simpleExchangeInstanceBoardId:
      dappConstants.SIMPLE_EXCHANGE_INSTANCE_BOARD_ID,
  });
  setLoading(false);
  onClose();
  dispatch(setBoughtCard(true));
  dispatch(
    setMessage('Please accept offer from your wallet to complete purchase!'),
  );
  const result = await E(
    publicFacetSimpleExchange,
  ).updateNotfiersOnWalletOffersAtBuyer({
    offerId,
    cardOffer,
    cardDetail,
    boughtFor,
    sellingPrice,
    walletP,
  });
  return result;
};
/*
 * This function should be called when the user puts a card
 * which he own on sale in the secondary marketplace
 */
const getSellerSeat = async ({
  cardDetail,
  sellingPrice,
  publicFacetSimpleExchange,
  cardPurse,
  tokenPurses,
  walletP,
  setLoading,
  onClose,
  // state,
  dispatch,
}) => {
  const { offerId, cardOfferAmount } = await E(
    publicFacetSimpleExchange,
  ).makeSellerOffer({
    cardDetail,
    sellingPrice,
    cardPurse,
    tokenPurses,
    walletP,
    _id: Date.now(),
    simpleExchangeInstallationBoardId:
      dappConstants.SIMPLE_EXCHANGE_INSTALLATION_BOARD_ID,
    simpleExchangeInstanceBoardId:
      dappConstants.SIMPLE_EXCHANGE_INSTANCE_BOARD_ID,
  });
  console.log('offerId:', offerId);
  setLoading(false);
  onClose();
  dispatch(setBoughtCard(true));
  dispatch(
    setMessage('Please accept offer from your wallet to put card on sale!'),
  );
  const result = await E(
    publicFacetSimpleExchange,
  ).updateNotfiersOnWalletOffersAtSeller({
    offerId,
    cardOfferAmount,
    walletP,
  });
  return result;
};

const removeItemFromSale = async ({
  cardDetail,
  publicFacetSimpleExchange,
  cardPurse,
}) => {
  const sellerSeat = await E(publicFacetSimpleExchange).getSellerSeat({
    id: cardDetail[0].id,
  });
  await E(sellerSeat[0].sellerSeat).exit();
  const amount = AmountMath.make(cardPurse.brand, harden(cardDetail));
  await E(publicFacetSimpleExchange).updateAvailableOffers(amount);
};

export { getSellerSeat, makeMatchingInvitation, removeItemFromSale };
