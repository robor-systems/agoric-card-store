// @ts-check

// Eventually will be importable from '@agoric/zoe-contract-support'
import {
  assertIssuerKeywords,
  swap,
  assertProposalShape,
} from '@agoric/zoe/src/contractSupport/index.js';

/**
 * Trade one item for another.
 *
 * The initial offer is { give: { Asset: A }, want: { Price: B } }.
 * The outcome from the first offer is an invitation for the second party,
 * who should offer { give: { Price: B }, want: { Asset: A } }, with a want
 * amount no greater than the original's give, and a give amount at least as
 * large as the original's want.
 *
 * @type {ContractStartFn}
 */
const start = (zcf) => {
  // assertIssuerKeywords(zcf, harden(['Items', 'Money']));
  /** @type {OfferHandler} */
  const makeMatchingInvitation = (firstSeat) => {
    // assertProposalShape(firstSeat, {
    //   give: { Items: null },
    //   want: { Money: null },
    // });
    const { want, give } = firstSeat.getProposal();
    /** @type {OfferHandler} */
    const matchingSeatOfferHandler = (matchingSeat) => {
      const swapResult = swap(zcf, firstSeat, matchingSeat);
      return swapResult;
    };
    const matchingSeatInvitation = zcf.makeInvitation(
      matchingSeatOfferHandler,
      'matchOffer',
      {
        Items: give.Items,
        Money: want.Money,
      },
    );
    return matchingSeatInvitation;
  };

  const creatorInvitation = zcf.makeInvitation(
    makeMatchingInvitation,
    'firstOffer',
  );

  return { creatorInvitation };
};

harden(start);
export { start };
