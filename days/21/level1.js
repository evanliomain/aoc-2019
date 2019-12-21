const T = require('taninsam');

const { walk, exec, parseOutput, readInstructions } = require('./tools');

module.exports = function(program) {
  return T.chain('level1')
    .chain(readInstructions)
    .chain(walk())
    .chain(exec(program))
    .chain(parseOutput)
    .value();
};
