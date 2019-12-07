const chalk = require('chalk');

const { parseOpcode } = require('./parse-opcode');

module.exports = { runInstruction };

function runInstruction(debug = false) {
  return ({ program, instructionPointer, input, output }) => {
    let halt = false;
    let newOutput = output;

    const [opcode, ...parametersMode] = parseOpcode(
      program[instructionPointer]
    );

    if (1 === opcode) {
      const [pm1, pm2] = parametersMode;
      const v1 = !pm1
        ? program[program[instructionPointer + 1]]
        : program[instructionPointer + 1];
      const v2 = !pm2
        ? program[program[instructionPointer + 2]]
        : program[instructionPointer + 2];
      program[program[instructionPointer + 3]] = v1 + v2;

      instructionPointer += 4;
      if (debug) {
        console.log(
          `${chalk.green.bold('+')}  (${chalk.yellow(v1)}, ${chalk.yellow(v2)})`
        );
      }
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

      instructionPointer += 4;
      if (debug) {
        console.log(
          `${chalk.green.bold('*')}  (${chalk.yellow(v1)}, ${chalk.yellow(v2)})`
        );
      }
    }
    if (3 === opcode) {
      const inn = input.shift();
      const pos = program[instructionPointer + 1];
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
      const pos = program[instructionPointer + 1];
      newOutput = program[pos];
      instructionPointer += 2;
      if (debug) {
        console.log(
          `${chalk.cyan.bold('<<')} (${chalk.cyan(newOutput)}, ${chalk.magenta(
            pos
          )})`
        );
      }
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
        if (debug) {
          console.log(`${chalk.green.bold('->')} (${chalk.magenta(v2)})`);
        }
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
        if (debug) {
          console.log(`${chalk.green.bold('->')} (${chalk.magenta(v2)})`);
        }
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
      if (debug) {
        console.log(
          `${chalk.green.bold('<')}  (${chalk.yellow(v1)}, ${chalk.yellow(v2)})`
        );
      }
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
      if (debug) {
        console.log(
          `${chalk.green.bold('==')} (${chalk.yellow(v1)}, ${chalk.yellow(v2)})`
        );
      }
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
      input,
      output: newOutput,
      halt
    };
  };
}
