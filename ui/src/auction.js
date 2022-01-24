import { E } from '@agoric/eventual-send';
import { assert, details as X } from '@agoric/assert';

const getCardAuctionDetail = async ({ publicFacet, card }) => {
  return E(publicFacet).getSessionDetailsForKey(card);
};

const makeBidOfferForCard = async ({
  walletP,
  card,
  publicFacet,
  cardPurse,
  tokenPurse,
  price,
}) => {
  console.log(walletP, card, publicFacet, cardPurse, tokenPurse, price);
  assert(card, X`At least one card must be chosen to purchase`);
  const invitation = await E(publicFacet).makeBidInvitationForKey(card);
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
  return E(walletP).addOffer(offerConfig);
};

const getSellerSession = async ({ publicFacet }) => {
  const seller = await E(publicFacet).getSellerSession();
  const sellerSession = await E(seller).showseller();
  console.log('session:', sellerSession);
};
export { makeBidOfferForCard, getCardAuctionDetail, getSellerSession };
