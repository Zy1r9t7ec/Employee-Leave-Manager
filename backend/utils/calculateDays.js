// Calculate working days (Monday-Friday only)
function calculateWorkingDays(startDate, endDate) {
  let count = 0;
  let current = new Date(startDate);
  
  while (current <= new Date(endDate)) {
    const day = current.getDay(); // 0=Sunday, 6=Saturday
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

module.exports = { calculateWorkingDays };
