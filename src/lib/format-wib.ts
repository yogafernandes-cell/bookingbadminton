export function formatWib(date: Date, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...options }).format(date);
}
