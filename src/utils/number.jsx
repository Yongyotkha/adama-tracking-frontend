function formatNumber(input) {
  // ตรวจสอบว่า input เป็น number หรือ string ที่สามารถแปลงเป็น number ได้
  const number = parseFloat(input);
  
  // ตรวจสอบว่า number ไม่ใช่ NaN
  if (!isNaN(number)) {
    return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    return '0.00'; // ถ้าไม่ใช่ number หรือ string ที่สามารถแปลงเป็น number ได้
  }
}
export default formatNumber;


