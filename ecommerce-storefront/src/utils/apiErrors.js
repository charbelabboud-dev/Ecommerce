/**
 * Extract a user-friendly message from an API error response.
 * Handles ASP.NET validation errors ({ errors: { Field: [...] } }) and { message } payloads.
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;
  if (!data) return fallback;

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (data.errors && typeof data.errors === 'object') {
    const messages = Object.entries(data.errors).flatMap(([field, msgs]) => {
      const list = Array.isArray(msgs) ? msgs : [msgs];
      return list.map((msg) => {
        const text = String(msg);
        if (/^the field /i.test(text)) return text;
        return `${field}: ${text}`;
      });
    });
    if (messages.length > 0) return messages.join(' ');
  }

  return fallback;
}
