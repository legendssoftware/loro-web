/**
 * Format a date object or string to a readable format
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
    date: Date | string,
    options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
): string {
    if (!date) return 'N/A';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-GB', options).format(dateObj);
}

/**
 * Format a number to a currency string
 * @param amount Amount to format
 * @param currency Currency code (default: 'ZAR')
 * @param locale Locale (default: 'en-ZA')
 * @returns Formatted currency string
 */
export function formatCurrency(
    amount: number | string,
    currency: string = 'ZAR',
    locale: string = 'en-ZA'
): string {
    if (amount === null || amount === undefined) return 'R0.00';

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numAmount);
}

/**
 * Format a number to a compact string (e.g. 1.2k, 1.2M)
 * @param num Number to format
 * @returns Formatted compact number
 */
export function formatCompactNumber(num: number): string {
    if (num === null || num === undefined) return '0';

    return new Intl.NumberFormat('en-ZA', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    }).format(num);
}

/**
 * Format a number to a percentage string
 * @param value Number to format (0-1 or 0-100)
 * @param unit Include the % symbol (default: true)
 * @returns Formatted percentage
 */
export function formatPercentage(value: number, unit: boolean = true): string {
    if (value === null || value === undefined) return '0%';

    // Convert to percentage if value is between 0-1
    const percentValue = value > 1 ? value : value * 100;

    return `${percentValue.toFixed(1)}${unit ? '%' : ''}`;
}
