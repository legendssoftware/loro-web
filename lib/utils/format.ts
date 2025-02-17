export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: "currency",
    currency: "ZAR",
  }).format(value);
};
