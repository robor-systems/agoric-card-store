import React from 'react';

const cardList = ({ input, cardList }) => {
  switch (activeTab) {
    case 1: {
      console.log(userOffers, 'userCards');
      cards =
        cardList?.length !== 0 ? (
          <div className="grid sm:grid-cols-1  md:grid-cols-2 xl:grid-cols-3  gap-x-6 gap-y-10">
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
    }
    case 2: {
      console.log('Cardlist:', cardList);
      cards = (
        <div className="grid sm:grid-cols-1  md:grid-cols-2 xl:grid-cols-3  gap-x-6 gap-y-10">
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
    }
  }
  const filteredData = cardList.filter((el) => {
    if (input === '') {
      return el;
    } else {
      return el.text.toLowerCase().includes(props.input);
    }
  });
  return <>filteredData</>;
};
export default cardList;
