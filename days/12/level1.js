const T = require('taninsam');
const { energyAfter } = require('./tools');

module.exports = function(input) {
  return T.chain(input)
    .chain(energyAfter(1000))
    .value();
};
