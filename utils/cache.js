const fs = require('fs');

module.exports = {
  get(key) {
    try {
      return fs.readFileSync(`.cache/${key}`, 'utf8');
    } catch (e) {
      return false;
    }
  },
  set(key, value) {
    if (!fs.existsSync('.cache')) {
      fs.mkdirSync('.cache');
    }
    return fs.writeFileSync(`.cache/${key}`, value, { encoding: 'utf8' });
  }
};
