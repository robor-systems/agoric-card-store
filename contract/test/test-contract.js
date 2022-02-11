// @ts-check
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { resolve as importMetaResolve } from 'import-meta-resolve';

import bundleSource from '@agoric/bundle-source';

import { E } from '@agoric/eventual-send';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKit } from '@agoric/zoe';
import { makeIssuerKit, AmountMath, AssetKind } from '@agoric/ertp';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { details } from '@agoric/assert';

const contractPath = new URL('../src/contract.js', import.meta.url).pathname;

const setupCardsContract = async () => {
  const { zoeService } = makeZoeKit(makeFakeVatAdmin().admin);
  const feePurse = E(zoeService).makeFeePurse();
  const zoe = E(zoeService).bindDefaultFeePurse(feePurse);

  // pack the contract
  const bundle = await bundleSource(contractPath);

  // install the contract
  const installation = await E(zoe).install(bundle);

  // We also need to bundle and install the auctionItems contract
  const bundleUrl = await importMetaResolve(
    '../src/auctionItems.js',
    import.meta.url,
  );
  const bundlePath = new URL(bundleUrl).pathname;
  const auctionItemsBundle = await bundleSource(bundlePath);
  const auctionItemsInstallation = await E(zoe).install(auctionItemsBundle);

  const auctionBundleUrl = await importMetaResolve(
    '@agoric/zoe/src/contracts/auction/index.js',
    import.meta.url,
  );
  const auctionBundlePath = new URL(auctionBundleUrl).pathname;
  const auctionBundle = await bundleSource(auctionBundlePath);
  const auctionInstallation = await E(zoe).install(auctionBundle);

  const swapbundleUrl = await importMetaResolve(
    '../src/secondaryStore.js',
    import.meta.url,
  );
  const swapbundlePath = new URL(swapbundleUrl).pathname;
  const swapBundle = await bundleSource(swapbundlePath);
  const swapInstallation = await E(zoe).install(swapBundle);

  const swapWrapperBundleUrl = await importMetaResolve(
    '../src/secondaryStoreWrapper.js',
    import.meta.url,
  );
  const swapWrapperBundlePath = new URL(swapWrapperBundleUrl).pathname;
  const swapWrapperBundle = await bundleSource(swapWrapperBundlePath);
  const swapWrapperInstallation = await E(zoe).install(swapWrapperBundle);

  const timer = buildManualTimer(console.log);
  const contractTerms = harden({
    bidDuration: 1n,
    winnerPriceOption: 'first-price',
  });

  return {
    zoe,
    installation,
    auctionInstallation,
    auctionItemsInstallation,
    swapInstallation,
    swapWrapperInstallation,
    timer,
    contractTerms,
  };
};

