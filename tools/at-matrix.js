/**
 * Return the element of an array at the specified index
 * @param index the index of the wished element.
 */
module.exports = function atMatrix({ x, y }) {
  return matrix => {
    if (!Array.isArray(matrix)) {
      throw new Error(
        `Attempt to acces the index to a non matrix ${typeof matrix}`
      );
    }
    if (!Array.isArray(matrix[0])) {
      throw new Error(
        `Attempt to acces the index to a non array matrix[0] ${typeof matrix[0]}`
      );
    }
    if (!Array.isArray(matrix[y])) {
      throw new Error(
        `Attempt to acces the index to a non array matrix[0] ${typeof matrix[
          y
        ]}`
      );
    }
    if (0 === matrix.length) {
      return undefined;
    }
    if (y < 0 || matrix.length <= y) {
      return undefined;
    }
    if (x < 0 || matrix[y].length <= x) {
      return undefined;
    }
    return matrix[y][x];
  };
};
