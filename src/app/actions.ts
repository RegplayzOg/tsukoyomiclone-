"use server";

import { getCachedSearchAnime } from "@/lib/server-anilist";
import { query } from "@/lib/db";
import { createSession, logout, getUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { exchangeAniListCode, fetchAniListUser, pullAniListList, pushToAniList } from "@/lib/anilist-sync";
import { getAnimeById } from "@/lib/anilist";

type DbRow = Record<string, unknown>;

export async function fetchAnimeAction(params: any) {
  const { search, page = 1, perPage = 30, genres, status, season, seasonYear, format } = params;

  // Always fetch from API (with cache)
  try {
    const apiResults = await getCachedSearchAnime(params);

    // Save results to DB in background (don't block response)
    if (apiResults && Array.isArray(apiResults.media)) {
      // Fire and forget - save to DB asynchronously
      Promise.all(
        apiResults.media.map((anime: import("../lib/anime-db").AnimeMedia) =>
          query(
            `INSERT INTO anime (id, title_romaji, title_english, description, format, status, episodes, average_score, season, season_year, cover_image_large, cover_image_extra_large, banner_image, genres)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             title_romaji = VALUES(title_romaji),
             title_english = VALUES(title_english),
             description = VALUES(description),
             format = VALUES(format),
             status = VALUES(status),
             episodes = VALUES(episodes),
             average_score = VALUES(average_score),
             season = VALUES(season),
             season_year = VALUES(season_year),
             cover_image_large = VALUES(cover_image_large),
             cover_image_extra_large = VALUES(cover_image_extra_large),
             banner_image = VALUES(banner_image),
             genres = VALUES(genres)`,
            [
              anime.id,
              anime.title?.romaji || null,
              anime.title?.english || null,
              anime.description || null,
              anime.format || null,
              anime.status || null,
              anime.episodes || null,
              anime.averageScore || null,
              anime.season || null,
              anime.seasonYear || null,
              anime.coverImage?.large || null,
              anime.coverImage?.extraLarge || null,
              anime.bannerImage || null,
              anime.genres ? JSON.stringify(anime.genres) : null
            ]
          ).catch(err => console.error("DB save error:", err))
        )
      ).catch(() => {}); // Ignore errors, don't block response
    }

    return apiResults;
  } catch (e) {
    console.error("AniList API Error:", e);
    return { error: "Failed to fetch anime" };
  }
}

export async function signupAction(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!username || !email || !password) {
    return { error: "Missing fields" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = uuidv4();

  try {
    await query(
      "INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)",
      [id, username, email, passwordHash]
    );
    await createSession(id);
    return { success: true };
  } catch (_error: unknown) {
    if (_error && typeof _error === 'object' && 'code' in _error && (_error as { code: string }).code === 'ER_DUP_ENTRY') {
      return { error: "Username or email already exists" };
    }
    return { error: "Internal server error" };
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Missing fields" };
  }

  const { rows } = await query("SELECT * FROM users WHERE email = ?", [email]);
  const users = rows as DbRow[];

  if (users.length === 0) {
    return { error: "Invalid credentials" };
  }

  const user = users[0];
  const isValid = await bcrypt.compare(password, user.password_hash as string);

  if (!isValid) {
    return { error: "Invalid credentials" };
  }

  await createSession(user.id as string);
  return { success: true };
}

export async function logoutAction() {
  await logout();
  revalidatePath("/");
}

export async function updateProfileAction(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const username = formData.get("username") as string;
  const avatarUrl = formData.get("avatar_url") as string;
  const watchlistPrivacy = formData.get("watchlist_privacy") === "true" ? 1 : 0;

  try {
    await query(
      "UPDATE users SET username = ?, avatar_url = ?, watchlist_privacy = ? WHERE id = ?",
      [username, avatarUrl, watchlistPrivacy, user.id]
    );
    revalidatePath("/profile");
    return { success: true };
  } catch {
    return { error: "Update failed" };
  }
}

export async function changePasswordAction(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const newPassword = formData.get("password") as string;
  const passwordHash = await bcrypt.hash(newPassword, 10);

  try {
    await query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, user.id]);
    return { success: true };
  } catch {
    return { error: "Failed to change password" };
  }
}

