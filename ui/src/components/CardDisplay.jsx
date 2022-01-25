import React from 'react';
import SearchIcon from '../assets/icons/search.png';
import FilterIcon from '../assets/icons/filter.png';
import BaseballCard from './BaseballCard.jsx';
import Loader from './common/Loader.jsx';

const CardDisplay = ({ activeTab, cardsList, handleClick, type }) => {
  const isReady = Boolean(cardsList);
  const cards = cardsList?.map((card) => (
    <div key={card.name}>
      <BaseballCard
        playerName={card}
        key={card.name}
        handleClick={handleClick}
        type={type}
      />
    </div>
  ));
  console.log(cardsList);
  return (
    <div className="display-card flex flex-col mx-auto max-w-6xl items-center">
      <h1 className="text-3xl font-semibold mb-14">
        {activeTab === 0 && 'My Cards'}
        {activeTab === 1 && 'Marketplace'}
        {activeTab === 2 && 'Primary Sales'}
      </h1>
      {activeTab !== 0 && (
        <div className="flex gap-x-4 justify-between w-full mb-14">
          <div className="flex w-full border justify-between  border-alternativeLight rounded items-center">
            <input
              className="outline-none focus:outline-none ml-4 rounded h-12 w-full text-lg"
              placeholder="Search"
            />
            <img
              className="w-4 h-4 mr-4 relative"
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
            className="bg-no-repeat cursor-pointer text-primaryLight border border-alternativeLight bg-white rounded w-60 h-12 px-3.5 text-lg outline-none focus:outline-none font-normal"
          >
            <option>Filter</option>
          </select>
        </div>
      )}
      <div className="flex flex-col items-center">
        {!isReady && <Loader />}
        {!isReady && 'Fetching card list...'}
      </div>
      {cardsList?.length === 0 ? (
        <p className="text-center text-xl">No Cards to show</p>
      ) : (
        <div className="w-full text-center justify-items-center grid grid-cols-3 gap-x-8 gap-y-10">
          {cards}
        </div>
      )}
    </div>
  );
};

export default CardDisplay;
