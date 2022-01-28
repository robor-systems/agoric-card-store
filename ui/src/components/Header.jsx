import React from 'react';

const Header = ({
  walletConnected,
  activeTab,
  setActiveTab,
  setType,
  handleAddNFTForm,
}) => {
  const walletStatus = walletConnected ? 'Connected' : 'Not connected';
  console.log(activeTab);
  const TabButton = ({ tabIndex, text, width }) => {
    return (
      <div
        onClick={() => {
          setActiveTab(tabIndex);
          console.log(tabIndex);
          tabIndex === 0 ? setType('Sell Product') : setType('Buy Product');
        }}
        className={`cursor-pointer flex flex-col justify-center relative h-20 ${width}`}
      >
        <span>{text}</span>
        <div
          className={`w-full h-1 bg-secondary rounded-md absolute bottom-0 ${
            tabIndex === activeTab ? 'block' : 'hidden'
          }`}
        ></div>
      </div>
    );
  };
  return (
    <div className="flex justify-between nav-shadow items-center w-full h-20 px-14 text-base">
      <p className="text-xl">Baseball Card Store</p>
      <div className="flex text-base  text-center">
        <TabButton tabIndex={0} text="My Cards" width="w-32" />
        <TabButton tabIndex={1} text="Marketplace" width="w-36" />
        <TabButton tabIndex={2} text="Primary Sales" width="w-40" />
        <span
          onClick={() => handleAddNFTForm()}
          className="self-center font-bold cursor-pointer"
        >
          Add NFT
        </span>
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
  );
};

export default Header;
