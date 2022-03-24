import { AmountMath } from '@agoric/ertp';
import { E } from '@agoric/eventual-send';
import dappConstants from '../utils/constants';
import { setBoughtCard, setMessage } from '../store/store';

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
  publicFacetMarketPlace,
  cardOffer,
  setLoading,
  onClose,
  dispatch,
}) => {
  console.log('cardPursePetname:', cardPurse.pursePetname);
  console.log('cardbrand:', cardPurse.brand);
  console.log(tokenPurses, 'tokenPurse');
  console.log(cardDetail, 'cardDetail');
  console.log(sellingPrice, 'sellingPrice');
  console.log(boughtFor, 'boughtFor');
  console.log(walletP, 'walletp');
  console.log(publicFacetMarketPlace);
  console.log(cardOffer);
  tokenPurses = tokenPurses.reverse();
  const offerId = await E(publicFacetMarketPlace).makeBuyerOffer({
    cardPurse,
    tokenPurses,
    cardDetail,
    sellingPrice,
    boughtFor,
    walletP,
    cardOffer,
    _id: Date.now(),
    simpleExchangeInstallationBoardId:
      dappConstants.MARKET_PLACE_INSTALLATION_BOARD_ID,
  });
  setLoading(false);
  onClose();
  dispatch(setBoughtCard(true));
  dispatch(
    setMessage('Please accept offer from your wallet to complete purchase!'),
  );
  const result = await E(
    publicFacetMarketPlace,
  ).updateNotfiersOnWalletOffersAtBuyer({
    offerId,
    cardOffer,
    cardDetail,
    boughtFor,
    sellingPrice,
    walletP,
  });
  return result;
};

const removeItemFromSale = async ({
  cardDetail,
  publicFacetMarketPlace,
  cardPurse,
}) => {
  console.log('removeItemFromSale:id', cardDetail);
  const sellerSeat = await E(publicFacetMarketPlace).getSellerSeat({
    id: cardDetail.id,
  });
  await E(sellerSeat[0].sellerSeat).exit();
  const amount = AmountMath.make(cardPurse.brand, harden([cardDetail]));
  await E(publicFacetMarketPlace).updateAvailableOffers(amount);
};

/*
 * This function should be called when the user puts a card
 * which he own on sale in the secondary marketplace
 */
const getSellerSeat = async ({
  cardDetail,
  userOffer,
  sellingPrice,
  publicFacetMarketPlace,
  cardPurse,
  tokenPurses,
  walletP,
  setLoading,
  onClose,
  dispatch,
}) => {
  try {
    const { offerId, cardOfferAmount } = await E(
      publicFacetMarketPlace,
    ).makeSellerOffer({
      cardDetail,
      sellingPrice,
      cardPurse,
      tokenPurses: tokenPurses.reverse(),
      walletP,
      _id: Date.now(),
      simpleExchangeInstallationBoardId:
        dappConstants.MARKET_PLACE_INSTALLATION_BOARD_ID,
      simpleExchangeInstanceBoardId:
        dappConstants.MARKET_PLACE_INSTANCE_BOARD_ID,
    });
    console.log('offerId:', offerId);
    setLoading(false);
    onClose();
    dispatch(setBoughtCard(true));
    dispatch(
      setMessage('Please accept offer from your wallet to put card on sale!'),
    );
    let checkConditon = 'accept';
    const result = await E(
      publicFacetMarketPlace,
    ).updateNotfiersOnWalletOffersAtSeller({
      checkConditon,
      offerId,
      cardOfferAmount,
      walletP,
    });
    console.log('result1:', result);
    if (result) {
      checkConditon = 'exit';
      const removeItem = await E(
        publicFacetMarketPlace,
      ).updateNotfiersOnWalletOffersAtSeller({
        checkConditon,
        offerId,
        cardOfferAmount,
        walletP,
      });
      console.log('removeItem1:', removeItem);
      if (removeItem) {
        console.log('running removeItem');
        await removeItemFromSale({
          cardDetail: userOffer,
          publicFacetMarketPlace,
          cardPurse,
        });
      }
    }
    console.log('afterremoveItem1:');
  } catch (err) {
    console.log('error:', err);
  }
};

export { getSellerSeat, makeMatchingInvitation, removeItemFromSale };
