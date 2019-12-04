module.exports = {
  digitsNeverDecrease,
  twoAdjacentDigitsAreTheSame,
  isASixDigit,
  twoAdjacentMatchingDigitsAreNotPartOfALargerGroupOfMatchingDigits
};

function digitsNeverDecrease(n) {
  const digits = String(n).split('');
  let previous = digits[0];
  for (let i = 1; i < digits.length; i++) {
    const current = digits[i];
    if (current < previous) {
      return false;
    }
    previous = current;
  }
  return true;
}
function twoAdjacentDigitsAreTheSame(n) {
  const digits = String(n).split('');
  let previous = digits[0];
  for (let i = 1; i < digits.length; i++) {
    const current = digits[i];
    if (current === previous) {
      return true;
    }
    previous = current;
  }
  return false;
}

function isASixDigit(n) {
  const digits = String(n).split('');
  return 6 === digits.length;
}

function twoAdjacentMatchingDigitsAreNotPartOfALargerGroupOfMatchingDigits(n) {
  const digits = String(n).split('');

  // let previous = digits[0];
  // let current = digits[1];
  // let inMatching = false;
  // for (let i = 2; i < digits.length - 1; i++) {
  //   const next = digits[i];

  //   if (!inMatching && previous === current && current !== next) {
  //     return true;
  //   }
  //   if (inMatching && previous !== current) {
  //     inMatching = false;
  //   }
  //   if (previous === current) {
  //     inMatching = true;
  //   }
  //   previous = current;
  //   current = next;
  // }
  // if (digits[3] !== digits[4] && digits[4] === digits[5]) {
  //   return true;
  // }
  // return false;

  const [d1, d2, d3, d4, d5, d6] = digits;

  if (d1 === d2 && d2 !== d3) {
    return true;
  }
  if (d1 !== d2 && d2 === d3 && d3 !== d4) {
    return true;
  }
  if (d2 !== d3 && d3 === d4 && d4 !== d5) {
    return true;
  }
  if (d3 !== d4 && d4 === d5 && d5 !== d6) {
    return true;
  }
  if (d4 !== d5 && d5 === d6) {
    return true;
  }
  return false;

  // if (d1 === d2 && d2 === d3 && d3 !== d4) {
  //   return false;
  // }
  // if (d1 !== d2 && d2 === d3 && d3 === d4 && d4 !== d5) {
  //   return false;
  // }
  // if (d2 !== d3 && d3 === d4 && d4 === d5 && d5 !== d6) {
  //   return false;
  // }
  // if (d3 !== d4 && d4 === d5 && d5 === d6) {
  //   return false;
  // }
  // if (d1 === d2 && d2 === d3 && d3 === d4 && d4 === d5 && d5 !== d6) {
  //   return false;
  // }
  // if (d1 !== d2 && d2 === d3 && d3 === d4 && d4 === d5 && d5 === d6) {
  //   return false;
  // }
  // return true;
}
