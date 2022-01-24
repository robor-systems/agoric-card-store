import React, { useState, useEffect, useRef } from 'react';
import { makeCapTP, E } from '@agoric/captp';
import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';
import { Far } from '@agoric/marshal';

import './styles/global.css';

import {
  activateWebSocket,
  deactivateWebSocket,
  getActiveSocket,
} from './utils/fetch-websocket.js';

import Header from './components/Header.jsx';
import CardDisplay from './components/CardDisplay.jsx';
import ApproveOfferSnackbar from './components/ApproveOfferSnackbar.jsx';
import BoughtCardSnackbar from './components/BoughtCardSnackbar.jsx';
import EnableAppDialog from './components/EnableAppDialog.jsx';

import { getCardAuctionDetail, makeBidOfferForCard } from './auction.js';
import dappConstants from './lib/constants.js';
import ModalWrapper from './components/ModalWrapper';
import ModalContent from './components/ModalContent';
import { images } from './images';

const {
  INSTANCE_BOARD_ID,
  INSTALLATION_BOARD_ID,
  issuerBoardIds: { Card: CARD_ISSUER_BOARD_ID },
  brandBoardIds: { Money: MONEY_BRAND_BOARD_ID, Card: CARD_BRAND_BOARD_ID },
} = dappConstants;

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [dappApproved, setDappApproved] = useState(true);
  const [availableCards, setAvailableCards] = useState([]);
  const [cardPurse, setCardPurse] = useState(null);
  const [tokenPurses, setTokenPurses] = useState([]);
  const [openEnableAppDialog, setOpenEnableAppDialog] = useState(false);
  const [needToApproveOffer, setNeedToApproveOffer] = useState(false);
  const [boughtCard, setBoughtCard] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [activeCardBid, setActiveCardBid] = useState(null);
  const [tokenDisplayInfo, setTokenDisplayInfo] = useState(null);
  const [tokenPetname, setTokenPetname] = useState(null);
  const [openExpandModal, setOpenExpandModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [type, setType] = useState('Sell Product');
  const handleTabChange = (index) => setActiveTab(index);
  const handleDialogClose = () => setOpenEnableAppDialog(false);

  const walletPRef = useRef(undefined);
  const publicFacetRef = useRef(undefined);

  useEffect(() => {
    // Receive callbacks from the wallet connection.
    const otherSide = Far('otherSide', {
      needDappApproval(_dappOrigin, _suggestedDappPetname) {
        setDappApproved(false);
        setOpenEnableAppDialog(true);
      },
      dappApproved(_dappOrigin) {
        setDappApproved(true);
      },
    });

    let walletAbort;
    let walletDispatch;

    const onConnect = async () => {
      setWalletConnected(true);
      const socket = getActiveSocket();
      const {
        abort: ctpAbort,
        dispatch: ctpDispatch,
        getBootstrap,
      } = makeCapTP(
        'Card Store',
        (obj) => socket.send(JSON.stringify(obj)),
        otherSide,
      );
      walletAbort = ctpAbort;
      walletDispatch = ctpDispatch;
      const walletP = getBootstrap();
      walletPRef.current = walletP;

      const processPurses = (purses) => {
        const newTokenPurses = purses.filter(
          ({ brandBoardId }) => brandBoardId === MONEY_BRAND_BOARD_ID,
        );
        const newCardPurse = purses.find(
          ({ brandBoardId }) => brandBoardId === CARD_BRAND_BOARD_ID,
        );

        setTokenPurses(newTokenPurses);
        setTokenDisplayInfo(newTokenPurses[0].displayInfo);
        setTokenPetname(newTokenPurses[0].brandPetname);
        setCardPurse(newCardPurse);
        console.log('printing card purse:', newCardPurse);
        console.log('printing all cards:', availableCards);
      };
      async function watchPurses() {
        const pn = E(walletP).getPursesNotifier();
        for await (const purses of iterateNotifier(pn)) {
          processPurses(purses);
        }
      }
      watchPurses().catch((err) => console.error('got watchPurses err', err));

      await Promise.all([
        E(walletP).suggestInstallation('Installation', INSTALLATION_BOARD_ID),
        E(walletP).suggestInstance('Instance', INSTANCE_BOARD_ID),
        E(walletP).suggestIssuer('Card', CARD_ISSUER_BOARD_ID),
      ]);

      const zoe = E(walletP).getZoe();
      const board = E(walletP).getBoard();
      const instance = await E(board).getValue(INSTANCE_BOARD_ID);
      const publicFacet = E(zoe).getPublicFacet(instance);
      publicFacetRef.current = publicFacet;
      /*
       *get the current items for sale in the proposal
       *Currenly these will me primary marketplace cards
       */
      const availableItemsNotifier = E(
        publicFacetRef.current,
      ).getAvailableItemsNotifier();

      /* Using the public faucet we get all the current Nfts offered for sale */
      for await (const cardsAvailableAmount of iterateNotifier(
        availableItemsNotifier,
      )) {
        console.log('available Cards:', cardsAvailableAmount);
        setAvailableCards(cardsAvailableAmount.value);
      }
    };

    const onDisconnect = () => {
      setWalletConnected(false);
      walletAbort && walletAbort();
    };

    const onMessage = (data) => {
      const obj = JSON.parse(data);
      walletDispatch && walletDispatch(obj);
    };

    activateWebSocket({
      onConnect,
      onDisconnect,
      onMessage,
    });
    return deactivateWebSocket;
  }, []);

  const handleCardClick = (name, bool) => {
    setActiveCard(name);
    setOpenExpandModal(bool);
  };

  const handleCardModalClose = () => {
    setActiveCard(null);
  };
  const handleCardBidOpen = () => {
    console.log(activeCardBid);
    setActiveCardBid(true);
  };

  const handleGetCardDetail = (name) => {
    // XXX for now, everytime user call this, we will create a new invitation
    return getCardAuctionDetail({
      walletP: walletPRef.current,
      publicFacet: publicFacetRef.current,
      card: name,
    });
  };

  const submitCardOffer = (name, price, selectedPurse) => {
    return makeBidOfferForCard({
      walletP: walletPRef.current,
      publicFacet: publicFacetRef.current,
      card: name,
      cardPurse,
      tokenPurse: selectedPurse || tokenPurses[0],
      price: BigInt(price),
    }).then((result) => {
      // getSellerSession({ publicFacet: publicFacetRef.current });
      console.log('Your offer id for this current offer:', result);
      setNeedToApproveOffer(true);
    });
  };

  const handleOnClose = () => {
    setNeedToApproveOffer(false);
    setBoughtCard(false);
  };
  console.log(availableCards, 'available cards');
  return (
    <div className="App relative">
      <Header
        walletConnected={walletConnected}
        dappApproved={dappApproved}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        setType={setType}
      />
      <CardDisplay
        activeTab={activeTab}
        playerNames={availableCards}
        cardPurse={cardPurse}
        handleClick={handleCardClick}
        type={type}
      />
      <ModalWrapper
        open={activeCard && !openExpandModal}
        onClose={handleCardModalClose}
        style="modal"
      >
        <ModalContent
          playerName={activeCard}
          type={type}
          onOpen={handleCardBidOpen}
          onClose={handleCardModalClose}
          onGetCardDetail={handleGetCardDetail}
          onBidCard={submitCardOffer}
          tokenPurses={tokenPurses}
          tokenPetname={tokenPetname}
          tokenDisplayInfo={tokenDisplayInfo}
        />
      </ModalWrapper>
      <ModalWrapper
        open={openExpandModal && activeCard}
        onClose={handleCardModalClose}
        style="modal-img"
      >
        <div className="pb-12 w-full h-full object-cover flex justify-center items-center">
          <img src={images[activeCard]} alt="Card Media" />
        </div>
      </ModalWrapper>
      <EnableAppDialog
        open={openEnableAppDialog}
        handleClose={handleDialogClose}
      />
      <ApproveOfferSnackbar open={needToApproveOffer} onClose={handleOnClose} />
      <BoughtCardSnackbar open={boughtCard} onClose={handleOnClose} />
    </div>
  );
}

export default App;
