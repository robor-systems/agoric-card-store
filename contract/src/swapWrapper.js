// @ts-check
import '@agoric/zoe/exported';

import { Far } from '@agoric/marshal';
import { E } from '@agoric/eventual-send';
import { makeNotifierKit } from '@agoric/notifier';
import { AmountMath } from '@agoric/ertp';

/**
 *
 *
 * @type {ContractStartFn}
 */
const start = (zcf) => {
  const { brands, issuers, swapInstallation, cardMinter } = zcf.getTerms();
  const zoe = zcf.getZoeService();
  let availableOffers = AmountMath.make(brands.Items, harden([]));
  const {
    notifier: availableOfferNotifier,
    updater: availableOfferUpdater,
  } = makeNotifierKit();
  availableOfferUpdater.updateState('its working i think plz confirm');
  const getSellerSeat = async ({ cardDetail, sellingPrice }) => {
    // const board = E(walletP).getBoard();
    // const brandKeywordRecord = await E(zoe).getBrands(mainContractInstance);
    // const issuerKeywordRecord = await E(zoe).getIssuers(mainContractInstance);
    // const cardMinter = await E(board).getValue(CARD_MINTER_BOARD_ID);
    const cardAmount = AmountMath.make(brands.Items, harden([cardDetail]));
    const saleAmount = AmountMath.make(brands.Money, sellingPrice);
    const Proposal = harden({
      give: { Items: cardAmount },
      want: { Money: saleAmount },
    });
    const userCardPayment = E(cardMinter).mintPayment(cardAmount);
    const payment = harden({ Items: userCardPayment });
    const { creatorInvitation } = await E(zoe).startInstance(
      swapInstallation,
      issuers,
    );
    availableOffers = AmountMath.add(availableOffers, cardAmount);
    availableOfferUpdater.updateState(availableOffers);
    const sellerSeat = await E(zoe).offer(creatorInvitation, Proposal, payment);
    return sellerSeat;
  };

  const getAvailableOfferNotifier = () => availableOfferNotifier;
  const getAvailableOffers = () => availableOffers;

  const publicFacet = Far('PublicFaucetForSwapInvitation', {
    getSellerSeat,
    getAvailableOfferNotifier,
    getAvailableOffers,
  });

  return harden({ publicFacet });
};

harden(start);
export { start };
