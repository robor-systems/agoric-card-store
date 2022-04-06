// import { AmountMath } from '@agoric/ertp';
import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';
import { setBoughtCard, setEscrowedCards, setMessage } from '../store/store';

/*
 * This function should be called when the buyer buys a card from
 * secondary market place
 */
const updateCardSaleHistory = async ({
  cardDetail,
  cardOffer,
  cardPurse,
  publicFacet,
}) => {
  const cardOfferAmount = AmountMath.make(cardPurse.brand, harden([cardOffer]));
  console.log('updated Amount:', cardOfferAmount);
  await E(publicFacet).removeFromUserSaleHistory(
    AmountMath.make(cardPurse.brand, harden([cardDetail])),
  );
  await E(publicFacet).addToUserSaleHistory(
    AmountMath.make(cardPurse.brand, harden([cardOffer])),
  );
};
const makeMatchingInvitation = async ({
  cardPurse,
  tokenPurses,
  cardOffer,
  cardDetail,
  sellingPrice,
  boughtFor,
  walletP,
  publicFacet,
  publicFacetMarketPlace,
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
  console.log(publicFacetMarketPlace);
  tokenPurses = tokenPurses.reverse();
  let invitation;
  try {
    invitation = await E(publicFacetMarketPlace).makeInvitation();
  } catch (e) {
    console.error('Could not make buyer invitation', e);
  }
  console.log('invitation Successful:', invitation);
  const id = Date.now();
  const proposalTemplate = {
    want: {
      Asset: {
        pursePetname: cardPurse.pursePetname,
        value: harden([cardDetail]),
      },
    },
    give: {
      Price: {
        pursePetname: tokenPurses[0].pursePetname,
        value: sellingPrice,
      },
    },
    exit: { onDemand: null },
  };
  const offerConfig = { id, invitation, proposalTemplate };
  try {
    await E(walletP).addOffer(offerConfig);
  } catch (e) {
    console.error('Could not add sell offer to wallet', e);
  }
  console.log('offerId:', id);
  await updateCardSaleHistory({
    cardDetail,
    cardOffer,
    cardPurse,
    publicFacet,
  });
  setLoading(false);
  onClose();
  dispatch(setBoughtCard(true));
  dispatch(
    setMessage(
      'Please approve the offer from your wallet to complete the purchase!',
    ),
  );
};

const removeItemFromSale = async ({
  dispatch,
  escrowedCards,
  cardDetail,
  sellerSeat,
  publicFacetMarketPlace,
}) => {
  try {
    dispatch(setEscrowedCards([...escrowedCards, cardDetail]));
    await E(sellerSeat).exit();
    const isExited = await E(sellerSeat).hasExited();
    console.log('Seat exited:', isExited);
    await E(publicFacetMarketPlace).updateNotifier();
  } catch (e) {
    console.log('error in removeItemFromSale()');
  }
};

/*
 * This function should be called when the user puts a card
 * which he own on sale in the secondary marketplace
 */
const getSellerSeat = async ({
  cardOffer,
  cardDetail,
  sellingPrice,
  publicFacet,
  publicFacetMarketPlace,
  cardPurse,
  tokenPurses,
  walletP,
  setLoading,
  onClose,
  dispatch,
}) => {
  let invitation;
  try {
    invitation = await E(publicFacetMarketPlace).makeInvitation();
  } catch (e) {
    console.error('Could not make seller invitation', e);
  }
  console.log('cardDetail in app:', cardDetail);
  const id = Date.now();
  const proposalTemplate = {
    give: {
      Asset: {
        pursePetname: cardPurse.pursePetname,
        value: harden([cardDetail]),
      },
    },
    want: {
      Price: {
        pursePetname: tokenPurses[0].pursePetname,
        value: sellingPrice,
      },
    },
    exit: { onDemand: null },
  };
  const offerConfig = { id, invitation, proposalTemplate };
  try {
    await E(walletP).addOffer(offerConfig);
  } catch (e) {
    console.error('Could not add sell offer to wallet', e);
  }
  await updateCardSaleHistory({
    cardDetail,
    cardOffer,
    cardPurse,
    publicFacet,
  });
  console.log('offerId:', id);
  setLoading(false);
  onClose();
  dispatch(setBoughtCard(true));
  dispatch(
    setMessage(
      'Please approve the offer from your wallet to put the card on sale!',
    ),
  );
};

export {
  getSellerSeat,
  makeMatchingInvitation,
  removeItemFromSale,
  updateCardSaleHistory,
};
