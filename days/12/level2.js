const T = require('taninsam');
const { initVelocity, stepAxe, hashAxe } = require('./tools');
const { lcm } = require('../../tools');

module.exports = function(input) {
  return T.chain(findAnwserAxe('x')(input))
    .chain(lcm(findAnwserAxe('y')(input)))
    .chain(lcm(findAnwserAxe('z')(input)))
    .value();
};

function findAnwserAxe(axe) {
  return input => {
    const universe = {};

    return T.chain(input)
      .chain(positions => [positions, initVelocity(), 0])
      .chain(T.loopWhile(compareAxe(axe), stepAxe(axe)))
      .chain(([_1, _2, count]) => count)
      .value();

    function compareAxe(axe) {
      return ([[satelit1, satelit2, satelit3, satelit4], [v1, v2, v3, v4]]) => {
        const hashSystem = hashAxe(axe)([
          [satelit1, satelit2, satelit3, satelit4],
          [v1, v2, v3, v4]
        ]);

        if (!T.isNil(universe[hashSystem])) {
          return false;
        }
        universe[hashSystem] = true;
        return true;
      };
    }
  };
}
