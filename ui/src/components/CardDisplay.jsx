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

// const useStyles = makeStyles((theme) => {
//   return {
//     root: {
//       marginTop: theme.spacing(2),
//     },
//     paper: {
//       padding: theme.spacing(3),
//       minWidth: '200px',
//     },
//     loading: {
//       marginBottom: theme.spacing(2),
//     },
//   };
// });

const CardDisplay = ({
  activeTab,
  userCards,
  playerNames,
  handleClick,
  type,
}) => {
  const cardsToDisplay = activeTab === 0 ? userCards : playerNames;
  const isReady = cardsToDisplay && cardsToDisplay.length > 0;
  const cards = cardsToDisplay.map((card) => (
    <div key={card.name}>
      <BaseballCard
        playerName={card}
        key={card.name}
        handleClick={handleClick}
        type={type}
      />
    </div>
  ));

  return (
    // <Container>
    //   <Grid container>
    //     <Grid container justify="space-evenly">
    //       <Paper elevation={0}>
    //         {!isReady && <CircularProgress size="2rem" />}
    //         <Typography>
    //           {isReady
    //             ? 'Click on a card below to make an offer to buy the card.'
    //             : 'Fetching card list...'}
    //         </Typography>
    //       </Paper>
    //     </Grid>
    //     <Grid
    //       container
    //       alignItems="stretch"
    //       direction="row"
    //       justify="space-evenly"
    //     >
    //       {cards}
    //     </Grid>
    //   </Grid>
    // </Container>
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
      <div className="w-full justify-items-center grid grid-cols-3 gap-x-8 gap-y-10">
        {cards}
      </div>
    </div>
  );
};

export default CardDisplay;
