const T = require('taninsam');
const {
  nextPhaseOptimize,
  getMessage,
  repeated,
  extract8Digit
} = require('./tools');

module.exports = function(input) {
  const messageOffset = getMessage(input);
  const hypotheticArrayLength = input.length * 10000;
  const securityMarge = 100;
  const sizeToCompute = hypotheticArrayLength - messageOffset + securityMarge;
  const optimizeRepeateTime = 1 + Math.floor(sizeToCompute / input.length);
  const l = optimizeRepeateTime * input.length;

  return T.chain(input)
    .chain(repeated(optimizeRepeateTime))
    .chain(T.loopFor(100, nextPhaseOptimize(sizeToCompute)))
    .chain(extract8Digit(l - (hypotheticArrayLength - messageOffset)))
    .chain(T.join(''))
    .value();
};
