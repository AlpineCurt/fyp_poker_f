const hands = {
  2: "Straight Flush",
  1: "Four of a Kind",
  10: "Full House",
  3: "Flush",
  4: "Straight",
  9: "Three of a Kind",
  7: "Two Pair",
  6: "One Pair",
  5: "High Card",
  8: "Flush Draw",
  11: "Straight Draw",
};
const handRanks = [8, 9, 5, 6, 1, 2, 3, 10, 4, 7, 0];

/**
 * 2 2
 * 3 3
 * 4 4
 * 5 5
 * 6 6
 * 7 7
 * 8 8
 * 9 9
 * T 10
 * J 11
 * Q 12
 * K 13
 * A 14
 */

function cs_to_bin_orig(cs) {
  var v, i, o, s;
  for (i = -1, v = o = 0; i < 5; i++, o = Math.pow(2, cs[i] * 4)) {
    v += o * (((v / o) & 15) + 1);
  }
  return v;
}

/** Converts an array of hand values (2 - 14 inclusive) into a binary
 * representation.
 * More than 4 of any value will cause an error.
 * Array must be 5 items.
 */
function ca_to_bin_bigInt(ca) {
  let v = 0n;
  let o = 0n;
  for (let i = 0n; i < 5; i++) {
    o = BigInt(Math.pow(2, ca[i] * 4));
    //o = BigInt(1 << (ca[i] * 4));
    v += o * (((v / o) & 15n) + 1n);
  }
  return v;
}

/** Best */
function ca_to_bin(ca) {
  let v = 0; // integer of our binary representation
  let o = 0;
  for (let i = 0; i < 5; i++) {
    o = Math.pow(2, ca[i] * 4); // bit offset. Math.pow seems faster than left shifting
    v += o * (((v / o) & 15) + 1);
  }
  return v;
}

/** Converts array of hand values to to binary where each 1
 * present represents a unique card.
 * Result of 31 is a straight.
 * Result of 4111 (0x100f) is a wheel (ace - 5).
 */
function ca_to_str_bin(ca) {
  const s =
    (1 << ca[0]) | (1 << ca[1]) | (1 << ca[2]) | (1 << ca[3]) | (1 << ca[4]);
  return s / (s & -s);
}

function isFlush(cs) {
  return cs.every((v) => v === cs[0]);
}

function isFlushDraw(cs) {
  const suits = new Set();
  for (s of cs) {
    suits.add(s);
  }
  return suits.length === 2;
}

const three_of_kind = [2, 3, 10, 10, 10];
const three_of_kind_s = ["s", "s", "s", "d", "h"];
const straight = [9, 10, 12, 11, 8];
const straight_s = ["s", "s", "s", "d", "h"];
const wheel = [4, 2, 5, 14, 3];
const wheel_s = ["s", "s", "s", "d", "h"];
const broadway = [14, 10, 12, 11, 13];
const broadway_s = ["s", "s", "s", "d", "h"];
const four_of_kind = [3, 4, 3, 3, 3];
const four_of_kind_s = ["s", "s", "d", "h", "c"];
const full_house = [6, 6, 5, 5, 6];
const full_house_s = ["s", "c", "d", "h", "h"];
const flush = [14, 4, 7, 9, 10];
const flush_s = ["s", "s", "s", "s", "s"];
const high_card = [10, 4, 3, 2, 7];
const high_card_s = ["s", "c", "d", "h", "h"];
const two_pair = [12, 12, 3, 3, 4];
const two_pair_s = ["c", "h", "s", "c", "d"];
const str_draw_open_ended_1 = [5, 4, 6, 3, 12];
const str_draw_open_ended_2 = [3, 4, 5, 6, 12];
const str_draw_ace_high_1 = [14, 12, 13, 11, 3];
const str_draw_ace_high_2 = [13, 11, 12, 14, 8];
const str_draw_ace_high_3 = [13, 11, 12, 14, 3];
const str_draw_gutshot_1 = [4, 5, 7, 8, 14];
const str_draw_gutshot_2 = [14, 13, 11, 10, 3];
const str_draw_wheel_1 = [3, 2, 4, 5, 9];
const str_draw_wheel_2 = [14, 3, 4, 5, 10];
const str_draw_wheel_need_ace_1 = [2, 3, 4, 5, 10];
const str_draw_wheel_need_ace_2 = [5, 11, 3, 4, 2];
const str_draw_s = ["c", "h", "s", "c", "d"];

