import { and, eq, lte, sql } from "drizzle-orm";
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
import { hashPassword } from "@/lib/auth";
import { KATALOG, VIDEO_CONTOH } from "@/lib/katalog";

const MINGGU = 1000 * 60 * 60 * 24 * 7;
const MENIT = 1000 * 60;

let seedPromise: Promise<void> | null = null;

async function jalankanSeed() {
  const ada = await db.select({ id: anime.id }).from(anime).limit(1);
  if (ada.length > 0) return;

  // 1) Seri dengan episode penuh yang legal ditonton.
  try {
    const { seedSeriLegal } = await import("@/lib/seed-legal");
    await seedSeriLegal();
  } catch {
    // lanjut
  }

  // 2) Jadwal tayang asli dari sumber luar (AniList), untuk judul musim berjalan.
  try {
    const { sinkronDariSumber } = await import("@/lib/sinkron");
    await sinkronDariSumber();
    await benihkomunitas();
    return;
  } catch {
    // Sumber tidak bisa dihubungi -> pakai katalog cadangan bawaan.
  }

  const sekarang = Date.now();
  for (let i = 0; i < KATALOG.length; i++) {
    const item = KATALOG[i];
    const [baris] = await db
      .insert(anime)
      .values({
        slug: item.slug,
        title: item.title,
        tagline: item.tagline,
        synopsis: item.synopsis,
        genres: item.genres,
        status: item.status,
        year: item.year,
        studio: item.studio,
        coverUrl: item.coverUrl,
        totalEpisodes: item.totalEpisodes,
        airDay: item.airDay,
      })
      .onConflictDoNothing()
      .returning({ id: anime.id });
    if (!baris) continue;

    const nilai = [];
    for (let n = 1; n <= item.totalEpisodes; n++) {
      const sudah = n <= item.sudahRilis;
      let releaseAt: Date;
      if (sudah) {
        releaseAt = new Date(sekarang - (item.sudahRilis - n + 1) * MINGGU);
      } else {
        const selisihKe = n - item.sudahRilis; // 1 = episode berikutnya
        // episode berikutnya dari judul pertama rilis beberapa menit lagi
        // supaya proses rilis otomatis bisa terlihat langsung.
        const offsetAwal = i === 0 ? 4 * MENIT : (i + 1) * 36 * 60 * MENIT;
        releaseAt = new Date(sekarang + offsetAwal + (selisihKe - 1) * MINGGU);
      }
      nilai.push({
        animeId: baris.id,
        number: n,
        title: item.judulEpisode[n - 1] ?? `Episode ${n}`,
        durationMinutes: 23 + (n % 3),
        videoUrl: VIDEO_CONTOH[(i + n) % VIDEO_CONTOH.length],
        releaseAt,
        isReleased: sudah,
        announced: sudah,
      });
    }
    await db.insert(episodes).values(nilai).onConflictDoNothing();
  }

  await benihkomunitas();
}

