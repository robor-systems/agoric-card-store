import { E } from '@agoric/captp';

export const mintNFT = async ({
  cardDetails,
  MAIN_CONTRACT_BOARD_INSTANCE_ID,
  walletP,
  CARD_BRAND_BOARD_ID,
  // cardPurse,
}) => {
  const zoe = await E(walletP).getZoe();
  const board = await E(walletP).getBoard();
  const instance = await E(board).getValue(MAIN_CONTRACT_BOARD_INSTANCE_ID);
  const depositFacetId = await E(walletP).getDepositFacetId(
    CARD_BRAND_BOARD_ID,
  );
  const depositFacet = await E(board).getValue(depositFacetId);
  const publicFacet = await E(zoe).getPublicFacet(instance);
  const mintedCardPayment = await E(publicFacet).mintUserCard(cardDetails);
  console.log(mintedCardPayment);
  await E(depositFacet).receive(mintedCardPayment);
};
