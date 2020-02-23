const T = require('taninsam');
const { patternMatchingWith, parseInteger, replace } = require('../../tools');
const { SHUFFLE_TECHNIQUE } = require('./tools');

const SHUFFLE_TECHNIQUE_RE = {
  DEAL_INTO_NEW_STACK: /deal into new stack/,
  CUT: /cut (-?\d*)/,
  DEAL_WITH_INCREMENT: /deal with increment (-?\d*)/
};

module.exports = function(input) {
  return T.chain(input)
    .chain(
      T.map(
        patternMatchingWith(
          [
            line => SHUFFLE_TECHNIQUE_RE.DEAL_INTO_NEW_STACK.test(line),
            () => ({ type: SHUFFLE_TECHNIQUE.DEAL_INTO_NEW_STACK })
          ],
          [
            line => SHUFFLE_TECHNIQUE_RE.CUT.test(line),
            line => ({
              type: SHUFFLE_TECHNIQUE.CUT,
              n: T.chain(line)
                .chain(replace(SHUFFLE_TECHNIQUE_RE.CUT, '$1'))
                .chain(parseInteger())
                .value()
            })
          ],
          [
            line => SHUFFLE_TECHNIQUE_RE.DEAL_WITH_INCREMENT.test(line),
            line => ({
              type: SHUFFLE_TECHNIQUE.DEAL_WITH_INCREMENT,
              n: T.chain(line)
                .chain(replace(SHUFFLE_TECHNIQUE_RE.DEAL_WITH_INCREMENT, '$1'))
                .chain(parseInteger())
                .value()
            })
          ]
        )
      )
    )
    .value();
};
