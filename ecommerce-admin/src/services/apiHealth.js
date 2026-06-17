import { API_BASE_URL } from './api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function waitForApiHealth({ maxAttempts = 15, delayMs = 4000, timeoutMs = 12000 } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timer);

      if (response.ok) {
        return true;
      }
    } catch {
      // API may be cold-starting on Render free tier
    }

    if (attempt < maxAttempts - 1) {
      await sleep(delayMs);
    }
  }

  return false;
}
