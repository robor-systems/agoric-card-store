import { AmountMath } from '@agoric/ertp';
import { E } from '@agoric/eventual-send';
import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';

/*
 * This function should be called when the buyer buys a card from
 * secondary market place
 */

const makeMatchingInvitation = async ({
  cardPurse,
  tokenPurses,
  cardDetail,
  sellingPrice,
  boughtFor,
  walletP,
  BuyerExclusiveInvitation,
  publicFacet,
  publicFacetSwap,
  cardOffer,
  setLoading,
  onClose,
}) => {
  const zoe = E(walletP).getZoe();
  console.log('myExclusiveInvitation:', BuyerExclusiveInvitation);
  const BuyerInvitationValue = await E(zoe).getInvitationDetails(
    BuyerExclusiveInvitation,
  );
  console.log('Buyers Invitation Value:', BuyerInvitationValue);
  console.log('sellingprice:', sellingPrice);
  const offerConfig = {
    id: Date.now(),
    invitation: BuyerExclusiveInvitation,
    proposalTemplate: {
      want: {
        Items: {
          pursePetname: cardPurse.pursePetname,
          value: harden([cardDetail]),
        },
      },
      give: {
        Money: {
          pursePetname: tokenPurses[1].pursePetname,
          value: sellingPrice,
        },
      },
      exit: { onDemand: null },
    },
  };
  console.log('offerconfig:', offerConfig);
  const offerId = await E(walletP).addOffer(offerConfig);
  console.log('result from wallet:', offerId);
  console.log('cardOffer:', cardOffer);
  console.log('cardDetail:', cardDetail);
  const amount = AmountMath.make(cardPurse.brand, harden([cardOffer]));
  const amount2 = AmountMath.make(
    cardPurse.brand,
    harden([{ ...cardDetail, boughtFor }]),
  );
  const amount3 = AmountMath.make(
    cardPurse.brand,
    harden([{ ...cardDetail, boughtFor: sellingPrice }]),
  );
  console.log('amount:', amount);
  setLoading(false);
  onClose();
  const notifier = await E(walletP).getOffersNotifier();
  for await (const walletOffers of iterateNotifier(notifier)) {
    console.log(' walletOffer:', walletOffers);
    for (const { id, status } of walletOffers) {
      if (id === offerId && (status === 'complete' || status === 'accept')) {
        E(publicFacet).removeUserOwnedNfts(amount2);
        E(publicFacet).addUserOwnedNfts(amount3);
        E(publicFacetSwap).updateAvailableOffers(amount);
        return true;
      }
    }
  }
  return false;
};
/*
 * This function should be called when the user puts a card
 * which he own on sale in the secondary marketplace
 */
const getSellerSeat = async ({ cardDetail, sellingPrice, publicFacet }) => {
  const sellerSeatInvitation = await E(publicFacet).getSellerSeat({
    cardDetail,
    sellingPrice,
  });
  return sellerSeatInvitation;
};

const removeItemFromSale = async ({ cardDetail, cardPurse, publicFacet }) => {
  await E(cardDetail.sellerSeat).tryExit();
  const amount = AmountMath.make(cardPurse.brand, harden([cardDetail]));
  await E(publicFacet).updateAvailableOffers(amount);
};

export { getSellerSeat, makeMatchingInvitation, removeItemFromSale };
