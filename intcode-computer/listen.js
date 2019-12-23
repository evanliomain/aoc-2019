const T = require('taninsam');
const { runInstruction, OPCODE } = require('./run-instruction');
const { parseOpcode } = require('./parse-opcode');

module.exports = { listen };

// If debug to true to print all instruction
// If runUntilHalt is true, it not stop at first output
function listen(
  program,
  input,
  { instructionPointer, relativeBase } = {
    instructionPointer: 0,
    relativeBase: 0
  },
  executionOptions = { debug: false, runUntilHalt: false, runUntilNbOutput: 1 }
) {
  const inputs = getInputs(input);
  const outputs = [];

  if (T.isNil(instructionPointer)) {
    instructionPointer = 0;
  }
  if (T.isNil(relativeBase)) {
    relativeBase = 0;
  }

  return T.chain(program)
    .chain(p => p.slice())
    .chain(p => ({
      program: p,
      instructionPointer,
      relativeBase,
      input: inputs,
      halt: false
    }))
    .chain(
      T.loopWhile(
        ({ halt, program, instructionPointer }) => {
          if (executionOptions.runUntilHalt) {
            return !halt;
          }
          if (halt) {
            return false;
          }
          if (executionOptions.runUntilNbOutput === outputs.length) {
            return false;
          }

          // Stop program to listen an new input
          const [opcode] = parseOpcode(program[instructionPointer]);
          if (OPCODE.INPUT === opcode && 0 === inputs.length) {
            return false;
          }

          return true;
        },
        programState => {
          if (!T.isNil(programState.output)) {
            outputs.push(programState.output);
            programState.output = undefined;
          }
          return runInstruction(executionOptions.debug)(programState);
        }
      )
    )
    .chain(programState => ({ ...programState, output: outputs }))
    .value();
}

function getInputs(input) {
  if (T.isNil(input)) {
    return [];
  }
  if (!T.isArray(input)) {
    return [input];
  }
  return input;
}
