import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  anime,
  comments,
  commentLikes,
  episodes,
  follows,
  notifications,
  ratings,
  users,
} from "@/db/schema";
import { isVerifiedEmail } from "@/lib/auth";

export type KartuAnime = {
  id: number;
  slug: string;
  title: string;
  tagline: string | null;
  genres: string;
  status: string;
  year: number;
  studio: string;
  coverUrl: string;
  trailerId: string | null;
  bannerUrl: string | null;
  lisensi: string | null;
  atribusi: string | null;
  totalEpisodes: number;
  airDay: string;
  rataRating: number;
  jumlahRating: number;
  episodeRilis: number;
};

const kolomKartu = {
  id: anime.id,
  slug: anime.slug,
  title: anime.title,
  tagline: anime.tagline,
  genres: anime.genres,
  status: anime.status,
  year: anime.year,
  studio: anime.studio,
  coverUrl: anime.coverUrl,
  trailerId: anime.trailerId,
  bannerUrl: anime.bannerUrl,
  lisensi: anime.lisensi,
  atribusi: anime.atribusi,
  totalEpisodes: anime.totalEpisodes,
  airDay: anime.airDay,
  rataRating: sql<number>`coalesce((select avg(r.score)::float from ratings r where r.anime_id = ${anime.id}), 0)`,
  jumlahRating: sql<number>`(select count(*)::int from ratings r where r.anime_id = ${anime.id})`,
  episodeRilis: sql<number>`(select count(*)::int from episodes e where e.anime_id = ${anime.id} and e.is_released = true)`,
};

export async function daftarAnime(q?: string): Promise<KartuAnime[]> {
  const dasar = db.select(kolomKartu).from(anime);
  const rows = q
    ? await dasar
        .where(
          sql`lower(${anime.title}) like ${"%" + q.toLowerCase() + "%"} or lower(${anime.genres}) like ${"%" + q.toLowerCase() + "%"}`,
        )
        .orderBy(desc(anime.createdAt))
    : await dasar.orderBy(desc(anime.createdAt));
  return rows;
}

export async function animeTeratas(limit = 5): Promise<KartuAnime[]> {
  const rows = await db.select(kolomKartu).from(anime);
  return rows.sort((a, b) => b.rataRating - a.rataRating).slice(0, limit);
}

export async function detailAnime(slug: string) {
  const rows = await db.select(kolomKartu).from(anime).where(eq(anime.slug, slug)).limit(1);
  const info = rows[0];
  if (!info) return null;
  const sinopsis = await db
    .select({ synopsis: anime.synopsis })
    .from(anime)
    .where(eq(anime.id, info.id))
    .limit(1);
  const daftarEpisode = await db
    .select()
    .from(episodes)
    .where(eq(episodes.animeId, info.id))
    .orderBy(asc(episodes.number));
  return { ...info, synopsis: sinopsis[0]?.synopsis ?? "", episodes: daftarEpisode };
}

export async function jadwalMendatang(limit = 12) {
  return db
    .select({
      id: episodes.id,
      number: episodes.number,
      title: episodes.title,
      releaseAt: episodes.releaseAt,
      animeTitle: anime.title,
      slug: anime.slug,
      coverUrl: anime.coverUrl,
      airDay: anime.airDay,
    })
    .from(episodes)
    .innerJoin(anime, eq(anime.id, episodes.animeId))
    .where(and(eq(episodes.isReleased, false), gt(episodes.releaseAt, new Date())))
    .orderBy(asc(episodes.releaseAt))
    .limit(limit);
}

export async function rilisTerbaru(limit = 8) {
  return db
    .select({
      id: episodes.id,
      number: episodes.number,
      title: episodes.title,
      releaseAt: episodes.releaseAt,
      animeTitle: anime.title,
      slug: anime.slug,
      coverUrl: anime.coverUrl,
    })
    .from(episodes)
    .innerJoin(anime, eq(anime.id, episodes.animeId))
    .where(eq(episodes.isReleased, true))
    .orderBy(desc(episodes.releaseAt))
    .limit(limit);
}

export type KomentarPublik = {
  id: number;
  body: string;
  createdAt: string;
  parentId: number | null;
  episodeNumber: number | null;
  userId: number;
  username: string;
  avatarUrl: string | null;
  isVerified: boolean;
  jumlahSuka: number;
  sayaSuka: boolean;
  balasan: KomentarPublik[];
};

export async function komentarAnime(
  animeId: number,
  viewerId: number | null,
): Promise<KomentarPublik[]> {
  const rows = await db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      parentId: comments.parentId,
      episodeNumber: comments.episodeNumber,
      userId: users.id,
      username: users.username,
      email: users.email,
      avatarUrl: users.avatarUrl,
      jumlahSuka: sql<number>`(select count(*)::int from comment_likes cl where cl.comment_id = ${comments.id})`,
      sayaSuka: sql<boolean>`exists(select 1 from comment_likes cl where cl.comment_id = ${comments.id} and cl.user_id = ${viewerId ?? -1})`,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.animeId, animeId))
    .orderBy(asc(comments.createdAt));

  const peta = new Map<number, KomentarPublik>();
  const akar: KomentarPublik[] = [];
  for (const r of rows) {
    peta.set(r.id, {
      id: r.id,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      parentId: r.parentId,
      episodeNumber: r.episodeNumber,
      userId: r.userId,
      username: r.username,
      avatarUrl: r.avatarUrl,
      isVerified: isVerifiedEmail(r.email),
      jumlahSuka: r.jumlahSuka,
      sayaSuka: r.sayaSuka,
      balasan: [],
    });
  }
  for (const r of rows) {
    const node = peta.get(r.id)!;
    if (r.parentId && peta.has(r.parentId)) {
      peta.get(r.parentId)!.balasan.push(node);
    } else {
      akar.push(node);
    }
  }
  akar.sort((a, b) => b.jumlahSuka - a.jumlahSuka || b.id - a.id);
  return akar;
}

export async function ratingSaya(animeId: number, userId: number | null) {
  if (!userId) return null;
  const rows = await db
    .select({ score: ratings.score })
    .from(ratings)
    .where(and(eq(ratings.animeId, animeId), eq(ratings.userId, userId)))
    .limit(1);
  return rows[0]?.score ?? null;
}

export async function sedangDiikuti(animeId: number, userId: number | null) {
  if (!userId) return false;
  const rows = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(eq(follows.animeId, animeId), eq(follows.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

export async function notifikasiSaya(userId: number) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function jumlahNotifikasiBaru(userId: number) {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return rows[0]?.n ?? 0;
}

export async function daftarPantau(userId: number): Promise<KartuAnime[]> {
  const rows = await db
    .select(kolomKartu)
    .from(follows)
    .innerJoin(anime, eq(anime.id, follows.animeId))
    .where(eq(follows.userId, userId))
    .orderBy(desc(follows.createdAt));
  return rows;
}

export async function statistikPengguna(userId: number) {
  const k = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(comments)
    .where(eq(comments.userId, userId));
  const r = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(ratings)
    .where(eq(ratings.userId, userId));
  const s = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(commentLikes)
    .innerJoin(comments, eq(comments.id, commentLikes.commentId))
    .where(eq(comments.userId, userId));
  return {
    komentar: k[0]?.n ?? 0,
    rating: r[0]?.n ?? 0,
    sukaDiterima: s[0]?.n ?? 0,
  };
}
