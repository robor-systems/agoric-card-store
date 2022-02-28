import { AmountMath } from '@agoric/ertp';
import { E } from '@agoric/eventual-send';
import { publicFacetSimpleExchange } from '../context/Application';
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
  BuyerExclusiveInvitation,
  // publicFacetSwap,
  cardOffer,
}) => {
  console.log('cardPursePetname:', cardPurse.pursePetname);
  console.log('cardbrand:', cardPurse.brand);
  const result = await E(publicFacetSimpleExchange).makeBuyerOffer({
    cardPurse,
    tokenPurses,
    cardDetail,
    sellingPrice,
    boughtFor,
    walletP,
    BuyerExclusiveInvitation,
    cardOffer,
    _id: Date.now(),
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
  // publicFacetSwap,
}) => {
  console.log(publicFacetSimpleExchange, 'publicFacetSwapinSwap:');
  const sellerSeatInvitation = await E(
    publicFacetSimpleExchange,
  ).makeSellerOffer({
    cardDetail,
    sellingPrice,
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
