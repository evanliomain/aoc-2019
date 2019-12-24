const T = require('taninsam');
const day = 24;
const parse = require('./in');
const solve = require('./level1');
const read = require('../../utils/read');

const { nextGeneration, hash } = require('./tools');

describe.skip('24-1', () => {
  it.each`
    sample | expected
    ${1}   | ${2129920}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(solve(parse(read(day)(sample)))).toEqual(expected);
  });

  it('nextGeneration', () => {
    expect(
      T.chain(parse(read(day)(1)))
        .chain(nextGeneration())
        .chain(hash())
        .value()
    ).toBe(
      T.chain(parse(read(day)(2)))
        .chain(hash())
        .value()
    );
  });
});
