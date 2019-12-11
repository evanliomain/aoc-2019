const { execute } = require('../../intcode-computer');

module.exports = function(program) {
  return execute(
    program,
    1,
    { instructionPointer: 0, relativeBase: 0 },
    { debug: true, runUntilHalt: false }
  ).output;
};
