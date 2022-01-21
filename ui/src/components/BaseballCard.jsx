import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tag from '../assets/icons/tag.png';
import User from '../assets/icons/user.png';
import Expand from '../assets/icons/expand.png';
// import { images } from '../images';
import Button from './common/Button';

const BaseballCard = ({ imageOnly, playerName, handleClick }) => {
  const [CardDetails, setCardDetails] = useState(null);
  // const CardContainer = handleClick ? CardActionArea : Fragment;
  // const containerProps = handleClick
  //   ? {
  //       onClick: () => handleClick(playerName),
  //     }
  //   : {};
  useEffect(() => {
    // console.log(playerName, 'baseballCardComponent');
    const getDetails = async (cardCID) => {
      const details = await axios.get(
        `https://gateway.pinata.cloud/ipfs/${cardCID}`,
      );
      setCardDetails(details.data);
    };
    getDetails(playerName);
  }, [playerName]);

  return (
    CardDetails && (
      <div
        className={`transition-all duration-300 flex flex-col py-3 border border-alternativeLight card card-shadow rounded-md ${
          imageOnly && 'card-image-only py-2.5'
        }`}
      >
        <div
          className={`card-media mb-3 relative self-center ${
            imageOnly && 'card-media-small'
          }`}
        >
          <img
            className="h-full w-full rounded-md"
            src={`https://gateway.pinata.cloud/ipfs/${CardDetails.image}`}
            alt={playerName}
          />
          {!imageOnly && (
            <>
              <div className="overlay rounded-md absolute top-0 left-0 w-full h-full bg-primary opacity-50"></div>
              <Button
                styles="media-action absolute bottom-6 w-52 left-16"
                onClick={() => handleClick(playerName, false)}
                text="Sell"
              />
              <img
                onClick={() => handleClick(playerName, true)}
                src={Expand}
                className="media-action-expand cursor-pointer w-12 h-12 absolute top-2 right-2"
                alt="expand"
              />
            </>
          )}
        </div>
        <div>
          <div className="px-3">
            <div className="flex justify-between items-center">
              <p className="text-lg mb-1">{CardDetails.name}</p>
              <img className="w-6 h-6" src={Tag} alt="sale-tag" />
            </div>
            <div className="flex items-center">
              <img className="w-6 h-6 mr-2" src={User} alt="user-icon" />
              <span className="text-secondary">jane_doe</span>
            </div>
          </div>
        </div>
        {!imageOnly && (
          <>
            <hr className="mt-2.5 mb-1 bg-alternativeLight" />
            <div className="flex items-center justify-between px-3">
              <div>
                <p className="text-base text-primaryLight">Bought For</p>
                <p className="text-lg">99 RUN</p>
              </div>
              <div>
                <p className="text-base text-primaryLight">Sale Ending In</p>
                <p className="text-lg">8 hours</p>
              </div>
            </div>
          </>
        )}
      </div>
    )
  );
};

export default BaseballCard;
