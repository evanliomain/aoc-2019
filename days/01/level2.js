const T = require('taninsam');

module.exports = function(input) {
  return T.chain(input)
    .chain(T.map(reduceFuel))
    .chain(T.sum())
    .value();
};

function reduceFuel(x) {
  if (x <= 8) {
    return 0;
  }
  const fuel = Math.floor(x / 3) - 2;
  return fuel + reduceFuel(fuel);
}
