export function formatNumber(value) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCurrency(value, currency = "USD") {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function formatPercent(value, digits = 0) {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(digits)}%`;
}

export function formatDate(dateInput) {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatTime(dateInput) {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
