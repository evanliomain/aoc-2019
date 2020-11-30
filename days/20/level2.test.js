const day = 20;
const parse = require('./in');
const solve = require('./level2');
const read = require('../../utils/read');

describe('20-2', () => {
  it.each`
    sample | expected
    ${1}   | ${26}
    ${3}   | ${396}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
