const T = require('taninsam');
const { runInstruction } = require('./run-instruction');

module.exports = { execute };

// If debug to true to print all instruction
// If runUntilHalt is true, it not stop at first output
function execute(
  program,
  input,
  ip = 0,
  executionOptions = { debug: false, runUntilHalt: false }
) {
  const inputs = T.isArray(input) ? input : [input];
  const outputs = [];

  return T.chain(program)
    .chain(p => p.slice())
    .chain(p => ({
      program: p,
      instructionPointer: ip,
      relativeBase: 0,
      input: inputs,
      halt: false
    }))
    .chain(
      T.loopWhile(
        ({ halt, output }) => {
          if (executionOptions.runUntilHalt) {
            return !halt;
          }
          return !halt && T.isUndefined(output);
        },
        programState => {
          if (executionOptions.runUntilHalt && !T.isNil(programState.output)) {
            outputs.push(programState.output);
            programState.output = undefined;
          }
          return runInstruction(executionOptions.debug)(programState);
        }
      )
    )
    .chain(programState => {
      if (executionOptions.runUntilHalt) {
        return {
          ...programState,
          output: outputs
        };
      }
      return programState;
    })
    .value();
}
