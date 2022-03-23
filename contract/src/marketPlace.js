// @ts-check

import { Far } from '@agoric/marshal';
import { E } from '@agoric/eventual-send';
import {
  makeAsyncIterableFromNotifier as iterateNotifier,
  makeNotifierKit,
} from '@agoric/notifier';
import '@agoric/zoe/exported';
import {
  swap,
  satisfies,
  assertProposalShape,
  assertIssuerKeywords,
} from '@agoric/zoe/src/contractSupport/index.js';
import { AmountMath } from '@agoric/ertp';

/**
 * SimpleExchange is an exchange with a simple matching algorithm, which allows
 * an unlimited number of parties to create new orders or accept existing
 * orders. The notifier allows callers to find the current list of orders.
 * https://agoric.com/documentation/zoe/guide/contracts/simple-exchange.html
 *
 * The SimpleExchange uses Asset and Price as its keywords. The contract treats
 * the two keywords symmetrically. New offers can be created and existing offers
 * can be accepted in either direction.
 *
 * { give: { 'Asset', simoleans(5n) }, want: { 'Price', quatloos(3) } }
 * { give: { 'Price', quatloos(8) }, want: { 'Asset', simoleans(3n) } }
 *
 * The Asset is treated as an exact amount to be exchanged, while the
 * Price is a limit that may be improved on. This simple exchange does
 * not partially fill orders.
 *
 * The publicFacet is returned from the contract.
 *
 * @type {ContractStartFn}
 */
