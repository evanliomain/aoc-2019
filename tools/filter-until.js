/**
 * Filter an array removing element until an element should be keep.
 * The predicate function say if an element should be kept or dropped
 */
module.exports = function filterUntil(predicat) {
  return array => {
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      if (!predicat(element, i)) {
        return array.slice(i);
      }
    }
    return [];
  };
};
