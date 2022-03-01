import { AmountMath } from '@agoric/ertp';
import { E } from '@agoric/eventual-send';
import dappConstants from '../utils/constants';
// import { publicFacetSimpleExchange } from '../context/Application';
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
  // BuyerExclusiveInvitation,
  publicFacetSimpleExchange,
  cardOffer,
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
  const result = await E(publicFacetSimpleExchange).makeBuyerOffer({
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
}) => {
  console.log(publicFacetSimpleExchange, 'publicFacetSwapinSwap:');
  const sellerSeatInvitation = await E(
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
  return sellerSeatInvitation;
};

const removeItemFromSale = async ({
  cardDetail,
  cardPurse,
  publicFacetSwap,
}) => {
  await E(cardDetail.sellerSeat).tryExit();
  const amount = AmountMath.make(cardPurse.brand, harden([cardDetail]));
  await E(publicFacetSwap).updateAvailableOffers(amount);
};

export { getSellerSeat, makeMatchingInvitation, removeItemFromSale };
