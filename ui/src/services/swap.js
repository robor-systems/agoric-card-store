import { AmountMath } from '@agoric/ertp';
import { E } from '@agoric/eventual-send';
import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';

/*
 * This function should be called when the buyer buys a card from
 * secondary market place
 */

const makeMatchingInvitation = async ({
  cardPurse,
  tokenPurses,
  cardDetail,
  sellingPrice,
  walletP,
  BuyerExclusiveInvitation,
  publicFacet,
  cardOffer,
}) => {
  // console.log('sellerSeatInvitation', sellerSeatInvitation);
  const zoe = E(walletP).getZoe();
  // const invitationP = await E(sellerSeatInvitation).getOfferResult();
  // // const { installation: buyerInstallationId, instance } = await E(
  // //   zoe,
  // // ).getInvitationDetails(invitationP);
  // const invitationIssuer = await E(zoe).getInvitationIssuer();
  // const BuyerExclusiveInvitation = await E(invitationIssuer).claim(invitationP);
  console.log('myExclusiveInvitation:', BuyerExclusiveInvitation);
  const BuyerInvitationValue = await E(zoe).getInvitationDetails(
    BuyerExclusiveInvitation,
  );
  console.log('Buyers Invitation Value:', BuyerInvitationValue);
  console.log('sellingprice:', sellingPrice);
  const offerConfig = {
    id: Date.now(),
    invitation: BuyerExclusiveInvitation,
    proposalTemplate: {
      want: {
        Items: {
          pursePetname: cardPurse.pursePetname,
          value: harden([cardDetail]),
        },
      },
      give: {
        Money: {
          pursePetname: tokenPurses[1].pursePetname,
          value: sellingPrice,
        },
      },
      exit: { onDemand: null },
    },
  };
  console.log('offerconfig:', offerConfig);
  const offerId = await E(walletP).addOffer(offerConfig);
  console.log('result from wallet:', offerId);
  const amount = AmountMath.make(cardPurse.brand, harden([cardOffer]));
  console.log('amount:', amount);
  const notifier = await E(walletP).getOffersNotifier();
  for await (const walletOffers of iterateNotifier(notifier)) {
    // if (walletOffers.id === offerId) {
    console.log(' walletOffer:', walletOffers);
    for (const { id, status } of walletOffers) {
      if (id === offerId && status === 'complete') {
        E(publicFacet).updateAvailableOffers(amount);
        return true;
      }
    }
  }
  return false;
};
/*
 * This function should be called when the user puts a card
 * which he own on sale in the secondary marketplace
 */
const getSellerSeat = async ({ cardDetail, sellingPrice, publicFacet }) => {
  const sellerSeatInvitation = await E(publicFacet).getSellerSeat({
    cardDetail,
    sellingPrice,
  });
  return sellerSeatInvitation;
};

export { getSellerSeat, makeMatchingInvitation };
