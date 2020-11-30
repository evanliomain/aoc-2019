const T = require('taninsam');
const chalk = require('chalk');
const jsgraphs = require('js-graph-algorithms');

const {
  printMatrix,
  patternMatchingWith,
  printMatrixToFile,
  mapMatrix,
  atMatrix
} = require('../../tools');

const AREA = {
  EMPTY_SPACE: ' ',
  OPEN_PASSAGE: '.',
  WALL: '#'
};
const AREA_RE = {
  EMPTY_SPACE: / /,
  OPEN_PASSAGE: /\./,
  WALL: /#/,
  PORTAL: /[A-Z]/
};

const WALL_COLOR = '#0095a8';
const COLOR_PALETTE = [
  '#ef5350',
  '#9e9e9e',
  '#bcaaa4',
  '#f57c00',
  '#f06292',
  '#ff6f00',
  '#fdd835',
  '#c0ca33',
  '#7cb342',
  '#66bb6a',
  '#90a4ae',
  '#ff7043',
  '#9fa8da',
  '#26a69a',
  '#ce93d8',
  '#26c6da',
  '#29b6f6',
  '#42a5f5',
  '#b39ddb'
];
const PORTAL_TYPE = { OUTER: 'outer', INNER: 'inner' };

const DIRECTION = { NORTH: 'N', SOUTH: 'S', EAST: 'E', WEST: 'W' };
const DIRECTION_MOVE = {
  N: { dx: 0, dy: -1 },
  S: { dx: 0, dy: 1 },
  E: { dx: 1, dy: 0 },
  W: { dx: -1, dy: 0 }
};
const DIRECTION_PRINT = {
  N: 'triangle-up',
  S: 'triangle-down',
  E: 'triangle-right',
  W: 'triangle-left'
};
const DIRECTION_PRINT_CONSOLE = {
  N: '^',
  S: 'v',
  E: '>',
  W: '<'
};

module.exports = {
  DIRECTION_MOVE,
  printConsole,
  printFile,
  start,
  createState,
  moveStep
};

function printConsole() {
  return state =>
    printMatrix(
      patternMatchingWith(
        [area => AREA_RE.EMPTY_SPACE.test(area), () => chalk.bgBlack(' ')],
        [
          area => AREA_RE.OPEN_PASSAGE.test(area),
          () => chalk.bgBlack.white('.')
        ],
        [area => AREA_RE.WALL.test(area), () => chalk.bgCyan.white(' ')],
        [area => AREA_RE.PORTAL.test(area), area => chalk.bgBlack.magenta(area)]
      )
    )(state.maze);
}

function printFile(index = '') {
  return state => {
    printMatrixToFile([
      // layer: wall, open passage
      patternMatchingWith(
        [area => AREA_RE.OPEN_PASSAGE.test(area), () => 'white'],
        [area => AREA_RE.WALL.test(area), () => WALL_COLOR],
        [
          area => AREA_RE.PORTAL.test(area),
          text => ({ shape: 'text', fill: pickColor(text), text })
        ],
        [() => null]
      ),
      // layer: open passage dot
      patternMatchingWith(
        [
          area => AREA_RE.OPEN_PASSAGE.test(area),
          () => ({ shape: 'circle', fill: '#424242', scale: 0.1 })
        ],
        [() => null]
      ),
      // layer: portals position
      (cell, x, y) => {
        const pos = positionToString({ x, y });
        if (T.isNil(state.portals.byPosition[pos])) {
          return;
        }
        const portalName = state.portals.byPosition[pos];
        if (['AA', 'ZZ'].includes(portalName)) {
          return { shape: 'circle', fill: '#66bb6a', scale: 0.8 };
        }

        const shape =
          PORTAL_TYPE.OUTER === state.portals.byPositionType[pos]
            ? 'rect'
            : 'circle';
        const fill =
          PORTAL_TYPE.OUTER === state.portals.byPositionType[pos]
            ? 'blue'
            : '#ab47bc';
        return { shape, fill, scale: 0.5 };
      },
      // layer: intersection
      (cell, x, y) => {
        const pos = positionToString({ x, y });
        if (T.isNil(state.intersections[pos])) {
          return;
        }
        return { shape: 'text', fill: 'black', text: state.intersections[pos] };
      }
    ])(`maze${'' === index ? '' : '-' + index}`, 20, true)(state.maze);
    return state;
  };
}

