import { query } from "./db";

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS cache (
      \`key\` VARCHAR(255) PRIMARY KEY,
      data JSON,
      expires_at TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      tag VARCHAR(50) DEFAULT NULL,
      tag_color ENUM('red', 'yellow', 'green', 'blue') DEFAULT 'yellow',
      avatar_url TEXT DEFAULT NULL,
      xp INT DEFAULT 0,
      rank VARCHAR(50) DEFAULT 'Wanderer',
      watchlist_privacy TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS anime (
      id INT PRIMARY KEY,
      title_romaji TEXT,
      title_english TEXT,
      title_native TEXT,
      cover_image_extra_large TEXT,
      cover_image_large TEXT,
      banner_image TEXT,
      format VARCHAR(20),
      genres JSON,
      status VARCHAR(20),
      episodes INT,
      average_score INT,
      description TEXT,
      season VARCHAR(20),
      season_year INT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS anime_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(36),
      anime_id INT,
      parent_id INT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES anime_comments(id) ON DELETE CASCADE
    );
  `);
  await query(`ALTER TABLE anime_comments ADD COLUMN IF NOT EXISTS parent_id INT NULL;`);
  await query(`ALTER TABLE community_comments ADD COLUMN IF NOT EXISTS parent_id INT NULL;`);

  await query(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(36),
      channel ENUM('announcements', 'suggestions', 'general') NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS community_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT,
      user_id VARCHAR(36),
      parent_id INT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES community_comments(id) ON DELETE CASCADE
    );
  `);

  await query(`DROP TABLE IF EXISTS reports;`);
  await query(`
    CREATE TABLE IF NOT EXISTS reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reporter_id VARCHAR(36),
      target_type ENUM('anime', 'user', 'comment') NOT NULL,
      target_id VARCHAR(36) DEFAULT NULL,
      anime_id INT DEFAULT NULL,
      reason TEXT NOT NULL,
      details TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS watchlists (
      user_id VARCHAR(36) NOT NULL,
      anime_id INT NOT NULL,
      status VARCHAR(20) DEFAULT 'plan_to_watch',
      progress INT DEFAULT 0,
      score INT DEFAULT 0,
      watched_time INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, anime_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(36),
      expires_at TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}
