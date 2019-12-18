const T = require('taninsam');

const {
  getMatrix,
  getAlignment,
  printConsole,
  printToFile
} = require('./tools');

module.exports = function(input) {
  return (
    T.chain(input)
      .chain(getMatrix())
      // .chain(getAlignment())
      .chain(printToFile())
      // .chain(printConsole())
      .value()
  );
};
