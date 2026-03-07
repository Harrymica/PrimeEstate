/**
 * Safely parses the image_url field from the properties table.
 * The DB sometimes stores this as:
 * - A proper PostgreSQL TEXT[] array → comes through as string[]
 * - A JSON string like '["url1","url2"]' → needs JSON.parse
 * - A plain string URL → wrap in array
 * - null/undefined → empty array
 */
export function parseImageUrls(raw: unknown): string[] {
    if (!raw) return [];

    // Already an array
    if (Array.isArray(raw)) {
        return raw.filter((url): url is string => typeof url === 'string' && url.length > 0);
    }

    // It's a string — might be JSON array or a single URL
    if (typeof raw === 'string') {
        const trimmed = raw.trim();

        // Looks like a JSON array string e.g. '["url1","url2"]'
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.filter((url): url is string => typeof url === 'string' && url.length > 0);
                }
            } catch {
                // Not valid JSON, treat as single URL
            }
        }

        // Single URL string
        if (trimmed.length > 0) {
            return [trimmed];
        }
    }

    return [];
}
