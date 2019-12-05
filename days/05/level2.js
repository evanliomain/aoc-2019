const { execute } = require('./tools');

module.exports = function(program) {
  return execute(program, 5);
};
