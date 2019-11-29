/**
 * Pair the elements of an array by 2, each element with its next neighboor, with a function.
 * For example, [A, B, C, D] become:
 * [f(A, B), f(B, C), f(C, D), f(D, A)]
 * The output array has 1 element in less.
 * @param iteratee the callback to pair 2 elements.
 * Received element1, element2, index1, index2, originalArray
 */
module.exports = function lag(iteratee) {
  return array => {
    if (!Array.isArray(array)) {
      throw new Exception('Attempt to use lag on a non array ' + typeof array);
    }
    if (0 === array.length || 1 === array.length) {
      return [];
    }
    const stop = array.length - 1;
    const result = [];
    for (let i = 0; i < stop; i++) {
      let j = i + 1;
      result.push(iteratee(array[i], array[j], i, j, array));
    }
    result.push(
      iteratee(array[array.length - 1], array[0], array.length - 1, 0, array)
    );
    return result;
  };
};
