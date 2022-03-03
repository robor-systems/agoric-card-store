import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import 'json5';
// import 'utils/installSESLockdown';

import { makeCapTP, E } from '@agoric/captp';
import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';
import { Far } from '@agoric/marshal';

import {
  activateWebSocket,
  deactivateWebSocket,
  getActiveSocket,
} from '../utils/fetch-websocket.js';

import dappConstants from '../lib/constants.js';
import {
  reducer,
  defaultState,
  setApproved,
  setConnected,
  setOpenEnableAppDialog,
  setAvailableCards,
  setCardPurse,
  setTokenDisplayInfo,
  setTokenPetname,
  setTokenPurses,
  setUserNfts,
  setUserOffers,
  setUserCards,
  setPendingOffers,
} from '../store/store';

const {
  INSTANCE_BOARD_ID,
  INSTALLATION_BOARD_ID,
  SWAP_WRAPPER_INSTANCE_BOARD_ID,
  MAIN_CONTRACT_BOARD_INSTANCE_ID,
  SIMPLE_EXCHANGE_WRAPPER_INSTANCE_BOARD_ID,
  issuerBoardIds: { Card: CARD_ISSUER_BOARD_ID },
  brandBoardIds: { Money: MONEY_BRAND_BOARD_ID, Card: CARD_BRAND_BOARD_ID },
} = dappConstants;

/* eslint-disable */
let walletP;
let publicFacet;
let publicFacetSwap;
let publicFacetSimpleExchange;
/* eslint-enable */

export { walletP, publicFacet, publicFacetSwap, publicFacetSimpleExchange };

export const ApplicationContext = createContext();

export function useApplicationContext() {
  return useContext(ApplicationContext);
}

