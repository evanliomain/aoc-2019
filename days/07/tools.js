const T = require('taninsam');
const { execute } = require('../../intcode-computer');

module.exports = {
  serie,
  generatePhase,
  feedBackLoop
};

function serie(program) {
  const amplifier = phase => x => execute(program, [phase, x]).output;

  return ([i1, i2, i3, i4, i5]) =>
    T.chain(0)
      .chain(amplifier(i1))
      .chain(amplifier(i2))
      .chain(amplifier(i3))
      .chain(amplifier(i4))
      .chain(amplifier(i5))
      .value();
}

function feedBackLoop(mainProgram) {
  return ([i1, i2, i3, i4, i5]) => {
    // Final output, initialize to 0
    let fo = 0;

    // All amplifiers program
    let p1 = mainProgram.slice();
    let p2 = mainProgram.slice();
    let p3 = mainProgram.slice();
    let p4 = mainProgram.slice();
    let p5 = mainProgram.slice();

    // All amplifiers instruction pointer
    let ip1 = 0;
    let ip2 = 0;
    let ip3 = 0;
    let ip4 = 0;
    let ip5 = 0;

    // All amplifiers inputs
    let in1 = [i1];
    let in2 = [i2];
    let in3 = [i3];
    let in4 = [i4];
    let in5 = [i5];

    while (true) {
      in1.push(fo);
      const { output: o1, program: pp1, instructionPointer: ipp1 } = execute(
        p1,
        in1,
        { instructionPointer: ip1 }
      );
      p1 = pp1;
      ip1 = ipp1;
      in1 = [];

      in2.push(o1);
      const { output: o2, program: pp2, instructionPointer: ipp2 } = execute(
        p2,
        in2,
        { instructionPointer: ip2 }
      );
      p2 = pp2;
      ip2 = ipp2;
      in2 = [];

      in3.push(o2);
      const { output: o3, program: pp3, instructionPointer: ipp3 } = execute(
        p3,
        in3,
        { instructionPointer: ip3 }
      );
      p3 = pp3;
      ip3 = ipp3;
      in3 = [];

      in4.push(o3);
      const { output: o4, program: pp4, instructionPointer: ipp4 } = execute(
        p4,
        in4,
        { instructionPointer: ip4 }
      );
      p4 = pp4;
      ip4 = ipp4;
      in4 = [];

      in5.push(o4);
      const {
        output: o5,
        halt: h5,
        program: pp5,
        instructionPointer: ipp5
      } = execute(p5, in5, { instructionPointer: ip5 });
      p5 = pp5;
      ip5 = ipp5;
      in5 = [];

      if (!T.isUndefined(o5)) {
        fo = o5;
      }

      if (h5) {
        break;
      }
    }
    return fo;
  };
}

function generatePhase(min, max) {
  const phases = [];
  for (let i1 = min; i1 <= max; i1++) {
    for (let i2 = min; i2 <= max; i2++) {
      for (let i3 = min; i3 <= max; i3++) {
        for (let i4 = min; i4 <= max; i4++) {
          for (let i5 = min; i5 <= max; i5++) {
            if (
              i1 !== i2 &&
              i1 !== i3 &&
              i1 !== i4 &&
              i1 !== i5 &&
              i2 !== i3 &&
              i2 !== i4 &&
              i2 !== i5 &&
              i3 !== i4 &&
              i3 !== i5 &&
              i4 !== i5
            ) {
              phases.push([i1, i2, i3, i4, i5]);
            }
          }
        }
      }
    }
  }
  return phases;
}
