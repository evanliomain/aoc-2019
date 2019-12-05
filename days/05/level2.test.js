const { runInstruction } = require('./tools');

describe('05-2', () => {
  describe('runInstruction', () => {
    describe('opcode 5', () => {
      it('1', () => {
        expect(
          runInstruction({
            program: [1105, 0, 10],
            instructionPointer: 0,
            input: 1
          })
        ).toEqual({
          program: [1105, 0, 10],
          instructionPointer: 3,
          halt: false
        });
      });
      it('0', () => {
        expect(
          runInstruction({
            program: [1105, 1, 10],
            instructionPointer: 0,
            input: 1
          })
        ).toEqual({
          program: [1105, 1, 10],
          instructionPointer: 10,
          halt: false
        });
      });
    });

    describe('opcode 6', () => {
      it('1', () => {
        expect(
          runInstruction({
            program: [1106, 0, 10],
            instructionPointer: 0,
            input: 1
          })
        ).toEqual({
          program: [1106, 0, 10],
          instructionPointer: 10,
          halt: false
        });
      });
      it('0', () => {
        expect(
          runInstruction({
            program: [1106, 1, 10],
            instructionPointer: 0,
            input: 1
          })
        ).toEqual({
          program: [1106, 1, 10],
          instructionPointer: 3,
          halt: false
        });
      });
    });

    describe('opcode 7', () => {
      it('1', () => {
        expect(
          runInstruction({
            program: [1107, 0, 2, 0],
            instructionPointer: 0,
            input: 1
          })
        ).toEqual({
          program: [1, 0, 2, 0],
          instructionPointer: 4,
          halt: false
        });
      });
      it('0', () => {
        expect(
          runInstruction({
            program: [1107, 2, 0, 0],
            instructionPointer: 0,
            input: 1
          })
        ).toEqual({
          program: [0, 2, 0, 0],
          instructionPointer: 4,
          halt: false
        });
      });
    });

    describe('opcode 8', () => {
      it('1', () => {
        expect(
          runInstruction({
            program: [1108, 2, 2, 0],
            instructionPointer: 0,
            input: 1
          })
        ).toEqual({
          program: [1, 2, 2, 0],
          instructionPointer: 4,
          halt: false
        });
      });
      it('0', () => {
        expect(
          runInstruction({
            program: [1108, 2, 0, 0],
            instructionPointer: 0,
            input: 1
          })
        ).toEqual({
          program: [0, 2, 0, 0],
          instructionPointer: 4,
          halt: false
        });
      });
    });
  });
});
