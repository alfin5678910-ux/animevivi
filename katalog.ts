export type SeedAnime = {
  slug: string;
  title: string;
  tagline: string;
  synopsis: string;
  genres: string;
  status: "tayang" | "tamat" | "segera";
  year: number;
  studio: string;
  coverUrl: string;
  totalEpisodes: number;
  airDay: string;
  /** jumlah episode yang sudah rilis saat benih dibuat */
  sudahRilis: number;
  judulEpisode: string[];
};

export const VIDEO_CONTOH = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
];

export const KATALOG: SeedAnime[] = [
  {
    slug: "pedang-fajar-terakhir",
    title: "Pedang Fajar Terakhir",
    tagline: "Satu bilah, satu janji, satu dunia yang runtuh.",
    synopsis:
      "Setelah kerajaannya hancur dalam semalam, Arga mewarisi pedang biru yang hanya menyala di tangan orang yang masih punya alasan untuk hidup. Bersama kelompok pengembara, ia menelusuri jembatan-jembatan runtuh demi mencari dalang kehancuran. Seluruh dialog disulihkan dalam teks bahasa Indonesia, dengan suara asli yang tetap dipertahankan.",
    genres: "Aksi, Fantasi, Petualangan",
    status: "tayang",
    year: 2026,
    studio: "Studio Nusa Animasi",
    coverUrl: "/images/cover-pedang.jpg",
    totalEpisodes: 12,
    airDay: "Sabtu",
    sudahRilis: 6,
    judulEpisode: [
      "Malam Ketika Langit Pecah",
      "Bilah yang Memilih Tuannya",
      "Jembatan Para Pengkhianat",
      "Hujan Bara di Benteng Timur",
      "Nama yang Tak Boleh Disebut",
      "Darah dan Sumpah",
      "Gerbang Fajar",
      "Pengakuan Sang Panglima",
      "Kota di Bawah Abu",
      "Luka yang Tak Sembuh",
      "Bayangan Terakhir",
      "Fajar untuk Semua Orang",
    ],
  },
  {
    slug: "lampu-kota-pukul-tiga",
    title: "Lampu Kota Pukul Tiga",
    tagline: "Kisah sederhana tentang pulang.",
    synopsis:
      "Nala, siswi SMA yang selalu kehilangan kereta terakhir, menemukan sebuah kedai 24 jam tempat semua orang menitipkan keresahannya. Drama hangat tentang persahabatan, musik, dan kota yang tidak pernah tidur. Teks sepenuhnya bahasa Indonesia.",
    genres: "Drama, Slice of Life, Musik",
    status: "tayang",
    year: 2026,
    studio: "Rumah Gambar Senja",
    coverUrl: "/images/cover-kota.jpg",
    totalEpisodes: 12,
    airDay: "Rabu",
    sudahRilis: 8,
    judulEpisode: [
      "Kereta Terakhir Sudah Pergi",
      "Kopi Dingin dan Lagu Lama",
      "Daftar Putar untuk Orang Asing",
      "Hujan di Perempatan",
      "Catatan di Serbet Kertas",
      "Suara yang Hilang",
      "Panggung Kecil",
      "Yang Tertinggal di Peron",
      "Pagi Pertama",
      "Surat untuk Diri Sendiri",
      "Pulang",
      "Lampu Kota Menyala Lagi",
    ],
  },
  {
    slug: "penyihir-perpustakaan-melayang",
    title: "Penyihir dari Perpustakaan Melayang",
    tagline: "Setiap mantra adalah kalimat yang pernah dilupakan.",
    synopsis:
      "Di perpustakaan yang melayang di atas awan, Seruni belajar bahwa sihir sejati lahir dari bahasa. Ketika buku-buku mulai kehilangan isinya, ia harus menulis ulang dunia sebelum semua ingatan menghilang.",
    genres: "Fantasi, Misteri, Sihir",
    status: "tayang",
    year: 2026,
    studio: "Studio Awan Tujuh",
    coverUrl: "/images/cover-penyihir.jpg",
    totalEpisodes: 13,
    airDay: "Jumat",
    sudahRilis: 4,
    judulEpisode: [
      "Rak Nomor Nol",
      "Mantra yang Salah Eja",
      "Tinta yang Menolak Kering",
      "Pembaca Tanpa Wajah",
      "Bab yang Hilang",
      "Bahasa Para Naga",
      "Kunci Berbentuk Koma",
      "Perpustakaan Jatuh",
      "Nama Asli Seruni",
      "Halaman Terbakar",
      "Penjaga Terakhir",
      "Menulis Ulang Langit",
      "Kalimat Penutup",
    ],
  },
  {
    slug: "baja-fajar-nusantara",
    title: "Baja Fajar Nusantara",
    tagline: "Raksasa baja, pilot remaja, laut yang marah.",
    synopsis:
      "Kota pesisir Candrapura diserang makhluk dari dasar laut. Bayu, remaja pengantar ikan, tanpa sengaja menjadi pilot mecha prototipe bernama Fajar-01. Aksi mecha penuh ledakan dengan narasi khas Indonesia.",
    genres: "Mecha, Aksi, Sci-Fi",
    status: "tayang",
    year: 2026,
    studio: "Garuda Frame Works",
    coverUrl: "/images/cover-mecha.jpg",
    totalEpisodes: 12,
    airDay: "Minggu",
    sudahRilis: 2,
    judulEpisode: [
      "Sirene Pagi",
      "Kokpit untuk Pemula",
      "Ombak Setinggi Menara",
      "Perintah yang Tak Masuk Akal",
      "Mesin Kedua",
      "Retak di Lambung Baja",
      "Dasar Laut Candrapura",
      "Protokol Fajar",
      "Teman Lama, Musuh Baru",
      "Langit Merah",
      "Pengorbanan Terakhir",
      "Nusantara Masih Berdiri",
    ],
  },
  {
    slug: "semangkuk-untuk-kenangan",
    title: "Semangkuk untuk Kenangan",
    tagline: "Resep terbaik selalu punya cerita sedih di baliknya.",
    synopsis:
      "Warung kecil milik almarhum ayahnya diwariskan kepada Tari. Setiap pelanggan datang membawa satu kenangan, dan setiap mangkuk yang ia sajikan mengembalikan satu potong masa lalu.",
    genres: "Kuliner, Drama, Keluarga",
    status: "tamat",
    year: 2025,
    studio: "Dapur Animasi Timur",
    coverUrl: "/images/cover-kuliner.jpg",
    totalEpisodes: 10,
    airDay: "Kamis",
    sudahRilis: 10,
    judulEpisode: [
      "Warung yang Ditinggalkan",
      "Kaldu Pertama",
      "Pelanggan Pukul Dua Pagi",
      "Resep di Balik Kalender",
      "Tamu yang Tak Pernah Bayar",
      "Rasa yang Hilang",
      "Malam Tanpa Pembeli",
      "Buku Catatan Ayah",
      "Mangkuk Terakhir",
      "Selamat Makan, Yah",
    ],
  },
];
