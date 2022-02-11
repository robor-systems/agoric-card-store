// @ts-check

import { assert, details as X } from '@agoric/assert';
import { Far } from '@agoric/marshal';
import { E } from '@agoric/eventual-send';
import { AmountMath } from '@agoric/ertp';
import { makeNotifierKit } from '@agoric/notifier';
import {
  assertIssuerKeywords,
  defaultAcceptanceMsg,
  assertNatAssetKind,
  offerTo,
} from '@agoric/zoe/src/contractSupport/index.js';
import '@agoric/zoe/exported.js';

/**
 * Auction a list of NFT items which identified by `string`, with timeAuthority, minBidPerItem,
 * needs {Money, Items}
 * Allow you to `withdraw` anytime.
 *
 * @typedef {{
 *  instance: Instance,
 *  makeBidInvitation: Function,
 *  getSessionDetails: Function,
 *  completedP: Promise,
 *  sellerSeatP: Promise<UserSeat>
 * }} AuctionSession
 *
 * @type {ContractStartFn}
 */
const start = (zcf) => {
  const {
    minimalBid,
    issuers,
    brands,
    timeAuthority,
    winnerPriceOption,
    bidDuration = 300n, // 5 mins in chain timer 1s resolution
    auctionInstallation,
  } = zcf.getTerms();
  assertIssuerKeywords(zcf, harden(['Items', 'Money']));

  const moneyBrand = brands.Money;
  const itemBrand = brands.Items;

  assertNatAssetKind(zcf, moneyBrand);

  // CMT (haseeb.asim@robor.systems): The amount that contains all the information of the sales that has been made through primary-marketplace
  let userSaleHistory = AmountMath.make(brands.Items, harden([]));

  // CMT (haseeb.asim@robor.systems):The notifiers that are used to notify the front-end about the existing sale history or update the front-end in case a new sale has been completed.
  const {
    notifier: userSaleHistoryNotifier,
    updater: userSaleHistoryUpdater,
  } = makeNotifierKit();

  /** @type Record<string, AuctionSession> */
  const sellerSessions = {};
  let availableItems = AmountMath.make(itemBrand, harden([]));
  const zoeService = zcf.getZoeService();

  const { zcfSeat: sellerSeat } = zcf.makeEmptySeatKit();

  const {
    notifier: availableItemsNotifier,
    updater: availableItemsUpdater,
  } = makeNotifierKit();

  const sell = (seat) => {
    sellerSeat.incrementBy(seat.decrementBy(seat.getCurrentAllocation()));
    zcf.reallocate(sellerSeat, seat);
    seat.exit();
    // update current amount
    const addedAmount = sellerSeat.getAmountAllocated('Items', itemBrand);
    // XXX the sell method can be call multiple times,
    // so available items should be added to, not updated
    availableItems = AmountMath.add(availableItems, addedAmount);
    availableItemsUpdater.updateState(availableItems);
    return defaultAcceptanceMsg;
  };
  // The seller can selectively withdraw any items and/or any amount of money by specifying amounts in their
  // `want`. If no `want` is specified, then all of the `sellerSeat`'s allocation is withdrawn.
  const withdraw = (seat) => {
    const { want } = seat.getProposal();
    const amount =
      want && (want.Items || want.Money)
        ? want
        : sellerSeat.getCurrentAllocation();
    seat.incrementBy(sellerSeat.decrementBy(harden(amount)));
    zcf.reallocate(sellerSeat, seat);
    seat.exit();
    return 'Withdraw success';
  };

  const getAvailableItems = () => {
    // XXX we can not get the allocated amount, because it may ignore the auctioning items
    assert(sellerSeat && !sellerSeat.hasExited(), X`no items are for sale`);
    return availableItems;
  };

  const getAvailableItemsNotifier = () => availableItemsNotifier;

  const startAuctioningItem = async (itemKey, cardOffer) => {
    const itemAmount = AmountMath.make(itemBrand, harden([itemKey]));
    const availableAmount = sellerSeat.getAmountAllocated('Items', itemBrand);

    assert(
      AmountMath.isGTE(availableAmount, itemAmount),
      X`Item ${itemKey} is no longer available`,
    );

    const issuerKeywordRecord = harden({
      Asset: issuers.Items,
      Ask: issuers.Money,
    });

    const terms = harden({
      winnerPriceOption,
      timeAuthority,
      bidDuration,
    });

    const { creatorInvitation, instance } = await E(zoeService).startInstance(
      auctionInstallation,
      issuerKeywordRecord,
      terms,
    );

    const shouldBeInvitationMsg = `The auctionContract instance should return a creatorInvitation`;
    assert(creatorInvitation, shouldBeInvitationMsg);

    const proposal = harden({
      give: { Asset: itemAmount },
      want: { Ask: minimalBid },
      exit: { waived: null },
    });

    const { userSeatPromise: sellerSeatP, deposited } = await offerTo(
      zcf,
      creatorInvitation,
      harden({
        Items: 'Asset',
        Money: 'Ask',
      }),
      proposal,
      sellerSeat,
      sellerSeat,
    );

    const completedP = deposited.then(async () => {
      // get after match allocation
      const sellerAllocation = await E(sellerSeatP).getCurrentAllocation();

      // check Asset amount after the auction session
      const isAssetItemSold = AmountMath.isEmpty(sellerAllocation.Asset);
      if (isAssetItemSold) {
        // item was sold, update available items by substracting sold amount
        // XXX we can not get the allocated amount, because it is prone to
        // race-condition when multiple auctions are completed consecutively
        const amount = AmountMath.make(itemBrand, harden([cardOffer]));
        addToUserSaleHistory(amount);
        availableItems = AmountMath.subtract(availableItems, itemAmount);
        availableItemsUpdater.updateState(availableItems);
      }
      // unset the session, this handles the case auction session was failed
      // then item should be available for a new session
      delete sellerSessions[itemKey];
    });

    const auctionObj = await E(sellerSeatP).getOfferResult();

    return {
      sellerSeatP,
      instance,
      completedP,
      makeBidInvitation: () => E(auctionObj).makeBidInvitation(),
      getSessionDetails: () => E(auctionObj).getSessionDetails(),
    };
  };

  const getOrCreateAuctionSession = async (itemKey, cardOffer) => {
    // assert.typeof(itemKey, 'string');

    if (!sellerSessions[itemKey]) {
      sellerSessions[itemKey] = await startAuctioningItem(itemKey, cardOffer);
    }

    return sellerSessions[itemKey];
  };

  const makeBidInvitationForKey = async (itemKey, cardOffer) => {
    const session = await getOrCreateAuctionSession(itemKey, cardOffer);
    return session.makeBidInvitation();
  };

  const getSellerSession = async () => {
    return Far('seller', {
      showseller: () => sellerSessions,
    });
  };

  const getSessionDetailsForKey = async (itemKey) => {
    assert.typeof(itemKey, 'string');
    const session = sellerSessions[itemKey];
    if (!session) {
      // session is not started, try to return general data,
      // The trade-off here is we have to fake the session data,
      // and it there may be mismatch between our version and the inner one
      const itemAmount = AmountMath.make(itemBrand, harden([itemKey]));

      return harden({
        auctionedAssets: itemAmount,
        minimumBid: minimalBid,
        winnerPriceOption,
        closesAfter: null,
        bidDuration,
        timeAuthority,
        bids: [],
      });
    }
    return session.getSessionDetails();
  };

  const getCompletedPromiseForKey = (itemKey) => {
    const session = sellerSessions[itemKey];
    return session && session.completedP;
  };

  const makeWithdrawInvitation = async () => {
    return zcf.makeInvitation(withdraw, 'withdraw');
  };

  const getUserSaleHistoryNotifier = () => userSaleHistoryNotifier;
  const getUserSaleHistory = () => userSaleHistory;
  const addToUserSaleHistory = (cardAmount) => {
    try {
      const validatedAmount = AmountMath.coerce(brands.Items, cardAmount);
      userSaleHistory = AmountMath.add(userSaleHistory, validatedAmount);
      userSaleHistoryUpdater.updateState(userSaleHistory);
    } catch (error) {
      console.log(error);
    }
  };
  const removeFromUserSaleHistory = (cardAmount) => {
    try {
      const validatedAmount = AmountMath.coerce(brands.Items, cardAmount);
      userSaleHistory = AmountMath.subtract(userSaleHistory, validatedAmount);
      userSaleHistoryUpdater.updateState(userSaleHistory);
    } catch (error) {
      console.log(error);
    }
  };

  const publicFacet = Far('AuctionItemsPublicFacet', {
    getAvailableItems,
    getAvailableItemsNotifier,
    getItemsIssuer: () => issuers.Items,
    makeBidInvitationForKey,
    getSellerSession,
    getCompletedPromiseForKey,
    getSessionDetailsForKey,
    getUserSaleHistoryNotifier,
    getUserSaleHistory,
  });

  const creatorFacet = Far('AuctionItemsCreatorFacet', {
    makeBidInvitationForKey,
    getAvailableItems: publicFacet.getAvailableItems,
    getItemsIssuer: publicFacet.getItemsIssuer,
    makeWithdrawInvitation,
    getCompletedPromiseForKey,
    getSessionDetailsForKey,
    addToUserSaleHistory,
    removeFromUserSaleHistory,
  });

  const creatorInvitation = zcf.makeInvitation(sell, 'seller');

  return harden({ creatorFacet, creatorInvitation, publicFacet });
};

harden(start);
export { start };
