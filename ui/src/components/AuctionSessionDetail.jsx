import React from 'react';

import { stringifyValue } from '../utils/amount';

const toDateString = (bigIntTs) => {
  const ts = parseInt(bigIntTs.toString(), 10);
  return new Date(ts * 1000).toISOString();
};

const AuctionSessionDetail = ({
  bidDuration,
  bids,
  closesAfter,
  minimumBid,
  winnerPriceOption,
  tokenPetname,
  tokenDisplayInfo,
  timeUnit = 'second',
}) => {
  const showHistory = Array.isArray(bids);
  const isHistoryEmpty = showHistory && bids.length < 1;

  return (
    <div className="mb-2">
      <p className="flex w-3/4 justify-between">
        <strong>Duration:</strong> {stringifyValue(bidDuration)} {timeUnit}(s)
      </p>
      <p className="flex w-3/4 justify-between">
        <strong>Winner price option:</strong> {winnerPriceOption}
      </p>
      <p className="flex w-3/4 justify-between">
        <strong>Minimum bid:</strong>{' '}
        {stringifyValue(minimumBid.value, tokenDisplayInfo)} {tokenPetname}
      </p>
      {closesAfter ? (
        <p className="flex w-3/4 justify-between">
          <strong>Closes after:</strong> {toDateString(closesAfter)}
        </p>
      ) : (
        <p className="flex w-3/4 justify-between">
          <strong>Status:</strong> Not started.
        </p>
      )}
      {showHistory ? (
        <div className="mt-2">
          <p>
            <strong>History</strong>
          </p>
          <div className="w-full bg-alternativeLight p-2 rounded-md">
            {isHistoryEmpty
              ? 'No bid for now. Session will be started after the first bid.'
              : bids.map((amount, idx) => (
                  <p className="" key={idx}>
                    {stringifyValue(amount.value, tokenDisplayInfo)}{' '}
                    {tokenPetname}
                  </p>
                ))}
          </div>
        </div>
      ) : (
        <p>
          <strong>Bids:</strong> {bids}
        </p>
      )}
    </div>
  );
};

export default AuctionSessionDetail;
