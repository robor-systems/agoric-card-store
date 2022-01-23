// @ts-check
import '@agoric/zoe/exported';
import { AmountMath, AssetKind, makeIssuerKit } from '@agoric/ertp';
import { Far } from '@agoric/marshal';
import { E } from '@agoric/eventual-send';

/**
 * This contract mints non-fungible tokens (baseball cards) and creates a contract
 * instance to auction the cards in exchange for some sort of money.
 *
 * @type {ContractStartFn}
 */
const start = (zcf) => {
  const zoeService = zcf.getZoeService();
  const { issuer, mint, brand } = makeIssuerKit(
    'baseball cards',
    AssetKind.SET,
  );

  const getBuyerInvitation = async (
    cardName,
    moneyIssuer,
    atomicSwapInstallation,
  ) => {
    const CardForSaleAmount = AmountMath.make(brand, cardName);
    const CardForSalePayment = mint.mintPayment(CardForSaleAmount);
    const issuerKeywordRecord = harden({
      Asset: issuer,
      Price: moneyIssuer,
    });

    const { creatorInvitation } = await E(zoeService).startInstance(
      atomicSwapInstallation,
      issuerKeywordRecord,
    );

    const proposal = harden({
      give: { Asset: CardForSaleAmount },
      want: { Price: AmountMath.make(moneyIssuer.getBrand(), 15n) },
      exit: { onDemand: null },
    });

    const paymentKeywordRecord = harden({ Asset: CardForSalePayment });

    // const auctionItemsTerms = harden({
    //   bidDuration: 300n,
    //   winnerPriceOption: FIRST_PRICE,
    //   ...zcf.getTerms(),
    //   auctionInstallation,
    //   minimalBid: minBidPerCard,
    //   timeAuthority,
    // });

    // const shouldBeInvitationMsg = `The auctionItemsContract instance should return a creatorInvitation`;
    // assert(creatorInvitation, shouldBeInvitationMsg);

    const seat = await E(zoeService).offer(
      // @ts-ignore
      creatorInvitation,
      proposal,
      paymentKeywordRecord,
    );

    const invitationP = seat.getOfferResult();

    return harden({
      // auctionItemsCreatorFacet: creatorFacet,
      // auctionItemsInstance: instance,
      // auctionItemsPublicFacet: publicFacet,
      seat,
      invitationP,
    });
  };

  const randomVal = () => {
    return harden({
      random: Math.random(),
    });
  };

  const publicFacet = Far('Atomic Swap Contract creator', {
    getBuyerInvitation,
    randomVal,
    // getIssuer: () => cardIssuer,
  });

  return harden({ publicFacet });
};

harden(start);
export { start };
