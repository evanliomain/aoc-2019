const {
  twoAdjacentMatchingDigitsAreNotPartOfALargerGroupOfMatchingDigits
} = require('./tools');

describe('04-2', () => {
  describe('twoAdjacentMatchingDigitsAreNotPartOfALargerGroupOfMatchingDigits', () => {
    it.each`
      sample    | expected
      ${112233} | ${true}
      ${123444} | ${false}
      ${124443} | ${false}
      ${144423} | ${false}
      ${444123} | ${false}
      ${111122} | ${true}
      ${111112} | ${false}
      ${211111} | ${false}
      ${211112} | ${false}
      ${221111} | ${true}
      ${112211} | ${true}
      ${111211} | ${true}
      ${221115} | ${true}
      ${221111} | ${true}
      ${122111} | ${true}
      ${112211} | ${true}
      ${111221} | ${true}
      ${111122} | ${true}
    `('returns $expected for sample $sample', ({ sample, expected }) => {
      expect(
        twoAdjacentMatchingDigitsAreNotPartOfALargerGroupOfMatchingDigits(
          sample
        )
      ).toEqual(expected);
    });
  });
});
