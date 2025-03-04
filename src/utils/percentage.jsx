import convertNumber from "../utils/convertNumber";


function percentage(value, target) {
  value = convertNumber(value);
  target = convertNumber(target);

  if (target === 0) {
    return 0;
  }

  let result = (value / target) * 100;

  return result;
}
export default percentage;
