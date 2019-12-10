const day = 10;
const parse = require('./in');
const solve = require('./level2');
const read = require('../../utils/read');

describe('10-2', () => {
  it.each`
    sample | expected
    ${5}   | ${802}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
