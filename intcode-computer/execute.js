const T = require('taninsam');
const { runInstruction } = require('./run-instruction');

module.exports = { execute };

// St debug to true to print all instruction
const debug = false;

function execute(program, input, ip = 0) {
  const inputs = T.isArray(input) ? input : [input];

  return T.chain(program)
    .chain(p => p.slice())
    .chain(p => ({
      program: p,
      instructionPointer: ip,
      input: inputs,
      halt: false
    }))
    .chain(
      T.loopWhile(
        ({ halt, output }) => !halt && T.isUndefined(output),
        runInstruction(debug)
      )
    )
    .value();
}
