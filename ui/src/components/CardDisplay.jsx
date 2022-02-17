import React, { useEffect, useState } from 'react';
import SearchIcon from '../assets/icons/search.png';
import FilterIcon from '../assets/icons/filter.png';

import AddNewNFTForm from './AddNewNFTForm';
import BaseballCard from './BaseballCard.jsx';
import Loader from './common/Loader.jsx';
import { useApplicationContext } from '../context/Application';

const CardDisplay = ({ handleClick, handleNFTMint }) => {
  const { state } = useApplicationContext();
  const {
    activeTab,
    availableCards: cardList,
    type,
    userOffers,
    userCards,
    userNfts,
    tokenDisplayInfo,
  } = state;
  // const isReady1 = cardPurse && cardPurse?.currentAmount?.value?.length > 0;
  // const isReady2 = userCards && userCards.length > 0;
  const isReady = cardList && cardList.length > 0;
  let cards;
  // const [cards, setCards] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [secondaryLoader, setSecondaryLoader] = useState(true);
  const [myCardLoader, setMyCardLoader] = useState(true);
  const [myCards, setMyCards] = useState([]);
  const [secondaryCards, setSecondaryCards] = useState([]);
  // const [filteredCards, setFilteredCards] = useState([]);
  const menuOptions = ['Name', 'Author', 'Price'];
  console.log(userCards, userOffers, userNfts, 'all card arrs');
  const getUserCards = (params) => {
    console.log('params:', params);
    const userOffersMap = params?.userOffers.reduce((map, obj) => {
      map[obj.id] = { ...obj };
      return map;
    }, {});
    console.log('userOfferMap:', userOffersMap);
    const userNftsMap = params?.userNfts.reduce((map, obj) => {
      map[obj.id] = { ...obj };
      return map;
    }, {});
    console.log('userNftsMap:', userNftsMap);
    const arr = params?.userCards.map((offer) => {
      let obj = {};
      if (userOffersMap[offer.id]) obj = { ...userOffersMap[offer.id] };
      if (userNftsMap[offer.id]) obj = { ...obj, ...userNftsMap[offer.id] };
      return obj;
    });
    console.log('array:', arr);
    setMyCardLoader(false);
    return arr;
  };
  const getSecondaryCards = (params) => {
    const ids = params?.userCards?.map((card) => card.id);
    // change !== to === to filter user owned cards from secondaryMarketplace
    const arr = params?.userOffers?.filter(
      (card) => ids.indexOf(card.id) !== -1,
    );
    setSecondaryLoader(false);
    return arr;
  };
  const getFilteredList = (list) => {
    return list.filter((el) => {
      if (searchInput === '') {
        return el;
      } else {
        return el.name.toLowerCase().includes(searchInput.toLocaleLowerCase());
      }
    });
  };
  useEffect(() => {
    console.log('userOffers:', userOffers);
    userCards?.length > 0 &&
      userNfts?.length > 0 &&
      setMyCards(getUserCards({ userCards, userOffers, userNfts }));
    userCards?.length === 0 && userNfts?.length === 0 && setMyCardLoader(false);
    setSecondaryCards(getSecondaryCards({ userCards, userOffers }));
  }, [userOffers, userCards, userNfts]);
  switch (activeTab) {
    case 0:
      console.log(myCards, 'MyCards');
      cards =
        myCards?.length > 0 ? (
          <div className="grid sm:grid-cols-1  md:grid-cols-2 xl:grid-cols-3  gap-x-6 gap-y-10">
            {myCards?.map((cardDetail) => (
              <div key={cardDetail.name}>
                <BaseballCard
                  cardDetail={cardDetail}
                  key={cardDetail.name}
                  handleClick={handleClick}
                  type={type}
                  onSale={cardDetail.sellingPrice}
                />
              </div>
            ))}
          </div>
        ) : (
          <h1> There are no cards in your wallet </h1>
        );
      break;
    case 1: {
      const filteredList = getFilteredList(secondaryCards);
      console.log(userOffers, 'userCards');
      cards =
        filteredList?.length !== 0 ? (
          <div className="grid sm:grid-cols-1  md:grid-cols-2 xl:grid-cols-3  gap-x-6 gap-y-10">
            {filteredList?.map((cardDetail) => {
              console.log(cardDetail, 'inside map ');
              return (
                <div key={cardDetail.id}>
                  <BaseballCard
                    cardDetail={cardDetail}
                    key={cardDetail.name}
                    handleClick={handleClick}
                    type={type}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <h1>No nfts for sale currently</h1>
        );
      break;
    }
    case 2: {
      const filtered = getFilteredList(cardList);
      console.log('Cardlist:', filtered);
      cards = (
        <div className="grid sm:grid-cols-1  md:grid-cols-2 xl:grid-cols-3  gap-x-6 gap-y-10">
          {filtered.map((cardDetail) => {
            console.log('cardDetail:', cardDetail);
            return (
              <div key={cardDetail.name}>
                <BaseballCard
                  cardDetail={cardDetail}
                  key={cardDetail.name}
                  handleClick={handleClick}
                  type={type}
                  onAuction={true}
                />
              </div>
            );
          })}
        </div>
      );
      break;
    }
    case 3:
      cards = (
        <AddNewNFTForm
          tokenDisplayInfo={tokenDisplayInfo}
          handleNFTMint={handleNFTMint}
        />
      );
      break;
    default:
      break;
  }
  return (
    <div className="display-card flex flex-col px-4 items-center max-w-6xl w-full">
      <h1 className="text-3xl font-semibold mb-14">
        {activeTab === 0 && 'My Cards'}
        {activeTab === 1 && 'Marketplace'}
        {activeTab === 2 && 'Primary Sales'}
        {activeTab === 3 && 'Create New Item'}
      </h1>
      {activeTab !== 0 && activeTab !== 3 && (
        <div className="flex flex-col gap-y-8 sm:flex-row gap-x-4 justify-center w-full px-2 mb-14">
          <div className="flex  sm:w-3/4 border justify-between px-4 border-alternativeLight rounded items-center">
            <input
              className="outline-none focus:outline-none rounded h-12 text-lg"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <img
              className="w-4 h-4 relative"
              src={SearchIcon}
              alt="search-icon"
            />
          </div>
          <select
            style={{
              backgroundImage: `url(${FilterIcon})`,
              backgroundSize: '25px',
              backgroundPositionY: 'center',
              backgroundPositionX: '95%',
            }}
            className="bg-no-repeat cursor-pointer text-primaryLight border border-alternativeLight bg-white rounded sm:w-1/5 h-12 px-3.5 text-lg outline-none focus:outline-none font-normal"
          >
            {menuOptions.map((item, i) => (
              <option key={i} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-col items-center">
        {!isReady && type === 'Bid Product' && <Loader />}
        {!isReady && type === 'Bid Product' && 'Fetching card list...'}
        {secondaryLoader && type === 'Buy Product' && <Loader />}
        {secondaryLoader && type === 'Buy Product' && 'Fetching card list...'}
        {myCardLoader && type === 'Sell Product' && <Loader />}
        {myCardLoader && type === 'Sell Product' && 'Fetching card list...'}
      </div>
      {type === 'Mint Nft' && <>{cards}</>}
      {isReady && type === 'Bid Product' && <>{cards}</>}
      {!secondaryLoader && type === 'Buy Product' && <>{cards}</>}
      {!myCardLoader && type === 'Sell Product' && <>{cards}</>}
    </div>
  );
};

export default CardDisplay;
