export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid dates

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short", // "Jan", "Feb", etc.
    day: "2-digit",
  }).format(date);
}

export function isAllowedChar(char: string): boolean {
  // Allow letters, numbers, and optionally spaces (adjust as needed)
  return /^[a-zA-Z0-9]*$/.test(char);
}

export function formatIndianNumber(value: string | number): string {
  // Convert to string and remove any existing commas
  const numStr = value.toString().replace(/,/g, "");

  // Check if it's a valid number
  if (isNaN(Number(numStr))) return numStr;

  // Split number into integer and decimal parts
  // const [integerPart, decimalPart] = numStr.split(".");

  // Convert to Indian format using Intl.NumberFormat
  const formatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    useGrouping: true,
  });

  const formattedNumber = formatter.format(Number(numStr));

  return formattedNumber;
}
