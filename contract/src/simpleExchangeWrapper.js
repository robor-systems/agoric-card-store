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
  const {
    brands,
    issuers,
    cardMinter,
    simpleExchangePublicFacet,
    auctionItemsCreator,
  } = zcf.getTerms();
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
  // const { publicFacet: simpleExchangePublicFacet } = await E(zoe).startInstance(
  //   simpleExchangeInstallation,
  //   {
  //     Asset: issuers.Asset,
  //     Price: issuers.Price,
  //   },
  // );
  console.log(simpleExchangePublicFacet, 'simpleExchangePublicFacet');
  const makeSellerOffer = async ({ cardDetail, sellingPrice }) => {
    console.log('makeSellerOffer is working correctly');
    const cardAmount = AmountMath.make(brands.Asset, harden([cardDetail]));
    console.log(cardAmount, 'cardAmount');
    const priceAmount = AmountMath.make(brands.Price, sellingPrice);
    console.log(priceAmount, 'priceAmount');
    const cardPayment = await E(cardMinter).mintPayment(cardAmount);
    console.log(cardPayment, 'cardPayment');
    console.log(await E(issuers.Price).getAssetKind());
    const sellerSellOrderProposal = harden({
      give: { Asset: cardAmount },
      want: { Price: priceAmount },
      exit: { onDemand: null },
    });

    const sellerPayment = harden({ Asset: cardPayment });
    console.log('beforeInvitation');
    const sellerInvitation = await E(
      simpleExchangePublicFacet,
    ).makeInvitation();
    console.log('afterInvitation');
    const sellerSeat = await E(zoe).offer(
      sellerInvitation,
      sellerSellOrderProposal,
      sellerPayment,
    );
    const cardOffer = {
      ...cardDetail,
      sellingPrice,
    };

    const cardOfferAmount = AmountMath.make(brands.Asset, harden([cardOffer]));
    console.log(cardOfferAmount);
    availableOffers = AmountMath.add(availableOffers, cardOfferAmount);
    console.log(availableOffers);
    availableOfferUpdater.updateState(availableOffers);

    return sellerSeat;
  };
  // const testFunction = async (cardDetail, sellingPrice) => {
  //   const sellerInvitation = await E(
  //     simpleExchangePublicFacet,
  //   ).makeInvitation();
  //   const cardAmount = AmountMath.make(brands.Asset, harden([cardDetail]));
  //   const priceAmount = AmountMath.make(brands.Price, harden([sellingPrice]));
  //   const cardPayment = cardMinter.mintPayment(cardAmount);
  //   const sellerSellOrderProposal = harden({
  //     give: { Asset: cardAmount },
  //     want: { Price: priceAmount },
  //     exit: { onDemand: null },
  //   });

  //   const sellerPayment = { Asset: cardPayment };

  //   const sellerSeat = await E(zoe).offer(
  //     sellerInvitation,
  //     sellerSellOrderProposal,
  //     sellerPayment,
  //   );
  //   const cardOffer = {
  //     ...cardDetail,
  //     sellingPrice,
  //   };

  //   const cardOfferAmount = AmountMath.make(brands.Items, harden([cardOffer]));

  //   availableOffers = AmountMath.add(availableOffers, cardOfferAmount);

  //   availableOfferUpdater.updateState(availableOffers);

  //   return sellerSeat;
  // };
  const makeBuyerOffer = async ({
    cardPurse,
    tokenPurses,
    cardDetail,
    sellingPrice,
    boughtFor,
    walletP,
    cardOffer,
    _id,
  }) => {
    const buyerInvitation = E(simpleExchangePublicFacet).makeInvitation();
    const invitationIssuer = E(zoe).getInvitationIssuer();
    const buyerExclusiveInvitation = E(invitationIssuer).claim(buyerInvitation);
    const offerConfig = {
      id: _id,
      invitation: buyerExclusiveInvitation,
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
    let amount = {};

    // CMT (haseeb.asim@robor.systems): offerAmount to update the available offers notifier.
    const offerAmount = AmountMath.make(brands.Asset, harden([cardOffer]));

    // CMT (haseeb.asim@robor.systems): checking if the cardOffer contains a valid boughtFor variable.
    if (cardOffer.boughtFor) {
      amount = { ...cardDetail, boughtFor };
    } else {
      amount = cardDetail;
    }
    // CMT (haseeb.asim@robor.systems): Creating the amount that is to be removed from userSaleHistory
    const NFTAmountForRemoval = AmountMath.make(brands.Asset, harden([amount]));

    // CMT (haseeb.asim@robor.systems): Creating the amount that is to be added to the userSaleHistory
    const NFTAmountForAddition = AmountMath.make(
      brands.Asset,
      harden([{ ...cardDetail, boughtFor: sellingPrice }]),
    );
    // CMT (haseeb.asim@robor.systems): wallet offer notifier that provides updates about change in offer status.
    const notifier = await E(walletP).getOffersNotifier();
    // CMT (haseeb.asim@robor.systems): Using the iterator function for notifiers updating the userSaleHistory and available offers.
    for await (const walletOffers of iterateNotifier(notifier)) {
      for (const { id, status } of walletOffers) {
        if (id === offerId && (status === 'complete' || status === 'accept')) {
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
        }
      }
    }
    return false;
  };

  const publicFacet = Far('PublicFaucetForSimpleExchange', {
    makeBuyerOffer,
    makeSellerOffer,
    getAvailableOfferNotifier,
    getAvailableOffers,
    updateAvailableOffers,
    // sellerOffer: testFunction,
  });
  return harden({ publicFacet });
};

harden(start);
export { start };
