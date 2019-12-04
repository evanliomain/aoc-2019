const T = require('taninsam');
const {
  digitsNeverDecrease,
  twoAdjacentDigitsAreTheSame,
  isASixDigit
} = require('./tools');

module.exports = function(input) {
  const [start, stop] = input;
  const validPassword = [];
  for (let i = start; i <= stop; i++) {
    if (
      isASixDigit(i) &&
      digitsNeverDecrease(i) &&
      twoAdjacentDigitsAreTheSame(i)
    ) {
      validPassword.push(i);
    }
  }
  return validPassword.length;
};
