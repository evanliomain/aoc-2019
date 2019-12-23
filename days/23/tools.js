const T = require('taninsam');
const chalk = require('chalk');

const { listen } = require('../../intcode-computer');
const { chunk, replaceAt, parseInteger } = require('../../tools');

const NB_COMPUTER = 50;
const NB_OUTPUT = 3;
const execOptions = { debug: false, runUntilHalt: false };

module.exports = {
  start,
  networkListen,
  print,
  isIdle,
  isNatEmpty
};

function startComputer(program) {
  return {
    program,
    instructionPointer: 0,
    relativeBase: 0
  };
}

function run(input) {
  return programState =>
    listen(
      programState.program,
      input.slice(),
      {
        instructionPointer: programState.instructionPointer,
        relativeBase: programState.relativeBase
      },
      execOptions
    );
}

function start() {
  return program => {
    const network = startNetwork(program);
    const packets = startPackets();
    return { network, packets, nat: null };
  };
}

function startNetwork(program) {
  // console.log(`Starting network...`);
  return T.chain(program)
    .chain(startComputer)
    .chain(T.arrayFromValue(NB_COMPUTER))
    .value();
}

function startPackets() {
  return T.chain(0)
    .chain(T.arrayFromValue(NB_COMPUTER))
    .chain(T.map((_, address) => [[address], [-1]]))
    .value();
}

function networkListen() {
  return ({ network, packets, nat }) => {
    // console.log(`Listen network...`);
    let outputNetwork = network.slice();
    let outputPackets = packets.slice();

    for (let address = 0; address < NB_COMPUTER; address++) {
      packets[address].forEach(input => {
        // console.log(`Listen ${address} -> ${input}`);

        const newComputer = run(input)(outputNetwork[address]);
        outputNetwork[address] = newComputer;

        if (hasOutput(newComputer)) {
          const outputs = T.chain(newComputer.output)
            .chain(chunk(NB_OUTPUT))
            .chain(T.map(T.map(parseInteger())))
            .value();

          outputs.forEach(([target, x, y]) => {
            if (NB_COMPUTER <= target) {
              nat = { x, y };
            } else {
              outputPackets[target].push([x, y]);
            }
          });
        }
      });
      outputPackets[address] = [];
    }
    return { network: outputNetwork, packets: outputPackets, nat };
  };
}

function hasOutput(computer) {
  return T.isArray(computer.output) && 0 !== computer.output.length;
}

function print({ packets }) {
  return T.chain(packets)
    .chain(T.map((values, address) => ({ values, address })))
    .chain(T.filter(({ values }) => 0 !== values.length))
    .chain(
      T.map(
        ({ address, values }) =>
          `@${chalk.green(address)}: ${values.join(' | ')}`
      )
    )
    .chain(T.join('\n'))
    .value();
}

function isIdle() {
  return ({ packets }) =>
    T.chain(packets)
      .chain(T.some(packet => 0 !== packet.length))
      .value();
}

function isNatEmpty() {
  return state => T.isNil(state.nat);
}
