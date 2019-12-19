module.exports = function makeMatrix(mapFn) {
  return ({ sizeX, sizeY }) => {
    const matrix = [];
    for (let y = 0; y < sizeY; y++) {
      const raw = [];
      for (let x = 0; x < sizeX; x++) {
        raw.push(mapFn(x, y));
      }
      matrix.push(raw);
    }
    return matrix;
  };
};
