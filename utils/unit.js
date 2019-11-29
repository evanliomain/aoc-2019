const read = require('./read');

module.exports = day => solver => input => expectedOutput => {
  it(String(input), () => {
    const reader = read(day);
    expect(solver(reader(input))).toEqual(expectedOutput);
  });
};
