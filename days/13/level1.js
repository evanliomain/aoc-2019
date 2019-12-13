const T = require('taninsam');
const { printMatrix, patternMatching, chunk } = require('../../tools');

const { execute } = require('../../intcode-computer');

const execOptions = { debug: false, runUntilHalt: true };

module.exports = function(program) {
  return T.chain(program)
    .chain(p =>
      execute(
        p,
        1,
        {
          instructionPointer: 0,
          relativeBase: 0
        },
        execOptions
      )
    )
    .chain(({ output }) => output)
    .chain(chunk(3))
    .chain(T.filter(([x, y, id]) => 2 === id))
    .chain(T.length())
    .value();
};
