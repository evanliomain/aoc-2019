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
      }
    `);
  });
  it('opcode 1 position mode', () => {
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
      }
    `);
  });
  it('opcode 1 value mode', () => {
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
      }
    `);
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
        }
      `);
    });
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
        }
      `);
    });
  });
});
