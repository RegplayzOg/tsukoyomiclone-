import { query } from "./db";

export interface AnimeMedia {
  id: number;
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage?: {
    extraLarge?: string;
    large?: string;
  };
  bannerImage?: string;
  format?: string;
  genres?: string[];
  status?: string;
  episodes?: number;
  averageScore?: number;
  description?: string;
  season?: string;
  seasonYear?: number;
}

export async function saveAnimeToDb(media: AnimeMedia) {
  if (!media || !media.id) return;

  const sql = `
    INSERT INTO anime (
      id, title_romaji, title_english, title_native, 
      cover_image_extra_large, cover_image_large, banner_image,
      format, genres, status, episodes, average_score, 
      description, season, season_year
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title_romaji = VALUES(title_romaji),
      title_english = VALUES(title_english),
      title_native = VALUES(title_native),
      cover_image_extra_large = VALUES(cover_image_extra_large),
      cover_image_large = VALUES(cover_image_large),
      banner_image = VALUES(banner_image),
      format = VALUES(format),
      genres = VALUES(genres),
      status = VALUES(status),
      episodes = VALUES(episodes),
      average_score = VALUES(average_score),
      description = VALUES(description),
      season = VALUES(season),
      season_year = VALUES(season_year)
  `;

  const params = [
    media.id,
    media.title?.romaji || null,
    media.title?.english || null,
    media.title?.native || null,
    media.coverImage?.extraLarge || null,
    media.coverImage?.large || null,
    media.bannerImage || null,
    media.format || null,
    JSON.stringify(media.genres || []),
    media.status || null,
    media.episodes || null,
    media.averageScore || null,
    media.description || null,
    media.season || null,
    media.seasonYear || null
  ];

  try {
    await query(sql, params);
  } catch (error) {
    console.error(`Error saving anime ${media.id} to DB:`, error);
  }
}

export async function getAnimeFromDb(id: number) {
  const sql = `SELECT * FROM anime WHERE id = ?`;
  try {
    const { rows } = await query(sql, [id]);
    const anime = (rows as Record<string, unknown>[])[0];
    if (anime) {
        // Parse genres if it's a string
        if (typeof anime.genres === 'string') {
            anime.genres = JSON.parse(anime.genres);
        }
    }
    return anime;
  } catch (error) {
    console.error(`Error getting anime ${id} from DB:`, error);
    return null;
  }
}
