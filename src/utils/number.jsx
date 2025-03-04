function formatNumber(input, digi = 2) {
  const number = parseFloat(input);

  if (!isNaN(number)) {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: digi,
    });
  } else {
    return "0"; 
  }
}

  

export default formatNumber;
