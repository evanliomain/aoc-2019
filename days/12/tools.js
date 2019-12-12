const T = require('taninsam');

module.exports = {
  energyAfter,
  initVelocity,
  step,
  stepAxe,
  hashAxe
};

function energyAfter(steps) {
  return input =>
    T.chain(input)
      .chain(positions => [positions, initVelocity()])
      .chain(T.loopFor(steps, step))
      .chain(energies)
      .value();
}

function stepAxe(axe) {
  return ([
    [satelit1, satelit2, satelit3, satelit4],
    [v1, v2, v3, v4],
    count
  ]) => {
    const vsatelit1 = {
      ...v1,
      ['v' + axe]: computeVelovityAxe(axe, v1, satelit1, [
        satelit2,
        satelit3,
        satelit4
      ])
    };
    const vsatelit2 = {
      ...v2,
      ['v' + axe]: computeVelovityAxe(axe, v2, satelit2, [
        satelit1,
        satelit3,
        satelit4
      ])
    };
    const vsatelit3 = {
      ...v3,
      ['v' + axe]: computeVelovityAxe(axe, v3, satelit3, [
        satelit1,
        satelit2,
        satelit4
      ])
    };
    const vsatelit4 = {
      ...v4,
      ['v' + axe]: computeVelovityAxe(axe, v4, satelit4, [
        satelit1,
        satelit2,
        satelit3
      ])
    };

    return [
      [
        { ...satelit1, [axe]: moveAxe(axe, satelit1, vsatelit1) },
        { ...satelit2, [axe]: moveAxe(axe, satelit2, vsatelit2) },
        { ...satelit3, [axe]: moveAxe(axe, satelit3, vsatelit3) },
        { ...satelit4, [axe]: moveAxe(axe, satelit4, vsatelit4) }
      ],
      [vsatelit1, vsatelit2, vsatelit3, vsatelit4],
      1 + count
    ];
  };
}

function step([[satelit1, satelit2, satelit3, satelit4], [v1, v2, v3, v4]]) {
  const vsatelit1 = computeVelovity(v1, satelit1, [
    satelit2,
    satelit3,
    satelit4
  ]);
  const vsatelit2 = computeVelovity(v2, satelit2, [
    satelit1,
    satelit3,
    satelit4
  ]);
  const vsatelit3 = computeVelovity(v3, satelit3, [
    satelit1,
    satelit2,
    satelit4
  ]);
  const vsatelit4 = computeVelovity(v4, satelit4, [
    satelit1,
    satelit2,
    satelit3
  ]);

  return [
    [
      move(satelit1, vsatelit1),
      move(satelit2, vsatelit2),
      move(satelit3, vsatelit3),
      move(satelit4, vsatelit4)
    ],
    [vsatelit1, vsatelit2, vsatelit3, vsatelit4]
  ];
}

function hashAxe(axe) {
  return ([[satelit1, satelit2, satelit3, satelit4], [v1, v2, v3, v4]]) =>
    [
      satelit1[axe],
      satelit2[axe],
      satelit3[axe],
      satelit4[axe],
      v1['v' + axe],
      v2['v' + axe],
      v3['v' + axe],
      v4['v' + axe]
    ].join('/');
}

function initVelocity() {
  return [
    { vx: 0, vy: 0, vz: 0 },
    { vx: 0, vy: 0, vz: 0 },
    { vx: 0, vy: 0, vz: 0 },
    { vx: 0, vy: 0, vz: 0 }
  ];
}

function computeVelovity(v, satelit, othersSatelit) {
  return {
    vx: computeVelovityAxe('x', v, satelit, othersSatelit),
    vy: computeVelovityAxe('y', v, satelit, othersSatelit),
    vz: computeVelovityAxe('z', v, satelit, othersSatelit)
  };
}
function computeVelovityAxe(axe, v, satelit, othersSatelit) {
  const d = satelit[axe];
  return T.chain(othersSatelit)
    .chain(T.map(sat => sat[axe]))
    .chain(T.map(dim => (d === dim ? 0 : d < dim ? 1 : -1)))
    .chain(T.sum())
    .chain(value => v['v' + axe] + value)
    .value();
}
function move(satelit, vsatelit) {
  return {
    x: moveAxe('x', satelit, vsatelit),
    y: moveAxe('y', satelit, vsatelit),
    z: moveAxe('z', satelit, vsatelit)
  };
}
function moveAxe(axe, satelit, vsatelit) {
  return satelit[axe] + vsatelit['v' + axe];
}

function energy(pos, vel) {
  return pot(pos) * kin(vel);
}
function pot({ x, y, z }) {
  return Math.abs(x) + Math.abs(y) + Math.abs(z);
}
function kin({ vx, vy, vz }) {
  return Math.abs(vx) + Math.abs(vy) + Math.abs(vz);
}
function energies([
  [satelit1, satelit2, satelit3, satelit4],
  [v1, v2, v3, v4]
]) {
  return (
    energy(satelit1, v1) +
    energy(satelit2, v2) +
    energy(satelit3, v3) +
    energy(satelit4, v4)
  );
}
