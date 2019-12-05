const T = require('taninsam');

module.exports = { runInstruction, parseOpcode, execute };

function execute(program, input) {
  return T.chain(program)
    .chain(program => ({ program, instructionPointer: 0, input, halt: false }))
    .chain(T.loopWhile(({ halt }) => !halt, runInstruction))
    .chain(({ output }) => output)
    .value();
}

function runInstruction({ program, instructionPointer, input, output }) {
  let halt = false;
  let newOutput = output;

  const [opcode, ...parametersMode] = parseOpcode(program[instructionPointer]);

  if (1 === opcode) {
    const [pm1, pm2] = parametersMode;
    const v1 = !pm1
      ? program[program[instructionPointer + 1]]
      : program[instructionPointer + 1];
    const v2 = !pm2
      ? program[program[instructionPointer + 2]]
      : program[instructionPointer + 2];
    program[program[instructionPointer + 3]] = v1 + v2;

    // console.log('+', v1, v2);

    instructionPointer += 4;
  }
  if (2 === opcode) {
    const [pm1, pm2] = parametersMode;
    const v1 = !pm1
      ? program[program[instructionPointer + 1]]
      : program[instructionPointer + 1];
    const v2 = !pm2
      ? program[program[instructionPointer + 2]]
      : program[instructionPointer + 2];
    program[program[instructionPointer + 3]] = v1 * v2;
    // console.log('*', v1, v2);

    instructionPointer += 4;
  }
  if (3 === opcode) {
    program[program[instructionPointer + 1]] = input;
    instructionPointer += 2;
    // console.log('inputs', input);
  }
  if (4 === opcode) {
    newOutput = program[program[instructionPointer + 1]];
    instructionPointer += 2;
    // console.log('outputs', newOutput);
  }
  if (5 === opcode) {
    const [pm1, pm2] = parametersMode;
    const v1 = !pm1
      ? program[program[instructionPointer + 1]]
      : program[instructionPointer + 1];
    const v2 = !pm2
      ? program[program[instructionPointer + 2]]
      : program[instructionPointer + 2];
    if (0 === v1) {
      instructionPointer += 3;
    } else {
      instructionPointer = v2;
    }
  }
  if (6 === opcode) {
    const [pm1, pm2] = parametersMode;
    const v1 = !pm1
      ? program[program[instructionPointer + 1]]
      : program[instructionPointer + 1];
    const v2 = !pm2
      ? program[program[instructionPointer + 2]]
      : program[instructionPointer + 2];
    if (0 === v1) {
      instructionPointer = v2;
    } else {
      instructionPointer += 3;
    }
  }
  if (7 === opcode) {
    const [pm1, pm2] = parametersMode;
    const v1 = !pm1
      ? program[program[instructionPointer + 1]]
      : program[instructionPointer + 1];
    const v2 = !pm2
      ? program[program[instructionPointer + 2]]
      : program[instructionPointer + 2];

    program[program[instructionPointer + 3]] = v1 < v2 ? 1 : 0;
    instructionPointer += 4;
  }
  if (8 === opcode) {
    const [pm1, pm2] = parametersMode;
    const v1 = !pm1
      ? program[program[instructionPointer + 1]]
      : program[instructionPointer + 1];
    const v2 = !pm2
      ? program[program[instructionPointer + 2]]
      : program[instructionPointer + 2];

    program[program[instructionPointer + 3]] = v1 === v2 ? 1 : 0;
    instructionPointer += 4;
  }

  if (99 === opcode) {
    halt = true;
  }

  return {
    program,
    instructionPointer,
    output: newOutput,
    halt
  };
}

function parseOpcode(opcode) {
  if (opcode < 100) {
    return [opcode];
  }
  return T.chain(String(opcode))
    .chain(T.split(''))
    .chain(T.reverse())
    .chain(([d1, d2, ...rest]) => [
      parseInt(d2 + d1, 10),
      ...rest.map(x => parseInt(x, 10))
    ])
    .value();
}
