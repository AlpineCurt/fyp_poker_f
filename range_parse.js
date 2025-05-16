const suits_str = ["s", "c", "h", "d"];
const suits_int = [1, 2, 3, 4];

function order_suits(s1, s2) {
  const idx1 = suits_str.indexOf(s1);
  const idx2 = suits_str.indexOf(s2);
  if (idx1 === -1 || idx2 === -1) {
    throw "derp.";
  }
  if (idx1 < idx2) {
    return [s1, s2];
  } else {
    return [s2, s1];
  }
}

function range_parse(range) {
  range = range.replace(/ /g, "");
  range = range.split(",");
  let all_combos = new Set();
  let all_bad_combos = new Set();
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
        break;
      case -1:
        all_bad_combos.add(hands);
        break;
    }
    combos.forEach((c) => all_combos.add(c));
    bad_combos.forEach((c) => all_bad_combos.add(c));
  }
  return [all_combos, all_bad_combos];
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
  // need to standardize the order of suits for combos
  let combos = [];
  const rank = face_to_value[hands[0]];
  for (let j = 0; j < 4; j++) {
    for (let k = j + 1; k < 4; k++) {
      if (j === k) {
        continue;
      }
      const so = order_suits(suits_str[j], suits_str[k]);
      combos.push(
        `${value_to_face[rank]}${so[0]}${value_to_face[rank]}${so[1]}`
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
  const rank1 = hands[0];
  const high_rank = Math.max(face_to_value[hands[1]], face_to_value[hands[5]]);
  const low_rank = Math.min(face_to_value[hands[1]], face_to_value[hands[5]]);
  for (let i = low_rank; i <= high_rank; i++) {
    for (const suit1 of suits_str) {
      for (const suit2 of suits_str) {
        if (suit1 === suit2) {
          continue;
        }
        combos.push(`${rank1}${suit1}${value_to_face[i]}${suit2}`);
      }
    }
  }
  return [combos, bad_combos];
}

function parse_offsuit_single(hands) {
  let combos = [];
  const high_rank = Math.max(face_to_value[hands[0]], face_to_value[hands[1]]);
  const low_rank = Math.min(face_to_value[hands[0]], face_to_value[hands[1]]);
  for (const suit1 of suits_str) {
    for (const suit2 of suits_str) {
      if (suit1 === suit2) {
        continue;
      }
      combos.push(
        `${value_to_face[high_rank]}${suit1}${value_to_face[low_rank]}${suit2}`
      );
    }
  }
  return combos;
}

function parse_single_combo(hand) {
  let combos = [];
  if (face_to_value[hand[0]] > face_to_value[hand[2]]) {
    combos.push(hand);
  } else if (face_to_value[hand[0]] < face_to_value[hand[2]]) {
    const combo = `${hand[2]}${hand[3]}${hand[0]}${hand[1]}`;
    combos.push(combo);
  } else {
    const co = order_suits(hand[1], hand[3]);
    const combo = `${hand[0]}${co[0]}${hand[0]}${co[1]}`;
    combos.push(combo);
  }
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

function build_combos_obj() {
  const ranks = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const res = {};
  for (let i = 0; i < ranks.length; i++) {
    for (let j = i; j < ranks.length; j++) {
      if (i === j) {
        res[`${value_to_face[ranks[i]]}${value_to_face[ranks[j]]}`] = [];
      } else {
        res[`${value_to_face[ranks[i]]}${value_to_face[ranks[j]]}s`] = [];
        res[`${value_to_face[ranks[i]]}${value_to_face[ranks[j]]}o`] = [];
      }
    }
  }
  return res;
}

const comb_obj = build_combos_obj();

const range =
  "2h7d, T8o, K8o-KTo, AQo+, ATs-AQs, 55-33, KJs, Q8s+, KK+, 22-44, 88, ATo+, 5h4h, 7h7c, 7c7h";
const [all_combos, all_bad_combos] = range_parse(range);

function fill_combos_obj(comb_obj, combos) {
  for (const c of combos) {
    if (c[0] === c[2]) {
      comb_obj[`${c[0]}${c[0]}`].push(c);
    } else if (c[1] === c[3]) {
      comb_obj[`${c[0]}${c[2]}s`].push(c);
    } else {
      comb_obj[`${c[0]}${c[2]}o`].push(c);
    }
  }
}

fill_combos_obj(comb_obj, all_combos);

function combo_obj_to_range(co) {
  let rs = "";
  let ind_combos = [];
  const ranks = ["A", "K", "Q", "J", "T", 9, 8, 7, 6, 5, 4, 3, 2];

  // pocket pairs
  let i, j, k;
  for (i = 0; i < ranks.length; i = j) {
    let upper_rank, lower_rank;
    const rank1 = ranks[i];
    if (co[`${rank1}${rank1}`].length === 6) {
      upper_rank = rank1;
    } else {
      if (co[`${rank1}${rank1}`].length > 0) {
        ind_combos = [...ind_combos, ...co[`${rank1}${rank1}`]];
      }
      j++;
      continue;
    }

    for (j = i + 1; j < ranks.length; j++) {
      const rank2 = ranks[j];
      if (co[`${rank2}${rank2}`].length !== 6) {
        break;
      }
      lower_rank = rank2;
    }
    if (!lower_rank) {
      rs += `${upper_rank}${upper_rank},`;
    } else if (upper_rank && lower_rank) {
      if (upper_rank === "A") {
        rs += `${lower_rank}${lower_rank}+,`;
      } else {
        rs += `${lower_rank}${lower_rank}-${upper_rank}${upper_rank},`;
      }
    }
  }

  for (const os of ["s", "o"]) {
    for (i = 0; i < ranks.length; i++) {
      let upper_rank, lower_rank;
      const rank1 = ranks[i];
      for (j = i + 1; j < ranks.length; j++) {
        if (co[`${rank1}${ranks[j]}${os}`].length === (os === "s" ? 4 : 12)) {
          upper_rank = ranks[j];
          for (k = j + 1; k < ranks.length; k++) {
            if (
              co[`${rank1}${ranks[k]}${os}`].length === (os === "s" ? 4 : 12)
            ) {
              lower_rank = ranks[k];
              continue;
            }
            if (lower_rank) {
              if (j === i + 1) {
                rs += `${rank1}${lower_rank}${os}+,`;
              } else {
                rs += `${rank1}${upper_rank}${os}-${rank1}${lower_rank}${os},`;
              }
              j = k - 1;
            } else {
              rs += `${rank1}${upper_rank}${os},`;
            }
            break;
          }
        } else {
          if (co[`${rank1}${ranks[j]}${os}`].length > 0) {
            ind_combos = [...ind_combos, ...co[`${rank1}${ranks[j]}${os}`]];
          }
          continue;
        }
      }
    }
  }
  // left off here. need to do offsuit
  // can use same code as above and/or add an additional loop for o vs s
  ind_combos.forEach((c) => (rs += `${c},`));
  rs = rs.slice(0, -1);
  return rs;
}

const rs = combo_obj_to_range(comb_obj);

console.log("stop");