export async function addXPAction(xpAmount: number) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const { rows } = await query("SELECT xp FROM users WHERE id = ?", [user.id]);
    const currentXp = (rows as DbRow[])[0].xp as number;
    const newXp = currentXp + xpAmount;

    let rank = 'Wanderer';
    if (newXp >= 25000) rank = 'RzGod';
    else if (newXp >= 12000) rank = 'Mythic';
    else if (newXp >= 6000) rank = 'Sage';
    else if (newXp >= 3000) rank = 'Elder';
    else if (newXp >= 1500) rank = 'Champion';
    else if (newXp >= 750) rank = 'Veteran';
    else if (newXp >= 300) rank = 'Adept';
    else if (newXp >= 100) rank = 'Apprentice';

    await query("UPDATE users SET xp = ?, rank = ? WHERE id = ?", [newXp, rank, user.id]);
    return { success: true, xp: newXp, rank };
  } catch {
    return { error: "Failed to update XP" };
  }
}

export async function getAllUsersAction() {
  const user = await getUser();
  if (!user || user.role !== 'admin') return { error: "Unauthorized" };

  const { rows } = await query("SELECT id, username, email, role, tag, xp, rank, created_at FROM users");
  return rows as DbRow[];
}

export async function adminUpdateUserAction(userId: string, data: Record<string, unknown>) {
  const admin = await getUser();
  if (!admin || admin.role !== 'admin') return { error: "Unauthorized" };

  const { tag, tag_color, role, password } = data;

  let queryStr = "UPDATE users SET ";
  const params: unknown[] = [];
  const updates: string[] = [];

  if (tag !== undefined) {
    updates.push("tag = ?");
    params.push(tag);
  }

  if (tag_color !== undefined) {
    updates.push("tag_color = ?");
    params.push(tag_color);
  }

  if (role !== undefined) {
    updates.push("role = ?");
    params.push(role);
  }

  if (password) {
    const passwordHash = await bcrypt.hash(password as string, 10);
    updates.push("password_hash = ?");
    params.push(passwordHash);
  }

  if (updates.length === 0) return { success: true };

  queryStr += updates.join(", ") + " WHERE id = ?";
  params.push(userId);

  try {
    await query(queryStr, params);
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { error: "Admin update failed" };
  }
}

export async function verifyAdminPasswordAction(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD || "RRRGAMER";
  if (password === adminPassword) {
    const user = await getUser();
    if (user) {
      await query("UPDATE users SET role = 'admin' WHERE id = ?", [user.id]);
      revalidatePath("/admin");
      return { success: true };
    }
    return { error: "You must be logged in to access admin" };
  }
  return { error: "Invalid admin password" };
}

export async function getCurrentUserAction() {
  return await getUser();
}

// Watchlist Actions
export async function getWatchlistAction(status?: string) {
  const user = await getUser();
  if (!user) return [];

  let sql = `SELECT w.*, c.data as anime_data
            FROM watchlists w
            LEFT JOIN cache c ON CONCAT('anime:', w.anime_id) = c.key
            WHERE w.user_id = ?`;
  const params: unknown[] = [user.id];

  if (status && status !== 'ALL') {
    sql += " AND w.status = ?";
    params.push(status);
  }

  const { rows } = await query(sql, params);
  const items = rows as DbRow[];

  for (const item of items) {
    if (!item.anime_data) {
      try {
        const anime = await getAnimeById(item.anime_id as number);
        if (anime) {
          item.anime_data = anime;
          await query(
            "INSERT INTO cache (`key`, data, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR)) ON DUPLICATE KEY UPDATE data = VALUES(data), expires_at = VALUES(expires_at)",
            [`anime:${item.anime_id}`, JSON.stringify(anime)]
          );
        }
      } catch {
        console.error("Failed to fetch anime for watchlist", item.anime_id);
      }
    } else {
      try {
        item.anime_data = JSON.parse(item.anime_data as string);
      } catch {
        item.anime_data = null;
      }
    }
  }

  return items;
}

