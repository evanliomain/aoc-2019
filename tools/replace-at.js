module.exports = function replaceAt(index, by) {
  return array => {
    if (index < 0 || array.length <= index) {
      return array;
    }
    return [
      ...array.slice(0, index),
      by,
      ...array.slice(1 + index, array.length)
    ];
  };
};
