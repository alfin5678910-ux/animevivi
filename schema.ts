import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    uniqueIndex("users_username_unique").on(t.username),
  ],
);

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const anime = pgTable(
  "anime",
  {
    id: serial("id").primaryKey(),
    /** ID di AniList bila judul ini ditarik otomatis dari sumber jadwal. */
    sourceId: integer("source_id"),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    tagline: text("tagline"),
    synopsis: text("synopsis").notNull(),
    genres: text("genres").notNull(), // "Aksi, Fantasi"
    status: text("status").notNull().default("tayang"), // tayang | tamat | segera
    year: integer("year").notNull(),
    studio: text("studio").notNull(),
    coverUrl: text("cover_url").notNull(),
    /** ID video YouTube untuk cuplikan/PV resmi. */
    trailerId: text("trailer_id"),
    bannerUrl: text("banner_url"),
    /** Diisi bila judul ini punya episode penuh yang legal ditayangkan. */
    lisensi: text("lisensi"),
    atribusi: text("atribusi"),
    totalEpisodes: integer("total_episodes").notNull().default(12),
    airDay: text("air_day").notNull().default("Sabtu"),
    createdById: integer("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("anime_slug_unique").on(t.slug),
    uniqueIndex("anime_source_unique").on(t.sourceId),
  ],
);

export const episodes = pgTable(
  "episodes",
  {
    id: serial("id").primaryKey(),
    animeId: integer("anime_id")
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(24),
    /** Kosong bila belum ada sumber video berlisensi untuk episode ini. */
    videoUrl: text("video_url").notNull().default(""),
    releaseAt: timestamp("release_at", { withTimezone: true }).notNull(),
    isReleased: boolean("is_released").notNull().default(false),
    announced: boolean("announced").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("episodes_anime_number_unique").on(t.animeId, t.number)],
);

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    animeId: integer("anime_id")
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    episodeNumber: integer("episode_number"),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: integer("parent_id"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("comments_anime_idx").on(t.animeId)],
);

export const subtitles = pgTable(
  "subtitles",
  {
    id: serial("id").primaryKey(),
    episodeId: integer("episode_id")
      .notNull()
      .references(() => episodes.id, { onDelete: "cascade" }),
    lang: text("lang").notNull().default("id"),
    /** Isi berkas WebVTT lengkap. */
    content: text("content").notNull(),
    /** "kurasi" = ditulis manual, "ai" = hasil terjemahan mesin. */
    source: text("source").notNull().default("kurasi"),
    model: text("model"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("subtitles_episode_lang_unique").on(t.episodeId, t.lang)],
);

export const commentLikes = pgTable(
  "comment_likes",
  {
    id: serial("id").primaryKey(),
    commentId: integer("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("comment_likes_unique").on(t.commentId, t.userId)],
);

export const ratings = pgTable(
  "ratings",
  {
    id: serial("id").primaryKey(),
    animeId: integer("anime_id")
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("ratings_unique").on(t.animeId, t.userId)],
);

export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    animeId: integer("anime_id")
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("follows_unique").on(t.animeId, t.userId)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // balasan | rilis | suka
    title: text("title").notNull(),
    body: text("body").notNull(),
    link: text("link").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);
