const suits_str = ["s", "c", "h", "d"];

/** Used in standardizing suit order in combo strings */
function order_suits(s1, s2) {
  const idx1 = suits_str.indexOf(s1);
  const idx2 = suits_str.indexOf(s2);
  if (idx1 === -1 || idx2 === -1) {
    throw `Incorrect suits. Received ${s1} ${s2}`;
  }
  if (idx1 < idx2) {
    return [s1, s2];
  } else {
    return [s2, s1];
  }
}

/** takes a combo as a string and standardizes its capitalization.
 * ex: aa+ -> AA+ | Tt-qq -> TT-QQ | aSKH -> AsKh
 */
function capitalize_combo(c, type) {
  let ch = "";
  switch (type) {
    case "pp":
      for (let i = 0; i < c.length; i++) {
        switch (i) {
          case 0:
          case 1:
          case 3:
          case 4:
            ch += c[i].toUpperCase();
            break;
          default:
            ch += c[i].toLowerCase();
            break;
        }
      }
      break;
    case "range":
      for (let i = 0; i < c.length; i++) {
        switch (i) {
          case 0:
          case 1:
          case 4:
          case 5:
            ch += c[i].toUpperCase();
            break;
          default:
            ch += c[i].toLowerCase();
            break;
        }
      }
      break;
    case "single":
      for (let i = 0; i < c.length; i++) {
        switch (i) {
          case 0:
          case 2:
            ch += c[i].toUpperCase();
            break;
          default:
            ch += c[i].toLowerCase();
            break;
        }
      }
      break;
  }
  return ch;
}

/** Turns string representation of a range into a Set of all
 * combos represented as a string.
 * ex: AA+, ATs+ will return "AsAc, AsAh..., AsTs, AcTc..."
 * If two or more ranges overlap, no duplicate combos will be
 * generated. ex: 22-55, 44-66 will generate the same combos
 * as 22-66
 */
