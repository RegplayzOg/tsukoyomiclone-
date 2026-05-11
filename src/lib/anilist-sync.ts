const ANILIST_CLIENT_ID = process.env.ANILIST_CLIENT_ID;
const ANILIST_CLIENT_SECRET = process.env.ANILIST_CLIENT_SECRET;
const ANILIST_REDIRECT_URI = process.env.ANILIST_REDIRECT_URI;

export const AL_STATUS_MAP: Record<string, string> = {
  'CURRENT': 'Watching',
  'PLANNING': 'Plan to Watch',
  'COMPLETED': 'Completed',
  'DROPPED': 'Dropped',
  'PAUSED': 'On Hold',
  'REPEATING': 'Rewatching'
};

export async function exchangeAniListCode(code: string) {
  const response = await fetch("https://anilist.co/api/v2/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: ANILIST_CLIENT_ID,
      client_secret: ANILIST_CLIENT_SECRET,
      redirect_uri: ANILIST_REDIRECT_URI,
      code,
    }),
  });

  return await response.json();
}

export async function fetchAniListUser(token: string) {
  const query = `
    query {
      Viewer {
        id
        name
      }
    }
  `;

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();
  return data?.Viewer;
}

export async function pullAniListList(token: string, userId: number) {
  const gqlQuery = `
    query ($userId: Int) {
      MediaListCollection(userId: $userId, type: ANIME) {
        lists {
          entries {
            mediaId
            status
            progress
            score(format: POINT_100)
            updatedAt
            repeat
          }
        }
      }
    }
  `;

  // Added a 30s timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        query: gqlQuery,
        variables: { userId }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    type Entry = Record<string, unknown>;
    const entries: Entry[] = [];

    if (result.data?.MediaListCollection?.lists) {
      for (const list of result.data.MediaListCollection.lists) {
        entries.push(...(list.entries || []));
      }
    }

    return entries;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function pushToAniList(token: string, entry: {
  mediaId: number,
  status: string,
  progress: number,
  score: number
}) {
  const mutation = `
    mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int, $score: Float) {
      SaveMediaListEntry (mediaId: $mediaId, status: $status, progress: $progress, score: $score) {
        id
        status
        progress
      }
    }
  `;

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: entry
    }),
  });

  return await response.json();
}

export async function syncEntry() {
}
