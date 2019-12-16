const T = require('taninsam');
const { patternMatchingBy, at, then } = require('../../tools');
const {
  STATUS,
  DIRECTION,
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

const PATH = {
  UNKNOWN: 0,
  KNOWN: 1,
  WALL: 2,
  GOAL: 3,
  ERROR: 4
};

const spaceMap = require('../../output/space-map.json');
const userInputs = require('../../output/user-inputs.json');

// Oxygen system is -16, -12

const USER_DIRECTION = { NORTH: 'z', SOUTH: 's', WEST: 'q', EAST: 'd' };

module.exports = async function(program) {
  // You start at position 0, 0
  let state = start(spaceMap)(program);
  // state = move(DIRECTION.WEST)(state);
  // printerFile('final2')(state);
  // return;

  // First, execute in automatic mode to discover the space
  // It save the map into output/space-map.json

  // Automatic
  return await automatic(state);

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
  state = moves(userInputs)(state);

  while (true) {
    console.log(printerConsole()(state));
    saveSpace(state);
    state = await userDeplacement(state);
  }
}

async function automatic(state) {
  const printer = index => async ({ space, currentPosition }) => {
    console.log(`Print discover ${index}`);
    return await printerFile(`discover/discover-${index}`)({
      space,
      currentPosition
    });
  };

  for (let count = 0; count < 5000; count++) {
    await printer(count)(state);
    state = deplacement(state);
  }
  printerConsole()(state);

  return;
  return (
    T.chain(state)
      .chain(T.loopFor(1000, deplacement))
      // .chain(wrap(printer(0))(x => x))
      // .chain(wrap(saveSpace)(x => x))
      .chain(printerConsole())
      .value()
  );
}

/**
 * @param { space, programState, currentPosition } state
 */
function deplacement(state) {
  return move(chooseDirection(state))(state);
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
    console.log('Where do you wanna go ? (z, q, s, d)');

    // When user input data and click enter key.
    process.stdin.on('data', async function(data) {
      if (`${USER_DIRECTION.EAST}\n` === data.toLowerCase()) {
        resolve(DIRECTION.EAST);
        return;
      }
      if (`${USER_DIRECTION.WEST}\n` === data.toLowerCase()) {
        resolve(DIRECTION.WEST);
        return;
      }
      if (`${USER_DIRECTION.NORTH}\n` === data.toLowerCase()) {
        resolve(DIRECTION.NORTH);
        return;
      }
      if (`${USER_DIRECTION.SOUTH}\n` === data.toLowerCase()) {
        resolve(DIRECTION.SOUTH);
        return;
      }
      resolve(DIRECTION.WEST);
    });
  });
}

function chooseDirection(state) {
  const tests = T.chain([
    testDirection(DIRECTION.EAST)(state),
    testDirection(DIRECTION.NORTH)(state),
    testDirection(DIRECTION.WEST)(state),
    testDirection(DIRECTION.SOUTH)(state)
  ])
    .chain(T.filter(({ path }) => PATH.WALL !== path && PATH.ERROR !== path))
    .chain(
      T.sortBy(
        patternMatchingBy(
          ({ path }) => path,
          [PATH.UNKNOWN, () => 1],
          [PATH.KNOWN, () => 2],
          [PATH.GOAL, () => 2],
          [3]
        )
      )
    )
    .value();

  if (PATH.UNKNOWN === tests[0].path) {
    return tests[0].direction;
  }

  return T.chain(tests)
    .chain(T.map(({ direction }) => direction))
    .chain(getRandomDirection)
    .value();
}

function getRandomDirection(directions) {
  return T.chain(directions)
    .chain(at(getRandomNumber(directions.length)))
    .value();
}
function getRandomNumber(nbDirection) {
  return Math.round(Math.random() * (nbDirection - 1));
}

/**
 *
 * @return PATH
 */
function testDirection(direction) {
  return state => {
    const status = getRecordValue(
      state.space,
      getNextPosition(state.currentPosition, direction)
    );
    if (T.isNil(status)) {
      // Unknown path, go to explore
      return { direction, path: PATH.UNKNOWN };
    }
    switch (status) {
      case STATUS.WALL:
        // Can't go into a wall
        return { direction, path: PATH.WALL };
      case STATUS.MOVED:
        // Clear path, ok
        return { direction, path: PATH.KNOWN };
      case STATUS.START:
        // Start position, why not
        return { direction, path: PATH.KNOWN };
      case STATUS.OXYGEN_SYSTEM:
        // Goal, hey
        return { direction, path: PATH.GOAL };
      default:
        return { direction, path: PATH.ERROR };
    }
  };
}
