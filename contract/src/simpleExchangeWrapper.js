// @ts-check
import '@agoric/zoe/exported';

import { Far } from '@agoric/marshal';
import { E } from '@agoric/eventual-send';
import {
  makeAsyncIterableFromNotifier as iterateNotifier,
  makeNotifierKit,
} from '@agoric/notifier';
import { AmountMath } from '@agoric/ertp';

/**
 *
 * @type {ContractStartFn}
 */
const start = async (zcf) => {
  const { brands, simpleExchangePublicFacet, auctionItemsCreator } =
    zcf.getTerms();
  const zoe = zcf.getZoeService();

  let availableOffers = AmountMath.make(brands.Asset, harden([]));

  const { notifier: availableOfferNotifier, updater: availableOfferUpdater } =
    makeNotifierKit();

  const getAvailableOfferNotifier = () => availableOfferNotifier;

  const getAvailableOffers = () => availableOffers;

  const updateAvailableOffers = (cardAmount) => {
    console.log('availableOffers:', availableOffers);
    console.log('cardAmount:', cardAmount);
    availableOffers = AmountMath.subtract(availableOffers, cardAmount);
    availableOfferUpdater.updateState(availableOffers);
  };
  console.log(simpleExchangePublicFacet, 'simpleExchangePublicFacet');
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
    const sellerInvitation = await E(
      simpleExchangePublicFacet,
    ).makeInvitation();

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
    // CMT (haseeb.asim@robor.systems): Adding the offer to the wallet. We get an offerId associated to the offer we sent to the wallet.
    const offerId = await E(walletP).addOffer(offerConfig);
    console.log(offerId);
    const cardOffer = {
      ...cardDetail,
      sellingPrice,
    };
    const cardOfferAmount = AmountMath.make(brands.Asset, harden([cardOffer]));
    console.log(cardOfferAmount);
    return { offerId, cardOfferAmount };
  };
  const makeBuyerOffer = async ({
    cardPurse,
    tokenPurses,
    cardDetail,
    sellingPrice,
    boughtFor,
    walletP,
    cardOffer,
    _id,
    simpleExchangeInstallationBoardId,
    simpleExchangeInstanceBoardId,
  }) => {
    const buyerInvitation = E(simpleExchangePublicFacet).makeInvitation();
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
    // CMT (haseeb.asim@robor.systems): Adding the offer to the wallet. We get an offerId associated to the offer we sent to the wallet.
    const offerId = await E(walletP).addOffer(offerConfig);
    // CMT (haseeb.asim@robor.systems): An empty amount object.
    return offerId;
  };

  const updateNotfiersOnWalletOffersAtSeller = async ({
    offerId,
    walletP,
    cardOfferAmount,
  }) => {
    // CMT (hussain.rizvi@robor.systems): wallet offer notifier that provides updates about change in offer status.
    const notifier = await E(walletP).getOffersNotifier();
    // CMT (hussain.rizvi@robor.systems): Using the iterator function for notifiers updating the userSaleHistory and available offers.
    for await (const walletOffers of iterateNotifier(notifier)) {
      for (const { id, status } of walletOffers) {
        if (id === offerId) {
          if (status === 'pending') {
            availableOffers = AmountMath.add(availableOffers, cardOfferAmount);
            console.log(availableOffers);
            availableOfferUpdater.updateState(availableOffers);
            return true;
          } else if (status === 'decline') {
            return false;
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
    const notifier = await E(walletP).getOffersNotifier();
    // CMT (hussain.rizvi@robor.systems): Using the iterator function for notifiers updating the userSaleHistory and available offers.
    for await (const walletOffers of iterateNotifier(notifier)) {
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
    const seatNotifier = E(simpleExchangePublicFacet).getNotifier();
    for await (const BookOrders of iterateNotifier(seatNotifier)) {
      console.log('BookOrders:', BookOrders);
      // const sellerSeat = bookOrders.sells;
      // console.log('seller Seats', sellerSeat);
      if (BookOrders.sells.length > 0) {
        console.log('proposal details:', BookOrders.sells[0].proposal.give);
        const filtered = BookOrders.sells.filter(
          (item) => item.proposal.give.Asset.value[0].id === id,
        );
        console.log('filtered:', filtered);
        return filtered;
      }
    }
  };
  const publicFacet = Far('PublicFaucetForSimpleExchange', {
    makeBuyerOffer,
    makeSellerOffer,
    getAvailableOfferNotifier,
    getAvailableOffers,
    updateAvailableOffers,
    updateNotfiersOnWalletOffersAtBuyer,
    updateNotfiersOnWalletOffersAtSeller,
    getSellerSeat,
  });
  return harden({ publicFacet });
};

harden(start);
export { start };
