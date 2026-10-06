import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { anime, episodes, follows, notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { VIDEO_CONTOH } from "@/lib/katalog";
import { rilisEpisodeJatuhTempo } from "@/lib/rilis";

const MINGGU = 1000 * 60 * 60 * 24 * 7;

function buatSlug(teks: string) {
  return teks
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

/** Daftar judul yang bisa dikelola oleh Studio. */
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Harus masuk." }, { status: 401 });
  if (!me.isVerified) {
    return NextResponse.json({ error: "Hanya akun resmi terverifikasi yang boleh mengelola episode." }, { status: 403 });
  }

  const daftar = await db
    .select({ id: anime.id, title: anime.title, slug: anime.slug, totalEpisodes: anime.totalEpisodes })
    .from(anime)
    .orderBy(anime.id);

  return NextResponse.json({ anime: daftar });
}

/** Menambahkan satu episode dengan URL video resmi. */
async function tambahEpisode(data: {
  animeId?: number; number?: number; title?: string; durationMinutes?: number; videoUrl?: string; releaseNow?: boolean;
}) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Harus masuk." }, { status: 401 });
  if (!me.isVerified) {
    return NextResponse.json({ error: "Hanya akun resmi terverifikasi yang boleh menambahkan episode." }, { status: 403 });
  }

  const animeId = Number(data.animeId);
  const number = Number(data.number);
  const title = (data.title ?? `Episode ${number}`).trim();
  const videoUrl = (data.videoUrl ?? "").trim();
  if (!Number.isInteger(animeId) || animeId < 1 || !Number.isInteger(number) || number < 1) {
    return NextResponse.json({ error: "Anime dan nomor episode wajib diisi dengan benar." }, { status: 400 });
  }
  if (title.length < 1) return NextResponse.json({ error: "Judul episode wajib diisi." }, { status: 400 });
  if (!/^https?:\/\//i.test(videoUrl)) {
    return NextResponse.json({ error: "URL video harus berupa URL http/https yang valid." }, { status: 400 });
  }

  const [judul] = await db.select({ id: anime.id, slug: anime.slug }).from(anime).where(eq(anime.id, animeId)).limit(1);
  if (!judul) return NextResponse.json({ error: "Anime tidak ditemukan." }, { status: 404 });

  const bentrok = await db.select({ id: episodes.id }).from(episodes)
    .where(and(eq(episodes.animeId, animeId), eq(episodes.number, number))).limit(1);
  if (bentrok.length) return NextResponse.json({ error: `Episode ${number} sudah ada.` }, { status: 409 });

  const releaseNow = Boolean(data.releaseNow);
  const [dibuat] = await db.insert(episodes).values({
    animeId, number, title,
    durationMinutes: Math.min(Math.max(Number(data.durationMinutes) || 24, 1), 300),
    videoUrl,
    releaseAt: releaseNow ? new Date() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isReleased: releaseNow, announced: releaseNow,
  }).returning({ id: episodes.id });

  return NextResponse.json({ ok: true, episodeId: dibuat.id, slug: judul.slug });
}

/** Menayangkan (merilis) judul baru di animeil.al. Khusus akun terverifikasi. */
export async function POST(request: Request) {
  const body = await request.json();
  if (body?.action === "add-episode") return tambahEpisode(body);
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Harus masuk." }, { status: 401 });
  if (!me.isVerified) {
    return NextResponse.json(
      { error: "Hanya akun resmi terverifikasi yang boleh merilis judul baru." },
      { status: 403 },
    );
  }

  const data = body as {
    title?: string;
    tagline?: string;
    synopsis?: string;
    genres?: string;
    studio?: string;
    coverUrl?: string;
    totalEpisodes?: number;
    airDay?: string;
    menitKeRilisPerdana?: number;
  };

  const title = (data.title ?? "").trim();
  const synopsis = (data.synopsis ?? "").trim();
  if (title.length < 3 || synopsis.length < 10) {
    return NextResponse.json(
      { error: "Judul minimal 3 karakter dan sinopsis minimal 10 karakter." },
      { status: 400 },
    );
  }

  const slug = buatSlug(title);
  const bentrok = await db.select({ id: anime.id }).from(anime).where(eq(anime.slug, slug)).limit(1);
  if (bentrok.length > 0) {
    return NextResponse.json({ error: "Judul dengan slug serupa sudah ada." }, { status: 409 });
  }

  const total = Math.min(Math.max(Number(data.totalEpisodes) || 12, 1), 26);
  const jeda = Math.min(Math.max(Number(data.menitKeRilisPerdana) || 2, 0), 60 * 24 * 30);
  const mulai = Date.now() + jeda * 60 * 1000;

  const [dibuat] = await db
    .insert(anime)
    .values({
      slug,
      title,
      tagline: (data.tagline ?? "").trim() || null,
      synopsis,
      genres: (data.genres ?? "Aksi").trim(),
      status: "tayang",
      year: new Date().getFullYear(),
      studio: (data.studio ?? "Studio animeil.al").trim(),
      coverUrl: (data.coverUrl ?? "").trim() || "/images/mascot.jpg",
      totalEpisodes: total,
      airDay: data.airDay ?? "Sabtu",
      createdById: me.id,
    })
    .returning({ id: anime.id });

  await db.insert(episodes).values(
    Array.from({ length: total }, (_, i) => ({
      animeId: dibuat.id,
      number: i + 1,
      title: `Episode ${i + 1}`,
      durationMinutes: 24,
      videoUrl: VIDEO_CONTOH[i % VIDEO_CONTOH.length],
      releaseAt: new Date(mulai + i * MINGGU),
      isReleased: false,
      announced: false,
    })),
  );

  // Beri tahu semua pengikut akun resmi lewat notifikasi judul baru
  const semua = await db.select({ userId: follows.userId }).from(follows).limit(0);
  void semua;

  await db.insert(notifications).values({
    userId: me.id,
    type: "rilis",
    title: `Judul baru dijadwalkan: ${title}`,
    body: `Episode 1 akan rilis otomatis dalam ${jeda} menit. Episode berikutnya menyusul tiap minggu.`,
    link: `/anime/${slug}`,
  });

  await rilisEpisodeJatuhTempo();
  return NextResponse.json({ ok: true, slug });
}
