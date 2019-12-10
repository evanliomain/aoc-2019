/**
 * Return the element of an array at the specified index
 * @param index the index of the wished element.
 */
module.exports = function at(index) {
  return array => {
    if (!Array.isArray(array)) {
      throw new Exception(
        'Attempt to acces the index to a non array ' + typeof array
      );
    }
    if (0 === array.length) {
      return undefined;
    }
    if (index < 0 || array.length <= index) {
      return undefined;
    }
    return array[index];
  };
};
