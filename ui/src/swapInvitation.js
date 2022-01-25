import { E } from '@agoric/eventual-send';
import { AmountMath } from '@agoric/ertp';

const makeSwapInvitation = async ({
  swapInstallation,
  issuerKeywordRecord,
  sellingPrice,
  cardName,
  walletP,
  cardBrand,
  moneyBrand,
  cardMinter,
}) => {
  console.log('MINTER :', cardMinter);
  const cardAmount = AmountMath.make(cardBrand, harden([cardName]));
  const saleAmount = AmountMath.make(moneyBrand, sellingPrice);
  console.log(cardAmount, saleAmount);
  const Proposal = harden({
    give: { Items: cardAmount },
    want: { Money: saleAmount },
  });
  console.log(Proposal);
  const zoe = E(walletP).getZoe();
  const { creatorInvitation } = await E(zoe).startInstance(
    swapInstallation,
    issuerKeywordRecord,
  );
  console.log('creatorInvitation:', creatorInvitation);
  const userCardPayment = E(cardMinter).mintPayment(cardAmount);
  console.log('userCardPayment:', userCardPayment);
  const payment = harden({ Items: userCardPayment });

  const sellerSeat = await E(zoe).offer(creatorInvitation, Proposal, payment);
  // console.log('Seller Seat:', sellerSeat);
  // const invitationP = sellerSeat.getOfferResult();
  return sellerSeat;
};

export { makeSwapInvitation };
