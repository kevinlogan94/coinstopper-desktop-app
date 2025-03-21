import numeral from "numeral";

//http://numeraljs.com/#format
export function formatNumber(
  numberToFormat: number | string,
  options?: { currency?: boolean; percentage?: boolean },
  format?: string
): string {
  // Handle default case for undefined, null, or 0
  if (numberToFormat === null || numberToFormat === undefined) {
    return "0";
  }

  // Parse string input to a number
  if (typeof numberToFormat === "string") {
    numberToFormat = parseFloat(numberToFormat.replace(/,/g, ""));
    if (isNaN(numberToFormat)) throw new Error("Invalid number input");
  }

  const { currency = false, percentage = false } = options || {};

  // Use `numeral` if a format is provided
  if (format) {
    return numeral(numberToFormat).format(format);
  }

  // Percentage formatting
  if (percentage) {
    return `${(numberToFormat).toFixed(2)}%`; // append '%'
  }

  // Currency formatting
  if (currency) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numberToFormat);
  }

  // Default number formatting
  return numeral(numberToFormat).format("0,0");
}

export function ConvertStringToNumber(string: string) {
  try {
    var convertedNumber = 0;
    if (typeof string === "string") {
      convertedNumber = parseFloat(string.replace(/[,$%]/g, ""));
      if (isNaN(convertedNumber)) throw new Error("Invalid number input");
    }
    return convertedNumber;
  } catch (error) {
    console.error(`Failed to convert ${string}`);
  }
}
