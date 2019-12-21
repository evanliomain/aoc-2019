module.exports = function stringToAscii(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    result.push(str[i].charCodeAt());
  }
  return result;
};
