import { E } from '@endo/eventual-send';
// import { AmountMath } from '@agoric/ertp';
import { assert, details as X } from '@agoric/assert';
// import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';

const getCardAuctionDetail = async ({ publicFacet, card }) => {
  return E(publicFacet).getSessionDetailsForKey(card);
};

const makeBidOfferForCard = async ({
  walletP,
  card,
  cardOffer,
  publicFacet,
  cardPurse,
  tokenPurse,
  price,
  onClose,
  setFormState,
}) => {
  assert(card, X`At least one card must be chosen to purchase`);
  const invitation = await E(publicFacet).makeBidInvitationForKey(
    card,
    cardOffer,
  );
  console.log('invitation Successful:', invitation);
  const offerConfig = {
    // JSONable ID for this offer.  This is scoped to the origin.
    id: 'dsdsdssd',
    invitation,
    proposalTemplate: {
      want: {
        Asset: {
          pursePetname: cardPurse.pursePetname,
          value: harden([card]),
        },
      },
      give: {
        Bid: {
          pursePetname: tokenPurse.pursePetname,
          value: price,
        },
      },
    },
  };
  console.log('offer is:', offerConfig);
  const offerId = await E(walletP).addOffer(offerConfig);
  onClose();
  setFormState({
    isSubmitting: false,
  });
  return offerId;
};

const getSellerSession = async ({ publicFacet }) => {
  const seller = await E(publicFacet).getSellerSession();
  const sellerSession = await E(seller).showseller();
  console.log('session:', sellerSession);
};
export { makeBidOfferForCard, getCardAuctionDetail, getSellerSession };
