const T = require('taninsam');

const {
  start,
  next,
  nextNPrint,
  appearTwice,
  getAppearTwiceHash
} = require('./tools');

// To solve part 1
module.exports = function(input) {
  return T.chain(input)
    .chain(start())
    .chain(T.loopWhile(T.not(appearTwice()), next()))
    .chain(getAppearTwiceHash())
    .value();
};

// To generate dataviz
// const fs = require('fs');
// const rimraf = require('rimraf');

// const execCommand = require('../../utils/exec-command');
// const { then } = require('../../tools');
// const NB_STEP = 1000;
// module.exports = async function(input) {
//   rimraf.sync('output/game-of-life');
//   fs.mkdirSync('output/game-of-life', { recursive: true });

//   await T.chain(input)
//     .chain(start())
//     .chain(state => Promise.resolve(state))
//     .chain(T.loopFor(NB_STEP, then(nextNPrint())))
//     .chain(then(() => 'end'))
//     .value();

//   console.log(`Generate animation`);

//   await execCommand(
//     `convert -delay 10 -loop 1 output/game-of-life/game-of-life.*.png output/game-of-life-part1.${NB_STEP}.gif`
//   );
//   rimraf.sync('output/game-of-life');
//   return `output/game-of-life-part1.${NB_STEP}.gif generated`;
// };
