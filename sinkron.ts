import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { anime, episodes, follows, notifications } from "@/db/schema";
import { ambilDariAniList, type AnimeDariSumber } from "@/lib/anilist";


export type HasilSinkron = {
  judulBaru: number;
  judulDiperbarui: number;
  episodeBaru: number;
  langsungRilis: number;
  dijadwalkan: number;
  pesan: string;
};

/** Simpan satu judul beserta jadwal episodenya. */
async function simpanJudul(item: AnimeDariSumber, hasil: HasilSinkron) {
  const sekarang = Date.now();

  const adaRows = await db
    .select({ id: anime.id })
    .from(anime)
    .where(eq(anime.sourceId, item.sourceId))
    .limit(1);

  let animeId: number;
  const belumTayangSemua = item.episodes.every((e) => e.airingAt.getTime() > sekarang);
  const sudahTamat = item.episodes.every((e) => e.airingAt.getTime() <= sekarang);
  const status = belumTayangSemua ? "segera" : sudahTamat ? "tamat" : "tayang";

  if (adaRows[0]) {
    animeId = adaRows[0].id;
    await db
      .update(anime)
      .set({
        title: item.title,
        tagline: item.tagline,
        synopsis: item.synopsis,
        genres: item.genres,
        status,
        studio: item.studio,
        coverUrl: item.coverUrl,
        trailerId: item.trailerId,
        bannerUrl: item.bannerUrl,
        totalEpisodes: item.totalEpisodes,
        airDay: item.airDay,
      })
      .where(eq(anime.id, animeId));
    hasil.judulDiperbarui++;
  } else {
    const [baru] = await db
      .insert(anime)
      .values({
        sourceId: item.sourceId,
        slug: item.slug,
        title: item.title,
        tagline: item.tagline,
        synopsis: item.synopsis,
        genres: item.genres,
        status,
        year: item.year,
        studio: item.studio,
        coverUrl: item.coverUrl,
        trailerId: item.trailerId,
        bannerUrl: item.bannerUrl,
        totalEpisodes: item.totalEpisodes,
        airDay: item.airDay,
      })
      .onConflictDoNothing()
      .returning({ id: anime.id });
    if (!baru) return;
    animeId = baru.id;
    hasil.judulBaru++;
  }

  // Episode yang sudah ada, agar tidak menimpa status rilis yang berjalan.
  const sudahAda = await db
    .select({ number: episodes.number, id: episodes.id, isReleased: episodes.isReleased })
    .from(episodes)
    .where(eq(episodes.animeId, animeId));
  const petaLama = new Map(sudahAda.map((e) => [e.number, e]));

  const baris: (typeof episodes.$inferInsert)[] = [];

  for (const ep of item.episodes) {
    const tayang = ep.airingAt.getTime() <= sekarang;
    const lama = petaLama.get(ep.number);

    if (lama) {
      // Perbarui jadwal bila berubah (anime sering diundur), tapi jangan
      // menarik kembali episode yang sudah terlanjur rilis.
      if (!lama.isReleased) {
        await db
          .update(episodes)
          .set({ releaseAt: ep.airingAt, isReleased: tayang, announced: tayang })
          .where(eq(episodes.id, lama.id));
        if (tayang) hasil.langsungRilis++;
      }
      continue;
    }

    baris.push({
      animeId,
      number: ep.number,
      title: `Episode ${ep.number}`,
      durationMinutes: item.durasi,
      // Dikosongkan: pemutar akan memakai cuplikan resmi judul ini selama
      // belum ada sumber video berlisensi yang dipasang.
      videoUrl: "",
      releaseAt: ep.airingAt,
      // Sudah lewat jam tayang aslinya -> langsung dirilis saat itu juga.
      isReleased: tayang,
      // Ditandai sudah diumumkan supaya tidak mengirim notifikasi susulan
      // untuk episode lama yang baru ditarik ke basis data.
      announced: tayang,
    });

    if (tayang) hasil.langsungRilis++;
    else hasil.dijadwalkan++;
  }

  if (baris.length > 0) {
    await db.insert(episodes).values(baris).onConflictDoNothing();
    hasil.episodeBaru += baris.length;
  }
}

