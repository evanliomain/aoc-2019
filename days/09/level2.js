const { execute } = require('../../intcode-computer');

module.exports = function(program) {
  return execute(program, 2).output;
};