test('zoe - sell baseball cards, secondary-store-wrapper', async (t) => {
  t.plan(2);
  // We'll use an imaginary currency "moola" as the money that we
  // require to buy baseball cards
  const {
    mint: moolaMint,
    issuer: moolaIssuer,
    brand: moolaBrand,
  } = makeIssuerKit('moola');

  const {
    issuer: cardIssuer,
    mint: cardMinter,
    brand: cardBrand,
  } = makeIssuerKit('baseball cards', AssetKind.SET);

  const {
    zoe,
    swapInstallation,
    swapWrapperInstallation,
  } = await setupCardsContract();

  const issuerKeywordRecord = harden({
    Items: cardIssuer,
    Money: moolaIssuer,
  });

  const swapWrapperTerms = harden({
    swapInstallation,
    cardMinter,
  });

  const { publicFacet } = await E(zoe).startInstance(
    swapWrapperInstallation,
    issuerKeywordRecord,
    swapWrapperTerms,
  );

  const cardDetail = {
    name: 'john doe',
    description: 'john doe card',
    price: 1n,
  };

  const cardAmount = AmountMath.make(cardBrand, harden([cardDetail]));
  const moolaAmount = AmountMath.make(moolaBrand, cardDetail.price);
  const sellerSeat = await E(publicFacet).getSellerSeat({
    cardDetail,
    sellingPrice: cardDetail.price,
  });

  const availabeOffers = await E(publicFacet).getAvailableOffers();
  const availableOffersValue = AmountMath.getValue(cardBrand, availabeOffers);

  const buyerExclusiveInvitation =
    availableOffersValue[0].BuyerExclusiveInvitation;

  const { instance } = await E(zoe).getInvitationDetails(
    buyerExclusiveInvitation,
  );
  const buyerIssuer = await E(zoe).getIssuers(instance);
  const buyerInvitationValue = await E(zoe).getInvitationDetails(
    buyerExclusiveInvitation,
  );

  t.log(buyerInvitationValue, 'buyerInvitationValue');
  t.log(buyerIssuer, 'buyerIssuer');
  assert(buyerIssuer.Items === cardIssuer, details`unexpected Items issuer`);
  assert(buyerIssuer.Money === moolaIssuer, details`unexpected Money issuer`);
  assert(
    AmountMath.isEqual(buyerInvitationValue.Items, cardAmount),
    details`wrong items`,
  );
  assert(
    AmountMath.isEqual(buyerInvitationValue.Money, moolaAmount),
    details`wrong money`,
  );

  const buyerProposal = harden({
    want: { Items: cardAmount },
    give: { Money: moolaAmount },
    exit: { onDemand: null },
  });

  const buyerPayment = moolaMint.mintPayment(moolaAmount);
  const buyerSeat = await E(zoe).offer(
    buyerExclusiveInvitation,
    buyerProposal,
    harden({ Money: buyerPayment }),
  );

  const sellerMoneyPayout = await sellerSeat.getPayout('Money');
  const moolaGainedAmount = await moolaIssuer.getAmountOf(sellerMoneyPayout);
  t.log(moolaGainedAmount, 'moolaGainedAmount');

  t.deepEqual(moolaGainedAmount, AmountMath.make(moolaBrand, cardDetail.price));

  const buyerItemsPayout = await buyerSeat.getPayout('Items');
  const buyerCardGain = await cardIssuer.getAmountOf(buyerItemsPayout);
  t.log(buyerCardGain, 'buyerCardGain');
  t.deepEqual(buyerCardGain, cardAmount);
});

