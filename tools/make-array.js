module.exports = function makeArray(mapFn) {
  return size => {
    const array = [];
    for (let k = 0; k < size; k++) {
      array.push(mapFn(k));
    }
    return array;
  };
};
