const fs = require('fs');
module.exports = writeFile;

function writeFile(filename) {
  return buffer =>
    new Promise(resolve =>
      fs.writeFile(filename, buffer, () => resolve(filename))
    );
}
