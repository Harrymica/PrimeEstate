/**
 * Email validation utility for PrimeEstate
 * Validates email format and checks for common typos in popular domains.
 */

// Common valid TLDs (top-level domains)
const VALID_TLDS = new Set([
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
    'co', 'io', 'app', 'dev', 'me', 'info', 'biz', 'name', 'pro',
    // Country codes
    'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'in', 'br',
    'it', 'es', 'nl', 'ru', 'se', 'no', 'dk', 'fi', 'pl', 'be',
    'at', 'ch', 'ie', 'nz', 'za', 'ng', 'ke', 'gh', 'eg', 'ma',
    'mx', 'ar', 'cl', 'co.uk', 'co.za', 'co.ke', 'co.in', 'co.jp',
    'com.au', 'com.br', 'com.ng', 'com.mx', 'com.ar',
    // Newer TLDs
    'tech', 'online', 'store', 'site', 'xyz', 'club', 'live',
    'cloud', 'ai', 'cc', 'tv', 'ws',
]);

// Popular email domains and their correct spellings for typo detection
const POPULAR_DOMAINS: Record<string, string> = {
    // Gmail
    'gmal.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmali.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmail.om': 'gmail.com',
    'gmail.con': 'gmail.com',
    'gmail.coom': 'gmail.com',
    'gmail.comm': 'gmail.com',
    'gmail.vom': 'gmail.com',
    'gmail.xom': 'gmail.com',
    'gmaul.com': 'gmail.com',
    'gmeil.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    // Yahoo
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com',
    'yahoo.cm': 'yahoo.com',
    'yahoo.con': 'yahoo.com',
    'yahoo.om': 'yahoo.com',
    'yhaoo.com': 'yahoo.com',
    'yahho.com': 'yahoo.com',
    'yahop.com': 'yahoo.com',
    // Outlook / Hotmail
    'outllook.com': 'outlook.com',
    'outlok.com': 'outlook.com',
    'outlook.co': 'outlook.com',
    'outlook.cm': 'outlook.com',
    'outlook.con': 'outlook.com',
    'hotmial.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
    'hotmail.co': 'hotmail.com',
    'hotmail.cm': 'hotmail.com',
    'hotmail.con': 'hotmail.com',
    'hotamil.com': 'hotmail.com',
    // iCloud
    'icloud.co': 'icloud.com',
    'icloud.cm': 'icloud.com',
    'icloud.con': 'icloud.com',
    'icould.com': 'icloud.com',
    // AOL
    'aol.co': 'aol.com',
    'aol.cm': 'aol.com',
    // Proton
    'protonmail.co': 'protonmail.com',
    'protonmail.cm': 'protonmail.com',
    'protonmail.con': 'protonmail.com',
};

export interface EmailValidationResult {
    isValid: boolean;
    error?: string;
    suggestion?: string; // e.g. "Did you mean gmail.com?"
}

export function validateEmail(email: string): EmailValidationResult {
    const trimmed = email.trim().toLowerCase();

    // 1. Check if empty
    if (!trimmed) {
        return { isValid: false, error: 'Email address is required.' };
    }

    // 2. Basic format check with regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
        return { isValid: false, error: 'Please enter a valid email address.' };
    }

    // 3. Split into parts
    const [localPart, domain] = trimmed.split('@');

    // 4. Validate local part length
    if (localPart.length < 1 || localPart.length > 64) {
        return { isValid: false, error: 'The email username is invalid.' };
    }

    // 5. Check for consecutive dots in local part
    if (localPart.includes('..')) {
        return { isValid: false, error: 'Email address cannot contain consecutive dots.' };
    }

    // 6. Check domain isn't too short
    if (domain.length < 4) {
        return { isValid: false, error: 'The email domain appears to be invalid.' };
    }

    // 7. Check for known typos in popular domains
    if (POPULAR_DOMAINS[domain]) {
        const corrected = POPULAR_DOMAINS[domain];
        return {
            isValid: false,
            error: `Did you mean ${localPart}@${corrected}?`,
            suggestion: `${localPart}@${corrected}`,
        };
    }

    // 8. Extract TLD and validate
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];

    // Check for very short suspicious TLDs (single char like .c, .o, .m)
    if (tld.length < 2) {
        return { isValid: false, error: 'The email domain extension appears to be incomplete.' };
    }

    // 9. Check for common TLD typos (.cm instead of .com, .co instead of .com, .con instead of .com)
    // Only flag these if the second-level domain is a well-known provider
    const secondLevel = domainParts.slice(0, -1).join('.');
    const knownProviders = ['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'aol', 'protonmail', 'live', 'msn'];

    if (knownProviders.includes(secondLevel)) {
        if (tld === 'cm' || tld === 'con' || tld === 'om') {
            const corrected = `${secondLevel}.com`;
            return {
                isValid: false,
                error: `Did you mean ${localPart}@${corrected}?`,
                suggestion: `${localPart}@${corrected}`,
            };
        }
    }

    return { isValid: true };
}
