module.exports = function loopDoWhile(predicate, iteree) {
  return input => {
    let accumulator = input;
    do {
      accumulator = iteree(accumulator);
    } while (predicate(accumulator));
    return accumulator;
  };
};
