const day = 16;
const parse = require('./in');
const solve = require('./level1');
const read = require('../../utils/read');
const T = require('taninsam');

const { nextPhase, getPattern } = require('./tools');

describe('16-1', () => {
  it.each`
    sample | expected
    ${1}   | ${'24176176'}
    ${2}   | ${'73745418'}
    ${3}   | ${'52432133'}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });

  describe('nextPhase', () => {
    it('1', () => {
      expect(
        T.chain([1, 2, 3, 4, 5, 6, 7, 8])
          .chain(nextPhase)
          .chain(T.join(''))
          .value()
      ).toBe('48226158');
    });
    it('2', () => {
      expect(
        T.chain([1, 2, 3, 4, 5, 6, 7, 8])
          .chain(nextPhase)
          .chain(nextPhase)
          .chain(T.join(''))
          .value()
      ).toBe('34040438');
    });
    it('3', () => {
      expect(
        T.chain([1, 2, 3, 4, 5, 6, 7, 8])
          .chain(nextPhase)
          .chain(nextPhase)
          .chain(nextPhase)
          .chain(T.join(''))
          .value()
      ).toBe('03415518');
    });
    it('4', () => {
      expect(
        T.chain([1, 2, 3, 4, 5, 6, 7, 8])
          .chain(nextPhase)
          .chain(nextPhase)
          .chain(nextPhase)
          .chain(nextPhase)
          .chain(T.join(''))
          .value()
      ).toBe('01029498');
    });
  });

  describe('getPattern', () => {
    it('1', () => {
      expect(getPattern(1)).toEqual([0, 1, 0, -1]);
    });
    it('2', () => {
      expect(getPattern(2)).toEqual([0, 0, 1, 1, 0, 0, -1, -1]);
    });
    it('3', () => {
      expect(getPattern(3)).toEqual([0, 0, 0, 1, 1, 1, 0, 0, 0, -1, -1, -1]);
    });
  });
});
