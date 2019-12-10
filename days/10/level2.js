const T = require('taninsam');
const { at } = require('../../tools');
const { getStation, flagSpace, getAsteroids, getAngle } = require('./tools');

module.exports = function(input) {
  const station = getStation(input);

  return T.chain(input)
    .chain(flagSpace(station))
    .chain(getAsteroids)
    .chain(T.filter(({ detected }) => detected))
    .chain(T.sortBy(getAngle(station)))
    .chain(at(199))
    .chain(({ x, y }) => x * 100 + y)
    .value();
};
