/**
 * @file Safely swaps the digital assets between two parties.
 * @author Hussain <hussain.rizvi@robor.systems>
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
  // CMT (haseeb.asim@robor.systems): Making an assertion that the issuerKeyWordRecord has the same key as defined in the assertion.
  assertIssuerKeywords(zcf, harden(['Items', 'Money']));
  /** @type {OfferHandler} */
  // CMT (haseeb.asim@robor.systems): makeMatchingInvitation is the an offer handler and it is called when the seller seat
  // is used to get the offer results of the offer created by the seller. It returns an invitation Payment which is resolved into
  // an exclusive invitation for the buyer.
  const makeMatchingInvitation = (SellerSeat) => {
    // CMT (haseeb.asim@robor.systems): Making assertion that the proposal structure is the same as defined in the assertion.
    assertProposalShape(SellerSeat, {
      give: { Items: null },
      want: { Money: null },
      exit: { onDemand: null },
    });
    // CMT (haseeb.asim@robor.systems): Using the seller seat to get the proposal used to created the offer.
    const { want, give } = SellerSeat.getProposal();
    /** @type {OfferHandler} */

    // CMT (haseeb.asim@robor.systems): matchingSeatOfferHandler is the offerHandler for the buyer offer. This handler is called
    // when the buyer makes an offer in response to the seller offer using the exclusive invitation. If the offer is valid
    // this handler swaps the assets between seller and buyer and the instance of the contract is shutdown.
    const matchingSeatOfferHandler = (buyerMatchingSeat) => {
      // CMT (haseeb.asim@robor.systems): swap function swaps the assets amounts between seller and buyer and allocates these
      // these swapper amount to the respective seat. The seats are exited when the swap is completed.
      const swapResult = swap(zcf, SellerSeat, buyerMatchingSeat);
      // CMT (haseeb.asim@robor.systems): zcf.shutdown() shuts down the instance of the contract.
      zcf.shutdown();
      // CMT (haseeb.asim@robor.systems): The swapResult is just a default string.
      return swapResult;
    };

    // CMT (haseeb.asim@robor.systems): matchingSeatInvitation returns the invitation payment when seller seat asks for result of the offer.
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

  // CMT (haseeb.asim@robor.systems): creatorInvitation is the invitation used to create the first offer.
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
