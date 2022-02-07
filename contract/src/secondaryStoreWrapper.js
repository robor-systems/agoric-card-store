/**
 * @file An abstraction over the secondary store contract.
 * @author Hussain <haseeb.asim@robor.systems>
 */

// @ts-check
import '@agoric/zoe/exported';

import { Far } from '@agoric/marshal';
import { E } from '@agoric/eventual-send';
import { makeNotifierKit } from '@agoric/notifier';
import { AmountMath } from '@agoric/ertp';

/**
 * The secondary store wrapper is an abstraction over the secondary store contract. This abstraction is responsible for
 * providing the seller seat, keeping account of all the offers and their values.
 *
 * The getSellerSeat function creates an instance of the secondary store contract which returns a creator invitation. Using this
 * invitation an offer is created which also requires a proposal and a paymentKeywordRecord. The proposal contains the amounts of
 * the assets that are to be exchanged. The paymentKeyword Record holds the payment of the asset that the seller has to give when the
 * offer resolves. When the offer is created it return a seller seat that resolves into an invitation that the buyer can use to buy the
 * baseball card.
 *
 * The notifiers in the abstraction are responsible for storing the details of every offer that is created by getSellerSeat function.
 * The userOwnedNftsUpdater function sends an update to the front-end every time an offer is created or resolved, so that only those cards
 * can be displayed on sale for which an offer has been created.
 *
 * The seller seat is resolved into an invitation at the front-end. The reason for this is that we need to have access to the wallet bridge which
 * is used to send an offer to the wallet. The offer contains the reference of the buyer invitation and the original proposal. When the user accepts the offer,
 * the wallet creates a payment of the asset that is to be swapped and required by the seller. The wallet creates an offer and send it to the secondary store contract,
 * which swaps the assets and return them to the respective parties. The baseball card automatically goes into the wallet of the buyer and the seller receives
 * the asset they wanted into there payout.
 *
 * @type {ContractStartFn}
 */
const start = (zcf) => {
  /* zcf.getTerms() gives the contract terms that are defined when an instance is created.
   Initially the terms of the contract just contains the brand and issuers involved in the contract, 
  but they can be modified to contain some more information. */

  const { brands, issuers, swapInstallation, cardMinter } = zcf.getTerms();

  // zcf.getZoeService() gets the user-facing Zoe Service API to the contract code.
  const zoe = zcf.getZoeService();

  /* availableOffers is an empty amount initially which is responsible for storing the card amount 
     for which an offer is created. In this way we can keep track of the card that is on sale. */
  let availableOffers = AmountMath.make(brands.Items, harden([]));
  const {
    notifier: availableOfferNotifier,
    updater: availableOfferUpdater,
  } = makeNotifierKit();
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
