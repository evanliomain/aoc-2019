const T = require('taninsam');
const { paint } = require('./tools');

module.exports = function(program) {
  return T.chain(program)
    .chain(paint(0))
    .chain(T.keys())
    .chain(T.length())
    .value();
};
