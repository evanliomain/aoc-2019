module.exports = function loopUntil(predicate, iteree) {
  return input => {
    let accumulator = input;
    while (!predicate(accumulator)) {
      accumulator = iteree(accumulator);
    }
    return accumulator;
  };
};
