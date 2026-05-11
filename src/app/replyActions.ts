export async function addAnimeCommentAction(animeId: number, content: string, parentId?: number) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  if (content.length < 2) return { error: "Comment too short" };
  if (content.split(/\s+/).length > 200) return { error: "Comment too long (max 200 words)" };

  try {
    await query(
      "INSERT INTO anime_comments (user_id, anime_id, parent_id, content) VALUES (?, ?, ?, ?)",
      [user.id, animeId, parentId || null, content]
    );

    revalidatePath(`/watch/${animeId}`);
    return { success: true };
  } catch {
    return { error: "Failed to add comment" };
  }
}

export async function addCommunityCommentAction(postId: number, content: string, parentId?: number) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  if (content.split(/\s+/).length > 200) return { error: "Comment too long (max 200 words)" };

  try {
    await query(
      "INSERT INTO community_comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)",
      [postId, user.id, parentId || null, content]
    );
    revalidatePath(`/community/post/${postId}`);
    return { success: true };
  } catch {
    return { error: "Failed to add comment" };
  }
}
