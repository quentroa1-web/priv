/**
 * UI Formatting Utilities
 */

// Price formatting (COP by default)
export const formatPrice = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseInt(amount.replace(/[^0-9]/g, '')) : amount;
    if (isNaN(num)) return amount;

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(num);
};

// Date formatting (Relative)
export const formatRelativeDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

    if (diffInSeconds < 60) return 'hace un momento';
    if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    if (diffInSeconds < 604800) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');

    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
};

// Number formatting
export const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num);
};
