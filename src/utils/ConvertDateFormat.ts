export const convertDateFormat = (input: any) => {
  // Split the input by non-numeric characters
  const parts = input.split(/[^0-9]/).filter((p: any) => p !== "");
  const nums = parts.map((p: any) => parseInt(p, 10));

  let year,
    month,
    day = 1; // Default day is 01

  // Extract month and year
  if (nums.length >= 1) {
    month = nums[0]; // First part is month
    if (nums.length >= 2) {
      // Second part is year (2-digit or 4-digit)
      const yearPart = parts[1];
      if (yearPart.length === 4) {
        year = nums[1]; // 4-digit year
      } else if (yearPart.length === 2) {
        // 2-digit year: assume 2000s for years < 50, else 1900s
        year = nums[1] < 50 ? 2000 + nums[1] : 1900 + nums[1];
      }
    }
  }

  // Default to current year if year is not found
  if (year === undefined) {
    year = new Date().getFullYear();
  }

  // Clamp month to valid range (1-12)
  month = Math.min(12, Math.max(1, month));

  // Format components
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  const yyyy = String(year).padStart(4, "0");
  
  return `${yyyy}-${mm}-${dd}`;
};
