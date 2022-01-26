// @ts-check
import { E } from '@agoric/eventual-send';
// Eventually will be importable from '@agoric/zoe-contract-support'
import { Far } from '@agoric/marshal';
import {
  assertIssuerKeywords,
  swap,
  assertProposalShape,
} from '@agoric/zoe/src/contractSupport/index.js';
import { AmountMath } from '@agoric/ertp';

/**
 * Trade one item for another.
 *
 * The initial offer is { give: { Asset: A }, want: { Price: B } }.
 * The outcome from the first offer is an invitation for the second party,
 * who should offer { give: { Price: B }, want: { Asset: A } }, with a want
 * amount no greater than the original's give, and a give amount at least as
 * large as the original's want.
 */
const start = (zcf) => {
  assertIssuerKeywords(zcf, harden(['Items', 'Money']));

  /** @type {OfferHandler} */
  const makeMatchingInvitation = (SellerSeat) => {
    assertProposalShape(SellerSeat, {
      give: { Items: null },
      want: { Money: null },
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

  const getSellerSeat = async ({
    cardDetail,
    swapInstallation,
    sellingPrice,
    mainContractInstance,
    walletP,
    CARD_MINTER_BOARD_ID,
  }) => {
    const zoe = zcf.getZoeService();
    const board = E(walletP).getBoard();
    const brandKeywordRecord = await E(zoe).getBrands(mainContractInstance);
    const issuerKeywordRecord = await E(zoe).getIssuers(mainContractInstance);
    const cardMinter = await E(board).getValue(CARD_MINTER_BOARD_ID);
    const cardAmount = AmountMath.make(
      brandKeywordRecord.Items,
      harden([cardDetail]),
    );
    const saleAmount = AmountMath.make(brandKeywordRecord.Money, sellingPrice);
    const Proposal = harden({
      give: { Items: cardAmount },
      want: { Money: saleAmount },
    });
    const userCardPayment = E(cardMinter).mintPayment(cardAmount);
    const payment = harden({ Items: userCardPayment });
    const { creatorInvitation } = await E(zoe).startInstance(
      swapInstallation,
      issuerKeywordRecord,
    );
    const sellerSeat = await E(zoe).offer(creatorInvitation, Proposal, payment);
    return sellerSeat;
  };

  const publicFacet = Far('PublicFaucetForInvitation', {
    getSellerSeat,
  });
  return { publicFacet, creatorInvitation };
};

harden(start);
export { start };
