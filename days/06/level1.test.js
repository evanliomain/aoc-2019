const day = 6;
const parse = require('./in');
const solve = require('./level1');
const read = require('../../utils/read');

describe('06-1', () => {
  it.each`
    sample | expected
    ${1}   | ${42}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
