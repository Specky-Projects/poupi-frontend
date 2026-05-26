export function formatCurrency(value: number, currency = "BRL", locale = "pt-BR") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

export function formatDate(value: string | Date, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
    typeof value === "string" ? new Date(value) : value,
  );
}

export function calculateUnitPrice(totalPrice: number, quantity: number) {
  if (!Number.isFinite(totalPrice) || !Number.isFinite(quantity) || quantity <= 0) return null;
  return totalPrice / quantity;
}

export function calculatePercentageChange(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
