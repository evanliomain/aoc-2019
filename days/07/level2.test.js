const day = 7;
const parse = require('./in');
const solve = require('./level2');
const read = require('../../utils/read');

describe('07-2', () => {
  it.each`
    sample | expected
    ${4}   | ${139629729}
    ${5}   | ${18216}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
