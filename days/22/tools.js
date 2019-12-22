const T = require('taninsam');
const bigintCryptoUtils = require('bigint-crypto-utils');

const SHUFFLE_TECHNIQUE = {
  DEAL_INTO_NEW_STACK: 'deal into new stack',
  CUT: 'cut',
  DEAL_WITH_INCREMENT: 'deal with increment'
};

module.exports = {
  SHUFFLE_TECHNIQUE,
  factoryDeck,
  shuffle,
  dealIntoNewStack,
  cut,
  dealWithIncrement,
  shuffles,
  reverseShufflesAB,
  pow,
  modinv,
  mod,
  bigIntToInt
};

/**
 * For part 1
 */

function factoryDeck(n) {
  return T.chain(0)
    .chain(T.arrayFromValue(n))
    .chain(T.map((_, i) => i))
    .value();
}

function shuffles(shuffleTechniques) {
  return deck => T.reduce(shuffle, deck)(shuffleTechniques);
}

function shuffle(deck, shuffleTechnique) {
  switch (shuffleTechnique.type) {
    case SHUFFLE_TECHNIQUE.DEAL_INTO_NEW_STACK:
      return dealIntoNewStack()(deck);
    case SHUFFLE_TECHNIQUE.CUT:
      return cut(shuffleTechnique.n)(deck);
    case SHUFFLE_TECHNIQUE.DEAL_WITH_INCREMENT:
      return dealWithIncrement(shuffleTechnique.n)(deck);
  }
  throw new Error(`Unknown technique ${shuffleTechnique.type}`);
}

function dealIntoNewStack() {
  return T.reverse();
}
function cut(n) {
  return deck =>
    T.chain(deck)
      .chain(x => x.slice())
      .chain(x => {
        if (0 < n) {
          const leftOver = x.splice(0, n);
          return [...x, ...leftOver];
        }
        if (n < 0) {
          const leftOver = x.splice(x.length + n, Math.abs(n));
          return [...leftOver, ...x];
        }
        return x;
      })
      .value();
}
function dealWithIncrement(n) {
  return deck => {
    const deckMap = {};
    for (let count = 0; count < deck.length; count++) {
      const newPosition = (count * n) % deck.length;
      deckMap[newPosition] = deck[count];
    }

    return T.chain(deckMap)
      .chain(T.entries())
      .chain(T.map(([key, value]) => [parseInt(key, 10), value]))
      .chain(T.sortBy(([key]) => key))
      .chain(T.map(([key, value]) => value))
      .value();
  };
}

/**
 * For part 2
 */

function reverseShufflesAB(D) {
  return shuffleTechniques => ([a, b]) =>
    T.chain(shuffleTechniques)
      .chain(T.reverse())
      .chain(T.reduce(reverseShuffleAB(D), [a, b]))
      .value();
}

function reverseShuffleAB(D) {
  return ([a, b], shuffleTechnique) => {
    switch (shuffleTechnique.type) {
      case SHUFFLE_TECHNIQUE.DEAL_INTO_NEW_STACK:
        return reverseDealIntoNewStackAB(D)([a, b]);
      case SHUFFLE_TECHNIQUE.CUT:
        return reverseCutAB()([a, b], BigInt(shuffleTechnique.n));
      case SHUFFLE_TECHNIQUE.DEAL_WITH_INCREMENT:
        return reverseDealWithIncrementAB(D)(
          [a, b],
          BigInt(shuffleTechnique.n)
        );
    }
    throw new Error(`Unknown technique ${shuffleTechnique.type}`);
  };
}

function reverseDealIntoNewStackAB(D) {
  return ([a, b]) => [-a, -b + D - BigInt(1)];
}
function reverseCutAB() {
  return ([a, b], n) => [a, b + n];
}
function reverseDealWithIncrementAB(D) {
  return ([a, b], n) => {
    const m = modinv(n, D);
    return [mod(a * m, D), mod(b * m, D)];
  };
}

function mod(a, m) {
  return bigintCryptoUtils.modPow(BigInt(a), BigInt(1), BigInt(m));
}

function modinv(a, m) {
  return bigintCryptoUtils.modInv(BigInt(a), BigInt(m));
}

function pow(x, y, m = 1) {
  return bigintCryptoUtils.modPow(BigInt(x), BigInt(y), BigInt(m));
}

function bigIntToInt(bigInt) {
  return parseInt(bigInt.toString(), 10);
}
