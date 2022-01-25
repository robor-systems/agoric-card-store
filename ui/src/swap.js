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
  const invitationP = matchingSeatInvitation.getOfferResult();

  const { installation: bobInstallationId, instance } = E(
    zoe,
  ).getInvitationDetails(invitationP);
  const myExclusiveInvitation = await invitationIssuer.claim(invitationP);

  return matchingSeatInvitation;
};




export { getSellerSeat };