function pickColor(letter) {
  return COLOR_PALETTE[
    (letter.codePointAt() - 'A'.codePointAt()) % COLOR_PALETTE.length
  ];
}

function createState() {
  return maze =>
    T.chain(maze)
      .chain(maze => ({ maze }))
      .chain(state => ({ ...state, portals: findPortals(state) }))
      .chain(state => ({ ...state, intersections: findIntersections(state) }))
      .chain(state => ({ ...state, start: getStart(state) }))
      .chain(state => ({ ...state, end: getEnd(state) }))
      .chain(state => ({ ...state, position: state.start }))
      .chain(state => ({
        ...state,
        direction: DIRECTION_MOVE[getStartDirection(state)]
      }))
      .chain(state => ({ ...state, level: 0 }))
      .value();
}

function start() {
  return maze =>
    T.chain(maze)
      .chain(createState())
      .chain(state => ({ ...state, graph: createGraph(state) }))
      .chain(state => ({ ...state, weightedDiGraph: toWeightedDiGraph(state) }))
      .value();
}

function findPortals({ maze }) {
  const atM = position => atMatrix(position)(maze);

  return T.chain(maze)
    .chain(
      mapMatrix((cell, x, y) => {
        // Exclude bound to not be out the matrix
        if (
          0 === x ||
          0 === y ||
          maze.length - 1 === y ||
          maze[0].length - 1 === x
        ) {
          return cell;
        }
        // We just care about portals
        if (!AREA_RE.PORTAL.test(cell)) {
          return cell;
        }
        // Does it have an open passage next?
        if (
          [
            atM({ x: x + 1, y }),
            atM({ x: x - 1, y }),
            atM({ x, y: y + 1 }),
            atM({ x, y: y - 1 })
          ].every(c => !AREA_RE.OPEN_PASSAGE.test(c))
        ) {
          return cell;
        }
        let name = '';
        let position = {};
        let type;
        if (AREA_RE.OPEN_PASSAGE.test(atM({ x: x + 1, y }))) {
          name = `${atM({ x: x - 1, y })}${cell}`;
          position = { x: x + 1, y };
          type = 0 === x - 1 ? PORTAL_TYPE.OUTER : PORTAL_TYPE.INNER;
        }

        if (AREA_RE.OPEN_PASSAGE.test(atM({ x: x - 1, y }))) {
          name = `${cell}${atM({ x: x + 1, y })}`;
          position = { x: x - 1, y };
          type =
            maze[0].length - 1 === x + 1
              ? PORTAL_TYPE.OUTER
              : PORTAL_TYPE.INNER;
        }

        if (AREA_RE.OPEN_PASSAGE.test(atM({ x, y: y + 1 }))) {
          name = `${atM({ x, y: y - 1 })}${cell}`;
          position = { x, y: y + 1 };
          type = 0 === y - 1 ? PORTAL_TYPE.OUTER : PORTAL_TYPE.INNER;
        }

        if (AREA_RE.OPEN_PASSAGE.test(atM({ x, y: y - 1 }))) {
          name = `${cell}${atM({ x, y: y + 1 })}`;
          position = { x, y: y - 1 };
          type =
            maze.length - 1 === y + 1 ? PORTAL_TYPE.OUTER : PORTAL_TYPE.INNER;
        }
        return { name, position, type };
      })
    )
    .chain(T.flat())
    .chain(T.filter(cell => !T.isString(cell)))
    .link('portals')
    .chain(
      T.reduce((acc, { name, position, type }) => {
        const element = { ...position, type };
        if (T.isNil(acc[name])) {
          acc[name] = [element];
        } else {
          acc[name].push(element);
        }
        return acc;
      }, {})
    )
    .link('byName')
    .chain((_, { portals }) => portals)
    .chain(
      T.toObject(
        ({ position }) => positionToString(position),
        ({ name }) => name
      )
    )
    .link('byPosition')
    .chain((_, { portals }) => portals)
    .chain(
      T.toObject(
        ({ position }) => positionToString(position),
        ({ type }) => type
      )
    )
    .link('byPositionType')
    .chain((_, { byName, byPosition, byPositionType }) => ({
      byName,
      byPosition,
      byPositionType
    }))
    .value();
}

