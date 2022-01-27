// @ts-check
import '@agoric/zoe/exported';

import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';
import { Far } from '@agoric/marshal';
import { E } from '@agoric/eventual-send';
import { FIRST_PRICE } from '@agoric/zoe/src/contracts/auction';
/**
 * This contract mints non-fungible tokens (baseball cards) and creates a contract
 * instance to auction the cards in exchange for some sort of money.
 *
 * @type {ContractStartFn}
 */
const start = (zcf) => {
  // Create the internal baseball card mint
  const { issuer, mint, brand } = makeIssuerKit(
    'baseball cards',
    AssetKind.SET,
  );

  const zoeService = zcf.getZoeService();

  const mintUserCard = async (cardDetails) => {
    const newUserCardAmount = AmountMath.make(brand, cardDetails);
    const newUserCardPayment = mint.mintPayment(newUserCardAmount);

    return harden(newUserCardPayment);
  };

  const auctionCards = async (
    newCardNames,
    moneyIssuer,
    auctionInstallation,
    auctionItemsInstallation,
    minBidPerCard,
    timeAuthority,
  ) => {
    const newCardsForSaleAmount = AmountMath.make(brand, newCardNames);
    const allCardsForSalePayment = mint.mintPayment(newCardsForSaleAmount);
    // Note that the proposal `want` is empty because we don't know
    // how many cards will be sold, so we don't know how much money we
    // will make in total.
    // https://github.com/Agoric/agoric-sdk/issues/855
    const proposal = harden({
      give: { Items: newCardsForSaleAmount },
      exit: { onDemand: null },
    });
    const paymentKeywordRecord = harden({ Items: allCardsForSalePayment });

    const issuerKeywordRecord = harden({
      Items: issuer,
      Money: moneyIssuer,
    });

    const auctionItemsTerms = harden({
      bidDuration: 1n,
      winnerPriceOption: FIRST_PRICE,
      ...zcf.getTerms(),
      auctionInstallation,
      minimalBid: minBidPerCard,
      timeAuthority,
    });

    const { creatorInvitation, creatorFacet, instance, publicFacet } = await E(
      zoeService,
    ).startInstance(
      auctionItemsInstallation,
      issuerKeywordRecord,
      auctionItemsTerms,
    );

    const shouldBeInvitationMsg = `The auctionItemsContract instance should return a creatorInvitation`;
    assert(creatorInvitation, shouldBeInvitationMsg);

    await E(zoeService).offer(
      creatorInvitation,
      proposal,
      paymentKeywordRecord,
    );
    return harden({
      auctionItemsCreatorFacet: creatorFacet,
      auctionItemsInstance: instance,
      auctionItemsPublicFacet: publicFacet,
    });
  };

  const publicFacet = Far('PublicFacet for card store', {
    mintUserCard,
  });

  const creatorFacet = Far('Card store creator', {
    auctionCards,
    getMinter: () => mint,
    getIssuer: () => issuer,
  });

  return harden({ creatorFacet, publicFacet });
};

harden(start);
export { start };
