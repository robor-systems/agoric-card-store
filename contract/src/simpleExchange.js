// @ts-check

import { makeNotifierKit } from '@agoric/notifier';
import { Far } from '@agoric/marshal';

import '@agoric/zoe/exported';
import {
  swap,
  satisfies,
  assertProposalShape,
  assertIssuerKeywords,
} from '@agoric/zoe/src/contractSupport/index.js';

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
  let sellSeats = [];
  let buySeats = [];
  // eslint-disable-next-line no-use-before-define
  const { notifier, updater } = makeNotifierKit(getBookOrders());
  // const { notifier: sellerSeatNotifier, updater: sellerNotifierUpdater } =
  //   makeNotifierKit(getSellerSeatDetails());

  assertIssuerKeywords(zcf, harden(['Asset', 'Price']));

  function dropExit(p) {
    return {
      want: p.want,
      give: p.give,
    };
  }

  function flattenOrders(seats) {
    const activeSeats = seats.filter((s) => !s.hasExited());
    console.log('ActiveSeats:', activeSeats);
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
  // function mapSeatToInvitationDetail(seats) {
  //   const activeSeats = seats.filter((s) => !s.hasExited());
  //   console.log('ActiveSeats:', activeSeats);
  //   return activeSeats.map((seat) => {
  //     return { sellerSeat: seat, proposal: dropExit(seat.getProposal()) };
  //   });
  // }
  // function getSellerSeatDetails() {
  //   return {
  //     sells: mapSeatToInvitationDetail(sellSeats),
  //   };
  // }

  // Tell the notifier that there has been a change to the book orders
  function bookOrdersChanged() {
    updater.updateState(getBookOrders());
  }

  // If there's an existing offer that this offer is a match for, make the trade
  // and return the seat for the matched offer. If not, return undefined, so
  // the caller can know to add the new offer to the book.
  function swapIfCanTrade(offers, seat) {
    for (const offer of offers) {
      console.log(
        offer.getCurrentAllocation(),
        seat.getCurrentAllocation(),
        'currentallocations',
      );
      const satisfiedBy = (xSeat, ySeat) => {
        console.log('working3');
        return satisfies(zcf, xSeat, ySeat.getCurrentAllocation());
      };
      if (satisfiedBy(offer, seat) && satisfiedBy(seat, offer)) {
        console.log('working4');
        swap(zcf, seat, offer);
        console.log('working5');
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

    console.log(offer, 'working7');
    if (offer) {
      // remove the matched offer.
      counterOffers = counterOffers.filter((value) => value !== offer);
    } else {
      // Save the order in the book
      coOffers.push(seat);
    }
    console.log('working8');
    bookOrdersChanged();
    return counterOffers;
  }

  const sell = (seat) => {
    assertProposalShape(seat, {
      give: { Asset: null },
      want: { Price: null },
    });
    console.log('working11');
    buySeats = swapIfCanTradeAndUpdateBook(buySeats, sellSeats, seat);
    console.log(buySeats);
    console.log('working12');
    return 'Order Added';
  };

  const buy = (seat) => {
    assertProposalShape(seat, {
      give: { Price: null },
      want: { Asset: null },
    });
    console.log('working2');
    sellSeats = swapIfCanTradeAndUpdateBook(sellSeats, buySeats, seat);
    console.log(sellSeats);
    console.log('working9');
    return 'Order Added';
  };

  /** @type {OfferHandler} */
  const exchangeOfferHandler = (seat) => {
    // Buy Order
    if (seat.getProposal().want.Asset) {
      console.log('working1');
      return buy(seat);
    }
    // Sell Order
    if (seat.getProposal().give.Asset) {
      console.log('working10');
      return sell(seat);
    }
    // Eject because the offer must be invalid
    throw seat.fail(
      new Error(`The proposal did not match either a buy or sell order.`),
    );
  };

  const makeExchangeInvitation = () =>
    zcf.makeInvitation(exchangeOfferHandler, 'exchange');

  /** @type {SimpleExchangePublicFacet} */
  const publicFacet = Far('SimpleExchangePublicFacet', {
    makeInvitation: makeExchangeInvitation,
    getNotifier: () => notifier,
  });

  // set the initial state of the notifier
  bookOrdersChanged();
  return harden({ publicFacet });
};

harden(start);
export { start };
