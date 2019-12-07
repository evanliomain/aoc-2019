const day = 7;
const parse = require('./in');
const solve = require('./level1');
const read = require('../../utils/read');

describe('07-1', () => {
  it.each`
    sample | expected
    ${1}   | ${43210}
    ${2}   | ${54321}
    ${3}   | ${65210}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
