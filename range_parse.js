function range_parse(range, text = true) {
  range = range.replace(/ /g, "");
  range = range.split(",");
  let all_combos = [];
  let all_bad_combos = [];
  for (const hands of range) {
    let combos = [];
    let bad_combos = [];
    switch (get_parse_idx(hands)) {
      case 1:
        combos = parse_pp_plus(hands);
        break;
      case 2:
        combos = parse_pp_single(hands);
        break;
      case 3:
        combos = parse_pp_range(hands);
        break;
      case 4:
        combos = parse_suited_plus(hands);
        break;
      case 5:
        combos = parse_suited_single(hands);
        break;
      case 6:
        [combos, bad_combos] = parse_suited_range(hands);
        break;
      case 7:
        combos = parse_offsuit_plus(hands);
        break;
      case 8:
        combos = parse_offsuit_single(hands);
        break;
      case 9:
        [combos, bad_combos] = parse_offsuit_range(hands);
        break;
      case 10:
        combos = parse_single_combo(hands);
      case -1:
        all_bad_combos.push(hands);
        break;
    }
    all_combos = [...all_combos, ...combos];
    all_bad_combos = [...all_bad_combos, ...bad_combos];
  }
  console.log("stop");
  // need to handle duplicates, or check for them or something.
  // need to ensure there are no dublicates.  there we go. that's what I wanted to say.
  // ex: QQ+ and then 33+ would be weird, but is valid.
}

/**
 * 1 - pocket pair plus
 * 2 - pocket pair single
 * 3 - pocket pair range
 * 4 - suited plus
 * 5 - suited single
 * 6 - suited range
 * 7 - offsuit plus
 * 8 - offsuit single
 * 9 - offsuit range
 * 10 - single combo
 */
function get_parse_idx(hands) {
  if (pp_plus.test(hands)) {
    return 1;
  } else if (pp_single.test(hands)) {
    return 2;
  } else if (pp_range.test(hands)) {
    return 3;
  } else if (suited_plus.test(hands)) {
    return 4;
  } else if (suited_single.test(hands)) {
    return 5;
  } else if (suited_range.test(hands)) {
    return 6;
  } else if (offsuit_plus.test(hands)) {
    return 7;
  } else if (offsuit_single.test(hands)) {
    return 8;
  } else if (offsuit_range.test(hands)) {
    return 9;
  } else if (single_combo.test(hands)) {
    return 10;
  }
  return -1;
}

function parse_pp_plus(hands) {
  let combos = [];
  const low_rank = face_to_value[hands[0]];
  for (let i = low_rank; i <= 14; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = j + 1; k < 4; k++) {
        if (j === k) {
          continue;
        }
        combos.push(
          `${value_to_face[i]}${suits_str[j]}${value_to_face[i]}${suits_str[k]}`
        );
      }
    }
  }
  return combos;
}
function parse_pp_single(hands) {
  let combos = [];
  const rank = face_to_value[hands[0]];
  for (let j = 0; j < 4; j++) {
    for (let k = j + 1; k < 4; k++) {
      if (j === k) {
        continue;
      }
      combos.push(
        `${value_to_face[rank]}${suits_str[j]}${value_to_face[rank]}${suits_str[k]}`
      );
    }
  }
  return combos;
}

function parse_pp_range(hands) {
  let combos = [];
  const low_rank = Math.min(face_to_value[hands[0]], face_to_value[hands[3]]);
  const high_rank = Math.max(face_to_value[hands[0]], face_to_value[hands[3]]);
  for (let i = low_rank; i <= high_rank; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = j + 1; k < 4; k++) {
        if (j === k) {
          continue;
        }
        combos.push(
          `${value_to_face[i]}${suits_str[j]}${value_to_face[i]}${suits_str[k]}`
        );
      }
    }
  }
  return combos;
}

function parse_suited_plus(hands) {
  let combos = [];
  const high_rank = Math.max(face_to_value[hands[0]], face_to_value[hands[1]]);
  const low_rank = Math.min(face_to_value[hands[0]], face_to_value[hands[1]]);
  for (let i = low_rank; i < high_rank; i++) {
    for (const suit of suits_str) {
      combos.push(
        `${value_to_face[high_rank]}${suit}${value_to_face[i]}${suit}`
      );
    }
  }
  return combos;
}

