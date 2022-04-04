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
  publicFacetMarketPlace,
  MAIN_CONTRACT_BOARD_INSTANCE_ID,
  CARD_BRAND_BOARD_ID,
) => {
  const { cardPurse, tokenPurses, activeCard, userOffers, escrowedCards } =
    state;
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
    }).then(() => {
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
    const Obj = { ...cardDetail };
    const { BuyerExclusiveInvitation, sellingPrice, boughtFor, sellerSeat } =
      Obj;
    delete Obj.sellerSeat;
    delete Obj.sellingPrice;
    // delete Obj.boughtFor;
    delete Obj.BuyerExclusiveInvitation;
    const result = await makeMatchingInvitation({
      cardPurse,
      tokenPurses,
      cardDetail: harden(Obj),
      cardOffer: {
        ...cardDetail,
        boughtFor,
      },
      sellingPrice,
      boughtFor,
      walletP,
      sellerSeat,
      BuyerExclusiveInvitation,
      publicFacet,
      publicFacetMarketPlace,
      setLoading,
      onClose,
      dispatch,
    });
    return result;
  };

  const makeInvitationAndSellerSeat = async ({
    price,
    setLoading,
    onClose,
  }) => {
    const userOffer = userOffers.filter((offer) => offer.id === activeCard.id);
    const params = {
      escrowedCards,
      sellingPrice: BigInt(price),
      walletP,
      cardPurse,
      tokenPurses,
      publicFacet,
      publicFacetMarketPlace,
      cardDetail: activeCard,
      cardOffer: {
        ...activeCard,
        sellingPrice: BigInt(price),
      },
      userOffer,
      setLoading,
      onClose,
      dispatch,
    };
    const sellerSeatInvitation = await getSellerSeat(params);
    return sellerSeatInvitation;
  };

  const removeCardFromSale = async () => {
    const userOffer = userOffers.filter((offer) => {
      return offer.proposal.give.Asset.value[0].id === activeCard.id;
    })[0];
    await removeItemFromSale({
      dispatch,
      escrowedCards,
      cardDetail: userOffer.proposal.give.Asset.value[0],
      sellerSeat: userOffer.sellerSeat,
      cardPurse,
      publicFacetMarketPlace,
    });
  };

  const handleNFTMint = ({ cardDetails }) => {
    mintNFT({
      cardDetails,
      MAIN_CONTRACT_BOARD_INSTANCE_ID,
      walletP,
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
