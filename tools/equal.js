const T = require('taninsam');

/**
 * Return true if the 2 elements are equals or deep equal, and the same type.
 * Comparison with function is not suported. It results to false.
 * @param a the left element of comparison
 * @param b the right element of comparison
 * @returns the result of the comparison
 */
module.exports = function equal(a) {
  return b => {
    if (typeof a !== typeof b) {
      // a and b are not the same type
      return false;
    }
    const typeA = typeof a;
    if (['function', 'symbol'].includes(typeA)) {
      // Necessary diffenrent by type
      return false;
    }
    if ('undefined' === typeA) {
      // Necessary equal by type
      return true;
    }
    if (['string', 'boolean', 'number', 'bigint'].includes(typeA)) {
      // Primitive comparison
      return a === b;
    }
    if ('object' === typeA) {
      // deep equal
      return T.hash()(a) === T.hash()(b);
    }
    throw new Error(`Not yet supported type ${typeA}`);
  };
};
