import { format, parseISO } from "date-fns";

/**
 * Formats a number as currency (USD).
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats an ISO date string into a readable format.
 * @param {string} dateString - ISO date string
 * @param {string} pattern - date-fns format pattern
 * @returns {string}
 */
export function formatDate(dateString, pattern = "MMM dd, yyyy") {
  try {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, pattern);
  } catch {
    return dateString;
  }
}

/**
 * Returns the user's initials from their full name.
 * @param {string} fullName
 * @returns {string}
 */
export function getInitials(fullName) {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Extracts a user-friendly error message from an API error.
 * @param {Error} error - Axios error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    return error.response.data.errors
      .map((e) => e.message)
      .join(", ");
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

/**
 * Formats a date to YYYY-MM-DD for input[type=date].
 * @param {string|Date} date
 * @returns {string}
 */
export function toInputDate(date) {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "yyyy-MM-dd");
  } catch {
    return "";
  }
}
