import { query } from "./db";

// Background revalidation lock
let lastRateLimitTime = 0;

export async function getStaleWhileRevalidate<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  // 1. Try to get cached data
  const cached = await getCachedData(key);

  if (cached) {
    // 2. Data found: return it and revalidate in background
    revalidate(key, fetchFn, ttlSeconds);
    return cached as T;
  }

  // 3. Cache Miss: Fetch synchronously to ensure user gets results immediately
  console.log(`Cache MISS - Synchronous fetch for: ${key}`);
  const freshData = await fetchFn();
  await setCachedData(key, freshData, ttlSeconds);
  return freshData;
}

async function revalidate<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number) {
  if (Date.now() - lastRateLimitTime < 60000) {
    console.log("Rate limit backoff active, skipping revalidation.");
    return;
  }

  console.log(`Starting background revalidation for: ${key}`);

  try {
    const freshData = await fetchFn();
    await setCachedData(key, freshData, ttlSeconds);
    console.log(`Revalidated cache for: ${key}`);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      lastRateLimitTime = Date.now();
      console.warn("AniList rate limit hit, backoff activated.");
    }
  }
}

export async function getCachedData(key: string) {
  try {
    const result = await query("SELECT data FROM cache WHERE `key` = ?", [key]);
    if (result.rows && Array.isArray(result.rows) && result.rows.length > 0) {
      const data = (result.rows as Record<string, unknown>[])[0].data;
      return typeof data === 'string' ? JSON.parse(data as string) : data;
    }
    return null;
  } catch (error) {
    console.error(`Error in getCachedData:`, error);
    return null;
  }
}

export async function setCachedData(key: string, data: unknown, ttlSeconds = 3600) {
  await query(
    "INSERT INTO cache (`key`, data, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND)) ON DUPLICATE KEY UPDATE data = ?, expires_at = DATE_ADD(NOW(), INTERVAL ? SECOND)",
    [key, JSON.stringify(data), ttlSeconds, JSON.stringify(data), ttlSeconds]
  );
}
