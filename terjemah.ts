import { buatVTT, rapikan, type Baris } from "@/lib/subtitle";

/**
 * Penerjemah subtitel otomatis berbasis AI.
 *
 * Mendukung beberapa penyedia sekaligus; yang dipakai adalah penyedia pertama
 * yang kuncinya tersedia di variabel lingkungan:
 *
 *   ANTHROPIC_API_KEY   -> Claude
 *   OPENAI_API_KEY      -> GPT
 *   GEMINI_API_KEY      -> Gemini
 *   DEEPL_API_KEY       -> DeepL
 *
 * Bila tidak ada satu pun kunci, sistem tetap berjalan memakai subtitel
 * kurasi yang sudah tersedia (lihat src/lib/subtitle.ts).
 *
 * CATATAN HAK CIPTA: fungsi ini hanya boleh dipakai untuk menerjemahkan
 * subtitel dari karya yang kita tayangkan secara legal (domain publik atau
 * berlisensi terbuka). Pemanggilnya wajib memastikan hal ini lebih dulu.
 */

export type Penyedia = "anthropic" | "openai" | "gemini" | "deepl" | null;

export function penyediaAktif(): Penyedia {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.DEEPL_API_KEY) return "deepl";
  return null;
}

export function namaPenyedia(p: Penyedia): string {
  const peta: Record<string, string> = {
    anthropic: "Claude (Anthropic)",
    openai: "GPT (OpenAI)",
    gemini: "Gemini (Google)",
    deepl: "DeepL",
  };
  return p ? peta[p] : "belum diatur";
}

const PERINTAH = `Kamu penerjemah subtitel profesional untuk platform anime berbahasa Indonesia.

Terjemahkan setiap baris ke bahasa Indonesia yang luwes dan alami.

Aturan wajib:
1. Keluarkan HANYA array JSON berisi string, jumlah dan urutannya sama persis dengan masukan.
2. Jangan menambah atau menghapus baris.
3. Pakai bahasa Indonesia sehari-hari yang sopan dan mudah dibaca.
4. Jangan memakai kata atau aksara Jepang sama sekali.
5. Pertahankan nama tokoh dan nama tempat apa adanya.
6. Maksimal 42 karakter per baris; pakai \\n bila perlu dua baris.
7. Pertahankan tanda baca dan nada bicara (ramah, tegang, lucu) sesuai aslinya.`;

async function viaAnthropic(baris: string[]): Promise<string[]> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 8000,
      system: PERINTAH,
      messages: [{ role: "user", content: JSON.stringify(baris) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic gagal (${res.status})`);
  const data = (await res.json()) as { content?: { text?: string }[] };
  return uraiJson(data.content?.[0]?.text ?? "", baris.length);
}

async function viaOpenAI(baris: string[]): Promise<string[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PERINTAH },
        { role: "user", content: JSON.stringify(baris) },
      ],
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI gagal (${res.status})`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return uraiJson(data.choices?.[0]?.message?.content ?? "", baris.length);
}

async function viaGemini(baris: string[]): Promise<string[]> {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    process.env.GEMINI_API_KEY;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: PERINTAH }] },
      contents: [{ parts: [{ text: JSON.stringify(baris) }] }],
    }),
  });
  if (!res.ok) throw new Error(`Gemini gagal (${res.status})`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return uraiJson(data.candidates?.[0]?.content?.parts?.[0]?.text ?? "", baris.length);
}

async function viaDeepL(baris: string[]): Promise<string[]> {
  const kunci = process.env.DEEPL_API_KEY!;
  const host = kunci.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
  const res = await fetch(`https://${host}/v2/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `DeepL-Auth-Key ${kunci}`,
    },
    body: JSON.stringify({ text: baris, target_lang: "ID" }),
  });
  if (!res.ok) throw new Error(`DeepL gagal (${res.status})`);
  const data = (await res.json()) as { translations?: { text: string }[] };
  const hasil = (data.translations ?? []).map((t) => t.text);
  if (hasil.length !== baris.length) throw new Error("Jumlah baris tidak cocok.");
  return hasil;
}

function uraiJson(teks: string, jumlah: number): string[] {
  const awal = teks.indexOf("[");
  const akhir = teks.lastIndexOf("]");
  if (awal === -1 || akhir === -1) throw new Error("Balasan AI bukan JSON.");
  const arr = JSON.parse(teks.slice(awal, akhir + 1)) as unknown[];
  if (!Array.isArray(arr) || arr.length !== jumlah) {
    throw new Error(`Jumlah baris tidak cocok (${arr.length} vs ${jumlah}).`);
  }
  return arr.map((x) => String(x));
}

/** Terjemahkan sekumpulan teks ke bahasa Indonesia. */
export async function terjemahkanBaris(baris: string[]): Promise<string[]> {
  const p = penyediaAktif();
  if (!p) throw new Error("Belum ada kunci API penerjemah yang diatur.");
  if (baris.length === 0) return [];

  // Dipotong agar permintaan tidak terlalu besar.
  const POTONG = 60;
  const hasil: string[] = [];
  for (let i = 0; i < baris.length; i += POTONG) {
    const bagian = baris.slice(i, i + POTONG);
    let keluar: string[];
    if (p === "anthropic") keluar = await viaAnthropic(bagian);
    else if (p === "openai") keluar = await viaOpenAI(bagian);
    else if (p === "gemini") keluar = await viaGemini(bagian);
    else keluar = await viaDeepL(bagian);
    hasil.push(...keluar);
  }
  return hasil.map((t) => rapikan(t.replace(/\s+/g, " ").trim()));
}

/** Terjemahkan daftar baris bersubtitel lalu susun menjadi berkas WebVTT. */
export async function terjemahkanVTT(baris: Baris[], judul?: string): Promise<string> {
  const teks = await terjemahkanBaris(baris.map((b) => b.teks));
  return buatVTT(
    baris.map((b, i) => ({ ...b, teks: teks[i] ?? b.teks })),
    judul,
  );
}

/** Urai berkas WebVTT menjadi daftar baris agar bisa diterjemahkan ulang. */
export function uraiVTT(vtt: string): Baris[] {
  const blok = vtt.replace(/\r/g, "").split("\n\n");
  const hasil: Baris[] = [];
  const waktu = (s: string) => {
    const [j, m, d] = s.split(":");
    return Number(j) * 3600 + Number(m) * 60 + parseFloat(d);
  };
  for (const b of blok) {
    const garis = b.split("\n").filter(Boolean);
    const idx = garis.findIndex((g) => g.includes("-->"));
    if (idx === -1) continue;
    const [a, z] = garis[idx].split("-->").map((x) => x.trim());
    const teks = garis.slice(idx + 1).join("\n");
    if (!teks) continue;
    hasil.push({ mulai: waktu(a), selesai: waktu(z), teks });
  }
  return hasil;
}
