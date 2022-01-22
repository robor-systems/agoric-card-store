// // import { AmountMath } from '@agoric/ertp';
// import { E } from '@agoric/captp';
// import dappConstants from './conf/defaults';
// import installationConstants from './conf/installationConstants';

// const {
//   issuerBoardIds: { Money: MONEY_ISSUER_BOARD_ID },
//   ATOMICSWAP_CONTRACT_INSTANCE_BOARD_ID: atomicSwapContractInstanceBoardID,
// } = dappConstants;
// const {
//   //   ATOMICSWAP_INSTALLATION_BOARD_ID: atomicSwapContractInstallationBoardId,
//   ATOMICSWAP_LOGIC_INSTALLATION_BOARD_ID: atomicSwapLogicInstallationBoardId,
// } = installationConstants;
// console.log(
//   atomicSwapContractInstanceBoardID,
//   atomicSwapLogicInstallationBoardId,
// );
// export async function Buy({ cardCID, walletP, cardPurse, tokenPurse }) {
//   try {
//     const zoe = await E(walletP).getZoe();
//     const board = await E(walletP).getBoard();
//     const atomicSwapContractInstance = await E(board).getValue(
//       atomicSwapContractInstanceBoardID,
//     );
//     const moneyIssuer = await E(board).getValue(MONEY_ISSUER_BOARD_ID);
//     const atomicSwapLogicInstallation = await E(board).getValue(
//       atomicSwapLogicInstallationBoardId,
//     );
//     const publicFacet = await E(zoe).getPublicFacet(atomicSwapContractInstance);

//     const { invitationP } = await E(publicFacet).getBuyerInvitation(
//       [cardCID],
//       moneyIssuer,
//       atomicSwapLogicInstallation,
//     );
//     // const invitationIssuer = await E(zoe).getInvitationIssuer();
//     // const buyerInvitation = await invitationIssuer.claim(invitationP);
//     // const cardPrice = AmountMath.make(moneyIssuer.getBrand(), 15n);
//     // const buyerProposal = harden({
//     //   want: { Asset: AmountMath.make(cardPurse.getAllegedBrand(), [cardCID]) },
//     //   give: { Price: cardPrice },
//     //   exit: { onDemand: null },
//     // });
//     // const buyerPayment = tokenPurse.withdraw(cardPrice);

//     // const publicFacet = await E(zoe).getPublicFacet(atomicSwapContractInstance);
//     // const { invitationP } = await E(publicFacet).createInstance(
//     //   [cardCID],
//     //   moneyIssuer,
//     //   atomicSwapLogicInstallation,
//     // );
//     console.log(
//       invitationP,
//       //   buyerInvitation,
//       publicFacet,
//       atomicSwapContractInstance,
//       //   publicFacet,

//       moneyIssuer,
//       cardCID,
//       atomicSwapLogicInstallation,
//       cardPurse,
//       tokenPurse,
//     );
//   } catch (err) {
//     console.log(err);
//   }
// }
