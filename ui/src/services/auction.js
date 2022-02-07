import { E } from '@agoric/eventual-send';
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
  console.log(
    walletP,
    card,
    cardOffer,
    publicFacet,
    cardPurse,
    tokenPurse,
    price,
  );
  assert(card, X`At least one card must be chosen to purchase`);
  const invitation = await E(publicFacet).makeBidInvitationForKey(
    card,
    cardOffer,
  );
  const zoe = E(walletP).getZoe();
  const invitationValue = await E(zoe).getInvitationDetails(invitation);
  console.log('Printing Invitation:', invitationValue);

  const offerConfig = {
    // JSONable ID for this offer.  This is scoped to the origin.
    id: Date.now(),
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
  const offerId = await E(walletP).addOffer(offerConfig);
  console.log('offer Id returned from wallet:', offerId);
  onClose();
  setFormState({
    isSubmitting: false,
  });
  // const amount = AmountMath.make(cardPurse.brand, harden([cardOffer]));
  // const notifier = await E(walletP).getOffersNotifier();
  // for await (const walletOffers of iterateNotifier(notifier)) {
  //   console.log('walletOffer:', walletOffers);
  //   for (const { id, status } of walletOffers) {
  //     console.log('offerIds:', id);
  //     if (id === offerId && (status === 'complete' || status === 'accept')) {
  //       console.log('Inside if');
  //       E(publicFacet).addUserOwnedNfts(amount);
  //       return status;
  //     } else if (id === offerId && status === 'decline') {
  //       return status;
  //     }
  //   }
  // }
  return offerId;
};

const getSellerSession = async ({ publicFacet }) => {
  const seller = await E(publicFacet).getSellerSession();
  const sellerSession = await E(seller).showseller();
  console.log('session:', sellerSession);
};
export { makeBidOfferForCard, getCardAuctionDetail, getSellerSession };
