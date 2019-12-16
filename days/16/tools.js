const T = require('taninsam');

module.exports = {
  nextPhase,
  nextPhaseOptimize,
  getPattern,
  extract8Digit,
  getMessage,
  repeated
};

function nextPhase(numbers) {
  return numbers.map((_, i) => {
    const pattern = getPattern(1 + i);
    return T.chain(numbers)
      .chain(array => array.slice(i))
      .chain(
        T.map((number, j) => number * pattern[(1 + i + j) % pattern.length])
      )
      .chain(T.sum())
      .chain(n => Math.abs(n) % 10)
      .value();
  });
}

function nextPhaseOptimize(size) {
  return previous => {
    const next = previous.slice();
    const end = next.length - size;

    for (let i = next.length - 2; end <= i; i--) {
      next[i] = (previous[i] + next[i + 1]) % 10;
    }
    return next;
  };
}

function getPattern(nbRepeat) {
  const basePattern = [0, 1, 0, -1];
  if (1 === nbRepeat) {
    return basePattern;
  }
  return T.chain(basePattern)
    .chain(T.map(T.arrayFromValue(nbRepeat)))
    .chain(T.flat())
    .value();
}

function extract8Digit(message) {
  return numbers => numbers.slice(message, message + 8);
}

function getMessage(numbers) {
  return T.chain(numbers)
    .chain(T.take(7))
    .chain(T.join(''))
    .chain(x => parseInt(x, 10))
    .value();
}

function repeated(n) {
  return numbers =>
    T.chain(numbers)
      .chain(T.arrayFromValue(n))
      .chain(T.flat())
      .value();
}
