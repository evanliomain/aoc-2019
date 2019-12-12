const day = 12;
const parse = require('./in');
const solve = require('./level2');
const read = require('../../utils/read');

describe('12-2', () => {
  it.each`
    sample | expected
    ${1}   | ${2772}
    ${2}   | ${4686774924}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