/**
 * Tarik jadwal dari AniList lalu simpan.
 * - Episode yang jam tayangnya SUDAH lewat  -> langsung dirilis.
 * - Episode yang belum tayang              -> ditunda sampai waktunya, lalu rilis otomatis.
 */
export async function sinkronDariSumber(): Promise<HasilSinkron> {
  const hasil: HasilSinkron = {
    judulBaru: 0,
    judulDiperbarui: 0,
    episodeBaru: 0,
    langsungRilis: 0,
    dijadwalkan: 0,
    pesan: "",
  };

  const sedangTayang = await ambilDariAniList("RELEASING", 14);
  let akanDatang: AnimeDariSumber[] = [];
  try {
    akanDatang = await ambilDariAniList("NOT_YET_RELEASED", 4);
  } catch {
    akanDatang = [];
  }

  const semua = [...sedangTayang, ...akanDatang];
  if (semua.length === 0) throw new Error("Sumber jadwal tidak mengembalikan data.");

  for (const item of semua) {
    try {
      await simpanJudul(item, hasil);
    } catch {
      // Lewati satu judul bermasalah, lanjutkan sisanya.
    }
  }

  await rapikanStatus();

  hasil.pesan =
    `${hasil.judulBaru} judul baru, ${hasil.judulDiperbarui} diperbarui. ` +
    `${hasil.langsungRilis} episode langsung dirilis karena sudah tayang, ` +
    `${hasil.dijadwalkan} episode menunggu jam tayangnya.`;
  return hasil;
}

/** Samakan status anime dengan kondisi episodenya. */
async function rapikanStatus() {
  await db.execute(sql`
    UPDATE anime SET status = 'tamat'
    WHERE NOT EXISTS (
      SELECT 1 FROM episodes e WHERE e.anime_id = anime.id AND e.is_released = false
    ) AND EXISTS (SELECT 1 FROM episodes e WHERE e.anime_id = anime.id)
  `);
  await db.execute(sql`
    UPDATE anime SET status = 'tayang'
    WHERE EXISTS (SELECT 1 FROM episodes e WHERE e.anime_id = anime.id AND e.is_released = true)
      AND EXISTS (SELECT 1 FROM episodes e WHERE e.anime_id = anime.id AND e.is_released = false)
  `);
  await db.execute(sql`
    UPDATE anime SET status = 'segera'
    WHERE NOT EXISTS (
      SELECT 1 FROM episodes e WHERE e.anime_id = anime.id AND e.is_released = true
    ) AND EXISTS (SELECT 1 FROM episodes e WHERE e.anime_id = anime.id)
  `);
}

/** Beri tahu pengikut bahwa judul yang mereka ikuti baru saja diperbarui jadwalnya. */
export async function kabariPengikut(animeIds: number[], judul: string, slug: string) {
  if (animeIds.length === 0) return;
  const pengikut = await db
    .select({ userId: follows.userId })
    .from(follows)
    .where(inArray(follows.animeId, animeIds));
  if (pengikut.length === 0) return;
  await db.insert(notifications).values(
    pengikut.map((p) => ({
      userId: p.userId,
      type: "rilis",
      title: `Jadwal diperbarui: ${judul}`,
      body: "Jadwal tayang judul yang kamu ikuti baru saja disegarkan.",
      link: `/anime/${slug}`,
    })),
  );
}

/** Dipakai untuk mencegah penarikan berulang terlalu sering. */
export async function perluSinkron(menit = 60): Promise<boolean> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(anime)
    .where(and(sql`${anime.sourceId} is not null`, sql`${anime.createdAt} > now() - (${menit} || ' minutes')::interval`));
  return (rows[0]?.n ?? 0) === 0;
}