test('zoe - sell baseball cards, secondary-store', async (t) => {
  t.plan(2);
  // We'll use an imaginary currency "moola" as the money that we
  // require to buy baseball cards
  const { zoe, swapInstallation } = await setupCardsContract();
  const {
    mint: moolaMint,
    issuer: moolaIssuer,
    brand: moolaBrand,
  } = makeIssuerKit('moola');

  const {
    issuer: cardIssuer,
    mint: cardMinter,
    brand: cardBrand,
  } = makeIssuerKit('baseball cards', AssetKind.SET);

  const issuerKeywordRecord = harden({
    Items: cardIssuer,
    Money: moolaIssuer,
  });

  const { creatorInvitation } = await E(zoe).startInstance(
    swapInstallation,
    issuerKeywordRecord,
  );
  const shouldBeInvitationMsg = `The swapAsset instance should return a creatorInvitation`;
  assert(creatorInvitation, shouldBeInvitationMsg);

  const cardDetail = {
    name: 'john doe',
    description: 'john doe card',
    price: 1n,
  };

  const cardAmount = AmountMath.make(cardBrand, harden([cardDetail]));
  const moolaAmount = AmountMath.make(moolaBrand, cardDetail.price);

  const Proposal = harden({
    give: { Items: cardAmount },
    want: { Money: moolaAmount },
  });

  const userCardPayment = E(cardMinter).mintPayment(cardAmount);
  const payment = harden({ Items: userCardPayment });

  const sellerSeat = await E(zoe).offer(creatorInvitation, Proposal, payment);

  const invitationP = await E(sellerSeat).getOfferResult();
  const { instance } = await E(zoe).getInvitationDetails(invitationP);
  const buyerIssuer = await E(zoe).getIssuers(instance);

  const invitationIssuer = await E(zoe).getInvitationIssuer();

  const buyerExclusiveInvitation = await E(invitationIssuer).claim(invitationP);
  const buyerInvitationValue = await E(zoe).getInvitationDetails(
    buyerExclusiveInvitation,
  );

  assert(buyerIssuer.Items === cardIssuer, details`unexpected Items issuer`);
  assert(buyerIssuer.Money === moolaIssuer, details`unexpected Money issuer`);
  assert(
    AmountMath.isEqual(buyerInvitationValue.Items, cardAmount),
    details`wrong items`,
  );
  assert(
    AmountMath.isEqual(buyerInvitationValue.Money, moolaAmount),
    details`wrong money`,
  );

  const buyerProposal = harden({
    want: { Items: cardAmount },
    give: { Money: moolaAmount },
    exit: { onDemand: null },
  });

  const buyerPayment = moolaMint.mintPayment(moolaAmount);
  const buyerSeat = await E(zoe).offer(
    buyerExclusiveInvitation,
    buyerProposal,
    harden({ Money: buyerPayment }),
  );

  const sellerMoneyPayout = await sellerSeat.getPayout('Money');
  const moolaGainedAmount = await moolaIssuer.getAmountOf(sellerMoneyPayout);
  t.log(moolaGainedAmount, 'moolaGainedAmount');

  t.deepEqual(moolaGainedAmount, AmountMath.make(moolaBrand, cardDetail.price));

  const buyerItemsPayout = await buyerSeat.getPayout('Items');
  const buyerCardGain = await cardIssuer.getAmountOf(buyerItemsPayout);
  t.log(buyerCardGain, 'buyerCardGain');
  t.deepEqual(buyerCardGain, cardAmount);
});

