const { execution } = require('./tools');

module.exports = function(input) {
  return execution(12, 2)(input);
};
