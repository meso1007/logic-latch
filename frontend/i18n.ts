
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
    // Determine locale: use stored value or fallback to English
    const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
    const locale = stored || 'en';

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
    };
});