test('zoe - sell baseball cards, normal case', async (t) => {
  t.plan(5);
  // We'll use an imaginary currency "moola" as the money that we
  // require to buy baseball cards
  const {
    mint: moolaMint,
    issuer: moolaIssuer,
    brand: moolaBrand,
  } = makeIssuerKit('moola');

  const {
    zoe,
    installation,
    auctionInstallation,
    auctionItemsInstallation,
  } = await setupCardsContract();

  const timer = buildManualTimer(console.log);
  const contractTerms = harden({
    bidDuration: 1n,
    winnerPriceOption: 'first-price',
  });

  const { creatorFacet: baseballCardSellerFacet } = await E(zoe).startInstance(
    installation,
    undefined,
    contractTerms,
  );

  const allCardNames = harden(['Alice', 'Bob']);
  const moneyIssuer = moolaIssuer;
  const pricePerCard = AmountMath.make(moolaBrand, 10n);

  const {
    auctionItemsCreatorFacet,
    auctionItemsPublicFacet,
    auctionItemsInstance,
  } = await E(baseballCardSellerFacet).auctionCards(
    allCardNames,
    moneyIssuer,
    auctionInstallation,
    auctionItemsInstallation,
    pricePerCard,
    timer,
  );

  const cardIssuer = await E(baseballCardSellerFacet).getIssuer();
  const cardBrand = await cardIssuer.getBrand();

  const makeCardMath = (value) => AmountMath.make(cardBrand, harden(value));

  const cardsForSale = await E(auctionItemsPublicFacet).getAvailableItems();
  t.deepEqual(cardsForSale, makeCardMath(['Alice', 'Bob']));

  const terms = await E(zoe).getTerms(auctionItemsInstance);

  // make the corresponding amount
  const bobCardAmount = makeCardMath(['Bob']);

  // Bob buys his own baseball card
  const bobInvitation = await E(
    auctionItemsPublicFacet,
  ).makeBidInvitationForKey('Bob');

  const bobProposal = harden({
    give: { Bid: terms.minimalBid },
    want: { Asset: bobCardAmount },
  });

  const bobPaymentKeywordRecord = harden({
    Bid: moolaMint.mintPayment(AmountMath.make(moolaBrand, 10n)),
  });

  // timer ticks before offering, nothing happens
  timer.tick();

  const bobSeat = await E(zoe).offer(
    bobInvitation,
    bobProposal,
    bobPaymentKeywordRecord,
  );

  // Carol also want bob's card
  const carolInvitation = await E(
    auctionItemsPublicFacet,
  ).makeBidInvitationForKey('Bob');

  const carolProposal = harden({
    give: { Bid: AmountMath.make(moolaBrand, 20n) },
    want: { Asset: bobCardAmount },
  });

  const carolPaymentKeywordRecord = harden({
    Bid: moolaMint.mintPayment(AmountMath.make(moolaBrand, 20n)),
  });

  const carolSeat = await E(zoe).offer(
    carolInvitation,
    carolProposal,
    carolPaymentKeywordRecord,
  );

  timer.tick();

  const bobCardPayout = await E(bobSeat).getPayout('Asset');

  const bobObtained = await E(cardIssuer).getAmountOf(bobCardPayout);

  t.truthy(AmountMath.isEmpty(bobObtained), 'Bob lose the auction, no card');

  const carolCardPayout = await E(carolSeat).getPayout('Asset');
  const carolObtained = await E(cardIssuer).getAmountOf(carolCardPayout);

  t.deepEqual(
    carolObtained,
    makeCardMath(['Bob']),
    'Carol own Bob baseball card!',
  );

  // That's enough selling for now, let's take our inventory back

  const withdrawInvitation = await E(
    auctionItemsCreatorFacet,
  ).makeWithdrawInvitation();

  const auctionItemsCreatorSeat = await E(zoe).offer(withdrawInvitation);

  await E(auctionItemsCreatorSeat).getOfferResult();

  const moneyPayment = await E(auctionItemsCreatorSeat).getPayout('Money');
  const moneyEarned = await E(moolaIssuer).getAmountOf(moneyPayment);
  t.deepEqual(moneyEarned, AmountMath.make(moolaBrand, 20n));

  const cardInventory = await E(auctionItemsCreatorSeat).getPayout('Items');
  const inventoryRemaining = await E(cardIssuer).getAmountOf(cardInventory);
  t.deepEqual(inventoryRemaining, makeCardMath(['Alice']));
});

