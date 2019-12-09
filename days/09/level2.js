const { execute } = require('../../intcode-computer');

module.exports = function(program) {
  return execute(program, 2, 0, { debug: false, runUntilHalt: false }).output;
};
