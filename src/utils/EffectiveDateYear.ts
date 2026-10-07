// Function to generate year options (previous year, current year, next year)
export const  getYearOptions= ()=> {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const nextYear = currentYear + 1;

  return [
    {
      value: `${nextYear}-01-01`,
      label: `01/01/${nextYear}`,
      year: nextYear,
    },
    {
      value: `${currentYear}-01-01`,
      label: `01/01/${currentYear} (current)`,
      year: currentYear,
      isCurrent: true,
    },
    {
      value: `${previousYear}-01-01`,
      label: `01/01/${previousYear}`,
      year: previousYear,
    },
  ];
}
