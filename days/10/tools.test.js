const { pgcd } = require('./tools');

describe('pgcd', () => {
  it.each`
    a        | b        | result
    ${2}     | ${2}     | ${2}
    ${2}     | ${3}     | ${1}
    ${2}     | ${4}     | ${2}
    ${2}     | ${5}     | ${1}
    ${10}    | ${11}    | ${1}
    ${2 * 5} | ${5 * 3} | ${5}
  `('($a, $b ) = $result', ({ a, b, result }) => {
    expect(pgcd(a, b)).toBe(result);
  });
});
