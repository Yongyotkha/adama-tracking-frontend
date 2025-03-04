
function convertNumber(value) {
  if (typeof value === "number") {
      return value;
  }
  if (typeof value === "string") {
      const cleanedValue = value.replace(/,/g, "");
      const numericValue = parseFloat(cleanedValue);

      return isNaN(numericValue) ? 0 : numericValue;
  }
  return 0;
}

export default convertNumber;

