const day = 9;
const parse = require('./in');
const solve = require('./level1');
const read = require('../../utils/read');

describe('09-1', () => {
  it.skip.each`
    sample | expected
    ${1}   | ${'TODO'}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