/** Akun resmi (bercentang oranye), akun contoh biasa, dan satu utas diskusi. */
async function benihkomunitas() {
  const adaUser = await db.select({ id: users.id }).from(users).limit(1);
  if (adaUser.length > 0) return;

  // PENTING: email terverifikasi sengaja TIDAK dipakai di sini, supaya pemilik
  // asli bisa mendaftar sendiri dengan nama pengguna pilihannya dan langsung
  // mendapat centang oranye.
  const [resmi] = await db
    .insert(users)
    .values({
      email: "tim@animeil.al",
      username: "tim_animeil",
      passwordHash: hashPassword("animeil123"),
      avatarUrl: "/images/mascot.jpg",
      bio: "Tim redaksi animeil.al",
    })
    .onConflictDoNothing()
    .returning({ id: users.id });

  const [biasa] = await db
    .insert(users)
    .values({
      email: "rina@contoh.id",
      username: "rina_otaku",
      passwordHash: hashPassword("rahasia123"),
    })
    .onConflictDoNothing()
    .returning({ id: users.id });

  if (!resmi || !biasa) return;

  const [judul] = await db
    .select({ id: anime.id, slug: anime.slug })
    .from(anime)
    .orderBy(anime.id)
    .limit(1);
  if (!judul) return;

  const [induk] = await db
    .insert(comments)
    .values({
      animeId: judul.id,
      userId: resmi.id,
      body: "Semua episode yang jam tayangnya sudah lewat langsung kami rilis di sini, lengkap dengan teks bahasa Indonesia. Episode berikutnya terbit otomatis tepat saat tayang perdananya. Selamat menonton!",
    })
    .returning({ id: comments.id });

  const [balasan] = await db
    .insert(comments)
    .values({
      animeId: judul.id,
      userId: biasa.id,
      parentId: induk.id,
      body: "Mantap, jadwalnya akurat banget. Ditunggu episode berikutnya!",
    })
    .returning({ id: comments.id });

  await db.insert(commentLikes).values([
    { commentId: induk.id, userId: biasa.id },
    { commentId: balasan.id, userId: resmi.id },
  ]);

  await db.insert(notifications).values({
    userId: resmi.id,
    type: "balasan",
    title: "rina_otaku membalas komentarmu",
    body: "Mantap, jadwalnya akurat banget. Ditunggu episode berikutnya!",
    link: `/anime/${judul.slug}#komentar-${balasan.id}`,
  });

  await db.insert(follows).values({ animeId: judul.id, userId: resmi.id }).onConflictDoNothing();

  const semuaJudul = await db.select({ id: anime.id }).from(anime);
  await db
    .insert(ratings)
    .values(
      semuaJudul.flatMap((a, i) => [
        { animeId: a.id, userId: resmi.id, score: 9 - (i % 3) },
        { animeId: a.id, userId: biasa.id, score: 8 - (i % 2) },
      ]),
    )
    .onConflictDoNothing();
}

export async function pastikanDataAwal(): Promise<void> {
  if (!seedPromise) {
    seedPromise = jalankanSeed().catch((e) => {
      seedPromise = null;
      throw e;
    });
  }
  await seedPromise;
}

/**
 * Mesin rilis otomatis: begitu waktu tayang sebuah episode tiba,
 * episode langsung dirilis di animeil.al dan pengikut mendapat notifikasi.
 */
export async function rilisEpisodeJatuhTempo(): Promise<number> {
  const jatuhTempo = await db
    .select({
      id: episodes.id,
      number: episodes.number,
      title: episodes.title,
      animeId: episodes.animeId,
      animeTitle: anime.title,
      slug: anime.slug,
      announced: episodes.announced,
    })
    .from(episodes)
    .innerJoin(anime, eq(anime.id, episodes.animeId))
    .where(and(eq(episodes.isReleased, false), lte(episodes.releaseAt, new Date())))
    .limit(50);

  if (jatuhTempo.length === 0) return 0;

  for (const ep of jatuhTempo) {
    await db
      .update(episodes)
      .set({ isReleased: true, announced: true })
      .where(eq(episodes.id, ep.id));

    const pengikut = await db
      .select({ userId: follows.userId })
      .from(follows)
      .where(eq(follows.animeId, ep.animeId));

    if (pengikut.length > 0 && !ep.announced) {
      await db.insert(notifications).values(
        pengikut.map((p) => ({
          userId: p.userId,
          type: "rilis",
          title: `Episode baru: ${ep.animeTitle}`,
          body:
            ep.title && ep.title !== `Episode ${ep.number}`
              ? `Episode ${ep.number} — "${ep.title}" sudah rilis dan bisa ditonton sekarang.`
              : `Episode ${ep.number} sudah rilis dan bisa ditonton sekarang.`,
          link: `/anime/${ep.slug}?ep=${ep.number}`,
        })),
      );
    }
  }

  // Anime yang seluruh episodenya sudah rilis otomatis berstatus "tamat".
  await db.execute(sql`
    UPDATE anime SET status = 'tamat'
    WHERE status = 'tayang'
      AND NOT EXISTS (
        SELECT 1 FROM episodes e WHERE e.anime_id = anime.id AND e.is_released = false
      )
  `);

  return jatuhTempo.length;
}

export async function siapkanBeranda(): Promise<void> {
  await pastikanDataAwal();
  await rilisEpisodeJatuhTempo();
}
