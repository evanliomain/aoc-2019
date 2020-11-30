const T = require('taninsam');

const {
  DIRECTION_MOVE,
  printConsole,
  printFile,
  createState,
  moveStep
} = require('./tools');
const { then } = require('../../tools');
module.exports = function(input) {
  return T.chain(input)
    .chain(createState())
    .chain(moveStep)
    .chain(state => {
      console.log(state.intersections);
      console.log('start', state.start);
      console.log('position', state.position);
      console.log('direction', state.direction);
      console.log('end', state.end);
      console.log('portals.byName', state.portals.byName);
      console.log('portals.byPositionType', state.portals.byPositionType);

      return state;
    })
    .chain(printFile('1'))
    .chain(printConsole())
    .value();
};
