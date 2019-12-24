const T = require('taninsam');
const day = 24;
const parse = require('./in');
const read = require('../../utils/read');

const { startRecursive, nextRecursive, countBugs } = require('./tools');

const solve = input =>
  T.chain(input)
    .chain(startRecursive())
    .chain(T.loopFor(10, nextRecursive()))
    .chain(countBugs())
    .value();

describe('24-2', () => {
  it.each`
    sample | expected
    ${1}   | ${99}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });
});