function findIntersections({ maze, portals }) {
  const innerIntersection = T.chain(maze)
    .chain(
      mapMatrix((cell, x, y) => {
        if (!isOpenPassage({ maze })({ x, y })) {
          return 0;
        }
        return T.chain({ x, y })
          .chain(positionToNeighboors)
          .chain(T.filter(isOpenPassage({ maze })))
          .chain(T.length())
          .value();
      })
    )
    .chain(mapMatrix((nbIntersection, x, y) => ({ nbIntersection, x, y })))
    .chain(T.flat())
    .chain(T.filter(({ nbIntersection }) => 2 < nbIntersection))
    .chain(T.map(({ x, y }, i) => ({ x, y, i })))
    .chain(T.toObject(positionToString, ({ i }) => String(i)))
    .value();

  return {
    ...innerIntersection,
    [positionToString(portals.byName['AA'][0])]: 'S',
    [positionToString(portals.byName['ZZ'][0])]: 'E'
  };
}

function getStart({ portals }) {
  return portals.byName['AA'][0];
}

function getEnd({ portals }) {
  return portals.byName['ZZ'][0];
}

function createGraph(state) {
  return T.chain(state.intersections)
    .chain(T.entries())
    .chain(T.map(([pos, name]) => ({ ...positionFromString(pos), name })))
    .chain(
      T.map(({ x, y, name }) =>
        T.chain({ x, y })
          .chain(positionToNeighboors)
          .chain(T.filter(isOpenPassage(state)))
          .chain(T.map(positionsToDirection({ x, y })))
          .chain(T.map(moveForward(state)({ x, y }, 1)))
          .chain(T.filter(T.not(T.isNil)))
          .chain(nextIntersections => [name, nextIntersections])
          .value()
      )
    )
    .chain(T.fromEntries())
    .value();
}

function toWeightedDiGraph({ graph }) {
  const nodes = T.chain(graph)
    .chain(T.keys())
    .value();
  const nameToIndex = T.chain(nodes)
    .chain(T.map((name, i) => [name, i]))
    .chain(T.fromEntries())
    .value();

  const g = new jsgraphs.WeightedDiGraph(nodes.length);

  nodes.forEach((nodeName, nodeIndex) => {
    graph[nodeName].forEach(({ next, step }) => {
      g.addEdge(new jsgraphs.Edge(nodeIndex, nameToIndex[next], step));
    });
    g.node(nodeIndex).label = nodeName;
  });

  return g;
}

function moveForward(state) {
  return (position, step) => direction => {
    const currentDirection = findNextDirection(state)(position)(direction);
    if (T.isNil(currentDirection)) {
      // It's a dead end
      return;
    }

    const { position: newPosition, direction: advisedDirection } = move(state)(
      position
    )(currentDirection);

    if (isOnIntersection(state)(newPosition)) {
      // We found the next intersection
      return { next: getIntersection(state)(newPosition), step };
    }
    // keep moving
    return moveForward(state)(newPosition, step + 1)(advisedDirection);
  };
}

function findNextDirection(state) {
  return pos => {
    const _canGoTo = canGoTo(state)(pos);

    return previousDirection => {
      // Can we go straight on?
      if (_canGoTo(previousDirection)) {
        return previousDirection;
      }
      // Can we turn left?
      if (_canGoTo(turnLeft(previousDirection))) {
        return turnLeft(previousDirection);
      }

      // Can we turn right?
      if (_canGoTo(turnRight(previousDirection))) {
        return turnRight(previousDirection);
      }

      // We don't go back
      return;
    };
  };
}

function getStartDirection(state) {
  const { x, y } = state.start;
  if (0 === y - 2) {
    return DIRECTION.SOUTH;
  }
  if (state.maze.length - 1 === y + 2) {
    return DIRECTION.NORTH;
  }
  if (0 === x - 2) {
    return DIRECTION.EAST;
  }
  if (state.maze[0].length - 1 === x + 2) {
    return DIRECTION.WEST;
  }
}

