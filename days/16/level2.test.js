const day = 16;
const parse = require('./in');
const solve = require('./level2');
const read = require('../../utils/read');

const { extract8Digit, getMessage, repeated } = require('./tools');

describe('16-2', () => {
  it.each`
    sample | expected
    ${4}   | ${'84462026'}
    ${5}   | ${'78725270'}
    ${6}   | ${'53553731'}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });

  it.each`
    sample | expected
    ${4}   | ${303673}
    ${5}   | ${293510}
    ${6}   | ${308177}
  `('getMessage for sample $sample to be $expected', ({ sample, expected }) => {
    expect(getMessage(parse(read(day)(sample)))).toEqual(expected);
  });

  describe('extract8Digit', () => {
    it('98765432109876543210 and message 7', () => {
      expect(
        extract8Digit(7)([
          '9',
          '8',
          '7',
          '6',
          '5',
          '4',
          '3',
          '2',
          '1',
          '0',
          '9',
          '8',
          '7',
          '6',
          '5',
          '4',
          '3',
          '2',
          '1',
          '0'
        ]).join('')
      ).toBe('21098765');
    });
  });

  describe('repeated', () => {
    it('3', () => {
      expect(repeated(3)([1, 2, 3])).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
    });
  });
});