const start = (zcf) => {
  // set the initial state of the notifier
  const { brands, auctionItemsCreator } = zcf.getTerms();
  const zoe = zcf.getZoeService();

  let availableOffers = AmountMath.make(brands.Asset, harden([]));

  const { notifier: availableOfferNotifier, updater: availableOfferUpdater } =
    makeNotifierKit();

  const getAvailableOfferNotifier = () => availableOfferNotifier;

  const getAvailableOffers = () => availableOffers;

  const updateAvailableOffers = (cardAmount) => {
    availableOffers = AmountMath.subtract(availableOffers, cardAmount);
    availableOfferUpdater.updateState(availableOffers);
  };

  let sellSeats = [];
  let buySeats = [];
  // eslint-disable-next-line no-use-before-define
  const { notifier, updater } = makeNotifierKit(getBookOrders());

  assertIssuerKeywords(zcf, harden(['Asset', 'Price']));

  function dropExit(p) {
    return {
      want: p.want,
      give: p.give,
    };
  }

  function flattenOrders(seats) {
    const activeSeats = seats.filter((s) => !s.hasExited());
    return activeSeats.map((seat) => {
      return { sellerSeat: seat, proposal: dropExit(seat.getProposal()) };
    });
  }

  function getBookOrders() {
    return {
      buys: flattenOrders(buySeats),
      sells: flattenOrders(sellSeats),
    };
  }
  // Tell the notifier that there has been a change to the book orders
  function bookOrdersChanged() {
    updater.updateState(getBookOrders());
  }

  // If there's an existing offer that this offer is a match for, make the trade
  // and return the seat for the matched offer. If not, return undefined, so
  // the caller can know to add the new offer to the book.
  function swapIfCanTrade(offers, seat) {
    for (const offer of offers) {
      const satisfiedBy = (xSeat, ySeat) => {
        return satisfies(zcf, xSeat, ySeat.getCurrentAllocation());
      };
      if (satisfiedBy(offer, seat) && satisfiedBy(seat, offer)) {
        swap(zcf, seat, offer);
        // return handle to remove
        return offer;
      }
    }
    return undefined;
  }

  // try to swap offerHandle with one of the counterOffers. If it works, remove
  // the matching offer and return the remaining counterOffers. If there's no
  // matching offer, add the offerHandle to the coOffers, and return the
  // unmodified counterOfffers
  function swapIfCanTradeAndUpdateBook(counterOffers, coOffers, seat) {
    const offer = swapIfCanTrade(counterOffers, seat);

    if (offer) {
      // remove the matched offer.
      counterOffers = counterOffers.filter((value) => value !== offer);
    } else {
      // Save the order in the book
      coOffers.push(seat);
    }
    bookOrdersChanged();
    return counterOffers;
  }

  const sell = (seat) => {
    assertProposalShape(seat, {
      give: { Asset: null },
      want: { Price: null },
    });
    buySeats = swapIfCanTradeAndUpdateBook(buySeats, sellSeats, seat);
    return 'Order Added';
  };

  const buy = (seat) => {
    assertProposalShape(seat, {
      give: { Price: null },
      want: { Asset: null },
    });
    sellSeats = swapIfCanTradeAndUpdateBook(sellSeats, buySeats, seat);
    return 'Order Added';
  };

  /** @type {OfferHandler} */
  const exchangeOfferHandler = (seat) => {
    // Buy Order
    if (seat.getProposal().want.Asset) {
      return buy(seat);
    }
    // Sell Order
    if (seat.getProposal().give.Asset) {
      return sell(seat);
    }
    // Eject because the offer must be invalid
    throw seat.fail(
      new Error(`The proposal did not match either a buy or sell order.`),
    );
  };

  const makeExchangeInvitation = () =>
    zcf.makeInvitation(exchangeOfferHandler, 'exchange');

  // Simple Exchange Starts here
  const makeSellerOffer = async ({
    cardDetail,
    sellingPrice,
    cardPurse,
    walletP,
    tokenPurses,
    _id,
    simpleExchangeInstallationBoardId,
    simpleExchangeInstanceBoardId,
  }) => {
    const sellerInvitation = makeExchangeInvitation();

    const invitationIssuer = E(zoe).getInvitationIssuer();
    const invitationAmount = await E(invitationIssuer).getAmountOf(
      sellerInvitation,
    );
    const {
      // @ts-ignore
      value: [{ handle }],
    } = invitationAmount;
    const board = E(walletP).getBoard();
    const invitationHandleBoardId = await E(board).getId(handle);
    const newCardDetails = { ...cardDetail };
    delete newCardDetails.boughtFor;
    const offerConfig = {
      id: _id,
      invitation: sellerInvitation,
      invitationHandleBoardId,
      simpleExchangeInstallationBoardId,
      simpleExchangeInstanceBoardId,
      proposalTemplate: {
        give: {
          Asset: {
            pursePetname: cardPurse.pursePetname,
            value: harden([newCardDetails]),
            brand: brands.Asset,
          },
        },
        want: {
          Price: {
            pursePetname: tokenPurses[0].pursePetname,
            value: sellingPrice,
            brand: brands.Price,
          },
        },
        exit: { onDemand: null },
      },
    };
    // CMT (hussain.rizvi@robor.systems): Adding the offer to the wallet. We get an offerId associated to the offer we sent to the wallet.
    const offerId = await E(walletP).addOffer(offerConfig);
    const cardOffer = {
      ...cardDetail,
      sellingPrice,
    };
    const cardOfferAmount = AmountMath.make(brands.Asset, harden([cardOffer]));
    return { offerId, cardOfferAmount };
  };
  const makeBuyerOffer = async ({
    cardPurse,
    tokenPurses,
    cardDetail,
    sellingPrice,
    walletP,
    _id,
    simpleExchangeInstallationBoardId,
    simpleExchangeInstanceBoardId,
  }) => {
    const buyerInvitation = makeExchangeInvitation();
    const invitationIssuer = E(zoe).getInvitationIssuer();
    const invitationAmount = await E(invitationIssuer).getAmountOf(
      buyerInvitation,
    );
    const {
      value: [{ handle }],
    } = invitationAmount;
    const board = E(walletP).getBoard();
    const invitationHandleBoardId = await E(board).getId(handle);

    const offerConfig = {
      id: _id,
      invitation: buyerInvitation,
      invitationHandleBoardId,
      simpleExchangeInstallationBoardId,
      simpleExchangeInstanceBoardId,
      proposalTemplate: {
        want: {
          Asset: {
            pursePetname: cardPurse.pursePetname,
            value: harden([cardDetail]),
            brand: brands.Asset,
          },
        },
        give: {
          Price: {
            pursePetname: tokenPurses[0].pursePetname,
            value: sellingPrice,
            brand: brands.Price,
          },
        },
        exit: { onDemand: null },
      },
    };
    // CMT (hussain.rizvi@robor.systems): Adding the offer to the wallet. We get an offerId associated to the offer we sent to the wallet.
    const offerId = await E(walletP).addOffer(offerConfig);
    // CMT (hussain.rizvi@robor.systems): An empty amount object.
    return offerId;
  };

  const updateNotfiersOnWalletOffersAtSeller = async ({
    checkConditon = 'accept',
    offerId,
    walletP,
    cardOfferAmount,
  }) => {
    // CMT (hussain.rizvi@robor.systems): wallet offer notifier that provides updates about change in offer status.
    const walletNotifier = await E(walletP).getOffersNotifier();
    // CMT (hussain.rizvi@robor.systems): Using the iterator function for notifiers updating the userSaleHistory and available offers.
    for await (const walletOffers of iterateNotifier(walletNotifier)) {
      for (const { id, status } of walletOffers) {
        if (id === offerId) {
          if (status === 'pending' && checkConditon === 'accept') {
            availableOffers = AmountMath.add(availableOffers, cardOfferAmount);
            availableOfferUpdater.updateState(availableOffers);
            return true;
          } else if (status === 'decline' && checkConditon === 'accept') {
            return false;
          } else if (status === 'cancel' && checkConditon === 'exit') {
            availableOffers = AmountMath.subtract(
              availableOffers,
              cardOfferAmount,
            );
            availableOfferUpdater.updateState(availableOffers);
            return true;
          }
        }
      }
    }
    return false;
  };

  const updateNotfiersOnWalletOffersAtBuyer = async ({
    offerId,
    cardOffer,
    cardDetail,
    boughtFor,
    sellingPrice,
    walletP,
  }) => {
    let amount = {};
    // CMT (hussain.rizvi@robor.systems): offerAmount to update the available offers notifier.
    const offerAmount = AmountMath.make(brands.Asset, harden([cardOffer]));
    // CMT (hussain.rizvi@robor.systems): checking if the cardOffer contains a valid boughtFor variable.
    if (cardOffer.boughtFor) {
      amount = { ...cardDetail, boughtFor };
    } else {
      amount = cardDetail;
    }
    // CMT (hussain.rizvi@robor.systems): Creating the amount that is to be removed from userSaleHistory
    const NFTAmountForRemoval = AmountMath.make(brands.Asset, harden([amount]));
    // CMT (hussain.rizvi@robor.systems): Creating the amount that is to be added to the userSaleHistory
    const NFTAmountForAddition = AmountMath.make(
      brands.Asset,
      harden([{ ...cardDetail, boughtFor: sellingPrice }]),
    );
    // CMT (hussain.rizvi@robor.systems): wallet offer notifier that provides updates about change in offer status.
    const walletnotifier = await E(walletP).getOffersNotifier();
    // CMT (hussain.rizvi@robor.systems): Using the iterator function for notifiers updating the userSaleHistory and available offers.
    for await (const walletOffers of iterateNotifier(walletnotifier)) {
      for (const { id, status } of walletOffers) {
        if (id === offerId) {
          if (status === 'complete' || status === 'accept') {
            // eslint-disable-next-line no-await-in-loop
            await E(auctionItemsCreator).removeFromUserSaleHistory(
              NFTAmountForRemoval,
            );
            // eslint-disable-next-line no-await-in-loop
            await E(auctionItemsCreator).addToUserSaleHistory(
              NFTAmountForAddition,
            );
            updateAvailableOffers(offerAmount);
            return true;
          } else if (status === 'reject') {
            return false;
          }
        }
      }
    }
    return false;
  };

  const getSellerSeat = async ({ id }) => {
    const seatNotifier = notifier;
    for await (const BookOrders of iterateNotifier(seatNotifier)) {
      if (BookOrders.sells.length > 0) {
        const filtered = BookOrders.sells.filter(
          (item) => item.proposal.give.Asset.value[0].id === id,
        );
        return filtered;
      }
    }
    return true;
  };

  /** @type {SimpleExchangePublicFacet} */
  const publicFacet = Far('SimpleExchangePublicFacet', {
    makeInvitation: makeExchangeInvitation,
    makeBuyerOffer,
    makeSellerOffer,
    getAvailableOfferNotifier,
    getAvailableOffers,
    updateAvailableOffers,
    updateNotfiersOnWalletOffersAtBuyer,
    updateNotfiersOnWalletOffersAtSeller,
    getSellerSeat,
    getNotifier: () => notifier,
  });
  bookOrdersChanged();
  return harden({ publicFacet });
};

harden(start);
export { start };
