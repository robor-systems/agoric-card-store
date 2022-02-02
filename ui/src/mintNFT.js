import { E } from '@agoric/captp';
import { AmountMath } from '@agoric/ertp';

export const mintNFT = async ({
  cardDetails,
  MAIN_CONTRACT_BOARD_INSTANCE_ID,
  walletP,
  publicFacetAuction,
  CARD_BRAND_BOARD_ID,
  cardPurse,
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
  const AmountForAddition = AmountMath.make(
    cardPurse.brand,
    harden([cardDetails]),
  );
  await E(publicFacetAuction).addUserOwnedNfts(AmountForAddition);
};