export async function updateWatchlistAction(animeId: number, data: { status: string, progress: number, score: number }) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await query(
      `INSERT INTO watchlists (user_id, anime_id, status, progress, score, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE status = VALUES(status), progress = VALUES(progress), score = VALUES(score), updated_at = CURRENT_TIMESTAMP`,
      [user.id, animeId, data.status, data.progress, data.score]
    );

    revalidatePath("/watchlist");
    return { success: true };
  } catch {
    return { error: "Failed to update watchlist" };
  }
}

export async function logPlaybackProgressAction(animeId: number, data: { progress: number, watchedTime: number }) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const anime = await getAnimeById(animeId);
    if (!anime) return { error: "Anime not found" };

    const { rows } = await query("SELECT status FROM watchlists WHERE user_id = ? AND anime_id = ?", [user.id, animeId]);
    const existing = (rows as DbRow[])[0];
    const currentStatus = existing?.status as string | undefined;

    let newStatus = currentStatus || 'CURRENT';

    const totalEpisodes = anime.episodes || 0;
    const isCompleted = totalEpisodes > 0 && data.progress >= totalEpisodes;
    const isFinished = anime.status === 'FINISHED';

    if (isCompleted && isFinished) {
      newStatus = 'COMPLETED';
    } else if (data.progress > 0) {
      newStatus = 'CURRENT';
    } else if (!currentStatus || ['PLANNING', 'DROPPED', 'PAUSED', 'COMPLETED'].includes(currentStatus)) {
      newStatus = 'CURRENT';
    }

    await query(
      `INSERT INTO watchlists (user_id, anime_id, status, progress, watched_time, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE
       progress = VALUES(progress),
       watched_time = VALUES(watched_time),
       status = VALUES(status),
       updated_at = CURRENT_TIMESTAMP`,
      [user.id, animeId, newStatus, data.progress, data.watchedTime]
    );

    if (newStatus !== currentStatus) {
      revalidatePath("/watchlist");
    }

    return { success: true };
  } catch (error) {
    console.error("Playback log error:", error);
    return { error: "Failed to log progress" };
  }
}

export async function completeAnimeAction(animeId: number, progress: number) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await query(
      `INSERT INTO watchlists (user_id, anime_id, status, progress, updated_at)
       VALUES (?, ?, 'COMPLETED', ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE status = 'COMPLETED', progress = ?, updated_at = CURRENT_TIMESTAMP`,
      [user.id, animeId, progress, progress]
    );
    revalidatePath("/watchlist");
    return { success: true };
  } catch {
    return { error: "Failed to complete anime" };
  }
}

export async function disconnectAniListAction() {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await query("UPDATE users SET anilist_id = NULL, anilist_token = NULL WHERE id = ?", [user.id]);
    revalidatePath("/profile");
    return { success: true };
  } catch {
    return { error: "Failed to disconnect AniList" };
  }
}

export async function toggleTwoWaySyncAction(enabled: boolean) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await query("UPDATE users SET two_way_sync = ? WHERE id = ?", [enabled ? 1 : 0, user.id]);
    return { success: true };
  } catch {
    return { error: "Failed to update settings" };
  }
}

export async function pushAllToAniListAction() {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const { rows } = await query("SELECT anilist_token FROM users WHERE id = ?", [user.id]);
  const token = (rows as DbRow[])[0]?.anilist_token as string | undefined;
  if (!token) return { error: "AniList not linked" };

  const watchlist = await getWatchlistAction();
  for (const item of watchlist) {
    await pushToAniList(token, {
      mediaId: item.anime_id as number,
      status: item.status as string,
      progress: item.progress as number,
      score: item.score as number
    });
  }
  return { success: true };
}

