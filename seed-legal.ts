import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { anime, episodes } from "@/db/schema";
import { SERI_LEGAL } from "@/lib/video-legal";

const HARI_KE: Record<string, number> = {
  Minggu: 0,
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
};

const JAM = 60 * 60 * 1000;

/**
 * Masukkan seri berisi episode penuh yang legal ditonton.
 *
 * Supaya mesin rilis otomatis tetap terlihat bekerja:
 * - sebagian besar episode diberi waktu tayang di masa lalu -> langsung rilis
 * - satu episode terakhir dijadwalkan beberapa menit lagi    -> rilis sendiri
 */
export async function seedSeriLegal(): Promise<number> {
  let dibuat = 0;
  const sekarang = Date.now();

  for (const seri of SERI_LEGAL) {
    const ada = await db
      .select({ id: anime.id })
      .from(anime)
      .where(eq(anime.slug, seri.slug))
      .limit(1);
    if (ada.length > 0) continue;

    const total = seri.episodes.length;
    const [baris] = await db
      .insert(anime)
      .values({
        slug: seri.slug,
        title: seri.title,
        tagline: seri.tagline,
        synopsis: seri.synopsis,
        genres: seri.genres,
        status: "tayang",
        year: seri.year,
        studio: seri.studio,
        coverUrl: "/images/mascot.jpg",
        totalEpisodes: total,
        airDay: seri.airDay,
        lisensi: seri.lisensi,
        atribusi: seri.atribusi,
      })
      .onConflictDoNothing()
      .returning({ id: anime.id });
    if (!baris) continue;

    const nilai = seri.episodes.map((ep, i) => {
      const nomor = i + 1;
      const terakhir = nomor === total;
      // Episode terakhir tayang 6 menit lagi, sisanya sudah lewat.
      const releaseAt = terakhir
        ? new Date(sekarang + 6 * 60 * 1000)
        : new Date(sekarang - (total - nomor) * 36 * JAM);
      return {
        animeId: baris.id,
        number: nomor,
        title: `${ep.judul} (${ep.tahun})`,
        durationMinutes: ep.menit,
        videoUrl: ep.videoUrl,
        releaseAt,
        isReleased: !terakhir,
        announced: !terakhir,
      };
    });

    await db.insert(episodes).values(nilai).onConflictDoNothing();
    dibuat++;
  }

  if (dibuat > 0) {
    // Pakai bingkai dari episode pertama sebagai sampul bila belum ada.
    await db.execute(sql`
      UPDATE anime SET status = 'tayang'
      WHERE lisensi IS NOT NULL
        AND EXISTS (SELECT 1 FROM episodes e WHERE e.anime_id = anime.id AND e.is_released = false)
    `);
  }

  return dibuat;
}
