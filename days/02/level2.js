const { execution } = require('./tools');

module.exports = function(input) {
  for (let noun = 0; noun < 100; noun++) {
    for (let verb = 0; verb < 100; verb++) {
      if (19690720 === execution(noun, verb)(input)) {
        return 100 * noun + verb;
      }
    }
  }
  return '?';
};