const wheel_draw_1 = [14, 2, 3, 4, 9]; // missing 5
const wheel_draw_2 = [14, 2, 3, 5, 9]; // missing 4
const wheel_draw_3 = [14, 2, 4, 5, 9]; // missing 3
const wheel_draw_4 = [14, 3, 4, 5, 9]; // missing 2
const wheel_draw_5 = [10, 2, 4, 5, 3]; // missing Ace

function calcRankIndex(ca, cs) {
  const rank = ca_to_bin(ca) % 15;
  if (rank === 5) {
    const fl = isFlush(cs);
    const str_bin = ca_to_str_bin(ca);
    if (str_bin === 31 || str_bin === 4111) {
      if (fl) {
        return 2;
      }
      return 4;
    }
    if (fl) {
      return 3;
    }
  }
  return rank;
}

function calcHand(ca, cs) {
  let made_hand;
  let str_draw = false;
  let fl_draw = false;
  let rank = ca_to_bin(ca) % 15;
  let fl = false;
  let str_bin = ca_to_str_bin(ca);
  if (rank === 5) {
    fl = isFlush(cs);
    if (str_bin === 31 || str_bin === 4111) {
      if (fl) {
        rank = 2;
      }
      rank = 4;
    }
    if (fl) {
      rank = 3;
    }
  }
  if (rank === 5) {
    str_draw = isStraightDraw(str_bin);
    fl_draw = isFlushDraw(cs);
  } else {
    made_hand = hands[rank];
  }
}

calcHand(flush, flush_s);

const bin_open_ended_1 = ca_to_str_bin(str_draw_open_ended_1);
const bin_open_ended_2 = ca_to_str_bin(str_draw_open_ended_2);
const bin_str_draw_ace_high_1 = ca_to_str_bin(str_draw_ace_high_1);
const bin_str_draw_ace_high_2 = ca_to_str_bin(str_draw_ace_high_2);
const bin_str_draw_ace_high_3 = ca_to_str_bin(str_draw_ace_high_3);
const bin_str_draw_gutshot_1 = ca_to_str_bin(str_draw_gutshot_1);
const bin_str_draw_gutshot_2 = ca_to_str_bin(str_draw_gutshot_2);
const bin_str_draw_wheel_1 = ca_to_str_bin(str_draw_wheel_1);
const bin_str_draw_wheel_2 = ca_to_str_bin(str_draw_wheel_2);
const bin_str_draw_wheel_need_ace_1 = ca_to_str_bin(str_draw_wheel_need_ace_1);
const bin_str_draw_wheel_need_ace_2 = ca_to_str_bin(str_draw_wheel_need_ace_2);
const bin_wheel_draw_1 = ca_to_str_bin(wheel_draw_1).toString(2);
const bin_wheel_draw_2 = ca_to_str_bin(wheel_draw_2).toString(2);
const bin_wheel_draw_3 = ca_to_str_bin(wheel_draw_3).toString(2);
const bin_wheel_draw_4 = ca_to_str_bin(wheel_draw_4).toString(2);
const bin_wheel_draw_5 = ca_to_str_bin(wheel_draw_5).toString(2);

function isStraightDraw(straight_binary) {
  const draws = new Set(["01111", "10111", "11011", "11101", "11110"]);
  const bin_string = straight_binary.toString(2);
  const end_five = bin_string.slice(-5);
  if (draws.has(end_five)) {
    return true;
  }
  const start_five = bin_string.slice(0, 5);
  if (draws.has(start_five)) {
    return true;
  }
  return isWheelDraw(straight_binary);
}

/** pass str_bin as integer */
function isWheelDraw(str_bin) {
  const wheel_draws = new Set(["0111", "1011", "1101", "1111"]);
  const bin_string = str_bin.toString(2);
  const end_four = bin_string.slice(-4);
  if (
    wheel_draws.has(end_four) &&
    (bin_string.length === 13 || bin_string.length === 12)
  ) {
    return true;
  }
  return false;
}

