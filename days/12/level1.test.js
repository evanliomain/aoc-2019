const day = 12;
const parse = require('./in');
const solve = require('./level1');
const read = require('../../utils/read');
const { energyAfter } = require('./tools');

describe('12-1', () => {
  it.each`
    sample | step   | expected
    ${1}   | ${10}  | ${179}
    ${2}   | ${100} | ${1940}
  `(
    'returns $expected for sample $sample and $step steps',
    ({ sample, step, expected }) => {
      expect(energyAfter(step)(parse(read(day)(sample)))).toEqual(expected);
    }
  );
});
