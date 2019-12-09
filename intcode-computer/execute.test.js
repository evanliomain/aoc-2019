const { execute } = require('./execute');

describe('execute', () => {
  it.each`
    program                                       | expected
    ${[1, 9, 10, 3, 2, 3, 11, 0, 99, 30, 40, 50]} | ${3500}
    ${[1, 0, 0, 0, 99]}                           | ${2}
    ${[2, 3, 0, 3, 99]}                           | ${2}
    ${[2, 4, 4, 5, 99, 0]}                        | ${2}
    ${[1, 1, 1, 4, 99, 5, 6, 0, 99]}              | ${30}
  `('returns $expected for program $program', ({ program, expected }) => {
    expect(execute(program).program[0]).toEqual(expected);
  });

  it.each`
    program                                       | expectedOutput
    ${[104, 1125899906842624, 99]}                | ${1125899906842624}
    ${[1102, 34915192, 34915192, 7, 4, 7, 99, 0]} | ${1219070632396864}
  `(
    'returns $expectedOutput for program $program',
    ({ program, expectedOutput }) => {
      expect(execute(program).output).toEqual(expectedOutput);
    }
  );

  it('copy the program', () => {
    const copyProgram = [
      109,
      1,
      204,
      -1,
      1001,
      100,
      1,
      100,
      1008,
      100,
      16,
      101,
      1006,
      101,
      0,
      99
    ];
    expect(
      execute(copyProgram, 1, 0, { debug: false, runUntilHalt: true }).output
    ).toEqual(copyProgram);
  });

  it('opcode 3', () => {
    expect(execute([3, 0, 4, 0, 99], 1)).toMatchInlineSnapshot(`
      Object {
        "halt": false,
        "input": Array [],
        "instructionPointer": 4,
        "output": 1,
        "program": Array [
          1,
          0,
          4,
          0,
          99,
        ],
        "relativeBase": 0,
      }
    `);
    expect(execute([109, 6, 203, 1, 204, 1, 99, 0], 1)).toMatchInlineSnapshot(`
      Object {
        "halt": false,
        "input": Array [],
        "instructionPointer": 6,
        "output": 1,
        "program": Array [
          109,
          6,
          203,
          1,
          204,
          1,
          99,
          1,
        ],
        "relativeBase": 6,
      }
    `);
  });
  it('opcode 4', () => {
    expect(execute([1, 0, 4, 0, 99], 1, 2)).toMatchInlineSnapshot(`
      Object {
        "halt": false,
        "input": Array [
          1,
        ],
        "instructionPointer": 4,
        "output": 1,
        "program": Array [
          1,
          0,
          4,
          0,
          99,
        ],
        "relativeBase": 0,
      }
    `);
    expect(execute([109, 4, 204, 1, 99, 200])).toMatchInlineSnapshot(`
      Object {
        "halt": false,
        "input": Array [
          undefined,
        ],
        "instructionPointer": 4,
        "output": 200,
        "program": Array [
          109,
          4,
          204,
          1,
          99,
          200,
        ],
        "relativeBase": 4,
      }
    `);
  });
  it('opcode 99', () => {
    expect(execute([1, 0, 4, 0, 99], 1, 4)).toMatchInlineSnapshot(`
      Object {
        "halt": true,
        "input": Array [
          1,
        ],
        "instructionPointer": 4,
        "output": undefined,
        "program": Array [
          1,
          0,
          4,
          0,
          99,
        ],
        "relativeBase": 0,
      }
    `);
  });
  describe('opcode 1', () => {
    it('position mode', () => {
      expect(execute([1, 0, 2, 1, 99])).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            undefined,
          ],
          "instructionPointer": 4,
          "output": undefined,
          "program": Array [
            1,
            3,
            2,
            1,
            99,
          ],
          "relativeBase": 0,
        }
      `);
    });
    it('value mode', () => {
      expect(execute([1101, 3, 4, 1, 99])).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            undefined,
          ],
          "instructionPointer": 4,
          "output": undefined,
          "program": Array [
            1101,
            7,
            4,
            1,
            99,
          ],
          "relativeBase": 0,
        }
      `);
    });
    it('relative mode', () => {
      expect(execute([109, 1, 2101, 3, 0, 7, 99, 0])).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            undefined,
          ],
          "instructionPointer": 6,
          "output": undefined,
          "program": Array [
            109,
            1,
            2101,
            3,
            0,
            7,
            99,
            4,
          ],
          "relativeBase": 1,
        }
      `);
    });

    it('write on relative position', () => {
      expect(execute([109, 6, 21101, 2, 1, 1, 99, 404])).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            undefined,
          ],
          "instructionPointer": 6,
          "output": undefined,
          "program": Array [
            109,
            6,
            21101,
            2,
            1,
            1,
            99,
            3,
          ],
          "relativeBase": 6,
        }
      `);
    });
  });
  describe('opcode 5', () => {
    it('1', () => {
      expect(execute([1105, 0, 10, 99], 1)).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            1,
          ],
          "instructionPointer": 3,
          "output": undefined,
          "program": Array [
            1105,
            0,
            10,
            99,
          ],
          "relativeBase": 0,
        }
      `);
    });
    it('0', () => {
      expect(execute([1105, 1, 6, 0, 0, 0, 99], 1)).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            1,
          ],
          "instructionPointer": 6,
          "output": undefined,
          "program": Array [
            1105,
            1,
            6,
            0,
            0,
            0,
            99,
          ],
          "relativeBase": 0,
        }
      `);
    });
  });

  describe('opcode 6', () => {
    it('1', () => {
      expect(execute([1106, 0, 6, 0, 0, 0, 99], 1)).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            1,
          ],
          "instructionPointer": 6,
          "output": undefined,
          "program": Array [
            1106,
            0,
            6,
            0,
            0,
            0,
            99,
          ],
          "relativeBase": 0,
        }
      `);
    });
    it('0', () => {
      expect(execute([1106, 1, 10, 99], 1)).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            1,
          ],
          "instructionPointer": 3,
          "output": undefined,
          "program": Array [
            1106,
            1,
            10,
            99,
          ],
          "relativeBase": 0,
        }
      `);
    });
  });

  describe('opcode 7', () => {
    it('1', () => {
      expect(execute([1107, 0, 2, 0, 99], 1)).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            1,
          ],
          "instructionPointer": 4,
          "output": undefined,
          "program": Array [
            1,
            0,
            2,
            0,
            99,
          ],
          "relativeBase": 0,
        }
      `);
    });
    it('0', () => {
      expect(execute([1107, 2, 0, 0, 99], 1)).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            1,
          ],
          "instructionPointer": 4,
          "output": undefined,
          "program": Array [
            0,
            2,
            0,
            0,
            99,
          ],
          "relativeBase": 0,
        }
      `);
    });
  });

  it('write on relative position', () => {
    expect(execute([109, 6, 21107, 2, 1, 1, 99, 404])).toMatchInlineSnapshot(`
      Object {
        "halt": true,
        "input": Array [
          undefined,
        ],
        "instructionPointer": 6,
        "output": undefined,
        "program": Array [
          109,
          6,
          21107,
          2,
          1,
          1,
          99,
          0,
        ],
        "relativeBase": 6,
      }
    `);
  });

  describe('opcode 8', () => {
    it('1', () => {
      expect(execute([1108, 2, 2, 0, 99], 1)).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            1,
          ],
          "instructionPointer": 4,
          "output": undefined,
          "program": Array [
            1,
            2,
            2,
            0,
            99,
          ],
          "relativeBase": 0,
        }
      `);
    });
    it('0', () => {
      expect(execute([1108, 2, 0, 0, 99], 1)).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            1,
          ],
          "instructionPointer": 4,
          "output": undefined,
          "program": Array [
            0,
            2,
            0,
            0,
            99,
          ],
          "relativeBase": 0,
        }
      `);
    });

    it('write on relative position', () => {
      expect(execute([109, 6, 21108, 2, 1, 1, 99, 404])).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            undefined,
          ],
          "instructionPointer": 6,
          "output": undefined,
          "program": Array [
            109,
            6,
            21108,
            2,
            1,
            1,
            99,
            0,
          ],
          "relativeBase": 6,
        }
      `);
    });
  });
  describe('opcode 9', () => {
    it('changes the relative base', () => {
      expect(execute([109, 30, 99])).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            undefined,
          ],
          "instructionPointer": 2,
          "output": undefined,
          "program": Array [
            109,
            30,
            99,
          ],
          "relativeBase": 30,
        }
      `);
    });
    it('changes the relative base twice', () => {
      expect(execute([109, 2, 109, 3, 99])).toMatchInlineSnapshot(`
        Object {
          "halt": true,
          "input": Array [
            undefined,
          ],
          "instructionPointer": 4,
          "output": undefined,
          "program": Array [
            109,
            2,
            109,
            3,
            99,
          ],
          "relativeBase": 5,
        }
      `);
    });
  });
});
