import React, { useEffect, useState } from 'react';
// import Grid from '@material-ui/core/Grid';
// import Typography from '@material-ui/core/Typography';
// import Paper from '@material-ui/core/Paper';
// import Container from '@material-ui/core/Container';
// import CircularProgress from '@material-ui/core/CircularProgress';
import SearchIcon from '../assets/icons/search.png';
import FilterIcon from '../assets/icons/filter.png';
// import { makeStyles } from '@material-ui/core/styles';

import BaseballCard from './BaseballCard.jsx';
import Loader from './common/Loader.jsx';

const CardDisplay = ({
  activeTab,
  cardList,
  handleClick,
  type,
  userOffers,
  userCards,
  userNfts,
}) => {
  // const isReady1 = cardPurse && cardPurse?.currentAmount?.value?.length > 0;
  // const isReady2 = userCards && userCards.length > 0;
  const isReady = cardList && cardList.length > 0;
  let cards;
  const [secondaryLoader, setSecondaryLoader] = useState(true);
  const [myCardLoader, setMyCardLoader] = useState(true);
  const [myCards, setMyCards] = useState([]);
  const [secondaryCards, setSecondaryCards] = useState([]);
  const getUserCards = (params) => {
    console.log('params:', params);
    const userOffersMap = params?.userOffers.reduce(function (map, obj) {
      map[obj.id] = { ...obj };
      return map;
    }, {});
    console.log('userOfferMap:', userOffersMap);
    const userNftsMap = params?.userNfts.reduce(function (map, obj) {
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
      cards =
        myCards?.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-8 gap-y-10">
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
    case 1:
      console.log(userOffers, 'userCards');
      cards =
        secondaryCards?.length !== 0 ? (
          <div className="grid grid-cols-3 gap-x-8 gap-y-10">
            {secondaryCards?.map((cardDetail) => {
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
    case 2:
      console.log('Cardlist:', cardList);
      cards = (
        <div className="grid grid-cols-3 gap-x-8 gap-y-10">
          {cardList.map((cardDetail) => {
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
    default:
      break;
  }

  return (
    <div className="display-card flex flex-col items-center w-10/12">
      <h1 className="text-3xl font-semibold mb-14">
        {activeTab === 0 && 'My Cards'}
        {activeTab === 1 && 'Marketplace'}
        {activeTab === 2 && 'Primary Sales'}
      </h1>
      {activeTab !== 0 && (
        <div className="flex gap-x-4 justify-center w-full px-2 mb-14">
          <div className="flex w-3/4 border justify-between px-4 border-alternativeLight rounded items-center">
            <input
              className="outline-none focus:outline-none rounded h-12 text-lg"
              placeholder="Search"
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
            className="bg-no-repeat cursor-pointer text-primaryLight border border-alternativeLight bg-white rounded w-1/5 h-12 px-3.5 text-lg outline-none focus:outline-none font-normal"
          >
            <option></option>
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
      {isReady && type === 'Bid Product' && <>{cards}</>}
      {!secondaryLoader && type === 'Buy Product' && <>{cards}</>}
      {!myCardLoader && type === 'Sell Product' && <>{cards}</>}
    </div>
  );
};

export default CardDisplay;
