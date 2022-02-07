import {
  getSellerSeat,
  makeMatchingInvitation,
  removeItemFromSale,
} from './swap';
import { mintNFT } from './mintNFT';
import { getCardAuctionDetail, makeBidOfferForCard } from './auction.js';
import {
  setActiveCard,
  setActiveCardBid,
  setNeedToApproveOffer,
  setOpenExpandModal,
} from '../store/store';

const Main = (
  state,
  dispatch,
  walletP,
  publicFacet,
  publicFacetSwap,
  MAIN_CONTRACT_BOARD_INSTANCE_ID,
  CARD_BRAND_BOARD_ID,
) => {
  const { cardPurse, tokenPurses, activeCard } = state;
  console.log('main running');
  const submitCardOffer = (
    name,
    price,
    selectedPurse,
    setFormState,
    onClose,
  ) => {
    return makeBidOfferForCard({
      walletP,
      publicFacet,
      card: name,
      cardOffer: { ...name, boughtFor: price },
      cardPurse,
      tokenPurse: selectedPurse || tokenPurses[0],
      price: BigInt(price),
      onClose,
      setFormState,
    }).then((result) => {
      console.log('Your offer id for this current offer:', result);
      dispatch(setNeedToApproveOffer(true));
    });
  };

  const handleGetCardDetail = (name) => {
    // XXX for now, everytime user call this, we will create a new invitation
    return getCardAuctionDetail({
      walletP,
      publicFacet,
      card: name,
    });
  };

  const handleCardModalClose = () => {
    dispatch(setActiveCard(null));
  };

  const handleCardBidOpen = () => {
    dispatch(setActiveCardBid(true));
  };

  const handleCardClick = (cardDetail, bool) => {
    dispatch(setActiveCard(cardDetail));
    dispatch(setOpenExpandModal(bool));
  };

  const makeMatchingSeatInvitation = async ({
    cardDetail,
    setLoading,
    onClose,
  }) => {
    console.log('cardDetail:', cardDetail);
    const Obj = { ...cardDetail };
    const { BuyerExclusiveInvitation, sellingPrice, boughtFor } = Obj;
    delete Obj.sellerSeat;
    delete Obj.sellingPrice;
    delete Obj.boughtFor;
    delete Obj.BuyerExclusiveInvitation;
    const result = await makeMatchingInvitation({
      cardPurse,
      tokenPurses,
      cardDetail: harden(Obj),
      cardOffer: cardDetail,
      sellingPrice,
      boughtFor,
      walletP,
      BuyerExclusiveInvitation,
      publicFacetSwap,
      publicFacet,
      setLoading,
      onClose,
    });
    return result;
  };

  const makeInvitationAndSellerSeat = async ({ price }) => {
    const params = {
      publicFacetSwap,
      sellingPrice: BigInt(price),
      walletP,
      cardDetail: activeCard,
    };
    const sellerSeatInvitation = await getSellerSeat(params);
    return sellerSeatInvitation;
  };

  const removeCardFromSale = async () => {
    await removeItemFromSale({
      cardDetail: activeCard,
      cardPurse,
      publicFacetSwap,
    });
  };

  const handleNFTMint = ({ cardDetails }) => {
    mintNFT({
      cardDetails,
      MAIN_CONTRACT_BOARD_INSTANCE_ID,
      walletP,
      publicFacet,
      CARD_BRAND_BOARD_ID,
      cardPurse,
      dispatch,
    });
  };
  return {
    handleNFTMint,
    handleGetCardDetail,
    handleCardModalClose,
    handleCardClick,
    handleCardBidOpen,
    removeCardFromSale,
    makeInvitationAndSellerSeat,
    makeMatchingSeatInvitation,
    submitCardOffer,
  };
};

export default Main;
