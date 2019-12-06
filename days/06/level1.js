const T = require('taninsam');

module.exports = function(input) {
  return T.chain(input)
    .chain(T.map(countOrbit(input)))
    .chain(T.sum())
    .value();
};

function countOrbit(orbits) {
  return ({ planet, satelite }) =>
    countOrbitRec(orbits, { planet, satelite }, 0);
}

function countOrbitRec(orbits, { planet, satelite }, nb) {
  if ('COM' === planet) {
    return 1 + nb;
  }
  const nextOrbit = orbits.find(orbit => orbit.satelite === planet);
  return countOrbitRec(orbits, nextOrbit, 1 + nb);
}
