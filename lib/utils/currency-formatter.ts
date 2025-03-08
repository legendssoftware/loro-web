/**
 * Format a number as a price with currency symbol
 * @param amount - The amount to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param currency - The currency code to use (default: 'USD')
 * @returns Formatted price string
 */
export function formatPrice(
    amount: number,
    locale: string = 'en-US',
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
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted number string with comma separators
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(num);
}
