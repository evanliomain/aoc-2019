const T = require('taninsam');

module.exports = function replace(regexp, replacement) {
  return s => {
    if (!T.isString(s)) {
      throw new Error(`Attempt to replace on a non string: ${typeof s}`);
    }
    return s.replace(regexp, replacement);
  };
};