function range_parse(range) {
  range = range.replace(/ /g, "");
  range = range.split(",");
  let all_combos = new Set();
  let all_bad_combos = new Set();
  for (let hands of range) {
    let combos = [];
    let bad_combos = [];
    const parse_idx = get_parse_idx(hands);
    switch (parse_idx) {
      case 1:
      case 2:
      case 3:
        hands = capitalize_combo(hands, "pp");
        break;
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
        hands = capitalize_combo(hands, "range");
        break;
      case 10:
        hands = capitalize_combo(hands, "single");
        break;
    }
    switch (parse_idx) {
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

/** Takes a string and determines which type of combos it
 * represents.
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
  const low_rank = f2v[hands[0]];
  for (let i = low_rank; i <= 14; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = j + 1; k < 4; k++) {
        if (j === k) {
          continue;
        }
        combos.push(`${v2f[i]}${suits_str[j]}${v2f[i]}${suits_str[k]}`);
      }
    }
  }
  return combos;
}
function parse_pp_single(hands) {
  let combos = [];
  const rank = f2v[hands[0]];
  for (let j = 0; j < 4; j++) {
    for (let k = j + 1; k < 4; k++) {
      if (j === k) {
        continue;
      }
      const so = order_suits(suits_str[j], suits_str[k]);
      combos.push(`${v2f[rank]}${so[0]}${v2f[rank]}${so[1]}`);
    }
  }
  return combos;
}

function parse_pp_range(hands) {
  let combos = [];
  const low_rank = Math.min(f2v[hands[0]], f2v[hands[3]]);
  const high_rank = Math.max(f2v[hands[0]], f2v[hands[3]]);
  for (let i = low_rank; i <= high_rank; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = j + 1; k < 4; k++) {
        if (j === k) {
          continue;
        }
        combos.push(`${v2f[i]}${suits_str[j]}${v2f[i]}${suits_str[k]}`);
      }
    }
  }
  return combos;
}

function parse_suited_plus(hands) {
  let combos = [];
  const high_rank = Math.max(f2v[hands[0]], f2v[hands[1]]);
  const low_rank = Math.min(f2v[hands[0]], f2v[hands[1]]);
  for (let i = low_rank; i < high_rank; i++) {
    for (const suit of suits_str) {
      combos.push(`${v2f[high_rank]}${suit}${v2f[i]}${suit}`);
    }
  }
  return combos;
}

function parse_suited_single(hands) {
  let combos = [];
  const high_rank = Math.max(f2v[hands[0]], f2v[hands[1]]);
  const low_rank = Math.min(f2v[hands[0]], f2v[hands[1]]);
  for (const suit of suits_str) {
    combos.push(`${v2f[high_rank]}${suit}${v2f[low_rank]}${suit}`);
  }
  return combos;
}

function parse_suited_range(hands) {
  let combos = [];
  let bad_combos = [];
  if (f2v[hands[1]] >= f2v[hands[0]] || f2v[hands[5]] >= f2v[hands[4]]) {
    bad_combos.push(hands);
    return [combos, bad_combos];
  }
  const rank1 = hands[0];
  const high_rank = Math.max(f2v[hands[1]], f2v[hands[5]]);
  const low_rank = Math.min(f2v[hands[1]], f2v[hands[5]]);
  for (let i = low_rank; i <= high_rank; i++) {
    for (const suit of suits_str) {
      combos.push(`${rank1}${suit}${v2f[i]}${suit}`);
    }
  }
  return [combos, bad_combos];
}

function parse_offsuit_plus(hands) {
  let combos = [];
  const high_rank = Math.max(f2v[hands[0]], f2v[hands[1]]);
  const low_rank = Math.min(f2v[hands[0]], f2v[hands[1]]);
  for (let i = low_rank; i < high_rank; i++) {
    for (const suit1 of suits_str) {
      for (const suit2 of suits_str) {
        if (suit1 === suit2) {
          continue;
        }
        combos.push(`${v2f[high_rank]}${suit1}${v2f[i]}${suit2}`);
      }
    }
  }
  return combos;
}

function parse_offsuit_range(hands) {
  let combos = [];
  let bad_combos = [];
  if (f2v[hands[1]] >= f2v[hands[0]] || f2v[hands[5]] >= f2v[hands[4]]) {
    bad_combos.push(hands);
    return [combos, bad_combos];
  }
  const rank1 = hands[0];
  const high_rank = Math.max(f2v[hands[1]], f2v[hands[5]]);
  const low_rank = Math.min(f2v[hands[1]], f2v[hands[5]]);
  for (let i = low_rank; i <= high_rank; i++) {
    for (const suit1 of suits_str) {
      for (const suit2 of suits_str) {
        if (suit1 === suit2) {
          continue;
        }
        combos.push(`${rank1}${suit1}${v2f[i]}${suit2}`);
      }
    }
  }
  return [combos, bad_combos];
}

function parse_offsuit_single(hands) {
  let combos = [];
  const high_rank = Math.max(f2v[hands[0]], f2v[hands[1]]);
  const low_rank = Math.min(f2v[hands[0]], f2v[hands[1]]);
  for (const suit1 of suits_str) {
    for (const suit2 of suits_str) {
      if (suit1 === suit2) {
        continue;
      }
      combos.push(`${v2f[high_rank]}${suit1}${v2f[low_rank]}${suit2}`);
    }
  }
  return combos;
}

function parse_single_combo(hand) {
  let combos = [];
  if (f2v[hand[0]] > f2v[hand[2]]) {
    combos.push(hand);
  } else if (f2v[hand[0]] < f2v[hand[2]]) {
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
 * Edge cases: T8o-TQo will pass even though the range isn't
 * correct. Ranges must be varified afterward.
 * Comments after each are examples.
 */
const pp_plus = /^([2-9akqjt])\1\+$/i; // QQ+
const pp_single = /^([2-9akqjt])\1$/i; // 88
const pp_range = /^([2-9akqjt])\1\-([2-9akqjt])\2$/i; // 22-55
const suited_plus = /^([0-9akqjt])(?!\1)[0-9akqjt]s\+$/i; // AQs+
const suited_single = /^([0-9akqjt])(?!\1)[0-9akqjt]s$/i; // KJs
const suited_range = /^([0-9akqjt])(?!\1)[0-9akqjt]s-\1[0-9akqjt]s$/i; // A2s-A5s | Edge case: T8s-TAs will return true, so check for valid range when parsing
const offsuit_plus = /^([0-9akqjt])(?!\1)[0-9akqjt]o\+$/i; // ATo+
const offsuit_single = /^([0-9akqjt])(?!\1)[0-9akqjt]o$/i; // KQo
const offsuit_range = /^([0-9akqjt])(?!\1)[0-9akqjt]o-\1[0-9akqjt]o$/i; // KTo-KJo | Edge Case: T8o-TAo will return true, so check for valid range when parsing
const single_combo = /([0-9akqjt][schd])(?!\1)[0-9akqjt][schd]/i; // 7h2d | Impossible single combos will fail. ex 6h6h

/** face to value */
const f2v = {
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

/** value to face */
const v2f = {
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

/** Builds an object with every range grid/matrix combo as keys
 * and an empty array as values.
 */
function build_combos_obj() {
  const ranks = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const res = {};
  for (let i = 0; i < ranks.length; i++) {
    for (let j = i; j < ranks.length; j++) {
      if (i === j) {
        res[`${v2f[ranks[i]]}${v2f[ranks[j]]}`] = [];
      } else {
        res[`${v2f[ranks[i]]}${v2f[ranks[j]]}s`] = [];
        res[`${v2f[ranks[i]]}${v2f[ranks[j]]}o`] = [];
      }
    }
  }
  return res;
}

/** Takes a set or array of individual combos and groups them
 * by the grid square they would belong to. Key is the grid square
 * string, value is array of individual combos.
 * ex: 54s: [5h4h, 5s4s...]
 */
function make_combo_obj(combos) {
  const co = {};
  for (const c of combos) {
    let c_str;
    if (c[0] === c[2]) {
      c_str = `${c[0]}${c[0]}`;
    } else if (c[1] === c[3]) {
      c_str = `${c[0]}${c[2]}s`;
    } else {
      c_str = `${c[0]}${c[2]}o`;
    }
    if (!co[c_str]) {
      co[c_str] = [];
    }
    co[c_str].push(c);
  }
  return co;
}

/** Takes a combo object and generates its string representation */
function combo_obj_to_range(co) {
  let rs = "";
  let ind_combos = [];
  const ranks = ["A", "K", "Q", "J", "T", 9, 8, 7, 6, 5, 4, 3, 2];

  // pocket pairs
  let i, j, k;
  for (i = 0; i < ranks.length; i = j) {
    let upper_rank, lower_rank;
    const rank1 = ranks[i];
    if (co[`${rank1}${rank1}`] && co[`${rank1}${rank1}`].length === 6) {
      upper_rank = rank1;
    } else {
      if (co[`${rank1}${rank1}`] && co[`${rank1}${rank1}`].length > 0) {
        ind_combos = [...ind_combos, ...co[`${rank1}${rank1}`]];
      }
      j++;
      continue;
    }

    for (j = i + 1; j < ranks.length; j++) {
      const rank2 = ranks[j];
      if (!co[`${rank2}${rank2}`] || co[`${rank2}${rank2}`].length !== 6) {
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

  // suited and offsuits
  for (const os of ["s", "o"]) {
    for (i = 0; i < ranks.length; i++) {
      let upper_rank, lower_rank;
      const rank1 = ranks[i];
      for (j = i + 1; j < ranks.length; j++) {
        if (
          co[`${rank1}${ranks[j]}${os}`] &&
          co[`${rank1}${ranks[j]}${os}`].length === (os === "s" ? 4 : 12)
        ) {
          upper_rank = ranks[j];
          for (k = j + 1; k < ranks.length; k++) {
            if (
              co[`${rank1}${ranks[k]}${os}`] &&
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
          if (
            co[`${rank1}${ranks[j]}${os}`] &&
            co[`${rank1}${ranks[j]}${os}`].length > 0
          ) {
            ind_combos = [...ind_combos, ...co[`${rank1}${ranks[j]}${os}`]];
          }
          continue;
        }
      }
    }
  }
  ind_combos.forEach((c) => (rs += `${c},`));
  rs = rs.slice(0, -1);
  return rs;
}
// const range =
//   "kk+, 2h7d, t8o, k8o-kto, ats-aqs, 55-33, kjs, q8S+, 22-44, 88, ato+, 5H4H, 7H7c, 7c7h";
// const [all_combos, all_bad_combos] = range_parse(range);
// const co = make_combo_obj(all_combos);
// const rs = combo_obj_to_range(co);

module.exports = { range_parse };
