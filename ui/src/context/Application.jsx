import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import 'json5';
// import 'utils/installSESLockdown';

import { makeCapTP, E } from '@endo/captp';
import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';
import { Far } from '@endo/marshal';

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
  setEscrowedCards,
} from '../store/store';

const {
  INSTANCE_BOARD_ID,
  INSTALLATION_BOARD_ID,
  MAIN_CONTRACT_BOARD_INSTANCE_ID,
  MARKET_PLACE_INSTANCE_BOARD_ID,
  issuerBoardIds: { Card: CARD_ISSUER_BOARD_ID },
  brandBoardIds: { Money: MONEY_BRAND_BOARD_ID, Card: CARD_BRAND_BOARD_ID },
} = dappConstants;

/* eslint-disable */
let walletP;
let publicFacet;
let publicFacetMarketPlace;
/* eslint-enable */

export { walletP, publicFacet, publicFacetMarketPlace };

export const ApplicationContext = createContext();

export function useApplicationContext() {
  return useContext(ApplicationContext);
}

/* eslint-disable complexity, react/prop-types */
export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { availableCards, escrowedCards, userCards } = state;
  useEffect(() => {
    async function watchWallerOffers() {
      const offerNotifier = E(walletP).getOffersNotifier();
      try {
        for await (const offers of iterateNotifier(offerNotifier)) {
          await E(publicFacetMarketPlace).updateNotifier();
          const userCardIds = userCards.map(({ id }) => id);
          console.log('userCardIds', userCardIds);
          const exitedOffers = offers
            .filter((offer) => {
              console.log('condtion 1', offer.status === 'cancel');
              console.log(
                'condtion 2',
                offer?.proposalTemplate?.give?.Asset?.value.length === 1,
              );
              console.log(
                'condtion 3',
                userCardIds.includes(
                  offer?.proposalTemplate?.give?.Asset?.value[0].id,
                ),
              );
              if (
                offer.status === 'cancel' &&
                offer?.proposalTemplate?.give?.Asset?.value.length === 1 &&
                !userCardIds.includes(
                  offer?.proposalTemplate?.give?.Asset?.value[0].id,
                )
              ) {
                return true;
              } else {
                return false;
              }
            })
            .map((offer) => offer?.proposalTemplate?.give?.Asset?.value[0]);
          dispatch(setEscrowedCards([...exitedOffers]));
        }
      } catch (err) {
        console.log('offers in application: error');
      }
    }
    watchWallerOffers().catch((err) =>
      console.error('got watchWalletoffer err', err),
    );
  }, [userCards]);
  useEffect(() => {
    console.log('escorwedCards in application:', escrowedCards);
  }, [escrowedCards]);
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
            dispatch(setPendingOffers(pendingOffersArray) || []);
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
      const marketPlaceInstance = await E(board).getValue(
        MARKET_PLACE_INSTANCE_BOARD_ID,
      );
      publicFacetMarketPlace = await E(zoe).getPublicFacet(marketPlaceInstance);
      async function watchOffers() {
        const availableOfferNotifier = await E(
          publicFacetMarketPlace,
        ).getNotifier();

        for await (const availableOffers of iterateNotifier(
          availableOfferNotifier,
        )) {
          console.log('GOT NOTIFIER!!!', availableOffers.sells);
          dispatch(setUserOffers(availableOffers.sells || []));
        }
      }
      watchOffers().catch((err) => console.log('got watchOffer errs', err));

      async function watchSale() {
        const userSaleHistoryNotifier = await E(
          publicFacet,
        ).getUserSaleHistoryNotifier();

        for await (const userSaleHistory of iterateNotifier(
          userSaleHistoryNotifier,
        )) {
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
        publicFacetMarketPlace,
        MARKET_PLACE_INSTANCE_BOARD_ID,
        CARD_BRAND_BOARD_ID,
        MAIN_CONTRACT_BOARD_INSTANCE_ID,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}
