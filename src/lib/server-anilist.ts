import 'server-only';
import { searchAnime } from "./anilist";
import { getStaleWhileRevalidate } from "./cache";

type SearchParams = Record<string, unknown>;

export async function getCachedSearchAnime(params: SearchParams) {
  const cacheKey = `search_${JSON.stringify(params)}`;

  return await getStaleWhileRevalidate(cacheKey, async () => {
    return await searchAnime(params);
  }, 300); // 5 min TTL
}
