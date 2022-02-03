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
  // CMT (haseeb@robor.systems) : zcf.getTerms is used to acquire the terms of the contract,
  // these terms initially contain brands and issuers related to the contract but more information
  // can be provided when an instance of the contract is being created.
  const { brands, issuers, swapInstallation, cardMinter } = zcf.getTerms();

  // CMT (haseeb@robor.systems) : zcf.getZoeService provides user-facing Zoe Service API to the contract code.
  const zoe = zcf.getZoeService();

  // AvailableOffers is an amount that stores all the important information about the offers that are created
  // using this contract. It helps in determining which card is on sale.
  let availableOffers = AmountMath.make(brands.Items, harden([]));

  // CMT (haseeb@robor.systems): Available Offer Notifier is used to send updates regarding available offers to the front-end.
  const {
    notifier: availableOfferNotifier,
    updater: availableOfferUpdater,
  } = makeNotifierKit();

  // CMT (haseeb@robor.systems): getSellerSeat function is used to create an offer for a specific asset (baseball card).
  // The function returns a seller seat which resolves into an exclusive buyer invitation that can be used to buy the asset on sale.
  const getSellerSeat = async ({ cardDetail, sellingPrice }) => {
    // CMT (haseeb@robor.systems): cardAmount is the amount of the asset that a user wants to sell.
    const cardAmount = AmountMath.make(brands.Items, harden([cardDetail]));

    // CMT (haseeb@robor.systems): saleAmount is the amount of the price at which the seller want to sell the asset.
    const saleAmount = AmountMath.make(brands.Money, sellingPrice);

    // Proposal for the offer which defines that which asset is on sale and which asset is required in return.
    const Proposal = harden({
      give: { Items: cardAmount },
      want: { Money: saleAmount },
    });

    // CMT (haseeb@robor.systems): minted payment for the asset (baseball card) on sale.
    const userCardPayment = E(cardMinter).mintPayment(cardAmount);

    // CMT (haseeb@robor.systems): payment object contains the payment of the asset on sale.
    const payment = harden({ Items: userCardPayment });

    // CMT (haseeb@robor.systems): startInstance starts the instance of the contract secondary-store and returns a creator-invitation.
    // This invitation is used to create the offer.
    const { creatorInvitation } = await E(zoe).startInstance(
      swapInstallation,
      issuers,
    );

    // CMT (haseeb@robor.systems): The default invitation message.
    const shouldBeInvitationMsg = `The swapAsset instance should return a creatorInvitation`;

    // CMT (haseeb@robor.systems): Making an assertion that the left entity is the same as right entity.
    assert(creatorInvitation, shouldBeInvitationMsg);

    // CMT (haseeb@robor.systems): offer function creates an offer and return a seller seat which can be used to get the offer results.
    const sellerSeat = await E(zoe).offer(creatorInvitation, Proposal, payment);

    // CMT (haseeb@robor.systems): getOfferResult return the result of the offer created by the seller.
    // This result is an invitation payment that can be claimed by the buyer to get an exclusive invitation.
    const invitationP = await E(sellerSeat).getOfferResult();

    // CMT (haseeb@robor.systems): Each invitation belongs to a global invitation issuer that can be used to valid the invitation payment.
    const invitationIssuer = await E(zoe).getInvitationIssuer();

    // CMT (haseeb@robor.systems): The claim function validates the invitation payment (invitationP) and returns an error in case it's
    // not a live invitation payment or an invalid invitation payment. It returns an exclusive invitation in case the payment is valid.
    const BuyerExclusiveInvitation = await E(invitationIssuer).claim(
      invitationP,
    );

    // CMT (haseeb@robor.systems): cardOffer object contains information regarding the offer that will be used at the front-end.
    const cardOffer = {
      ...cardDetail,
      sellingPrice,
      BuyerExclusiveInvitation,
      sellerSeat,
    };

    // CMT (haseeb@robor.systems): Creating an amount of the cardOffer with the same brand as availableOffers so that it can be added to the
    // availableOffers amount.
    const cardOfferAmount = AmountMath.make(brands.Items, harden([cardOffer]));

    // CMT (haseeb@robor.systems): Adding the cardOfferAmount into the availableOffers.
    availableOffers = AmountMath.add(availableOffers, cardOfferAmount);

    // CMT (haseeb@robor.systems): After the cardOfferAmount has been added to the availableOffers amount, an update is sent
    // using the notifiers to notify the front-end that a new offer has been created. This is important so that the new offer can
    // be listed in the secondary-marketplace section of the front-end.
    availableOfferUpdater.updateState(availableOffers);

    return sellerSeat;
  };

  // CMT (haseeb@robor.systems): A function to easily access the availableOfferNotifier at the front-end.
  const getAvailableOfferNotifier = () => availableOfferNotifier;

  // CMT (haseeb@robor.systems): A function to easily access the availableOffers amount at the front-end.
  const getAvailableOffers = () => availableOffers;

  // CMT (haseeb@robor.systems): A function to subtract the provided amount from the availableOffers.
  const updateAvailableOffers = (cardAmount) => {
    availableOffers = AmountMath.subtract(availableOffers, cardAmount);
    availableOfferUpdater.updateState(availableOffers);
  };

  // CMT (haseeb@robor.systems): publicFacet to access all the public function of the contract.
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
