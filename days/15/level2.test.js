const T = require('taninsam');
const { mapMatrix } = require('../../tools');

const { STATUS, spreadOxygen, positionToRecordKey } = require('./tools');

const testMap = T.chain(['##    ', '#..## ', '#.#..#', '#.O.# ', ' ###  '])
  .chain(T.map(T.split()))
  .chain(
    mapMatrix((cell, x, y) => {
      if ('#' === cell || ' ' === cell) {
        return { x, y, value: STATUS.WALL };
      }
      if ('.' === cell || 'O' === cell) {
        return { x, y, value: STATUS.MOVED };
      }
    })
  )
  .chain(T.flat())
  .chain(T.toObject(positionToRecordKey, ({ value }) => value))
  .value();

describe('15-2', () => {
  it('return 4 minutes for test space map', () => {
    expect(spreadOxygen(testMap, { x: 2, y: 3 })).toBe(4);
  });
});
