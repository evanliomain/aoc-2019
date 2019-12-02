const day = 2;
const parse = require('./in');
const { run } = require('./tools');
const read = require('../../utils/read');

describe('02-1', () => {
  it.each`
    sample | expected
    ${1}   | ${3500}
    ${2}   | ${2}
    ${3}   | ${2}
    ${4}   | ${2}
    ${5}   | ${30}
  `('returns $expected for sample $sample', ({ sample, expected }) => {
    expect(run(parse(read(day)(sample)))).toEqual(expected);
  });
});
