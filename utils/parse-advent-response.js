const T = require('taninsam');
const HTMLParser = require('node-html-parser');
const chalk = require('chalk');

function parse(html) {
  const root = HTMLParser.parse(html);
  const result = root.querySelector('article p');
  const response = result.rawText
    .replace(/^\s*/, '')
    .replace(/\s*$/, '')
    .replace(/\s\s\s\s/g, ' ')
    .replace(/\s\s\s/g, ' ')
    .replace(/\s\s/g, ' ');
  if (new RegExp("That's the right answer").test(response)) {
    return {
      isCorrect: true,
      response
    };
  } else if (new RegExp("That's not the right answer").test(response)) {
    return {
      isCorrect: false,
      response
    };
  }
}

function displayResult(html) {
  const result = parse(html);
  if (result.isCorrect) {
    console.log(chalk.green("That's the right answer!"));
  } else {
    console.log(chalk.red(result.response));
  }
}

module.exports = {
  parse,
  displayResult
};