test('zoe - after a failed auction session, key should be available for new one', async (t) => {
  t.plan(6);
  // We'll use an imaginary currency "moola" as the money that we
  // require to buy baseball cards
  const {
    mint: moolaMint,
    issuer: moolaIssuer,
    brand: moolaBrand,
  } = makeIssuerKit('moola');

  const {
    zoe,
    installation,
    auctionInstallation,
    auctionItemsInstallation,
  } = await setupCardsContract();

  const timer = buildManualTimer(console.log);
  const contractTerms = harden({
    bidDuration: 1n,
    winnerPriceOption: 'first-price',
  });

  const { creatorFacet: baseballCardSellerFacet } = await E(zoe).startInstance(
    installation,
    undefined,
    contractTerms,
  );

  const allCardNames = harden(['Alice', 'Bob']);
  const moneyIssuer = moolaIssuer;
  const pricePerCard = AmountMath.make(moolaBrand, 10n);

  const {
    auctionItemsCreatorFacet,
    auctionItemsPublicFacet,
    auctionItemsInstance,
  } = await E(baseballCardSellerFacet).auctionCards(
    allCardNames,
    moneyIssuer,
    auctionInstallation,
    auctionItemsInstallation,
    pricePerCard,
    timer,
  );

  const cardIssuer = await E(baseballCardSellerFacet).getIssuer();
  const cardBrand = await cardIssuer.getBrand();

  const makeCardMath = (value) => AmountMath.make(cardBrand, harden(value));

  const cardsForSale = await E(auctionItemsPublicFacet).getAvailableItems();
  t.deepEqual(cardsForSale, makeCardMath(['Alice', 'Bob']));

  const terms = await E(zoe).getTerms(auctionItemsInstance);

  // make the corresponding amount
  const bobCardAmount = makeCardMath(['Bob']);

  // Bob buys his own baseball card
  const bobInvitation = await E(
    auctionItemsPublicFacet,
  ).makeBidInvitationForKey('Bob');

  const bobProposal = harden({
    give: { Bid: terms.minimalBid },
    want: { Asset: bobCardAmount },
  });

  const bobPaymentKeywordRecord = harden({
    Bid: moolaMint.mintPayment(AmountMath.make(moolaBrand, 10n)),
  });

  // timer ticks before offering, nothing happens
  timer.tick();

  const bobSeat = await E(zoe).offer(
    bobInvitation,
    bobProposal,
    bobPaymentKeywordRecord,
  );

  await E(bobSeat).getOfferResult();

  // all bidders exit now
  await E(bobSeat).tryExit();

  // auction closed?
  timer.tick();

  const bobCardPayout = await E(bobSeat).getPayout('Asset');

  const bobObtained = await E(cardIssuer).getAmountOf(bobCardPayout);
  t.truthy(AmountMath.isEmpty(bobObtained), 'Bob exit the auction, no card');

  const bobMoneyPayout = await E(bobSeat).getPayout('Bid');
  const bobObtainedMoney = await E(moolaIssuer).getAmountOf(bobMoneyPayout);

  t.deepEqual(
    bobObtainedMoney,
    AmountMath.make(moolaBrand, 10n),
    'Bob get back his money',
  );

  const auctionCompletedP = await E(
    auctionItemsPublicFacet,
  ).getCompletedPromiseForKey('Bob');

  // XXX wait for payment deposited, to make sure old session cleared
  // In real life, carol may get an exception for session closed because of race-condition
  await auctionCompletedP;

  // Carol also want bob's card
  const carolInvitation = await E(
    auctionItemsPublicFacet,
  ).makeBidInvitationForKey('Bob');

  const carolProposal = harden({
    give: { Bid: AmountMath.make(moolaBrand, 20n) },
    want: { Asset: bobCardAmount },
  });

  const carolPaymentKeywordRecord = harden({
    Bid: moolaMint.mintPayment(AmountMath.make(moolaBrand, 20n)),
  });

  const carolSeat = await E(zoe).offer(
    carolInvitation,
    carolProposal,
    carolPaymentKeywordRecord,
  );

  await E(carolSeat).getOfferResult();

  // next tick, session will be completed
  timer.tick();

  const carolCardPayout = await E(carolSeat).getPayout('Asset');
  const carolObtained = await E(cardIssuer).getAmountOf(carolCardPayout);

  t.deepEqual(
    carolObtained,
    makeCardMath(['Bob']),
    'Carol own Bob baseball card!',
  );

  // That's enough selling for now, let's take our inventory back
  const withdrawInvitation = await E(
    auctionItemsCreatorFacet,
  ).makeWithdrawInvitation();

  const auctionItemsCreatorSeat = await E(zoe).offer(withdrawInvitation);

  await E(auctionItemsCreatorSeat).getOfferResult();

  const moneyPayment = await E(auctionItemsCreatorSeat).getPayout('Money');
  const moneyEarned = await E(moolaIssuer).getAmountOf(moneyPayment);
  t.deepEqual(moneyEarned, AmountMath.make(moolaBrand, 20n));

  const cardInventory = await E(auctionItemsCreatorSeat).getPayout('Items');
  const inventoryRemaining = await E(cardIssuer).getAmountOf(cardInventory);
  t.deepEqual(inventoryRemaining, makeCardMath(['Alice']));
});
