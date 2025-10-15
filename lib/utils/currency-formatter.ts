/**
 * Format a number as a price with currency symbol
 * @param amount - The amount to format
 * @param locale - The locale to use for formatting (default: 'en-ZA')
 * @param currency - The currency code to use (default: 'USD')
 * @returns Formatted price string
 */
export function formatPrice(
    amount: number,
    locale: string = 'en-ZA',
    currency: string = 'USD'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format a number with comma separators
 * @param num - The number to format
 * @param locale - The locale to use for formatting (default: 'en-ZA')
 * @returns Formatted number string with comma separators
 */
export function formatNumber(num: number, locale: string = 'en-ZA'): string {
    return new Intl.NumberFormat(locale).format(num);
}
