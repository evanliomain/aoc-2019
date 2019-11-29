const { runCLI } = require('jest-cli');

function runTest(day, level) {
  const projectRootPath = 'days';
  const jestConfig = {
    testRegex: `${day}/level${level}\\.test\\.js$`
  };

  // Run the Jest asynchronously
  return runCLI(jestConfig, [projectRootPath]).then(
    x => x,
    error => console.log('error', error)
  );
}

module.exports = runTest;
