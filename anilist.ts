/**
 * Pengambil jadwal tayang anime dari AniList (GraphQL, gratis, tanpa kunci API).
 * Setiap episode punya stempel waktu tayang asli, sehingga aplikasi bisa
 * merilis episode tepat saat anime aslinya tayang.
 */

const ENDPOINT = "https://graphql.anilist.co";

const KUERI = `
query ($page: Int, $perPage: Int, $status: MediaStatus) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, status: $status, sort: POPULARITY_DESC, isAdult: false) {
      id
      title { romaji english }
      description(asHtml: false)
      genres
      episodes
      seasonYear
      averageScore
      duration
      trailer { id site }
      bannerImage
      coverImage { extraLarge large }
      studios(isMain: true) { nodes { name } }
      startDate { year }
      nextAiringEpisode { episode airingAt }
      airingSchedule(perPage: 50) { nodes { episode airingAt } }
    }
  }
}`;

type MediaAniList = {
  id: number;
  title: { romaji: string | null; english: string | null };
  description: string | null;
  genres: string[];
  episodes: number | null;
  seasonYear: number | null;
  averageScore: number | null;
  duration: number | null;
  trailer: { id: string | null; site: string | null } | null;
  bannerImage: string | null;
  coverImage: { extraLarge: string | null; large: string | null };
  studios: { nodes: { name: string }[] };
  startDate: { year: number | null };
  nextAiringEpisode: { episode: number; airingAt: number } | null;
  airingSchedule: { nodes: { episode: number; airingAt: number }[] };
};

export type JadwalEpisode = { number: number; airingAt: Date };

export type AnimeDariSumber = {
  sourceId: number;
  slug: string;
  title: string;
  tagline: string;
  synopsis: string;
  genres: string;
  year: number;
  studio: string;
  coverUrl: string;
  trailerId: string | null;
  bannerUrl: string | null;
  totalEpisodes: number;
  airDay: string;
  durasi: number;
  episodes: JadwalEpisode[];
};

const GENRE_ID: Record<string, string> = {
  Action: "Aksi",
  Adventure: "Petualangan",
  Comedy: "Komedi",
  Drama: "Drama",
  Ecchi: "Ecchi",
  Fantasy: "Fantasi",
  Horror: "Horor",
  "Mahou Shoujo": "Gadis Penyihir",
  Mecha: "Mecha",
  Music: "Musik",
  Mystery: "Misteri",
  Psychological: "Psikologis",
  Romance: "Romantis",
  "Sci-Fi": "Fiksi Ilmiah",
  "Slice of Life": "Keseharian",
  Sports: "Olahraga",
  Supernatural: "Supranatural",
  Thriller: "Menegangkan",
};

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MINGGU_MS = 7 * 24 * 60 * 60 * 1000;

export function buatSlug(teks: string, kode: number): string {
  const dasar = teks
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50)
    .replace(/-+$/, "");
  return dasar ? `${dasar}-${kode}` : `anime-${kode}`;
}

function genreIndo(genres: string[]): string {
  const hasil = genres.slice(0, 4).map((g) => GENRE_ID[g] ?? g);
  return hasil.length > 0 ? hasil.join(", ") : "Umum";
}

/** Menyusun sinopsis berbahasa Indonesia dari data terstruktur AniList. */
function sinopsisIndo(m: MediaAniList, genre: string, studio: string): string {
  const judul = m.title.english || m.title.romaji || "Judul ini";
  const tahun = m.seasonYear ?? m.startDate.year;
  const jml = m.episodes ? `${m.episodes} episode` : "jumlah episode berjalan";
  const skor = m.averageScore ? ` Rata-rata penilaian penonton dunia mencapai ${(m.averageScore / 10).toFixed(1)} dari 10.` : "";
  const durasi = m.duration ? ` Setiap episode berdurasi sekitar ${m.duration} menit.` : "";

  return (
    `${judul} adalah serial bergenre ${genre.toLowerCase()} garapan ${studio}` +
    `${tahun ? ` yang mulai tayang pada tahun ${tahun}` : ""}, direncanakan sebanyak ${jml}.` +
    `${durasi}${skor} ` +
    `Di animeil.al, seluruh teks disajikan dalam bahasa Indonesia sementara suara aslinya tetap dipertahankan. ` +
    `Episode baru terbit otomatis di sini tepat pada jam tayang aslinya.`
  );
}