console.log("open_ended_1: ", isStraightDraw(bin_open_ended_1));
console.log("open_ended_2: ", isStraightDraw(bin_open_ended_2));
console.log(
  "bin_str_draw_ace_high_1: ",
  isStraightDraw(bin_str_draw_ace_high_1)
);
console.log(
  "bin_str_draw_ace_high_2: ",
  isStraightDraw(bin_str_draw_ace_high_2)
);
console.log(
  "bin_str_draw_ace_high_3: ",
  isStraightDraw(bin_str_draw_ace_high_3)
);
console.log("bin_str_draw_gutshot_1: ", isStraightDraw(bin_str_draw_gutshot_1));
console.log("bin_str_draw_gutshot_2: ", isStraightDraw(bin_str_draw_gutshot_2));
console.log("bin_str_draw_wheel_1: ", isStraightDraw(bin_str_draw_wheel_1));
console.log("bin_str_draw_wheel_2: ", isStraightDraw(bin_str_draw_wheel_2));
console.log(
  "bin_str_draw_wheel_need_ace_1: ",
  isStraightDraw(bin_str_draw_wheel_need_ace_1)
);
console.log(
  "bin_str_draw_wheel_need_ace_2: ",
  isStraightDraw(bin_str_draw_wheel_need_ace_2)
);

console.log("wheel_draw_1: ", isStraightDraw(bin_wheel_draw_1));
console.log("wheel_draw_2: ", isStraightDraw(bin_wheel_draw_2));
console.log("wheel_draw_3: ", isStraightDraw(bin_wheel_draw_3));
console.log("wheel_draw_4: ", isStraightDraw(bin_wheel_draw_4));

console.log(hands[calcRankIndex(three_of_kind, three_of_kind_s)]);
console.log(hands[calcRankIndex(four_of_kind, four_of_kind_s)]);
console.log(hands[calcRankIndex(full_house, full_house_s)]);
console.log(hands[calcRankIndex(wheel, wheel_s)]);
console.log(hands[calcRankIndex(straight, straight_s)]);
console.log(hands[calcRankIndex(flush, flush_s)]);
console.log(hands[calcRankIndex(straight, flush_s)]);
console.log(hands[calcRankIndex(two_pair, two_pair_s)]);
console.log(hands[calcRankIndex(high_card, high_card_s)]);

console.log("stop");

// const res = ca_to_bin(three_of_kind);
// const res2 = ca_to_bin_bigInt(three_of_kind);
// const res3 = cs_to_bin_orig(three_of_kind);

// console.log("best ", hands[res % 15]);
// console.log("BigInt ", hands[res2 % 15n]);
// console.log("orig ", hands[res3 % 15]);
// console.log("stop");

/**
 * 403c is ace-low straight in binary/hex
 * 7c00 is any straight not including ace-low
 */
function calcIndex(cs, ss) {
  var v, i, o, s;
  for (i = -1, v = o = 0; i < 5; i++, o = Math.pow(2, cs[i] * 4)) {
    v += o * (((v / o) & 15) + 1);
  }
  if ((v %= 15) != 5) {
    return v - 1;
  } else {
    s =
      (1 << cs[0]) | (1 << cs[1]) | (1 << cs[2]) | (1 << cs[3]) | (1 << cs[4]);
  }
  v -= s / (s & -s) == 31 || s == 0x403c ? 3 : 1;
  return (
    v -
    (ss[0] == (ss[0] | ss[1] | ss[2] | ss[3] | ss[4])) * (s == 0x7c00 ? -5 : 1)
  );
}

function getPokerScore(cs) {
  console.log("called getpokerscore " + cs);
  var a = cs.slice(),
    d = {},
    i;
  for (i = 0; i < 5; i++) {
    d[a[i]] = d[a[i]] >= 1 ? d[a[i]] + 1 : 1;
  }
  a.sort(function (a, b) {
    return d[a] < d[b] ? +1 : d[a] > d[b] ? -1 : b - a;
  });
  return (a[0] << 16) | (a[1] << 12) | (a[2] << 8) | (a[3] << 4) | a[4];
}

const suits = ["s", "c", "d", "d", "s"];

//const res = calcIndex(hand2, suits);

let c_val = {};

let v = 256n;
let key = 2;
for (let i = 0; i < 13; i++) {
  c_val[key] = v << BigInt(i * 4);
  key += 1;
}

let hand_val = 0n;
for (const c of hand) {
  hand_val += c_val[c];
}
const rank = hand_val % 15n;
console.log("stop");

let face_count = 0;

// comment lol