function moveStep(state) {
  return { ...state, ...move(state)(state.position)(state.direction) };
}

/**
 * Travel
 */

function move(state) {
  return position => direction => {
    console.log('move', position, direction);

    const newPosition = goTo(direction)(position);

    if (isOnStart(state)(newPosition) || isOnEnd(state)(newPosition)) {
      return { position: newPosition, direction };
    }

    if (isPortal(state)(newPosition)) {
      const teleportedPosition = teleport(state)(position);

      const dl =
        PORTAL_TYPE.INNER ===
        state.portals.byPositionType[positionToString(newPosition)]
          ? 1
          : -1;

      return {
        position: teleportedPosition,
        level: state.level + dl,
        direction: T.chain(teleportedPosition)
          .chain(positionToNeighboors)
          .chain(T.filter(isOpenPassage(state)))
          .chain(T.head())
          .chain(positionsToDirection(teleportedPosition))
          .value()
      };
    }
    return { position: newPosition, direction, level: state.level };
  };
}

function teleport(state) {
  return position => {
    const portal = state.portals.byPosition[positionToString(position)];
    const [p1, p2] = state.portals.byName[portal];
    if (p1.x === position.x && p1.y === position.y) {
      return p2;
    }
    return p1;
  };
}

/**
 * Getters
 */

function getIntersection({ intersections }) {
  return position => intersections[positionToString(position)];
}
function getPortalName(state) {
  return position => state.portals.byPosition[positionToString(position)];
}

/**
 * Test we can go to the position + direction
 * @param state
 * @param {x, y} position
 * @param {dx, dy} direction
 * @returns boolean true if we can go from position to position + direction
 */
function canGoTo(state) {
  return position => direction => !isWall(state)(goTo(direction)(position));
}

/**
 * Tests on maze elements
 */

function isOpenPassage({ maze }) {
  return position => AREA_RE.OPEN_PASSAGE.test(atMatrix(position)(maze));
}
function isWall({ maze }) {
  return position => AREA_RE.WALL.test(atMatrix(position)(maze));
}
function isPortal({ maze }) {
  return position => AREA_RE.PORTAL.test(atMatrix(position)(maze));
}
function isOnStart(state) {
  return position => 'AA' === getPortalName(state)(position);
}
function isOnEnd(state) {
  return position => 'ZZ' === getPortalName(state)(position);
}
function isOnIntersection({ intersections }) {
  return position => !T.isNil(intersections[positionToString(position)]);
}

// So generic function that can be easily re-use
/**
 * Transform a direction once you turn left
 * @param {dx, dy} direction
 * @returns {dx, dy} direction left
 */
function turnLeft({ dx, dy }) {
  return { dx: dy, dy: -dx };
}
/**
 * Transform a direction once you turn right
 * @param {dx, dy} direction
 * @returns {dx, dy} direction right
 */
function turnRight({ dx, dy }) {
  return { dx: -dy, dy: dx };
}
/**
 * Stringify a position
 * @param {x, y} position
 * @returns string s
 */
function positionToString({ x, y }) {
  return `${x},${y}`;
}
/**
 * Parse a string, and convert into position
 * @param string s
 * @returns {x, y} position
 *
 */
function positionFromString(s) {
  const [x, y] = s.split(',');
  return { x: parseInt(x, 10), y: parseInt(y, 10) };
}
/**
 * Get the position after apply direction on starting position
 * @param {dx, dy} direction
 * @param {x, y} starting position
 * @returns {x, y} ending position
 */
function goTo({ dx, dy }) {
  return ({ x, y }) => ({ x: x + dx, y: y + dy });
}
/**
 * Get direction to go from start to end
 * @param {x, y} start
 * @param {x, y} end
 * @returns {dx, dy}
 */
function positionsToDirection(start) {
  return end => ({ dx: end.x - start.x, dy: end.y - start.y });
}
/**
 * Find neighboors of a position: top, right, bottom, left
 * @param {x, y} position
 * @returns {x, y}[]
 */
function positionToNeighboors({ x, y }) {
  return [{ x, y: y - 1 }, { x: x + 1, y }, { x, y: y + 1 }, { x: x - 1, y }];
}
