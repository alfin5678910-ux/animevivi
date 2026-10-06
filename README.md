# animeil.al 🎬

Aplikasi nonton anime berbahasa Indonesia. Seluruh antarmuka, judul, sinopsis, dan nama episode
ditulis dalam bahasa Indonesia — **tidak ada teks Jepang**. Suara anime tetap aslinya; hanya teks
yang dilokalkan.

Dibangun dengan **Next.js 16 (App Router)**, **PostgreSQL**, **Drizzle ORM**, dan **Tailwind CSS 4**.

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 💬 **Subtitel Indonesia** | Semua episode legal bersubtitel bahasa Indonesia (WebVTT) |
| 🤖 **Penerjemah AI** | Otomatis aktif bila kunci API diisi (Claude / GPT / Gemini / DeepL) |
| 📡 **Tarik episode otomatis** | Katalog + jam tayang tiap episode ditarik dari **AniList** (gratis, tanpa kunci API) |
| ⚡ **Yang sudah tayang langsung rilis** | Episode yang jam tayangnya sudah lewat langsung tersedia saat itu juga |
| 🎥 Pemutar video | Streaming per episode, episode belum tayang terkunci 🔒 |
| ⏰ **Rilis otomatis** | Episode belum tayang ditunda sampai waktunya, lalu terbit sendiri + pengikut dapat notifikasi |
| ✅ **Centang oranye** | Hanya tampil untuk email terverifikasi (`VERIFIED_EMAIL`) |
| 💬 Komentar & balasan | Diskusi bertingkat (balasan di dalam balasan) |
| ♥ Suka komentar | Like/unlike, jumlah suka realtime |
| ⭐ Rating 1–10 | Rata-rata dan jumlah penilai dihitung otomatis |
| 🔔 Notifikasi | Saat komentar dibalas, disukai, atau episode baru rilis |
| 🔖 Daftar pantau | Ikuti anime untuk menerima notifikasi rilis |
| 🎬 Studio Rilis | Khusus akun terverifikasi: merilis judul baru + jadwal mingguan otomatis |
| 🔐 Autentikasi | Register/login sendiri, sandi di-hash `scrypt`, sesi via cookie httpOnly |

---

## 🚀 Menjalankan secara lokal

### 1. Prasyarat
- Node.js 20 atau lebih baru
- PostgreSQL yang berjalan (lokal atau cloud)

### 2. Pasang dependensi
```bash
npm install
```

### 3. Siapkan variabel lingkungan
```bash
cp .env.example .env
```
Lalu sesuaikan isi `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
VERIFIED_EMAIL=ilfil1087@gmail.com
```

### 4. Buat tabel di database
```bash
npx drizzle-kit push --dialect=postgresql --schema=./src/db/schema.ts --url="$DATABASE_URL"
```
> Di Windows PowerShell, ganti `"$DATABASE_URL"` dengan URL database-nya langsung.

### 5. Jalankan
```bash
npm run dev     # mode pengembangan  -> http://localhost:3000
# atau
npm run build && npm run start   # mode produksi
```

Katalog awal (5 anime + episode + diskusi contoh) **terisi otomatis** saat halaman pertama dibuka.

---

## ☁️ Deploy ke Vercel

