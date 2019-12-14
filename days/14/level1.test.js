const day = 14;
const parse = require('./in');
const solve = require('./level1');
const read = require('../../utils/read');

describe('14-1', () => {
  it.each`
    sample | expected
    ${1}   | ${31}
    ${2}   | ${165}
    ${3}   | ${13312}
    ${4}   | ${180697}
    ${5}   | ${2210736}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
