import { AmountMath } from '@agoric/ertp';
import { E } from '@agoric/eventual-send';
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
  publicFacetSwap,
  cardOffer,
  setLoading,
  onClose,
}) => {
  const result = await E(publicFacetSwap).makeMatchingInvitation({
    cardPurse,
    tokenPurses,
    cardDetail,
    sellingPrice,
    boughtFor,
    walletP,
    BuyerExclusiveInvitation,
    cardOffer,
    _id: Date.now(),
    setLoading,
    onClose,
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
  publicFacetSwap,
  currentCard,
}) => {
  const sellerSeatInvitation = await E(publicFacetSwap).getSellerSeat({
    cardDetail,
    sellingPrice,
    currentCard,
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
