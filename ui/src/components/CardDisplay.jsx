import React from 'react';
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
  cardPurse,
  userOffers,
}) => {
  const isReady = cardList && cardList.length > 0;

  let cards;
  switch (activeTab) {
    case 0:
      cards =
        cardPurse?.currentAmount?.value?.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-8 gap-y-10">
            {cardPurse?.currentAmount.value.map((playerName) => (
              <div key={playerName.name}>
                <BaseballCard
                  playerName={playerName}
                  key={playerName.name}
                  handleClick={handleClick}
                  type={type}
                />
              </div>
            ))}
          </div>
        ) : (
          <h1> There are no cards in your wallet </h1>
        );
      break;
    case 1:
      console.log(userOffers, 'userOffer');
      cards =
        userOffers?.length !== 0 ? (
          <div className="grid grid-cols-3 gap-x-8 gap-y-10">
            {userOffers?.map((playerName) => {
              console.log(playerName, 'inside map ');
              return (
                <div key={playerName.id}>
                  <BaseballCard
                    playerName={playerName}
                    key={playerName.name}
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
      cards = (
        <div className="grid grid-cols-3 gap-x-8 gap-y-10">
          {cardList.map((playerName) => (
            <div key={playerName.name}>
              <BaseballCard
                playerName={playerName}
                key={playerName.name}
                handleClick={handleClick}
                type={type}
              />
            </div>
          ))}
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
        {!isReady && <Loader />}
        {!isReady && 'Fetching card list...'}
      </div>
      {isReady && <>{cards}</>}
    </div>
  );
};

export default CardDisplay;
