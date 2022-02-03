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

    const shouldBeInvitationMsg = `The swapAsset instance should return a creatorInvitation`;
    assert(creatorInvitation, shouldBeInvitationMsg);

    const sellerSeat = await E(zoe).offer(creatorInvitation, Proposal, payment);

    const invitationP = await E(sellerSeat).getOfferResult();
    const invitationIssuer = await E(zoe).getInvitationIssuer();
    const BuyerExclusiveInvitation = await E(invitationIssuer).claim(
      invitationP,
    );
    const cardOffer = {
      ...cardDetail,
      sellingPrice,
      BuyerExclusiveInvitation,
      sellerSeat,
    };
    const cardOfferAmount = AmountMath.make(brands.Items, harden([cardOffer]));
    availableOffers = AmountMath.add(availableOffers, cardOfferAmount);
    availableOfferUpdater.updateState(availableOffers);
    return sellerSeat;
  };

  const getAvailableOfferNotifier = () => availableOfferNotifier;
  const getAvailableOffers = () => availableOffers;
  const updateAvailableOffers = (cardAmount) => {
    availableOffers = AmountMath.subtract(availableOffers, cardAmount);
    availableOfferUpdater.updateState(availableOffers);
  };
  const publicFacet = Far('PublicFaucetForSwapInvitation', {
    getSellerSeat,
    getAvailableOfferNotifier,
    getAvailableOffers,
    updateAvailableOffers,
  });

  return harden({ publicFacet });
};

harden(start);
export { start };
