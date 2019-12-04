const T = require('taninsam');

module.exports = function(input) {
  return T.chain(input)
    .chain(T.map(T.split(',')))
    .chain(T.map(T.map(x => x.replace(/([RULD])(\d*)/, '$1/$2'))))
    .chain(T.map(T.map(T.split('/'))))
    .chain(
      T.map(
        T.map(([direction, step]) => ({ direction, step: parseInt(step, 10) }))
      )
    )
    .value();
};
