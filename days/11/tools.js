const T = require('taninsam');
const chalk = require('chalk');
const { printMatrix, patternMatching } = require('../../tools');

const { execute } = require('../../intcode-computer');

const execOptions = { debug: false, runUntilHalt: false };

const DIRECTION = {
  UP: 'up',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right'
};

module.exports = {
  paint,
  print
};

function paint(startColor) {
  return program => {
    // Initial state
    let panels = { '0,0': startColor };
    let robotPosition = { x: 0, y: 0, direction: DIRECTION.UP };
    let state = { program, instructionPointer: 0, relativeBase: 0 };
    let halt = false;

    while (true) {
      let res = runTwice(state, getColor(panels, robotPosition));
      state = res.state;
      halt = state.halt;
      if (halt) {
        break;
      }
      const [color, direction] = res.output;

      panels = setColor(panels, robotPosition, color);
      robotPosition = move(robotPosition, direction);
    }
    return panels;
  };
}

function runTwice(state, colorInput) {
  const output = [];
  state = execute(
    state.program,
    colorInput,
    {
      instructionPointer: state.instructionPointer,
      relativeBase: state.relativeBase
    },
    execOptions
  );
  output.push(state.output);
  state = execute(
    state.program,
    undefined,
    {
      instructionPointer: state.instructionPointer,
      relativeBase: state.relativeBase
    },
    execOptions
  );
  output.push(state.output);
  return { state, output };
}

function getColor(panels, robotPosition) {
  const pos = `${robotPosition.x},${robotPosition.y}`;
  if (T.isNil(panels[pos])) {
    return 0;
  }
  return panels[pos];
}

function setColor(panels, robotPosition, color) {
  const pos = `${robotPosition.x},${robotPosition.y}`;
  panels[pos] = color;
  return panels;
}

function move(position, direction) {
  if (0 === direction) {
    // turn left 90 degrees
    switch (position.direction) {
      case DIRECTION.UP:
        return {
          x: position.x - 1,
          y: position.y,
          direction: DIRECTION.LEFT
        };
      case DIRECTION.LEFT:
        return {
          x: position.x,
          y: position.y + 1,
          direction: DIRECTION.BOTTOM
        };
      case DIRECTION.RIGHT:
        return {
          x: position.x,
          y: position.y - 1,
          direction: DIRECTION.UP
        };
      case DIRECTION.BOTTOM:
        return {
          x: position.x + 1,
          y: position.y,
          direction: DIRECTION.RIGHT
        };
    }
  }
  if (1 === direction) {
    // turn right 90 degrees
    switch (position.direction) {
      case DIRECTION.UP:
        return {
          x: position.x + 1,
          y: position.y,
          direction: DIRECTION.RIGHT
        };
      case DIRECTION.LEFT:
        return {
          x: position.x,
          y: position.y - 1,
          direction: DIRECTION.UP
        };
      case DIRECTION.RIGHT:
        return {
          x: position.x,
          y: position.y + 1,
          direction: DIRECTION.BOTTOM
        };
      case DIRECTION.BOTTOM:
        return {
          x: position.x - 1,
          y: position.y,
          direction: DIRECTION.LEFT
        };
    }
  }

  return position;
}

function print(panels) {
  return T.chain(panels)
    .chain(T.keys())
    .chain(T.map(T.split(',')))
    .chain(
      T.map(([x, y]) => ({
        x: parseInt(x, 10),
        y: parseInt(y, 10)
      }))
    )
    .chain(positions => ({
      xmin: T.minBy(({ x }) => x)(positions).x,
      xmax: T.maxBy(({ x }) => x)(positions).x,
      ymin: T.minBy(({ y }) => y)(positions).y,
      ymax: T.maxBy(({ y }) => y)(positions).y
    }))
    .chain(({ xmin, xmax, ymin, ymax }) => {
      const matrix = [];
      for (let rawIndex = ymin; rawIndex <= ymax; rawIndex++) {
        const raw = [];
        for (let colIndex = xmin; colIndex <= xmax; colIndex++) {
          raw.push(getColor(panels, { x: colIndex, y: rawIndex }));
        }
        matrix.push(raw.slice());
      }
      return matrix;
    })
    .chain(
      printMatrix(
        patternMatching(
          [0, () => chalk.bgBlack(' ')],
          [1, () => chalk.bgWhite(' ')]
        )
      )
    )
    .value();
}
