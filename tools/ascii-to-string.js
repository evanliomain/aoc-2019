module.exports = function asciiToString(array) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(String.fromCharCode(array[i]));
  }
  return result;
};
