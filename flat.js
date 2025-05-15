function flat(arr) {
  const res = [];
  const arrs = [];
  for (const item of arr) {
    if (!Array.isArray(item)) {
      res.push(item);
    } else {
      arrs.push(item);
    }
  }
  while (arrs.length > 0) {
    const next = arrs.pop();
    if (!Array.isArray(next)) {
      res.push(next);
    } else {
      for (item of next) {
        arrs.push(item);
      }
    }
  }
  return res;
}

function flat2(a, res = []) {
  for (let item of a) {
    if (Array.isArray(item)) {
      res.push(...flat2(item));
    } else {
      res.push(item);
    }
  }
  return res;
}

const array1 = [
  3,
  4,
  [3, [54, 32, 9], 3, [34], [1, 2]],
  45,
  "fd",
  { hi: "bye" },
  [69, [420, 666, [32, 22]], 22],
];

const res1 = flat(array1);
const res2 = flat2(array1);
console.log("stop");
