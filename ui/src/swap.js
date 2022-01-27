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
  walletP,
  sellerSeatInvitation,
  publicFacet,
}) => {
  console.log('sellerSeatInvitation', sellerSeatInvitation);
  const zoe = E(walletP).getZoe();
  const invitationP = await E(sellerSeatInvitation).getOfferResult();
  // const { installation: buyerInstallationId, instance } = await E(
  //   zoe,
  // ).getInvitationDetails(invitationP);
  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const BuyerExclusiveInvitation = await E(invitationIssuer).claim(invitationP);
  console.log('myExclusiveInvitation:', BuyerExclusiveInvitation);
  const BuyerInvitationValue = await E(zoe).getInvitationDetails(
    BuyerExclusiveInvitation,
  );
  console.log('Buyers Invitation Value:', BuyerInvitationValue);
  const offerConfig = {
    id: Date.now(),
    invitation: BuyerExclusiveInvitation,
    proposalTemplate: {
      want: {
        Items: {
          pursePetname: cardPurse.pursePetname,
          value: [cardDetail],
        },
      },
      give: {
        Money: {
          pursePetname: tokenPurses[1].pursePetname,
          value: BigInt(sellingPrice),
        },
      },
      exit: { onDemand: null },
    },
  };
  console.log(offerConfig);
  const result = await E(walletP).addOffer(offerConfig);
  console.log('result from wallet:', result);
  if (result) {
    await E(publicFacet).updateAvailableOffers(
      harden(AmountMath.make(cardPurse.brand, [cardDetail])),
    );
  }
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
