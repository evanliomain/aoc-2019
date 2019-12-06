const T = require('taninsam');

module.exports = function(input) {
  return T.chain(input)
    .chain(orbits => [
      pathRec(orbits, 'YOU', ['YOU']),
      pathRec(orbits, 'SAN', ['SAN'])
    ])
    .chain(paths => findPivot(...paths))
    .chain(([i, j]) => i + j - 2)
    .value();
};

function pathRec(orbits, satelite, previous) {
  const currentOrbit = orbits.find(orbit => orbit.satelite === satelite);
  if ('COM' === currentOrbit.planet) {
    return [...previous, currentOrbit.planet];
  }
  const nextOrbit = orbits.find(
    orbit => orbit.satelite === currentOrbit.planet
  );
  return pathRec(orbits, nextOrbit.satelite, [
    ...previous,
    currentOrbit.planet
  ]);
}

function findPivot(path1, path2) {
  for (let i = 0; i < path1.length; i++) {
    const element = path1[i];
    const j = path2.indexOf(element);
    if (-1 !== j) {
      return [i, j];
    }
  }
}
