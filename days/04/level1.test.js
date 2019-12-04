const { digitsNeverDecrease, twoAdjacentDigitsAreTheSame } = require('./tools');

describe('04-1', () => {
  describe('digitsNeverDecrease', () => {
    it.each`
      sample    | expected
      ${111111} | ${true}
      ${223450} | ${false}
      ${123789} | ${true}
      ${123156} | ${false}
    `('returns $expected for sample $sample', ({ sample, expected }) => {
      expect(digitsNeverDecrease(sample)).toEqual(expected);
    });
  });
  describe('twoAdjacentDigitsAreTheSame', () => {
    it.each`
      sample    | expected
      ${111111} | ${true}
      ${223450} | ${true}
      ${123789} | ${false}
      ${123156} | ${false}
    `('returns $expected for sample $sample', ({ sample, expected }) => {
      expect(twoAdjacentDigitsAreTheSame(sample)).toEqual(expected);
    });
  });
});
