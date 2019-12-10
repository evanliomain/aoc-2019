const day = 10;
const parse = require('./in');
const solve = require('./level1');
const read = require('../../utils/read');

describe('10-1', () => {
  it.each`
    sample | expected
    ${1}   | ${8}
    ${2}   | ${33}
    ${3}   | ${35}
    ${4}   | ${41}
    ${5}   | ${210}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
