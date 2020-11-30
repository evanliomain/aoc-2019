const day = 20;
const parse = require('./in');
const solve = require('./level1');
const read = require('../../utils/read');

describe('20-1', () => {
  it.each`
    sample | expected
    ${1}   | ${23}
    ${2}   | ${58}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
