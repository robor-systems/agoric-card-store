import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useApplicationContext } from '../context/Application';
import { setActiveTab, setType } from '../store/store';

const Header = () => {
  const { state, dispatch } = useApplicationContext();
  const { connected: walletConnected, activeTab } = state;
  const history = useHistory();
  const walletStatus = walletConnected ? 'Connected' : 'Not connected';
  // dispatch(setActiveTab(0));
  useEffect(() => {
    switch (activeTab) {
      case 0:
        history.push('/mycards');
        break;
      case 1:
        history.push('/marketplace');
        break;
      case 2:
        history.push('/primarysales');
        break;
      case 3:
        history.push('/create');
        break;

      default: {
        dispatch(setActiveTab(0));
        break;
      }
    }
  }, [activeTab]);

  const TabButton = ({ tabIndex, text, width }) => {
    return (
      <div
        onClick={() => {
          dispatch(setActiveTab(tabIndex));
          switch (tabIndex) {
            case 0:
              dispatch(setType('Sell Product'));
              break;
            case 1:
              dispatch(setType('Buy Product'));
              break;
            case 2:
              dispatch(setType('Bid Product'));
              break;
            case 3:
              dispatch(setType('Mint Nft'));
              break;
            default:
          }
        }}
        className={`cursor-pointer flex flex-col justify-center relative h-20 ${width}`}
      >
        <span>{text}</span>
        <div
          className={`w-full h-1 bg-secondary rounded-t-md absolute bottom-0 ${
            tabIndex === activeTab ? 'block' : 'hidden'
          }`}
        ></div>
      </div>
    );
  };
  return (
    <>
      <div className="flex justify-between nav-shadow items-center w-full h-20 px-14 text-base">
        <p className="text-xl">Baseball Card Store</p>
        <div className="flex-row flex text-base text-center">
          <TabButton tabIndex={0} text="My Cards" width="w-32" />
          <TabButton tabIndex={1} text="Marketplace" width="w-36" />
          <TabButton tabIndex={2} text="Primary Sales" width="w-40" />
          <TabButton tabIndex={3} text="Create" width="w-24" />
          {/* <span
          onClick={() => handleAddNFTForm()}
          className="self-center font-bold cursor-pointer"
        >
          Add NFT
        </span> */}
        </div>
        <div>
          Agoric Wallet: {walletStatus}
          <span
            className={`inline-block ml-1.5 w-2.5 h-2.5 rounded-full ${
              walletConnected ? 'bg-secondary' : 'bg-alternative'
            }`}
          ></span>
        </div>
      </div>
    </>
  );
};

export default Header;
