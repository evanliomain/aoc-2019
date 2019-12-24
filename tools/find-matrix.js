module.exports = function findAllMatrix(match) {
  return matrix => {
    for (let y = 0; y < matrix.length; y++) {
      const raw = matrix[y];
      for (let x = 0; x < raw.length; x++) {
        const cell = raw[x];
        if (match(cell)) {
          return { x, y };
        }
      }
    }
    return undefined;
  };
};
