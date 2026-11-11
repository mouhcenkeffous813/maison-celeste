export function formatPrice(amount: number, currency = 'DA'): string {
  return `${amount.toLocaleString('fr-DZ')} ${currency}`;
}

export function calculateDiscountPercentage(price: number, compareAtPrice: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function validateAlgerianPhone(phone: string): boolean {
  const clean = phone.replace(/[\s.-]/g, '');
  // Matches 05, 06, 07 followed by 8 digits (total 10 digits) or +213 followed by 5/6/7 and 8 digits
  const dzRegex = /^(0)(5|6|7)[0-9]{8}$|^(\+213|00213)(5|6|7)[0-9]{8}$/;
  return dzRegex.test(clean);
}

export function formatAlgerianPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10 && clean.startsWith('0')) {
    return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6, 8)} ${clean.slice(8, 10)}`;
  }
  return phone;
}

/**
 * Normalizes text for accent-insensitive and case-insensitive search.
 * e.g. "Sétif" -> "setif", "Béjaïa" -> "bejaia", "Médéa" -> "medea"
 */
export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Checks whether a target string contains the search query, ignoring case, accents, and extra spaces.
 */
export function searchMatches(target: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!target) return false;
  return normalizeString(target).includes(normalizeString(query));
}