export async function linkAniListAction(code: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const tokenData = await exchangeAniListCode(code);
    if (!tokenData.access_token) return { error: "Failed to exchange code" };

    const aniListUser = await fetchAniListUser(tokenData.access_token);
    if (!aniListUser) return { error: "Failed to fetch AniList user" };

    await query(
      "UPDATE users SET anilist_id = ?, anilist_token = ? WHERE id = ?",
      [aniListUser.id, tokenData.access_token, user.id]
    );

    revalidatePath("/profile");
    return { success: true };
  } catch {
    return { error: "Failed to link AniList" };
  }
}

export async function syncAniListAction() {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const { rows } = await query("SELECT anilist_id, anilist_token FROM users WHERE id = ?", [user.id]);
  const userRecord = (rows as DbRow[])[0];

  if (!userRecord || !userRecord.anilist_token || !userRecord.anilist_id) {
    return { error: "AniList not linked" };
  }

  try {
    console.log("Starting AniList sync for user:", user.id);
    const entries = await pullAniListList(userRecord.anilist_token as string, Number(userRecord.anilist_id));
    console.log(`Fetched ${entries.length} entries from AniList.`);

    let processedCount = 0;
    for (const entry of entries) {
      try {
        await query(
          `INSERT INTO watchlists (user_id, anime_id, status, progress, score, repeat_count, anilist_updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           status = IF(VALUES(anilist_updated_at) > anilist_updated_at, VALUES(status), status),
           progress = IF(VALUES(anilist_updated_at) > anilist_updated_at, VALUES(progress), progress),
           score = IF(VALUES(anilist_updated_at) > anilist_updated_at, VALUES(score), score),
           repeat_count = IF(VALUES(anilist_updated_at) > anilist_updated_at, VALUES(repeat_count), repeat_count),
           anilist_updated_at = GREATEST(anilist_updated_at, VALUES(anilist_updated_at))`,
          [user.id, entry.mediaId, entry.status, entry.progress, entry.score, entry.repeat, entry.updatedAt]
        );
        processedCount++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error processing entry ${entry.mediaId}:`, errorMessage);
      }
    }

    console.log(`Sync completed. Processed ${processedCount}/${entries.length} entries.`);
    revalidatePath("/watchlist");
    return { success: true, count: processedCount };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(err);
    console.error("Sync process failed:", errorMessage);
    return { error: "Sync failed: " + errorMessage };
  }
}


export async function removeFromWatchlistAction(animeId: number) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await query("DELETE FROM watchlists WHERE user_id = ? AND anime_id = ?", [user.id, animeId]);
    revalidatePath("/watchlist");
    return { success: true };
  } catch {
    return { error: "Failed to remove from list" };
  }
}

export async function getUserAnimeStatusAction(animeId: number) {
  const user = await getUser();
  if (!user) return null;

  const { rows } = await query("SELECT status FROM watchlists WHERE user_id = ? AND anime_id = ?", [user.id, animeId]);
  return (rows as DbRow[])[0] || null;
}

export async function addAnimeCommentAction(animeId: number, content: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  if (content.length < 2) return { error: "Comment too short" };
  if (content.split(/\s+/).length > 200) return { error: "Comment too long (max 200 words)" };

  try {
    await query(
      "INSERT INTO anime_comments (user_id, anime_id, content) VALUES (?, ?, ?)",
      [user.id, animeId, content]
    );

    const { rows } = await query(
      "SELECT id FROM anime_comments WHERE anime_id = ? ORDER BY created_at DESC",
      [animeId]
    );
    const comments = rows as DbRow[];

    if (comments.length > 80) {
      const idsToDelete = comments.slice(80).map(c => c.id);
      await query(
        `DELETE FROM anime_comments WHERE id IN (${idsToDelete.join(",")})`
      );
    }

    revalidatePath(`/watch/${animeId}`);
    return { success: true };
  } catch {
    return { error: "Failed to add comment" };
  }
}

export async function getAnimeCommentsAction(animeId: number, page: number = 1) {
  const limit = 10;
  const offset = (page - 1) * limit;

  const { rows } = await query(
    `SELECT ac.*, u.username, u.tag, u.tag_color, u.avatar_url
     FROM anime_comments ac
     JOIN users u ON ac.user_id = u.id
     WHERE ac.anime_id = ?
     ORDER BY ac.is_pinned DESC, ac.created_at DESC
     LIMIT ? OFFSET ?`,
    [animeId, limit, offset]
  );

  return rows as DbRow[];
}

export async function deleteAnimeCommentAction(commentId: number) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const { rows } = await query("SELECT user_id, anime_id FROM anime_comments WHERE id = ?", [commentId]);
  const comment = (rows as DbRow[])[0];
  if (!comment) return { error: "Comment not found" };

  if (comment.user_id !== user.id && user.role !== 'admin') {
    return { error: "Unauthorized" };
  }

  try {
    await query("DELETE FROM anime_comments WHERE id = ?", [commentId]);
    revalidatePath(`/watch/${comment.anime_id}`);
    return { success: true };
  } catch {
    return { error: "Failed to delete comment" };
  }
}

export async function pinAnimeCommentAction(commentId: number, isPinned: boolean) {
  const user = await getUser();
  if (!user || user.role !== 'admin') return { error: "Unauthorized" };

  try {
    const { rows } = await query("SELECT anime_id FROM anime_comments WHERE id = ?", [commentId]);
    const comment = (rows as DbRow[])[0];
    if (!comment) return { error: "Comment not found" };

    await query("UPDATE anime_comments SET is_pinned = ? WHERE id = ?", [isPinned ? 1 : 0, commentId]);
    revalidatePath(`/watch/${comment.anime_id}`);
    return { success: true };
  } catch {
    return { error: "Failed to pin comment" };
  }
}

export async function createCommunityPostAction(channel: string, title: string, content: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  if (channel === 'announcements' && user.role !== 'admin') {
    return { error: "Only admins can post in announcements" };
  }

  if (content.split(/\s+/).length > 200) return { error: "Content too long (max 200 words)" };

  try {
    const { rows } = await query(
      "INSERT INTO community_posts (user_id, channel, title, content) VALUES (?, ?, ?, ?)",
      [user.id, channel, title, content]
    );
    revalidatePath("/community");
    const result = rows as { insertId: number };
    return { success: true, id: result.insertId };
  } catch {
    return { error: "Failed to create post" };
  }
}

export async function getCommunityPostsAction(channel?: string) {
  let sql = `SELECT cp.*, u.username, u.tag, u.tag_color, u.avatar_url,
            (SELECT COUNT(*) FROM community_comments WHERE post_id = cp.id) as comment_count
            FROM community_posts cp
            JOIN users u ON cp.user_id = u.id`;
  const params: unknown[] = [];

  if (channel) {
    sql += " WHERE cp.channel = ?";
    params.push(channel);
  }

  sql += " ORDER BY cp.created_at DESC";

  const { rows } = await query(sql, params);
  return rows as DbRow[];
}

export async function getCommunityPostAction(postId: number) {
  const { rows } = await query(
    `SELECT cp.*, u.username, u.tag, u.tag_color, u.avatar_url
     FROM community_posts cp
     JOIN users u ON cp.user_id = u.id
     WHERE cp.id = ?`,
    [postId]
  );
  return (rows as DbRow[])[0] || null;
}

export async function deleteCommunityPostAction(postId: number) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const { rows } = await query("SELECT user_id FROM community_posts WHERE id = ?", [postId]);
  const post = (rows as DbRow[])[0];

  if (!post) return { error: "Post not found" };

  if (post.user_id !== user.id && user.role !== 'admin') {
    return { error: "Unauthorized" };
  }

  try {
    await query("DELETE FROM community_posts WHERE id = ?", [postId]);
    revalidatePath("/community");
    return { success: true };
  } catch {
    return { error: "Failed to delete post" };
  }
}

export async function addCommunityCommentAction(postId: number, content: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  if (content.split(/\s+/).length > 200) return { error: "Comment too long (max 200 words)" };

  try {
    await query(
      "INSERT INTO community_comments (post_id, user_id, content) VALUES (?, ?, ?)",
      [postId, user.id, content]
    );
    revalidatePath(`/community/post/${postId}`);
    return { success: true };
  } catch {
    return { error: "Failed to add comment" };
  }
}

export async function getCommunityCommentsAction(postId: number) {
  const { rows } = await query(
    `SELECT cc.*, u.username, u.tag, u.tag_color, u.avatar_url
     FROM community_comments cc
     JOIN users u ON cc.user_id = u.id
     WHERE cc.post_id = ?
     ORDER BY cc.is_pinned DESC, cc.created_at ASC`,
    [postId]
  );
  return rows as DbRow[];
}

export async function deleteCommunityCommentAction(commentId: number) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const { rows } = await query("SELECT user_id, post_id FROM community_comments WHERE id = ?", [commentId]);
  const comment = (rows as DbRow[])[0];
  if (!comment) return { error: "Comment not found" };

  if (comment.user_id !== user.id && user.role !== 'admin') {
    return { error: "Unauthorized" };
  }

  try {
    await query("DELETE FROM community_comments WHERE id = ?", [commentId]);
    revalidatePath(`/community/post/${comment.post_id}`);
    return { success: true };
  } catch {
    return { error: "Failed to delete comment" };
  }
}

export async function pinCommunityCommentAction(commentId: number, isPinned: boolean) {
  const user = await getUser();
  if (!user || user.role !== 'admin') return { error: "Unauthorized" };

  try {
    const { rows } = await query("SELECT post_id FROM community_comments WHERE id = ?", [commentId]);
    const comment = (rows as DbRow[])[0];
    if (!comment) return { error: "Comment not found" };

    await query("UPDATE community_comments SET is_pinned = ? WHERE id = ?", [isPinned ? 1 : 0, commentId]);
    revalidatePath(`/community/post/${comment.post_id}`);
    return { success: true };
  } catch {
    return { error: "Failed to pin comment" };
  }
}

export async function reportUserAction(targetId: string, reason: string, details: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await query(
      "INSERT INTO reports (reporter_id, target_type, target_id, reason, details) VALUES (?, 'user', ?, ?, ?)",
      [user.id, targetId, reason, details]
    );
    return { success: true };
  } catch {
    return { error: "Failed to submit report" };
  }
}

export async function reportAnimeAction(animeId: number, reason: string, details: string, episodes?: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await query(
      "INSERT INTO reports (reporter_id, target_type, anime_id, reason, details) VALUES (?, 'anime', ?, ?, ?)",
      [user.id, animeId, reason, episodes ? `${details} | Episodes: ${episodes}` : details]
    );
    return { success: true };
  } catch {
    return { error: "Failed to submit report" };
  }
}

export async function getReportsAction(type: 'anime' | 'user', page: number = 1) {
  const user = await getUser();
  if (!user || user.role !== 'admin') return { error: "Unauthorized" };

  const limit = 20;
  const offset = (page - 1) * limit;

  const { rows } = await query(
    `SELECT r.*, u.username as reporter_name
     FROM reports r
     JOIN users u ON r.reporter_id = u.id
     WHERE r.target_type = ?
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [type, limit, offset]
  );
  return rows as DbRow[];
}

export async function deleteReportAction(reportId: number) {
  const user = await getUser();
  if (!user || user.role !== 'admin') return { error: "Unauthorized" };

  try {
    await query("DELETE FROM reports WHERE id = ?", [reportId]);
    revalidatePath("/admin/reports");
    return { success: true };
  } catch {
    return { error: "Failed to delete report" };
  }
}
