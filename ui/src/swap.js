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
  const sellerSeat = await E(publicFacet).getSellerSeat({
    cardDetail,
    swapInstallation,
    sellingPrice,
    mainContractInstance,
    walletP,
    CARD_MINTER_BOARD_ID,
  });
  return sellerSeat;
};

export { getSellerSeat };
