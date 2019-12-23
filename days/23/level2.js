const T = require('taninsam');

const { start, networkListen, isIdle } = require('./tools');

module.exports = function(program) {
  let previousNatY = null;
  let currentNatY = null;

  return T.chain(program)
    .chain(start())
    .chain(
      T.loopWhile(
        () => {
          if (!T.isNil(previousNatY) && previousNatY === currentNatY) {
            return false;
          }
          previousNatY = currentNatY;
          currentNatY = null;
          return true;
        },
        state =>
          T.chain(state)
            .chain(T.loopWhile(isIdle(), networkListen()))
            .chain(state => {
              currentNatY = state.nat.y;
              return state;
            })
            .chain(state => {
              state.packets[0].push([state.nat.x, state.nat.y]);
              return state;
            })
            .value()
      )
    )
    .chain(() => currentNatY)
    .value();
};
