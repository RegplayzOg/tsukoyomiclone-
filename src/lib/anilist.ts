const GRAPHQL_ENDPOINT = "https://graphql.anilist.co";

export const TRENDING_QUERY = `
query ($page: Int = 1, $perPage: Int = 10) {
  Page(page: $page, perPage: $perPage) {
    media(sort: TRENDING_DESC, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      bannerImage
      coverImage {
        extraLarge
        large
      }
      averageScore
      seasonYear
      episodes
      studios(isMain: true) {
        nodes {
          name
        }
      }
      genres
      description
      status
      nextAiringEpisode {
        episode
        airingAt
      }
    }
  }
}
`;

export const SEARCH_QUERY = `
query (
  $page: Int = 1
  $perPage: Int = 30
  $search: String
  $sort: [MediaSort]
  $status: MediaStatus
  $format: MediaFormat
  $season: MediaSeason
  $seasonYear: Int
  $genres: [String]
  $studios: [String]
) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(
      type: ANIME
      search: $search
      sort: $sort
      status: $status
      format: $format
      season: $season
      seasonYear: $seasonYear
      genre_in: $genres
      licensedBy_in: $studios
    ) {
      id
      status
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
      }
      averageScore
      episodes
      status
      format
      genres
      nextAiringEpisode {
        episode
        airingAt
      }
    }
  }
}
`;
export const ANIME_DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    description
    coverImage {
      extraLarge
      large
    }
    bannerImage
    averageScore
    episodes
    status
    format
    season
    seasonYear
    genres
    studios(isMain: true) {
      nodes {
        name
      }
    }
    nextAiringEpisode {
      episode
      airingAt
    }
    relations {
      edges {
        relationType
        node {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          format
          status
        }
      }
    }
    recommendations {
      nodes {
        mediaRecommendation {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
        }
      }
    }
  }
}
`;

export const AIRING_SCHEDULE_QUERY = `
query ($airingAt_greater: Int, $airingAt_lesser: Int, $page: Int = 1, $perPage: Int = 50) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
      total
    }
    airingSchedules(airingAt_greater: $airingAt_greater, airingAt_lesser: $airingAt_lesser, sort: TIME) {
      airingAt
      episode
      media {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
        }
        format
        genres
        status
        episodes
        averageScore
      }
    }
  }
}
`;

import { getStaleWhileRevalidate } from "./cache";

export async function getAiringSchedule(start: number, end: number, page = 1) {
  const cacheKey = `schedule_${start}_${end}_${page}`;

  return await getStaleWhileRevalidate(cacheKey, async () => {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: AIRING_SCHEDULE_QUERY,
          variables: {
            airingAt_greater: start,
            airingAt_lesser: end,
            page,
            perPage: 50,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AniList API Error [${response.status}]: ${errorText}`);
        throw new Error(`Failed to fetch airing schedule: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        console.error("AniList GraphQL Errors:", data.errors);
        throw new Error("AniList GraphQL Error");
      }

      // Persist anime to DB in background
      const schedules = data.data.Page.airingSchedules || [];
      const { saveAnimeToDb } = await import("./anime-db");
      type AiringScheduleItem = { media: import("./anime-db").AnimeMedia };
      Promise.all(schedules.map((s: AiringScheduleItem) => saveAnimeToDb(s.media))).catch(console.error);

      return data.data.Page;
    } catch (error) {
      console.error("Error in getAiringSchedule:", error);
      throw error;
    }
  }, 600); // 10 minutes cache
}

export async function getAnimeById(id: number) {
  const cacheKey = `anime_${id}`;

  return await getStaleWhileRevalidate(cacheKey, async () => {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: ANIME_DETAIL_QUERY,
        variables: { id },
      }),
    });

    if (!response.ok) {
        const error = new Error("Failed to fetch") as Error & { status: number };
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    if (data.errors) {
      console.error("GraphQL errors for ID", id, ":", data.errors);
      throw new Error("GraphQL Error");
    }

    // Persist to DB
    const anime = data.data.Media;
    if (anime) {
      const { saveAnimeToDb } = await import("./anime-db");
      saveAnimeToDb(anime).catch(console.error);
    }

    return anime;
  }, 3600); // 1 hour TTL
}

export async function getTrendingAnime(perPage = 10, sort = "TRENDING_DESC", status?: string, ttlSeconds = 180) {
  const cacheKey = `trending_${sort}_${status || 'all'}_${perPage}`;
  const statusFilter = status ? `, status: ${status}` : "";
  
  return await getStaleWhileRevalidate(cacheKey, async () => {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
          query ($page: Int = 1, $perPage: Int = ${perPage}) {
            Page(page: $page, perPage: $perPage) {
              media(sort: ${sort}, type: ANIME${statusFilter}) {
                id
                title { romaji english native }
                bannerImage
                coverImage { extraLarge large }
                averageScore
                seasonYear
                season
                episodes
                studios(isMain: true) { nodes { name } }
                genres
                description
                status
                nextAiringEpisode { episode airingAt }
              }
            }
          }
        `,
      }),
    });

    if (!response.ok) {
        const error = new Error("Failed to fetch") as Error & { status: number };
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    const media = data.data.Page.media;

    // Persist to DB
    if (media && Array.isArray(media)) {
      const { saveAnimeToDb } = await import("./anime-db");
      Promise.all(media.map(m => saveAnimeToDb(m))).catch(console.error);
    }

    return media;
  }, ttlSeconds);
}