function tagline(m: MediaAniList): string {
  if (m.nextAiringEpisode) {
    return `Episode ${m.nextAiringEpisode.episode} menyusul sesuai jadwal tayang aslinya.`;
  }
  return "Serial lengkap, siap ditonton dari episode pertama.";
}

/**
 * Lengkapi jadwal: AniList kadang hanya memberi sebagian episode.
 * Sisanya diperkirakan mingguan dari episode terakhir yang diketahui.
 */
function lengkapiJadwal(nodes: { episode: number; airingAt: number }[], total: number | null): JadwalEpisode[] {
  const peta = new Map<number, Date>();
  for (const n of nodes) {
    if (n.episode > 0) peta.set(n.episode, new Date(n.airingAt * 1000));
  }
  if (peta.size === 0) return [];

  const nomor = [...peta.keys()].sort((a, b) => a - b);
  const terakhir = nomor[nomor.length - 1];
  const target = total && total > 0 ? Math.min(total, terakhir + 26) : terakhir;

  if (target > terakhir) {
    const waktuTerakhir = peta.get(terakhir)!.getTime();
    for (let n = terakhir + 1; n <= target; n++) {
      peta.set(n, new Date(waktuTerakhir + (n - terakhir) * MINGGU_MS));
    }
  }

  // Batasi agar serial sangat panjang tidak membanjiri basis data.
  return [...peta.entries()]
    .sort((a, b) => a[0] - b[0])
    .slice(-60)
    .map(([number, airingAt]) => ({ number, airingAt }));
}

export async function ambilDariAniList(
  status: "RELEASING" | "FINISHED" | "NOT_YET_RELEASED" = "RELEASING",
  perPage = 12,
): Promise<AnimeDariSumber[]> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: KUERI, variables: { page: 1, perPage, status } }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`AniList menolak permintaan (${res.status})`);
  const json = (await res.json()) as {
    data?: { Page?: { media?: MediaAniList[] } };
    errors?: { message: string }[];
  };
  if (json.errors?.length) throw new Error(json.errors[0].message);

  const media = json.data?.Page?.media ?? [];
  const hasil: AnimeDariSumber[] = [];

  for (const m of media) {
    // Serial panjang hanya mengembalikan sebagian jadwal, sehingga episode
    // berikutnya perlu ikut disertakan agar statusnya tidak salah jadi "tamat".
    const node = [...(m.airingSchedule?.nodes ?? [])];
    if (m.nextAiringEpisode && !node.some((n) => n.episode === m.nextAiringEpisode!.episode)) {
      node.push(m.nextAiringEpisode);
    }
    const jadwal = lengkapiJadwal(node, m.episodes);
    if (jadwal.length === 0) continue;

    const judul = m.title.english || m.title.romaji || `Anime ${m.id}`;
    const studio = m.studios.nodes[0]?.name ?? "Studio tidak diketahui";
    const genre = genreIndo(m.genres ?? []);
    const sampul = m.coverImage.extraLarge || m.coverImage.large;
    if (!sampul) continue;

    hasil.push({
      sourceId: m.id,
      slug: buatSlug(judul, m.id),
      title: judul,
      tagline: tagline(m),
      synopsis: sinopsisIndo(m, genre, studio),
      genres: genre,
      year: m.seasonYear ?? m.startDate.year ?? new Date().getFullYear(),
      studio,
      coverUrl: sampul,
      trailerId: m.trailer?.site === "youtube" && m.trailer.id ? m.trailer.id : null,
      bannerUrl: m.bannerImage,
      totalEpisodes: jadwal.length,
      airDay: HARI[jadwal[jadwal.length - 1].airingAt.getDay()],
      durasi: m.duration ?? 24,
      episodes: jadwal,
    });
  }

  return hasil;
}