### Langkah 1 — Siapkan database cloud
PostgreSQL lokal tidak bisa diakses Vercel. Pakai salah satu (semuanya punya paket gratis):
- [Neon](https://neon.tech) — paling direkomendasikan
- [Supabase](https://supabase.com)
- Vercel Postgres (dari tab *Storage* di dasbor Vercel)

Salin connection string-nya, contoh:
```
postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

### Langkah 2 — Buat tabel di database cloud
Jalankan dari komputermu, arahkan ke database cloud tadi:
```bash
npx drizzle-kit push --dialect=postgresql --schema=./src/db/schema.ts --url="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"
```

### Langkah 3 — Unggah kode
**Cara A — lewat GitHub (disarankan)**
```bash
git init
git add .
git commit -m "animeil.al"
git branch -M main
git remote add origin https://github.com/USERNAME/animeil-al.git
git push -u origin main
```
Buka [vercel.com/new](https://vercel.com/new) → *Import* repositori tersebut.

**Cara B — lewat CLI tanpa GitHub**
```bash
npm i -g vercel
vercel
```

### Langkah 4 — Isi Environment Variables di Vercel
Di dasbor proyek → **Settings → Environment Variables**, tambahkan:

| Name | Value |
|---|---|
| `DATABASE_URL` | connection string dari Langkah 1 |
| `VERIFIED_EMAIL` | `ilfil1087@gmail.com` |

Pilih ketiga environment (Production, Preview, Development), lalu **Redeploy**.

> Next.js terdeteksi otomatis oleh Vercel — tidak perlu mengubah Build Command
> maupun Output Directory.

### Langkah 5 — Selesai
Buka domain hasil deploy, lalu daftar dengan email `ilfil1087@gmail.com`.
Centang oranye langsung aktif untuk akun tersebut.

---

## ✅ Cara kerja centang oranye

Pengecekan dilakukan **di sisi server**, jadi tidak bisa dipalsukan dari browser:

```ts
// src/lib/auth.ts
export function isVerifiedEmail(email) {
  return normalizeEmail(email) === normalizeEmail(VERIFIED_EMAIL);
}
```

Fungsi `normalizeEmail` memaafkan kesalahan ketik/salin yang umum:
spasi tersembunyi, huruf besar, kurung `[ ]`, titik pada Gmail, dan `+label`.
Artinya `ILFIL1087@Gmail.com`, `ilf.il1087@gmail.com`, dan `ilfil1087+tes@gmail.com`
tetap dikenali sebagai akun yang sama.

Pengguna lain yang mendaftar **tidak** mendapat centang, dan Studio Rilis bagi mereka
menampilkan "Akses terbatas".

Mau mengganti pemilik centang? Cukup ubah `VERIFIED_EMAIL` di `.env`.

---

## 💬 Subtitel Indonesia & penerjemah AI

**Sudah aktif tanpa perlu kunci API.** Semua episode legal (15 episode) punya
subtitel bahasa Indonesia berformat WebVTT, disajikan lewat `/api/subtitle/[episodeId]`
dan dipasang otomatis sebagai `<track default>` di pemutar.

### Batas hak cipta (penting)

Subtitel **hanya** dibuat untuk video yang kita tayangkan secara legal:
animasi Jepang domain publik (pra-1953) dan film berlisensi Creative Commons.
Judul berhak cipta mengembalikan berkas kosong, karena episodenya memang tidak
kami tayangkan. Teks subtitel adalah keterangan adegan yang ditulis sendiri
untuk animeil.al — bukan salinan dialog dari karya lain.

### Mengaktifkan terjemahan AI

Isi **salah satu** kunci berikut di `.env`, lalu buka **Studio Rilis**:

```env
ANTHROPIC_API_KEY=...   # Claude
OPENAI_API_KEY=...      # GPT
GEMINI_API_KEY=...      # Gemini
DEEPL_API_KEY=...       # DeepL
```

Sistem mendeteksi sendiri penyedia yang tersedia — tidak perlu mengubah kode.
Tombol **"Terjemahkan ulang semua subtitel"** akan muncul, dan hasilnya disimpan
di tabel `subtitles` supaya tidak perlu menerjemah berulang kali.

Berkas terkait: `src/lib/subtitle.ts` (teks + WebVTT), `src/lib/terjemah.ts`
(penerjemah multi-penyedia), `src/app/api/subtitle/`.

## 📡 Pengambilan episode otomatis

Sumber data: **AniList GraphQL** (`https://graphql.anilist.co`) — gratis dan tanpa kunci API.
Setiap episode di sana punya stempel waktu tayang asli (`airingAt`).

Alur di `src/lib/sinkron.ts`:

1. Tarik anime yang sedang tayang + yang akan datang, lengkap dengan jadwal tiap episode.
2. Untuk setiap episode:
   - `airingAt <= sekarang` → **langsung dirilis** (bisa ditonton saat itu juga).
   - `airingAt > sekarang` → **ditunda**, disimpan sebagai terjadwal.
3. Jadwal yang berubah (anime diundur) ikut diperbarui, tanpa menarik kembali
   episode yang sudah terlanjur rilis.
4. Status judul disesuaikan otomatis: *Segera* → *Sedang Tayang* → *Tamat*.

Penarikan berjalan otomatis saat katalog masih kosong, dan bisa diulang kapan saja
lewat tombol **"Tarik & rilis sekarang"** di menu **Studio Rilis**.

## ⏰ Cara kerja rilis terjadwal

Fungsi `rilisEpisodeJatuhTempo()` (`src/lib/rilis.ts`) berjalan saat halaman dimuat
dan saat notifikasi di-polling:

1. Mencari episode dengan `release_at <= sekarang` yang belum rilis.
2. Menandainya rilis sehingga **langsung bisa ditonton**.
3. Mengirim notifikasi "Episode baru" ke seluruh pengikut judul tersebut.
4. Mengubah status anime menjadi *Tamat* bila semua episodenya sudah rilis.

> **Cron bawaan.** Berkas `vercel.json` sudah menjadwalkan `GET /api/sync`
> setiap 10 menit, sehingga episode tetap rilis tepat waktu walau tidak ada
> pengunjung. Endpoint yang sama bisa dipanggil cron eksternal bila kamu
> tidak memakai Vercel.

---

## 📁 Struktur proyek

```
src/
├─ app/
│  ├─ page.tsx                  # Beranda
│  ├─ anime/[slug]/page.tsx     # Pemutar, episode, rating, komentar
│  ├─ jelajah/ jadwal/          # Katalog & jadwal rilis
│  ├─ masuk/ daftar/            # Autentikasi
│  ├─ profil/ pantau/ notifikasi/
│  ├─ studio/                   # Rilis judul (khusus terverifikasi)
│  └─ api/                      # auth, comments, ratings, follow, notifications, studio
├─ components/
│  ├─ Verified.tsx              # ⭐ Ikon centang oranye
│  ├─ Komentar.tsx              # Komentar + balasan + suka
│  ├─ TopNav.tsx  KartuAnime.tsx  RatingBintang.tsx
│  ├─ HitungMundur.tsx  DaftarNotifikasi.tsx  FormAuth.tsx  FormStudio.tsx
├─ db/
│  ├─ schema.ts                 # 8 tabel Drizzle
│  └─ index.ts                  # Koneksi (SSL otomatis untuk cloud)
└─ lib/
   ├─ auth.ts                   # Sesi, hash sandi, cek verifikasi
   ├─ data.ts                   # Query baca
   ├─ rilis.ts                  # Seed + mesin rilis otomatis
   ├─ katalog.ts                # Data katalog awal
   └─ format.ts                 # Tanggal & waktu bahasa Indonesia
```

### Tabel database
`users` · `sessions` · `anime` · `episodes` · `comments` · `comment_likes` · `ratings` · `follows` · `notifications`

---

## 🔑 Akun bawaan (hasil seed)

| Akun | Email | Sandi | Centang |
|---|---|---|---|
| Tim redaksi | `tim@animeil.al` | `animeil123` | ❌ |
| Pengguna contoh | `rina@contoh.id` | `rahasia123` | ❌ |

Email `ilfil1087@gmail.com` **sengaja dibiarkan kosong** agar kamu bisa mendaftar
sendiri dengan nama pengguna pilihanmu dan langsung mendapat centang oranye.

---

## 📝 Catatan

- **Metadata** (judul, jadwal, poster) ditarik dari AniList. **Berkas videonya tidak** —
  AniList tidak menyediakan video. Pemutar memakai berkas contoh publik
  (Big Buck Bunny dsb.) sebagai pengganti.
- Ganti `VIDEO_CONTOH` di `src/lib/katalog.ts`, atau isi kolom `video_url` pada tabel
  `episodes`, dengan sumber video yang kamu miliki haknya.
- Poster dimuat dari `s4.anilist.co` (sudah didaftarkan di `next.config.ts`).
  Gambar cadangan lokal ada di `public/images/`.
- Pastikan kamu memiliki hak atas konten yang kamu distribusikan.
