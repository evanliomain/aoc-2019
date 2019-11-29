const chalk = require('chalk');

function askToSend(puzzleResult) {
  return new Promise(function(resolve, reject) {
    // Set input character encoding.
    process.stdin.setEncoding('utf-8');

    // Prompt user to input data in console.
    console.log(
      'Send your puzzle result ',
      chalk.bold.blue(puzzleResult),
      ' ? (y/N)'
    );

    // When user input data and click enter key.
    process.stdin.on('data', async function(data) {
      if ('y\n' !== data.toLowerCase()) {
        console.log(chalk.blue('Response NOT sent'));
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
}

module.exports = askToSend;
