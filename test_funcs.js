/** Functions for testing and building mock data */

/** Selects specified number of combos from array  */
function random_combos(arr, num) {
  const selected_combos = [];
  const remaining_combos = [];
  num = num <= arr.length ? num : arr.length;
  let r_nums = [];
  for (let i = 0; i < num; i++) {
    while (true) {
      let random_num = Math.floor(Math.random() * (arr.length + 1));
      if (!r_nums.includes(random_num)) {
        r_nums.push(random_num);
        break;
      }
    }
  }
  for (let i = 0; i < arr.length; i++) {
    if (r_nums.includes(i)) {
      selected_combos.push(arr[i]);
    } else {
      remaining_combos.push(arr[i]);
    }
  }
  return [selected_combos, remaining_combos];
}

module.exports = { random_combos };
