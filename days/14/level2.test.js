const day = 14;
const parse = require('./in');
const solve = require('./level2');
const read = require('../../utils/read');

describe('14-2', () => {
  it.each`
    sample | expected
    ${3}   | ${82892753}
    ${4}   | ${5586022}
    ${5}   | ${460664}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
