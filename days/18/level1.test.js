const day = 18;
const parse = require('./in');
const solve = require('./level1');
const read = require('../../utils/read');

describe('18-1', () => {
  it.each`
    sample | expected
    ${1}   | ${8}
    ${2}   | ${86}
    ${3}   | ${132}
    ${4}   | ${136}
    ${5}   | ${81}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
