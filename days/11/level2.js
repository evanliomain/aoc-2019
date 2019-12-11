const T = require('taninsam');
const { paint, print } = require('./tools');

module.exports = function(program) {
  return T.chain(program)
    .chain(paint(1))
    .chain(print)
    .value();
};
