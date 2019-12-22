const T = require('taninsam');

const day = 22;
const parse = require('./in');
const read = require('../../utils/read');
const {
  dealIntoNewStack,
  cut,
  dealWithIncrement,
  factoryDeck,
  shuffle,
  shuffles,
  pow,
  powRec,
  modinv
} = require('./tools');

describe('22-tools', () => {
  it.each`
    sample | expected
    ${1}   | ${[0, 3, 6, 9, 2, 5, 8, 1, 4, 7]}
    ${2}   | ${[3, 0, 7, 4, 1, 8, 5, 2, 9, 6]}
    ${3}   | ${[6, 3, 0, 7, 4, 1, 8, 5, 2, 9]}
    ${4}   | ${[9, 2, 5, 8, 1, 4, 7, 0, 3, 6]}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    const shuffleTechniques = T.chain(sample)
      .chain(read(day))
      .chain(parse)
      .value();
    expect(
      T.chain(factoryDeck(10))
        .chain(shuffles(shuffleTechniques))
        .value()
    ).toEqual(expected);
  });

  describe('factoryDeck', () => {
    it('get a brand new deck', () => {
      expect(T.chain(factoryDeck(10)).value()).toEqual([
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
      ]);
    });
  });

  describe('dealIntoNewStack', () => {
    it('reverse the deck', () => {
      expect(
        T.chain(factoryDeck(10))
          .chain(dealIntoNewStack())
          .value()
      ).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
    });
  });
  describe('cut', () => {
    it('cut the deck start top', () => {
      expect(
        T.chain(factoryDeck(10))
          .chain(cut(3))
          .value()
      ).toEqual([3, 4, 5, 6, 7, 8, 9, 0, 1, 2]);
    });
    it('cut the deck starting bottom', () => {
      expect(
        T.chain(factoryDeck(10))
          .chain(cut(-4))
          .value()
      ).toEqual([6, 7, 8, 9, 0, 1, 2, 3, 4, 5]);
    });
  });
  describe('dealWithIncrement', () => {
    it('apply increment technique on the deck', () => {
      expect(
        T.chain(factoryDeck(10))
          .chain(dealWithIncrement(3))
          .value()
      ).toEqual([0, 7, 4, 1, 8, 5, 2, 9, 6, 3]);
    });
  });

  describe('pow', () => {
    it.each`
      a      | b     | m      | expected
      ${2}   | ${3}  | ${3}   | ${2}
      ${3}   | ${4}  | ${2}   | ${1}
      ${40}  | ${50} | ${120} | ${40}
      ${-40} | ${51} | ${120} | ${80}
    `('$a^$b % $m === $expected', ({ a, b, m, expected }) => {
      expect(pow(a, b, m)).toBe(BigInt(expected));
    });
  });

  describe('modinv', () => {
    it.each`
      a     | m                  | expected
      ${36} | ${119315717514047} | ${43086231324517}
      ${40} | ${119315717514047} | ${50709179943470}
    `('modinv($a, $m) === $expected', ({ a, m, expected }) => {
      expect(modinv(a, m)).toEqual(BigInt(expected));
    });
  });
});
