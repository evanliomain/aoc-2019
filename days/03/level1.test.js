const day = 3;
const parse = require('./in');
const solve = require('./level1');
const read = require('../../utils/read');

describe('03-1', () => {
  it.each`
    sample | expected
    ${1}   | ${159}
    ${2}   | ${135}
    ${3}   | ${6}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
