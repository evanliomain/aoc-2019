const T = require('taninsam');
const { execution } = require('./tools');

module.exports = function(input) {
  return T.chain(input)
    .chain(execution(12, 2))
    .value();
};
