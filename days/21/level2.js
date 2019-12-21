const T = require('taninsam');

const { run, exec, parseOutput, readInstructions } = require('./tools');

module.exports = function(program) {
  return T.chain('level2')
    .chain(readInstructions)
    .chain(run())
    .chain(exec(program))
    .chain(parseOutput)
    .value();
};
