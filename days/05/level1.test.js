const { runInstruction, parseOpcode } = require('./tools');

describe('05-1', () => {
  describe('runInstruction', () => {
    it('opcode 3', () => {
      expect(
        runInstruction({
          program: [3, 0, 4, 0, 99],
          instructionPointer: 0,
          input: 1
        })
      ).toEqual({
        program: [1, 0, 4, 0, 99],
        instructionPointer: 2,
        halt: false
      });
    });
    it('opcode 4', () => {
      expect(
        runInstruction({
          program: [1, 0, 4, 0, 99],
          instructionPointer: 2,
          input: 1
        })
      ).toEqual({
        program: [1, 0, 4, 0, 99],
        instructionPointer: 4,
        output: 1,
        halt: false
      });
    });
    it('opcode 99', () => {
      expect(
        runInstruction({
          program: [1, 0, 4, 0, 99],
          instructionPointer: 4,
          input: 1,
          output: 1
        })
      ).toEqual({
        program: [1, 0, 4, 0, 99],
        instructionPointer: 4,
        output: 1,
        halt: true
      });
    });

    it('opcode 1 position mode', () => {
      expect(
        runInstruction({
          program: [1, 0, 2, 1],
          instructionPointer: 0
        })
      ).toEqual({
        program: [1, 3, 2, 1],
        instructionPointer: 4,
        halt: false
      });
    });
    it('opcode 1 value mode', () => {
      expect(
        runInstruction({
          program: [1101, 3, 4, 1],
          instructionPointer: 0
        })
      ).toEqual({
        program: [1101, 7, 4, 1],
        instructionPointer: 4,
        halt: false
      });
    });
  });

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
});