export async function searchAnime({
  page = 1,
  perPage = 30,
  search,
  sort = "TRENDING_DESC",
  status,
  format,
  season,
  seasonYear,
  genres,
  studios,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  status?: string;
  format?: string;
  season?: string;
  seasonYear?: number;
  genres?: string[];
  studios?: string[];
}) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: {
          page,
          perPage,
          search,
          sort: [sort],
          status,
          format,
          season,
          seasonYear,
          genres,
          studios,
        },
      }),
    });

    const data = await response.json();
    if (!data.data || !data.data.Page) {
      console.error("AniList API returned an error or empty data:", data);
      return { media: [], pageInfo: { hasNextPage: false } };
    }

    const media = data.data.Page.media;
    if (media && Array.isArray(media)) {
      const { saveAnimeToDb } = await import("./anime-db");
      Promise.all(media.map(m => saveAnimeToDb(m))).catch(console.error);
    }

    return data.data.Page;
  } catch (error) {
    console.error("Error searching anime:", error);
    return { media: [], pageInfo: { hasNextPage: false } };
  }
}

export async function getAnimeByGenre(genre: string, page = 1) {
  return searchAnime({ genres: [genre], page });
}

export async function getAnimeByStatus(status: string, page = 1) {
  return searchAnime({ status, page });
}

export async function getAnimeByFormat(format: string, page = 1) {
  return searchAnime({ format, page });
}

type AnimeData = Record<string, unknown>;

export async function getAllSeasons(id: number): Promise<AnimeData[]> {
  const seasonsMap = new Map<number, AnimeData>();
  const visited = new Set<number>();

  async function fetchChain(currentId: number) {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const anime = await getAnimeById(currentId);
    if (!anime) return;

    seasonsMap.set(anime.id, anime);

    const relations = anime.relations?.edges || [];
    const chainRelations = relations.filter(
      (edge: AnimeData) => edge.relationType === "PREQUEL" || edge.relationType === "SEQUEL"
    );

    for (const edge of chainRelations) {
      if (edge.node?.id) {
        await fetchChain(edge.node.id);
      }
    }
  }

  await fetchChain(id);
  
  // Sort by year and season
  return Array.from(seasonsMap.values()).sort((a, b) => {
    if (a.seasonYear !== b.seasonYear) {
      return (a.seasonYear || 0) - (b.seasonYear || 0);
    }
    const seasonsOrder = ["WINTER", "SPRING", "SUMMER", "FALL"];
    return seasonsOrder.indexOf(a.season) - seasonsOrder.indexOf(b.season);
  });
}
