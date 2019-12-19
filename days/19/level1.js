const T = require('taninsam');
const {
  makeMatrix,
  mapMatrix,
  printMatrix,
  findAllMatrix
} = require('../../tools');

const { execute } = require('../../intcode-computer');

const execOptions = { debug: false, runUntilHalt: false };

const DRONE_STATE = {
  STATIONARY: 0,
  PULLED: 1
};

module.exports = function(program) {
  return (
    T.chain({ sizeX: 50, sizeY: 50 })
      .chain(makeMatrix(() => DRONE_STATE.STATIONARY))
      .chain(
        mapMatrix(
          (cell, x, y) =>
            execute(
              program,
              [x, y],
              { instructionPointer: 0, relativeBase: 0 },
              execOptions
            ).output
        )
      )
      // .chain(printMatrix(x => x))
      .chain(findAllMatrix(cell => DRONE_STATE.PULLED === cell))
      .chain(T.length())
      .value()
  );
};
