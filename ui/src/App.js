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

import {
  getCardAuctionDetail,
  makeBidOfferForCard,
} from './services/auction.js';
import dappConstants from './lib/constants.js';
import ModalWrapper from './components/ModalWrapper';
import ModalContent from './components/ModalContent';
import {
  getSellerSeat,
  makeMatchingInvitation,
  removeItemFromSale,
} from './services/swap';
import { mintNFT } from './mintNFT';

const {
  INSTANCE_BOARD_ID,
  INSTALLATION_BOARD_ID,
  SWAP_WRAPPER_INSTANCE_BOARD_ID,
  MAIN_CONTRACT_BOARD_INSTANCE_ID,
  issuerBoardIds: { Card: CARD_ISSUER_BOARD_ID },
  brandBoardIds: { Money: MONEY_BRAND_BOARD_ID, Card: CARD_BRAND_BOARD_ID },
} = dappConstants;

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [dappApproved, setDappApproved] = useState(true);
  const [availableCards, setAvailableCards] = useState([]);
  const [cardPurse, setCardPurse] = useState([]);
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
  const [addNFTForm, setAddNFTForm] = useState(false);
  const [type, setType] = useState('Sell Product');
  const [userOffers, setUserOffers] = useState([]);
  const [userNfts, setUserNfts] = useState([]);
  const handleTabChange = (index) => setActiveTab(index);
  const handleDialogClose = () => setOpenEnableAppDialog(false);
  const handleAddNFTForm = () => setAddNFTForm(!addNFTForm);

  const walletPRef = useRef(undefined);
  const publicFacetRef = useRef(undefined);
  const publicFacetSwapRef = useRef(undefined);

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
      const swapWrapperInstance = await E(board).getValue(
        SWAP_WRAPPER_INSTANCE_BOARD_ID,
      );
      const publicFacetSwap = await E(zoe).getPublicFacet(swapWrapperInstance);
      publicFacetSwapRef.current = publicFacetSwap;

      async function watchOffers() {
        console.log('watch offer');
        const availableOfferNotifier = await E(
          publicFacetSwapRef.current,
        ).getAvailableOfferNotifier();

        for await (const availableOffers of iterateNotifier(
          availableOfferNotifier,
        )) {
          console.log('available offers from swap:', availableOffers);
          setUserOffers(availableOffers.value || []);
        }

        const userOwnedNftsNotifier = await E(
          publicFacetRef.current,
        ).getUserOwnedNftNotifier();

        console.log('userOwnedNftsNotifier:', userOwnedNftsNotifier);
        for await (const userOwnedNfts of iterateNotifier(
          userOwnedNftsNotifier,
        )) {
          console.log('userNfts:', userOwnedNfts);
          setUserNfts(userOwnedNfts.value);
        }
      }
      watchOffers().catch((err) => console.log('got watchOffer errs', err));

      async function watchSale() {
        console.log('watch offer');
        const userOwnedNftsNotifier = await E(
          publicFacetRef.current,
        ).getUserOwnedNftNotifier();

        console.log('userOwnedNftsNotifier:', userOwnedNftsNotifier);
        for await (const userOwnedNfts of iterateNotifier(
          userOwnedNftsNotifier,
        )) {
          console.log('userNfts:', userOwnedNfts);
          setUserNfts(userOwnedNfts.value);
        }
      }
      watchSale().catch((err) => console.log('got watchSale errs', err));

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
      console.log(data);
      const obj = JSON.parse(data);
      walletDispatch && walletDispatch(obj);
      console.log('Response from wallet:', obj);
    };
    activateWebSocket({
      onConnect,
      onDisconnect,
      onMessage,
    });
    return deactivateWebSocket;
  }, []);

  const handleNFTMint = ({ cardDetails }) => {
    mintNFT({
      cardDetails,
      MAIN_CONTRACT_BOARD_INSTANCE_ID,
      walletP: walletPRef.current,
      publicFacetAuction: publicFacetRef.current,
      CARD_BRAND_BOARD_ID,
      cardPurse,
    });
  };
  const removeCardFromSale = async () => {
    await removeItemFromSale({
      cardDetail: activeCard,
      cardPurse,
      publicFacet: publicFacetSwapRef.current,
    });
  };
  const makeInvitationAndSellerSeat = async ({ price }) => {
    const params = {
      publicFacet: publicFacetSwapRef.current,
      sellingPrice: BigInt(price),
      walletP: walletPRef.current,
      cardDetail: activeCard,
    };
    const sellerSeatInvitation = await getSellerSeat(params);
    return sellerSeatInvitation;
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
      walletP: walletPRef.current,
      BuyerExclusiveInvitation,
      publicFacetSwap: publicFacetSwapRef.current,
      publicFacet: publicFacetRef.current,
      setLoading,
      onClose,
    });
    return result;
  };
  const handleCardClick = (cardDetail, bool) => {
    console.log('active card:', bool);
    setActiveCard(cardDetail);
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

  const submitCardOffer = (
    name,
    price,
    selectedPurse,
    setFormState,
    onClose,
  ) => {
    return makeBidOfferForCard({
      walletP: walletPRef.current,
      publicFacet: publicFacetRef.current,
      card: name,
      cardOffer: { ...name, boughtFor: price },
      cardPurse,
      tokenPurse: selectedPurse || tokenPurses[0],
      price: BigInt(price),
      onClose,
      setFormState,
    }).then((result) => {
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
    <div>
      <Header
        walletConnected={walletConnected}
        dappApproved={dappApproved}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        setType={setType}
        handleAddNFTForm={handleAddNFTForm}
      />
      <CardDisplay
        activeTab={activeTab}
        cardList={availableCards}
        userOffers={activeTab !== 2 && userOffers ? userOffers : []}
        userCards={cardPurse?.currentAmount?.value}
        userNfts={userNfts}
        handleClick={handleCardClick}
        type={type}
        handleNFTMint={handleNFTMint}
        tokenDisplayInfo={tokenDisplayInfo}
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
          cardDetail={activeCard}
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

      {/* <ModalWrapper open={addNFTForm} onClose={handleAddNFTForm}>
        <h1 className="text-2xl font-semibold text-center">Add NFT</h1>
        <div className="flex flex-col gap-x-10 mt-11 mx-12 mb-12">
          <AddNewNFTForm
            tokenDisplayInfo={tokenDisplayInfo}
            handleNFTMint={handleNFTMint}
          />
        </div>
      </ModalWrapper> */}
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
