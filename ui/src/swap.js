import { E } from '@agoric/eventual-send';

const getSellerSeat = async ({
  cardDetail,
  swapInstallation,
  sellingPrice,
  walletP,
  INSTANCE_BOARD_ID,
  CARD_MINTER_BOARD_ID,
  publicFacet,
}) => {
  const zoe = E(walletP).getZoe();
  const board = E(walletP).getBoard();
  const mainContractInstance = await E(board).getValue(INSTANCE_BOARD_ID);
  const matchingSeatInvitation = await E(publicFacet).getSellerSeat({
    cardDetail,
    swapInstallation,
    sellingPrice,
    mainContractInstance,
    walletP,
    CARD_MINTER_BOARD_ID,
  });
  const invitationP = await E(matchingSeatInvitation).getOfferResult();
  // const invitationIssuer = await E(zoe).getInvitationIssuer();
  const { installation: bobInstallationId, instance } = E(
    zoe,
  ).getInvitationDetails(invitationP);
  console.log(bobInstallationId, instance);
  // const myExclusiveInvitation = await invitationIssuer.claim(invitationP);
  // console.log(bobInstallationId, instance, myExclusiveInvitation);
  // return matchingSeatInvitation;
};

export { getSellerSeat };
