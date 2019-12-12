const T = require('taninsam');

module.exports = function(input) {
  return T.chain(input)
    .chain(
      T.map(s => s.replace(/<x=(-?\d+), y=(-?\d+), z=(-?\d+)>/, '$1/$2/$3'))
    )
    .chain(T.map(T.split('/')))
    .chain(
      T.map(([x, y, z]) => ({
        x: parseInt(x, 10),
        y: parseInt(y, 10),
        z: parseInt(z, 10)
      }))
    )
    .value();
};