function parse_suited_single(hands) {
  let combos = [];
  const high_rank = Math.max(face_to_value[hands[0]], face_to_value[hands[1]]);
  const low_rank = Math.min(face_to_value[hands[0]], face_to_value[hands[1]]);
  for (const suit of suits_str) {
    combos.push(
      `${value_to_face[high_rank]}${suit}${value_to_face[low_rank]}${suit}`
    );
  }
  return combos;
}

function parse_suited_range(hands) {
  let combos = [];
  let bad_combos = [];
  // need to account for upper or lower case
  if (
    face_to_value[hands[1]] >= face_to_value[hands[0]] ||
    face_to_value[hands[5]] >= face_to_value[hands[4]]
  ) {
    bad_combos.push(hands);
    return [combos, bad_combos];
  }
  const rank1 = hands[0];
  const high_rank = Math.max(face_to_value[hands[1]], face_to_value[hands[5]]);
  const low_rank = Math.min(face_to_value[hands[1]], face_to_value[hands[5]]);
  for (let i = low_rank; i <= high_rank; i++) {
    for (const suit of suits_str) {
      combos.push(`${rank1}${suit}${value_to_face[i]}${suit}`);
    }
  }
  return [combos, bad_combos];
}

function parse_offsuit_plus(hands) {
  let combos = [];
  const high_rank = Math.max(face_to_value[hands[0]], face_to_value[hands[1]]);
  const low_rank = Math.min(face_to_value[hands[0]], face_to_value[hands[1]]);
  for (let i = low_rank; i < high_rank; i++) {
    for (const suit1 of suits_str) {
      for (const suit2 of suits_str) {
        if (suit1 === suit2) {
          continue;
        }
        combos.push(
          `${value_to_face[high_rank]}${suit1}${value_to_face[i]}${suit2}`
        );
      }
    }
  }
  return combos;
}

function parse_offsuit_range(hands) {
  let combos = [];
  let bad_combos = [];
  // need to account for upper or lower case
  if (
    face_to_value[hands[1]] >= face_to_value[hands[0]] ||
    face_to_value[hands[5]] >= face_to_value[hands[4]]
  ) {
    bad_combos.push(hands);
    return [combos, bad_combos];
  }
  return [combos, bad_combos];
}

function parse_offsuit_single(hands) {
  let combos = [];
  return combos;
}

function parse_single_combo(hand) {
  let combos = [];
  return combos;
}

/** These regexes guarantee that for each type that passes,
 * the allowed characters will be in the correct string indexes.
 */
const pp_plus = /^([2-9akqjt])\1\+$/i;
const pp_single = /^([2-9akqjt])\1$/i;
const pp_range = /^([2-9akqjt])\1\-([2-9akqjt])\2$/i;
const suited_plus = /^([0-9akqjt])(?!\1)[0-9akqjt]s\+$/i;
const suited_single = /^([0-9akqjt])(?!\1)[0-9akqjt]s$/i;
const suited_range = /^([0-9akqjt])(?!\1)[0-9akqjt]s-\1[0-9akqjt]s$/i; // T8s-TAs will return true, so check for valid range when parsing
const offsuit_plus = /^([0-9akqjt])(?!\1)[0-9akqjt]o\+$/i;
const offsuit_single = /^([0-9akqjt])(?!\1)[0-9akqjt]o$/i;
const offsuit_range = /^([0-9akqjt])(?!\1)[0-9akqjt]o-\1[0-9akqjt]o$/i; // T8o-TAo will return true, so check for valid range when parsing
const single_combo = /([0-9akqjt][schd])(?!\1)[0-9akqjt][schd]/i;

const face_to_value = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

const value_to_face = {
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "T",
  11: "J",
  12: "Q",
  13: "K",
  14: "A",
};

const suits_str = ["s", "c", "h", "d"];
const suits_int = [1, 2, 3, 4];

const range =
  "t8o-tao, AQo+, AJs-A3s, 55-33, KJs, A2s+, KK+, 88, ATo+, K8o-KTo, 5h4h";
const res = range_parse(range);
console.log("stop");