/* eslint-disable complexity, react/prop-types */
export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { availableCards, userCards } = state;
  useEffect(() => {
    // Receive callbacks from the wallet connection.
    const otherSide = Far('otherSide', {
      needDappApproval(_dappOrigin, _suggestedDappPetname) {
        dispatch(setApproved(false));
        dispatch(setOpenEnableAppDialog(true));
      },
      dappApproved(_dappOrigin) {
        dispatch(setApproved(true));
      },
    });

    let walletAbort;
    let walletDispatch;

    const onConnect = async () => {
      dispatch(setConnected(true));
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
      walletP = getBootstrap();
      //   walletPRef.current = walletP;

      const processPurses = (purses) => {
        const newTokenPurses = purses.filter(
          ({ brandBoardId }) => brandBoardId === MONEY_BRAND_BOARD_ID,
        );
        const newCardPurse = purses.find(
          ({ brandBoardId }) => brandBoardId === CARD_BRAND_BOARD_ID,
        );

        dispatch(setTokenPurses(newTokenPurses));
        dispatch(setTokenDisplayInfo(newTokenPurses[0].displayInfo));
        dispatch(setTokenPetname(newTokenPurses[0].brandPetname));
        dispatch(setCardPurse(newCardPurse));
        dispatch(setUserCards(newCardPurse?.currentAmount?.value));
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
      async function watchWallerOffers() {
        const offerNotifier = E(walletP).getOffersNotifier();
        try {
          for await (const offers of iterateNotifier(offerNotifier)) {
            let pendingOffersArray = offers.filter((offer) => {
              if (offer.status === 'pending') {
                if (offer?.proposalTemplate?.give?.Asset) {
                  return true;
                }
              }
              return false;
            });
            pendingOffersArray = pendingOffersArray?.map(
              (offer) => offer?.proposalTemplate?.give?.Asset?.value[0],
            );
            console.log(userCards);
            console.log('offers in application:', pendingOffersArray);
            if (pendingOffersArray?.length > 0) {
              console.log('offers in application2:', pendingOffersArray);
              dispatch(setPendingOffers(pendingOffersArray));
            }
          }
        } catch (err) {
          console.log('offers in application: error');
        }
      }
      watchWallerOffers().catch((err) =>
        console.error('got watchWalletoffer err', err),
      );
      await Promise.all([
        E(walletP).suggestInstallation('Installation', INSTALLATION_BOARD_ID),
        E(walletP).suggestInstance('Instance', INSTANCE_BOARD_ID),
        E(walletP).suggestIssuer('Card', CARD_ISSUER_BOARD_ID),
      ]);

      const zoe = E(walletP).getZoe();
      const board = E(walletP).getBoard();
      const instance = await E(board).getValue(INSTANCE_BOARD_ID);
      publicFacet = E(zoe).getPublicFacet(instance);
      //   publicFacetRef.current = publicFacet;
      const swapWrapperInstance = await E(board).getValue(
        SWAP_WRAPPER_INSTANCE_BOARD_ID,
      );
      publicFacetSwap = await E(zoe).getPublicFacet(swapWrapperInstance);

      //   publicFacetSwapRef.current = publicFacetSwap;
      const simpleExchangeWrapperInstance = await E(board).getValue(
        SIMPLE_EXCHANGE_WRAPPER_INSTANCE_BOARD_ID,
      );
      console.log(
        simpleExchangeWrapperInstance,
        'simpleExchangeWrapperInstance',
      );

      publicFacetSimpleExchange = await E(zoe).getPublicFacet(
        simpleExchangeWrapperInstance,
      );
      console.log(publicFacetSimpleExchange, 'publicfacetsimpleexchange');
      console.log(
        await E(publicFacetSimpleExchange).getAvailableOffers(),
        'getAvailableOffers:',
      );
      async function watchOffers() {
        console.log('watch offer');
        const availableOfferNotifier = await E(
          publicFacetSimpleExchange,
        ).getAvailableOfferNotifier();

        for await (const availableOffers of iterateNotifier(
          availableOfferNotifier,
        )) {
          console.log('available offers from swap:', availableOffers);
          dispatch(setUserOffers(availableOffers.value || []));
        }

        const userSaleHistoryNotifier = await E(
          publicFacet,
        ).getUserSaleHistoryNotifier();

        console.log('userOwnedNftsNotifier:', userSaleHistoryNotifier);
        for await (const userSaleHistory of iterateNotifier(
          userSaleHistoryNotifier,
        )) {
          console.log('userNfts:', userSaleHistory);
          dispatch(setUserNfts(userSaleHistory.value));
        }
      }
      watchOffers().catch((err) => console.log('got watchOffer errs', err));

      async function watchSale() {
        console.log('watch offer');
        const userSaleHistoryNotifier = await E(
          publicFacet,
        ).getUserSaleHistoryNotifier();

        console.log('userOwnedNftsNotifier:', userSaleHistoryNotifier);
        for await (const userSaleHistory of iterateNotifier(
          userSaleHistoryNotifier,
        )) {
          console.log('userNfts:', userSaleHistory);
          dispatch(setUserNfts(userSaleHistory.value));
        }
      }
      watchSale().catch((err) => console.log('got watchSale errs', err));

      /*
       *get the current items for sale in the proposal
       *Currenly these will me primary marketplace cards
       */
      const availableItemsNotifier = E(publicFacet).getAvailableItemsNotifier();

      /* Using the public faucet we get all the current Nfts offered for sale */
      for await (const cardsAvailableAmount of iterateNotifier(
        availableItemsNotifier,
      )) {
        console.log('available Cards:', cardsAvailableAmount);
        dispatch(setAvailableCards(cardsAvailableAmount.value));
      }
    };

    const onDisconnect = () => {
      dispatch(setConnected(false));
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

  return (
    <ApplicationContext.Provider
      value={{
        state,
        dispatch,
        walletP,
        publicFacet,
        publicFacetSwap,
        publicFacetSimpleExchange,
        CARD_BRAND_BOARD_ID,
        MAIN_CONTRACT_BOARD_INSTANCE_ID,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}
