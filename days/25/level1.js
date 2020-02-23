const T = require('taninsam');

const spaceMap = require('../../output/24-space-map.json');
const userInputs = require('../../output/24-user-inputs.json');

const {
  DROID_COMMAND,
  move,
  moves,
  start,
  printerConsole,
  getRecordValue,
  getNextPosition,
  saveSpace,
  wrap,
  printerFile,
  writeUserInputs
} = require('./tools');

const USER_COMMAND = { NORTH: 'z', SOUTH: 's', WEST: 'q', EAST: 'd' };

const USER_TO_DROID_COMMAND = {
  [USER_COMMAND.NORTH]: DROID_COMMAND.NORTH,
  [USER_COMMAND.SOUTH]: DROID_COMMAND.SOUTH,
  [USER_COMMAND.WEST]: DROID_COMMAND.WEST,
  [USER_COMMAND.EAST]: DROID_COMMAND.EAST
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
    // saveSpace(state);
    state = await userDeplacement(state);
  }
}

async function userDeplacement(state) {
  const direction = await askDirection();
  userInputs.push(direction);
  writeUserInputs(userInputs);
  return move(direction)(state);
}

async function askDirection() {
  return new Promise(function(resolve, reject) {
    // Set input character encoding.
    process.stdin.setEncoding('utf-8');

    // Prompt user to input data in console.
    console.log(
      'Where do you wanna go ? (north: z, west: q, south: s, east: d)'
    );

    // When user input data and click enter key.
    process.stdin.on('data', async function(data) {
      if (`${USER_COMMAND.EAST}\n` === data.toLowerCase()) {
        resolve(DROID_COMMAND.EAST);
        return;
      }
      if (`${USER_COMMAND.WEST}\n` === data.toLowerCase()) {
        resolve(DROID_COMMAND.WEST);
        return;
      }
      if (`${USER_COMMAND.NORTH}\n` === data.toLowerCase()) {
        resolve(DROID_COMMAND.NORTH);
        return;
      }
      if (`${USER_COMMAND.SOUTH}\n` === data.toLowerCase()) {
        resolve(DROID_COMMAND.SOUTH);
        return;
      }
      resolve(DROID_COMMAND.WEST);
    });
  });
}
