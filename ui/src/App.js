import React, { useEffect } from 'react';
import './styles/global.css';

import { useParams } from 'react-router-dom';
import Header from './components/Header.jsx';
import CardDisplay from './components/CardDisplay.jsx';
import ApproveOfferSnackbar from './components/ApproveOfferSnackbar.jsx';
import BoughtCardSnackbar from './components/BoughtCardSnackbar.jsx';
import EnableAppDialog from './components/EnableAppDialog.jsx';

import ModalWrapper from './components/ModalWrapper';
import ModalContent from './components/ModalContent';

import Main from './services/main';
import { useApplicationContext } from './context/Application';
import NFTCreationSnackbar from './components/NFTCreationSnackbar';
import { setActiveTab, setType } from './store/store';
import Loader from './components/common/Loader';
import CheckIcon from './assets/icons/checkIcon.svg';

function App() {
  const { activeTab } = useParams();

  const {
    state,
    dispatch,
    walletP,
    publicFacet,
    publicFacetSwap,
    publicFacetSimpleExchange,
    MAIN_CONTRACT_BOARD_INSTANCE_ID,
    CARD_BRAND_BOARD_ID,
  } = useApplicationContext();

  const { activeCard, openExpandModal, addFormLoader, checkIcon } = state;
  useEffect(() => {
    console.log('Inside Use effect:', activeTab);
    switch (activeTab) {
      case 'mycards': {
        dispatch(setActiveTab(0));
        dispatch(setType('Sell Product'));
        break;
      }

      case 'marketplace': {
        dispatch(setActiveTab(1));
        dispatch(setType('Buy Product'));
        break;
      }

      case 'primarysales': {
        dispatch(setActiveTab(2));
        dispatch(setType('Bid Product'));
        break;
      }

      case 'create': {
        dispatch(setActiveTab(3));
        dispatch(setType('Mint Nft'));
        break;
      }

      default:
        dispatch(setActiveTab(0));
        break;
    }
  }, []);
  const {
    handleCardBidOpen,
    submitCardOffer,
    makeMatchingSeatInvitation,
    makeInvitationAndSellerSeat,
    handleNFTMint,
    removeCardFromSale,
    handleCardClick,
    handleCardModalClose,
    handleGetCardDetail,
  } = Main(
    state,
    dispatch,
    walletP,
    publicFacet,
    publicFacetSwap,
    publicFacetSimpleExchange,
    MAIN_CONTRACT_BOARD_INSTANCE_ID,
    CARD_BRAND_BOARD_ID,
  );

  return (
    <div className="relative w-full h-full">
      {addFormLoader && (
        <div className="fixed z-50 bg-gray-300 bg-opacity-50 flex justify-center items-center w-full h-full">
          {checkIcon ? (
            <img src={CheckIcon} width="52px" height="52px" alt="checkIcon" />
          ) : (
            <Loader size={12} />
          )}
        </div>
      )}
      <Header />
      <CardDisplay
        handleClick={handleCardClick}
        handleNFTMint={handleNFTMint}
      />
      <ModalWrapper
        open={activeCard && !openExpandModal}
        onClose={handleCardModalClose}
      >
        <ModalContent
          handleClick={handleCardClick}
          makeSwapInvitation={makeInvitationAndSellerSeat}
          makeMatchingSeatInvitation={makeMatchingSeatInvitation}
          removeCardFromSale={removeCardFromSale}
          onOpen={handleCardBidOpen}
          onClose={handleCardModalClose}
          onGetCardDetail={handleGetCardDetail}
          onBidCard={submitCardOffer}
        />
      </ModalWrapper>
      <ModalWrapper
        open={openExpandModal && activeCard}
        onClose={handleCardModalClose}
        style="modal-img w-full mx-6"
      >
        <div className="pb-12 object-contain flex justify-center items-center">
          <img
            style={{ maxWidth: '30%' }}
            src={`https://gateway.pinata.cloud/ipfs/${activeCard?.image}`}
            alt="Card Media"
          />
        </div>
      </ModalWrapper>

      <EnableAppDialog />
      <ApproveOfferSnackbar />
      <BoughtCardSnackbar />
      <NFTCreationSnackbar />
    </div>
  );
}

export default App;
