/**
 * @file Safely swaps the digital assets between two parties.
 * @author Robor <info@robor.tech>
 */

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
 * The secondary store wrapper exists to provide an abstraction over the secondary store contract.
 * This abstraction is used to interact with the secondary store contract and create matching seats for both
 * the seller and buyer. It also helps in accounting how many instances are created of the contract and it also
 * accounts for the details of each offer belonging to a particular instance.
 *
 * For each sale a new instance of the secondary store contract is created because a single instance creates a
 * single offer that returns single seller seat and a single buyer seat and we cannot accommodate multiple offers
 * in a single instance. There for, after the offer resolves, the instance shuts down and for another sale a new instance
 * must be created.
 *
 * @param zcf
 */

const start = (zcf) => {
  assertIssuerKeywords(zcf, harden(['Items', 'Money']));
  /** @type {OfferHandler} */
  const makeMatchingInvitation = (SellerSeat) => {
    assertProposalShape(SellerSeat, {
      give: { Items: null },
      want: { Money: null },
      exit: { onDemand: null },
    });
    const { want, give } = SellerSeat.getProposal();
    /** @type {OfferHandler} */
    const matchingSeatOfferHandler = (buyerMatchingSeat) => {
      const swapResult = swap(zcf, SellerSeat, buyerMatchingSeat);
      zcf.shutdown();
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
  return {
    creatorInvitation,
  };
};

harden(start);
export { start };
