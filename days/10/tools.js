const T = require('taninsam');
const chalk = require('chalk');
const { mapMatrix, printMatrix } = require('../../tools');

module.exports = {
  pgcd,
  getBetterPlace,
  getStation,
  flagSpace,
  printSpace,
  getSense,
  getLength,
  getAngle,
  getAsteroids
};

function pgcd(a, b) {
  while (a != b) {
    if (a > b) {
      a -= b;
    } else {
      b -= a;
    }
  }
  return a;
}

function getStation(space) {
  return getBetterPlace(space)[1];
}

function getBetterPlace(space) {
  const { xLength, yLength } = getLength(space);

  return T.chain(genAllCoordinates(xLength, yLength))
    .chain(T.filter(hasAsteroid(space)))
    .chain(T.map(countDetectableAsteroid(space)))
    .chain(T.maxBy(([n]) => n))
    .value();
}

function printSpace(space, { station, pointer, target }) {
  return printMatrix(element => {
    const bg = getElementBg(element, { pointer });
    if (element.x === station.x && element.y === station.y) {
      return bg.red('X');
    }
    if (!element.hasAsteroid) {
      return bg(' ');
    }
    if (element.x === target.x && element.y === target.y) {
      return bg.red('0');
    }
    if (element.hasAsteroid && element.undetectable) {
      return bg.blue('O');
    }
    if (element.hasAsteroid && element.detected) {
      return bg.green('O');
    }
    return bg.red('?');
  })(space);
}

function getElementBg(element, { pointer }) {
  if (element.x === pointer.x && element.y === pointer.y) {
    return chalk.bgWhite;
  }
  return chalk.bgBlack;
}

function genAllCoordinates(xLength, yLength) {
  const coords = [];
  for (let y = 0; y < yLength; y++) {
    for (let x = 0; x < xLength; x++) {
      coords.push({ x, y });
    }
  }
  return coords;
}

function countDetectableAsteroid(space) {
  return ({ x, y }) => {
    return T.chain(space)
      .chain(flagSpace({ x, y }))
      .chain(countDetected)
      .chain(n => [n, { x, y }])
      .value();
  };
}

function copyMatrix(matrix) {
  return matrix.map(raw => raw.slice());
}

function getLength(space) {
  return {
    xLength: space[0].length,
    yLength: space.length
  };
}

function hasAsteroid(space) {
  return ({ x, y }) => space[y][x].hasAsteroid;
}

function flagSpace(position) {
  return space =>
    T.chain(space)
      .chain(markManathanDistance(position))
      .chain(flagAsteroid(position))
      .value();
}

function markManathanDistance(source) {
  return mapMatrix((cell, x, y) => ({
    ...cell,
    d: Math.abs(x - source.x) + Math.abs(y - source.y),
    dx: Math.abs(x - source.x),
    dy: Math.abs(y - source.y),
    x,
    y,
    undetectable: false,
    detected: false
  }));
}

function flagAsteroid(source) {
  return space => {
    const { xLength, yLength } = getLength(space);
    const dmax = xLength + yLength;

    for (let d = 1; d <= dmax; d++) {
      const bubbles = getBubble(space)(d);
      for (let b = 0; b < bubbles.length; b++) {
        const bubble = bubbles[b];
        if (!bubble.hasAsteroid) {
          continue;
        }
        if (bubble.undetectable) {
          continue;
        }
        space[bubble.y][bubble.x].detected = true;

        const { diffx, diffy } = getDiff(bubble);
        const xSense = getSense(source.x, bubble.x);
        const ySense = getSense(source.y, bubble.y);

        let i = 1;
        let xFlag = bubble.x + i * xSense * diffx;
        let yFlag = bubble.y + i * ySense * diffy;
        while (0 <= xFlag && 0 <= yFlag && xFlag < xLength && yFlag < yLength) {
          space[yFlag][xFlag].undetectable = true;
          i++;
          xFlag = bubble.x + i * xSense * diffx;
          yFlag = bubble.y + i * ySense * diffy;
        }
      }
    }
    return space;
  };
}

function getBubble(space) {
  const { xLength, yLength } = getLength(space);
  return d => {
    const coords = [];
    for (let y = 0; y < yLength; y++) {
      for (let x = 0; x < xLength; x++) {
        if (d === space[y][x].d) {
          coords.push({ ...space[y][x], x, y });
        }
      }
    }
    return coords;
  };
}

function countDetected(space) {
  const { xLength, yLength } = getLength(space);
  let detected = 0;
  for (let y = 0; y < yLength; y++) {
    for (let x = 0; x < xLength; x++) {
      if (space[y][x].detected) {
        detected++;
      }
    }
  }
  return detected;
}

function getDiff({ dx, dy }) {
  if (0 === dx) {
    return { diffx: 0, diffy: 1 };
  }
  if (0 === dy) {
    return { diffx: 1, diffy: 0 };
  }
  const p = pgcd(dx, dy);
  const diffx = dx / p;
  const diffy = dy / p;
  return { diffx, diffy };
}

function getSense(source, target) {
  if (source === target) {
    return 0;
  }
  if (source < target) {
    return 1;
  }
  if (target < source) {
    return -1;
  }
}

function getAsteroids(space) {
  return T.chain(space)
    .chain(T.flat())
    .chain(T.filter(element => element.hasAsteroid))
    .value();
}

function getAngle(a) {
  return b =>
    ((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 90 + 360) % 360;
}
