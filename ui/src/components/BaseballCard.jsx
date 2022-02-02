import React from 'react';
import Tag from '../assets/icons/tag.png';
import User from '../assets/icons/user.png';
import Expand from '../assets/icons/expand.png';
import Button from './common/Button';
import { stringifyValueRUN } from '../utils/amount';

const BaseballCard = ({
  imageOnly,
  cardDetail,
  handleClick,
  type,
  onSale,
  onAuction,
  noButton,
}) => {
  console.log(cardDetail?.image, 'image from baseball card component');
  // console.log(type, 'baseballcard type btn');
  return (
    <div
      className={`transition-all duration-300 flex flex-col py-3 border border-alternativeLight card card-shadow rounded-md ${
        (imageOnly && 'card-image-only py-2.5') || (onAuction && 'py-10')
      }`}
    >
      <div
        className={`card-media mb-3 relative self-center ${
          imageOnly && 'card-media-small'
        }`}
      >
        <img
          className="h-full w-full rounded-md"
          src={`https://gateway.pinata.cloud/ipfs/${cardDetail?.image}`}
          alt={cardDetail?.name}
        />
        {!imageOnly && !noButton && (
          <>
            <div className="overlay rounded-md absolute top-0 left-0 w-full h-full bg-primary opacity-50 items-center"></div>
            {type === 'Sell Product' && !onSale && (
              <Button
                styles="media-action absolute bottom-6 w-52 left-16"
                onClick={() => handleClick(cardDetail, false)}
                text="Sell"
              />
            )}
            {type === 'Sell Product' && onSale && (
              <Button
                styles="media-action absolute bottom-6 w-52 left-16"
                onClick={() => handleClick(cardDetail, false)}
                text="Remove from sale"
              />
            )}
            {(type === 'Buy Product' || type === 'Bid Product') && (
              <Button
                styles="media-action absolute bottom-6 w-52 left-16"
                onClick={() => handleClick(cardDetail, false)}
                text="Buy"
              />
            )}
            <img
              onClick={() => handleClick(cardDetail, true)}
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
            <p className="text-lg mb-1">{cardDetail?.name}</p>
            {onSale && <img className="w-6 h-6" src={Tag} alt="sale-tag" />}
          </div>
          <div className="flex items-center">
            <img className="w-6 h-6 mr-2" src={User} alt="user-icon" />
            <span className="text-secondary">jane_doe</span>
          </div>
        </div>
      </div>
      {!imageOnly && !onAuction && (
        <>
          <hr className="mt-2.5 mb-1 bg-alternativeLight" />
          <div className="flex items-center justify-between px-3">
            <div>
              <p className="text-base text-primaryLight">
                {type === 'Sell Product' && !onSale
                  ? 'Bought For'
                  : 'Sale Price'}
              </p>
              <p className="text-lg">
                {type === 'Buy Product' || onSale
                  ? stringifyValueRUN(cardDetail.sellingPrice, {
                      decimalPlaces: 6,
                    })
                  : stringifyValueRUN(cardDetail.boughtFor, {
                      decimalPlaces: 6,
                    })}
              </p>
            </div>
            {type !== 'Sell Product' ? (
              <div>
                <p className="text-base text-primaryLight">Sale Ending In</p>
                <p className="text-lg">8 hours</p>
              </div>
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BaseballCard;
