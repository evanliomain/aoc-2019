const T = require('taninsam');

const { start, networkListen, print, isNatEmpty } = require('./tools');

module.exports = function(program) {
  return T.chain(program)
    .chain(start())
    .chain(T.loopWhile(isNatEmpty(), networkListen()))
    .chain(({ nat }) => nat.y)
    .value();
};
