const { exec } = require('child_process');
const chalk = require('chalk');

module.exports = execCommand;

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        reject(err);
        return;
      }
      if (stderr) {
        console.log(chalk.red(stderr));
      }
      resolve(stdout);
    });
  });
}
