const chalk = require('chalk');
const T = require('taninsam');

const { parseOpcode } = require('./parse-opcode');

module.exports = { runInstruction };

function runInstruction(debug = false) {
  return ({ program, instructionPointer, relativeBase, input, output }) => {
    let halt = false;
    let newOutput = output;

    const [opcode, ...parametersMode] = parseOpcode(
      program[instructionPointer]
    );

    if (1 === opcode) {
      const [pm1, pm2, pm3] = parametersMode;
      const v1 = getValue(pm1, 1, {
        program,
        instructionPointer,
        relativeBase
      });
      const v2 = getValue(pm2, 2, {
        program,
        instructionPointer,
        relativeBase
      });
      const pos3 = getPosition(pm3, 3, {
        program,
        instructionPointer,
        relativeBase
      });
      program[pos3] = add(v1, v2);

      if (debug) {
        console.log(
          `${chalk.green.bold('+')}  (${chalk.yellow(v1)}, ${chalk.yellow(
            v2
          )} -> ${program[instructionPointer + 3]})`
        );
      }
      instructionPointer += 4;
    }
    if (2 === opcode) {
      const [pm1, pm2, pm3] = parametersMode;
      const v1 = getValue(pm1, 1, {
        program,
        instructionPointer,
        relativeBase
      });
      const v2 = getValue(pm2, 2, {
        program,
        instructionPointer,
        relativeBase
      });
      const pos3 = getPosition(pm3, 3, {
        program,
        instructionPointer,
        relativeBase
      });
      program[pos3] = v1 * v2;

      if (debug) {
        console.log(
          `${chalk.green.bold('*')}  (${chalk.yellow(v1)}, ${chalk.yellow(
            v2
          )} -> ${program[instructionPointer + 3]})`
        );
      }
      instructionPointer += 4;
    }
    if (3 === opcode) {
      const inn = input.shift();
      const [pm1] = parametersMode;
      const pos = getPosition(pm1, 1, {
        program,
        instructionPointer,
        relativeBase
      });
      checkMemoryAccess(program, [pos]);
      program[pos] = inn;
      instructionPointer += 2;
      if (debug) {
        console.log(
          `${chalk.cyan.bold('>')}${chalk.cyan('-')} (${chalk.cyan(
            inn
          )}, ${chalk.magenta(pos)})`
        );
      }
    }
    if (4 === opcode) {
      const [pm1] = parametersMode;
      const v1 = getValue(pm1, 1, {
        program,
        instructionPointer,
        relativeBase
      });
      newOutput = v1;
      instructionPointer += 2;
      if (debug) {
        console.log(`${chalk.cyan.bold('<<')} (${chalk.cyan(newOutput)})`);
      }
    }
    if (5 === opcode) {
      const [pm1, pm2] = parametersMode;
      const v1 = getValue(pm1, 1, {
        program,
        instructionPointer,
        relativeBase
      });
      const v2 = getValue(pm2, 2, {
        program,
        instructionPointer,
        relativeBase
      });
      if (0 === v1) {
        instructionPointer += 3;
      } else {
        instructionPointer = v2;
        if (debug) {
          console.log(`${chalk.green.bold('->')} (${chalk.magenta(v2)})`);
        }
      }
    }
    if (6 === opcode) {
      const [pm1, pm2] = parametersMode;
      const v1 = getValue(pm1, 1, {
        program,
        instructionPointer,
        relativeBase
      });
      const v2 = getValue(pm2, 2, {
        program,
        instructionPointer,
        relativeBase
      });
      if (0 === v1) {
        instructionPointer = v2;
        if (debug) {
          console.log(`${chalk.green.bold('->')} (${chalk.magenta(v2)})`);
        }
      } else {
        instructionPointer += 3;
      }
    }
    if (7 === opcode) {
      const [pm1, pm2, pm3] = parametersMode;
      const v1 = getValue(pm1, 1, {
        program,
        instructionPointer,
        relativeBase
      });
      const v2 = getValue(pm2, 2, {
        program,
        instructionPointer,
        relativeBase
      });
      const pos3 = getPosition(pm3, 3, {
        program,
        instructionPointer,
        relativeBase
      });
      program[pos3] = v1 < v2 ? 1 : 0;
      instructionPointer += 4;
      if (debug) {
        console.log(
          `${chalk.green.bold('<')}  (${chalk.yellow(v1)}, ${chalk.yellow(v2)})`
        );
      }
    }
    if (8 === opcode) {
      const [pm1, pm2, pm3] = parametersMode;
      const v1 = getValue(pm1, 1, {
        program,
        instructionPointer,
        relativeBase
      });
      const v2 = getValue(pm2, 2, {
        program,
        instructionPointer,
        relativeBase
      });
      const pos3 = getPosition(pm3, 3, {
        program,
        instructionPointer,
        relativeBase
      });

      program[pos3] = v1 === v2 ? 1 : 0;
      instructionPointer += 4;
      if (debug) {
        console.log(
          `${chalk.green.bold('==')} (${chalk.yellow(v1)}, ${chalk.yellow(v2)})`
        );
      }
    }
    if (9 === opcode) {
      const [pm1] = parametersMode;
      const v1 = getValue(pm1, 1, {
        program,
        instructionPointer,
        relativeBase
      });
      const oldRelativeBase = relativeBase;
      relativeBase += v1;
      if (debug) {
        console.log(
          `${chalk.green.bold('~_')} (${chalk.magenta(
            oldRelativeBase + program[instructionPointer + 1]
          )} -> ${chalk.yellow(v1)}, ${chalk.magenta(
            oldRelativeBase
          )} -> ${chalk.magenta(relativeBase)})`
        );
      }
      instructionPointer += 2;
    }

    if (99 === opcode) {
      halt = true;
      if (debug) {
        console.log(`${chalk.green.bold('#')}`);
      }
    }

    return {
      program,
      instructionPointer,
      relativeBase,
      input,
      output: newOutput,
      halt
    };
  };
}

function getValue(
  parameterMode,
  parameterPosition,
  { program, instructionPointer, relativeBase }
) {
  let pos;
  if (!parameterMode) {
    // By position
    pos = program[instructionPointer + parameterPosition];
    checkMemoryAccess(program, [pos]);
  }
  if (1 === parameterMode) {
    // By value
    pos = instructionPointer + parameterPosition;
  }
  if (2 === parameterMode) {
    // By relative base
    pos = relativeBase + program[instructionPointer + parameterPosition];
    checkMemoryAccess(program, [pos]);
  }
  return program[pos];
}

function getPosition(
  parameterMode,
  parameterPosition,
  { program, instructionPointer, relativeBase }
) {
  if (!parameterMode) {
    // By position
    return program[instructionPointer + parameterPosition];
  }
  if (2 === parameterMode) {
    // By relative base
    return relativeBase + program[instructionPointer + parameterPosition];
  }
  throw new Error(`Unknown parameter mode position ${parameterMode}`);
}

function add(v1, v2) {
  if (T.isNil(v1)) {
    return v2;
  }
  if (T.isNil(v2)) {
    return v1;
  }
  return v1 + v2;
}

function checkMemoryAccess(program, addresses) {
  addresses.forEach(address => {
    if (address < 0) {
      throw new Error(`Invalid memory access, negative adress ${address}`);
    }
    if (T.isUndefined(program[address])) {
      program[address] = 0;
    }
  });
}
