const { parseOpcode } = require('./parse-opcode');

describe('parseOpcode', () => {
  it.each`
    opcode  | expected
    ${1}    | ${[1]}
    ${2}    | ${[2]}
    ${3}    | ${[3]}
    ${4}    | ${[4]}
    ${99}   | ${[99]}
    ${101}  | ${[1, 1]}
    ${1001} | ${[1, 0, 1]}
  `('for $opcode returns $expected', ({ opcode, expected }) => {
    expect(parseOpcode(opcode)).toEqual(expected);
  });
});
