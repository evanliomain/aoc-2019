const T = require('taninsam');
const chalk = require('chalk');

const spaceMap = require('../../output/24-space-map.json');
const userInputs = require('../../output/24-user-inputs.json');

const {
  DROID_COMMAND,
  move,
  action,
  moves,
  start,
  printerConsole,
  printOutput,
  printSpaceToFile,
  getRecordValue,
  getNextPosition,
  saveSpace,
  wrap,
  printerFile,
  writeUserInputs
} = require('./tools');

const { replace, parseInteger, equal } = require('../../tools');

const USER_COMMAND = {
  NORTH: 'z',
  SOUTH: 's',
  WEST: 'q',
  EAST: 'd',
  INVENTORY: 'i'
};
const DROID_DIRECTION_TO_USER_COMMAND = {
  [DROID_COMMAND.NORTH]: USER_COMMAND.NORTH,
  [DROID_COMMAND.SOUTH]: USER_COMMAND.SOUTH,
  [DROID_COMMAND.WEST]: USER_COMMAND.WEST,
  [DROID_COMMAND.EAST]: USER_COMMAND.EAST
};

const USER_TO_DROID_COMMAND = {
  [USER_COMMAND.NORTH]: DROID_COMMAND.NORTH,
  [USER_COMMAND.SOUTH]: DROID_COMMAND.SOUTH,
  [USER_COMMAND.WEST]: DROID_COMMAND.WEST,
  [USER_COMMAND.EAST]: DROID_COMMAND.EAST,
  [USER_COMMAND.INVENTORY]: DROID_COMMAND.INVENTORY
};

module.exports = async function(program) {
  // You start at position 0, 0
  let state = start(spaceMap)(program);
  // state = move(DIRECTION.WEST)(state);
  // printerFile('final2')(state);
  // return;

  // First, execute in automatic mode to discover the space
  // It save the map into output/space-map.json

  // Automatic
  // return await automatic(state);

  // Then, to discover last parcel of the map, run in manual
  // It save the map into output/space-map.json
  // And user inputs  into output/user-inputs.json
  // To replay them if you terninate and re-run

  // Manual
  return manual(state);

  // To solve level 1, once your map is complete, find the path by yourself
  // and count manually how move this path contains
};

async function manual(state) {
  // replacy last user inputs
  // state = moves(userInputs)(state);
  state = move()(state);

  while (true) {
    // console.log(printerConsole()(state));
    saveSpace(state);
    await printerFile('current')(state);
    state = await userDeplacement(state);
  }
}

async function userDeplacement(state) {
  if (T.isNil(state) || T.isNil(state.out)) {
    throw new Error(`Need program output to continue`);
  }
  console.log(printOutput(state.out));
  const direction = await askDirection(state).then(action => {
    console.log(`> ${action}`);
    return action;
  });
  userInputs.push(direction);
  writeUserInputs(userInputs);

  if (
    /^take/.test(direction) ||
    /^drop/.test(direction) ||
    /^inv/.test(direction)
  ) {
    return action(direction)(state);
  }

  return move(direction)(state);
}

async function askDirection(state) {
  return new Promise(function(resolve, reject) {
    // Set input character encoding.
    process.stdin.setEncoding('utf-8');

    // Prompt user to input data in console.
    const askSentence = T.chain(state.out.possibleDirections)
      .chain(
        T.map(
          direction =>
            `${chalk.green(direction)}: ${chalk.magenta(
              DROID_DIRECTION_TO_USER_COMMAND[direction]
            )}`
        )
      )
      .chain(T.join(', '))
      .chain(s => `Where do you wanna go ? (${s})`)
      .value();

    const askChoice = T.chain(state.out.items)
      .chain(
        T.map(
          (item, i) =>
            `${chalk.cyan(item)}: ${
              0 === i ? chalk.magenta('m') : chalk.magenta(i)
            }`
        )
      )
      .chain(T.join(', '))
      .chain(s => ('' === s ? '' : `Do you wanna take? (${s})`))
      .value();

    const askDrop = T.chain(state.items)
      .chain(
        T.map(
          (item, i) =>
            `${chalk.cyan(item)}: ${
              0 === i ? chalk.magenta('p') : chalk.magenta('p' + i)
            }`
        )
      )
      .chain(T.join(', '))
      .chain(s => ('' === s ? '' : `Do you wanna drop? (${s})`))
      .value();

    console.log(
      T.chain([
        askSentence,
        askChoice,
        askDrop,
        `Do you wanna check inventory? (${chalk.magenta('i')})`
      ])
        .chain(T.filter(T.not(equal(''))))
        .chain(T.join('\n'))
        .value()
    );

    // When user input data and click enter key.
    process.stdin.on('data', async function(data) {
      // console.log(`>${data}<`);

      const response = data.toLowerCase().replace('\n', '');
      if ('m' === response) {
        resolve(`take ${state.out.items[0]}`);
        return;
      }
      if (!isNaN(parseInt(response, 10))) {
        resolve(
          T.chain(response)
            .chain(parseInteger())
            .chain(i => state.out.items[i])
            .chain(item => `take ${item}`)
            .value()
        );
        return;
      }
      if ('p' === response) {
        resolve(`drop ${state.items[0]}`);
        return;
      }
      if (response.startsWith('p')) {
        resolve(
          T.chain(response)
            .chain(replace(/p/, ''))
            .chain(parseInteger())
            .chain(i => state.items[i])
            .chain(item => `drop ${item}`)
            .value()
        );
        return;
      }

      resolve(USER_TO_DROID_COMMAND[response]);
      return;
    });
  });
}
