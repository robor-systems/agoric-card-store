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
  const { installation: buyerInstallationId, instance } = await E(
    zoe,
  ).getInvitationDetails(invitationP);
  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const BuyerExclusiveInvitation = await E(invitationIssuer).claim(invitationP);
  console.log('myExclusiveInvitation:', BuyerExclusiveInvitation);
  const BuyerInvitationValue = await E(zoe).getInvitationDetails(
    BuyerExclusiveInvitation,
  );
  console.log('Buyers Invitation Value:', BuyerInvitationValue);
  const offerConfig = {
    id: Date.now(),
    instancePetname: 'testing',
    installation: buyerInstallationId,
    instance,
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
    },
  };
  console.log(offerConfig);
  const result = await E(walletP).addOffer(offerConfig);
  console.log('result from wallet:', result);
  if (result) {
    await E(publicFacet).updateAvailableOffers(
      AmountMath.make(cardPurse.brand, cardDetail),
    );
  }
  // const result2 = await E(sellerSeatInvitation).getOfferResult();
  // console.log('result:', result2);
  // const exited = await E(sellerSeatInvitation).hasExited();
  // console.log('seller seat exited:', exited);
  // return buyerSeat;
};
/*
 * This function should be called when the user puts a card
 * which he own on sale in the secondary marketplace
 */
const getSellerSeat = async ({
  cardDetail,
  sellingPrice,
  // walletP,
  // INSTANCE_BOARD_ID,
  // CARD_MINTER_BOARD_ID,
  // swapInstallation,
  publicFacet,
}) => {
  // const board = E(walletP).getBoard();
  // const mainContractInstance = await E(board).getValue(INSTANCE_BOARD_ID);
  const sellerSeatInvitation = await E(publicFacet).getSellerSeat({
    cardDetail,
    // swapInstallation,
    sellingPrice,
    // mainContractInstance,
    // walletP,
    // CARD_MINTER_BOARD_ID,
  });
  return sellerSeatInvitation;
};

export { getSellerSeat, makeMatchingInvitation };

// Unhandled Rejection (Error): The amount could not be subtracted from the allocation because the allocation did not have an amount under the keyword (a string).
// Unhandled Rejection (Error): The "Money" keyword in proposal.give did not have an associated payment in the paymentKeywordRecord, which had keywords: []
