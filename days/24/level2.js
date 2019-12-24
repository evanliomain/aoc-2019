const T = require('taninsam');

const {
  startRecursive,
  nextRecursive,
  countBugs,
  printConsoleLevel
} = require('./tools');

module.exports = function(input) {
  return (
    T.chain(input)
      .chain(startRecursive())
      .chain(state => {
        console.log(`start\n` + printConsoleLevel()(state));

        return state;
      })
      .chain(T.loopFor(200, nextRecursive()))
      // .chain(printConsoleLevel())
      .chain(countBugs())
      .value()
  );
};
