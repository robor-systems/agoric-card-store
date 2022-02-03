import React from 'react';
import './styles/global.css';

import Header from './components/Header.jsx';
import CardDisplay from './components/CardDisplay.jsx';
import ApproveOfferSnackbar from './components/ApproveOfferSnackbar.jsx';
import BoughtCardSnackbar from './components/BoughtCardSnackbar.jsx';
import EnableAppDialog from './components/EnableAppDialog.jsx';

import ModalWrapper from './components/ModalWrapper';
import ModalContent from './components/ModalContent';

import Main from './services/main';
import { useApplicationContext } from './context/Application';

function App(props) {
  console.log(props, 'props');

  const {
    state,
    dispatch,
    walletP,
    publicFacet,
    publicFacetSwap,
    MAIN_CONTRACT_BOARD_INSTANCE_ID,
    CARD_BRAND_BOARD_ID,
  } = useApplicationContext();

  const { activeCard, openExpandModal } = state;

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
    MAIN_CONTRACT_BOARD_INSTANCE_ID,
    CARD_BRAND_BOARD_ID,
  );

  return (
    <div>
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
    </div>
  );
}

export default App;
