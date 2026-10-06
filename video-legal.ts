/**
 * Katalog video yang BOLEH ditayangkan ulang.
 *
 * Dua sumber, keduanya sudah diverifikasi dapat di-stream (HTTP 206 / video/mp4):
 *
 * 1. ANIMASI JEPANG DOMAIN PUBLIK (pra-1953).
 *    Pengadilan Jepang (2006) menetapkan seluruh film Jepang terbitan sebelum
 *    1953 bebas hak cipta. Ini anime sungguhan — termasuk "Namakura Gatana"
 *    (1917), anime tertua yang masih tersimpan.
 *
 * 2. FILM ANIMASI LISENSI CREATIVE COMMONS BY.
 *    Blender Foundation merilisnya secara terbuka; boleh ditayangkan ulang
 *    selama pembuatnya dicantumkan (atribusi ada di kolom `atribusi`).
 *
 * Tidak ada satu pun judul berhak cipta di sini.
 */

const UNDUH = "https://archive.org/download";

function tautan(identifier: string, berkas: string): string {
  return `${UNDUH}/${identifier}/${encodeURIComponent(berkas)}`;
}

export type EpisodeLegal = {
  judul: string;
  tahun: number;
  menit: number;
  videoUrl: string;
  sinopsis: string;
};

export type SeriLegal = {
  slug: string;
  title: string;
  tagline: string;
  synopsis: string;
  genres: string;
  studio: string;
  year: number;
  airDay: string;
  lisensi: string;
  atribusi: string;
  episodes: EpisodeLegal[];
};

export const SERI_LEGAL: SeriLegal[] = [
  {
    slug: "fajar-anime-era-bisu",
    title: "Fajar Anime: Era Bisu",
    tagline: "Anime pertama di dunia, kini bisa kamu tonton utuh.",
    synopsis:
      "Kumpulan animasi Jepang paling awal yang masih tersimpan, dibuka oleh Namakura Gatana (1917) karya Jun'ichi Kouchi — karya anime tertua yang berhasil diselamatkan. Film-film ini dibuat jauh sebelum era televisi, digambar tangan bingkai demi bingkai. Seluruh judul berstatus domain publik sehingga bebas ditonton siapa saja. Teks pengantar dan keterangan disajikan dalam bahasa Indonesia.",
    genres: "Klasik, Sejarah, Komedi",
    studio: "Pelopor Animasi Jepang",
    year: 1917,
    airDay: "Senin",
    lisensi: "Domain Publik (film Jepang pra-1953)",
    atribusi: "Arsip: Internet Archive",
    episodes: [
      {
        judul: "Pedang Tumpul",
        tahun: 1917,
        menit: 4,
        videoUrl: tautan("namakura-gatana-1917", "Namakura Gatana 1917 restoration.mp4"),
        sinopsis:
          "Seorang samurai membeli pedang yang ternyata tumpul, lalu mencobanya kepada orang-orang yang lewat dengan hasil yang sama sekali di luar dugaan. Inilah anime tertua yang masih tersimpan hingga kini.",
      },
      {
        judul: "Urashima Taro",
        tahun: 1931,
        menit: 11,
        videoUrl: tautan("malkav-animes-urashima-tarou", "[Malkav Animes] Urashima Tarou.mp4"),
        sinopsis:
          "Adaptasi dongeng rakyat tentang nelayan yang menolong seekor penyu, lalu diundang ke istana di dasar laut. Ia pulang membawa kotak yang tak boleh dibuka.",
      },
      {
        judul: "Si Kecil Issunboshi",
        tahun: 1929,
        menit: 7,
        videoUrl: tautan(
          "malkav-animes-issunboushi-no-shusse",
          "[Malkav Animes] Issunboushi no Shusse.mp4",
        ),
        sinopsis:
          "Anak laki-laki sebesar jari merantau ke kota dengan mangkuk sebagai perahu dan jarum sebagai pedang, membuktikan keberanian tidak diukur dari ukuran tubuh.",
      },
      {
        judul: "Perayaan Desa",
        tahun: 1930,
        menit: 6,
        videoUrl: tautan(
          "malkav-animes-mura-matsuri-1930",
          "[Malkav Animes] Mura-Matsuri-1930-MP4.mp4",
        ),
        sinopsis:
          "Suasana festival di sebuah desa Jepang, lengkap dengan tarian, tabuhan taiko, dan kejahilan para hewan yang ikut meramaikan.",
      },
      {
        judul: "Nyanyian Musim Semi",
        tahun: 1931,
        menit: 5,
        videoUrl: tautan("malkav-animes-haru-no-uta", "[Malkav Animes] Haru no Uta.mp4"),
        sinopsis:
          "Animasi musikal pendek yang merayakan datangnya musim semi lewat gerak hewan dan bunga yang bermekaran.",
      },
    ],
  },
  {
    slug: "petualangan-momotaro",
    title: "Petualangan Momotaro",
    tagline: "Pahlawan dari buah persik, dari layar bisu sampai layar lebar.",
    synopsis:
      "Momotaro, bocah yang lahir dari buah persik, adalah tokoh rakyat paling terkenal di Jepang dan paling sering diangkat ke animasi awal. Seri ini mengumpulkan tiga penafsiran berbeda dari tahun 1928 hingga 1944, memperlihatkan bagaimana teknik animasi Jepang berkembang pesat dalam waktu kurang dari dua dekade. Seluruhnya berstatus domain publik.",
    genres: "Klasik, Petualangan, Fantasi",
    studio: "Pelopor Animasi Jepang",
    year: 1928,
    airDay: "Rabu",
    lisensi: "Domain Publik (film Jepang pra-1953)",
    atribusi: "Arsip: Internet Archive",
    episodes: [
      {
        judul: "Momotaro Nomor Satu di Jepang",
        tahun: 1928,
        menit: 6,
        videoUrl: tautan(
          "malkav-animes-nihon-ichi-momotaro",
          "[Malkav Animes] Nihon-ichi Momotaro.mp4",
        ),
        sinopsis:
          "Versi paling awal: Momotaro berangkat bersama anjing, monyet, dan burung pegar untuk menghadapi para oni di Pulau Setan.",
      },
      {
        judul: "Momotaro di Angkasa",
        tahun: 1931,
        menit: 6,
        videoUrl: tautan(
          "malkav-animes-sora-no-momotarou-mp4",
          "[Malkav Animes] Sora-no-momotarou-mp4.mp4",
        ),
        sinopsis:
          "Momotaro berpindah ke langit, memimpin armada udara dalam salah satu animasi bertema penerbangan paling awal dari Jepang.",
      },
      {
        judul: "Momotaro di Lautan",
        tahun: 1931,
        menit: 6,
        videoUrl: tautan("malkav-animes-umi-no-momotaro", "[Malkav Animes] Umi no Momotaro.mp4"),
        sinopsis:
          "Petualangan bahari sang pahlawan bersama kawanan hewan laut, dipenuhi humor khas animasi era bisu.",
      },
      {
        judul: "Prajurit Laut Suci",
        tahun: 1944,
        menit: 74,
        videoUrl: tautan("momotaro-sacred-sailors", "Momotaro Sacred Sailors .mp4"),
        sinopsis:
          "Film animasi panjang pertama Jepang. Secara teknis sangat maju untuk zamannya dan menjadi tonggak penting sejarah anime. Dibuat pada masa perang, sehingga sarat muatan propaganda — ditayangkan di sini sebagai dokumen sejarah.",
      },
    ],
  },
  {
    slug: "dongeng-hewan-jepang",
    title: "Dongeng Hewan Jepang",
    tagline: "Kucing hitam, kelelawar, dan burung yang pandai bicara.",
    synopsis:
      "Animasi pendek Jepang era 1930-an yang seluruhnya berkisah tentang hewan. Dibuat ketika suara baru saja masuk ke film Jepang, banyak di antaranya berbentuk animasi musikal sederhana yang ceria. Semua judul berstatus domain publik.",
    genres: "Klasik, Keseharian, Musik",
    studio: "Pelopor Animasi Jepang",
    year: 1931,
    airDay: "Jumat",
    lisensi: "Domain Publik (film Jepang pra-1953)",
    atribusi: "Arsip: Internet Archive",
    episodes: [
      {
        judul: "Si Kucing Hitam",
        tahun: 1931,
        menit: 5,
        videoUrl: tautan("malkav-animes-kuro-nyago", "[Malkav Animes] Kuro Nyago.mp4"),
        sinopsis:
          "Animasi musikal tentang sekelompok anak kucing hitam yang menari mengikuti irama — salah satu animasi bersuara paling awal dari Jepang.",
      },
      {
        judul: "Kelelawar",
        tahun: 1931,
        menit: 5,
        videoUrl: tautan("malkav-animes-koumori", "[Malkav Animes] Koumori.mp4"),
        sinopsis:
          "Seekor kelelawar kebingungan menentukan jati diri: ikut kawanan burung atau kawanan hewan berbulu. Fabel klasik dengan sentuhan jenaka.",
      },
      {
        judul: "Rumah Baru Si Burung",
        tahun: 1933,
        menit: 6,
        videoUrl: tautan(
          "malkav-animes-hibari-no-yadogae",
          "[Malkav Animes] Hibari no Yadogae.mp4",
        ),
        sinopsis:
          "Keluarga burung pindah rumah dan menghadapi berbagai kerepotan yang akrab di telinga siapa pun yang pernah berpindah tempat tinggal.",
      },
    ],
  },
  {
    slug: "sinema-animasi-terbuka",
    title: "Sinema Animasi Terbuka",
    tagline: "Film animasi modern yang sengaja dibebaskan pembuatnya.",
    synopsis:
      "Film-film animasi 3D garapan Blender Foundation yang dirilis dengan lisensi Creative Commons Attribution. Pembuatnya sengaja membebaskan karya ini untuk ditonton, dibagikan, bahkan diolah ulang siapa saja. Kualitas produksinya setara film bioskop, dan semuanya legal ditayangkan di sini selama pembuatnya dicantumkan.",
    genres: "Animasi, Fantasi, Petualangan",
    studio: "Blender Foundation",
    year: 2019,
    airDay: "Sabtu",
    lisensi: "Creative Commons Attribution (CC BY)",
    atribusi: "© Blender Foundation — blender.org",
    episodes: [
      {
        judul: "Spring",
        tahun: 2019,
        menit: 8,
        videoUrl: tautan("springopenmovie", "springopenmovie.mp4"),
        sinopsis:
          "Seorang gembala muda dan anjingnya menghadapi roh-roh purba demi memastikan pergantian musim tetap berjalan. Visualnya memukau, nyaris tanpa dialog.",
      },
      {
        judul: "Big Buck Bunny",
        tahun: 2008,
        menit: 10,
        videoUrl: tautan("BigBuckBunny_124", "Content/big_buck_bunny_720p_surround.mp4"),
        sinopsis:
          "Seekor kelinci besar berhati lembut akhirnya kehilangan kesabaran menghadapi tiga hewan pengganggu. Komedi slapstick yang hangat dan penuh warna.",
      },
      {
        judul: "Elephants Dream",
        tahun: 2006,
        menit: 11,
        videoUrl: tautan("ElephantsDream", "ed_1024_512kb.mp4"),
        sinopsis:
          "Dua tokoh menyusuri mesin raksasa yang terus berubah bentuk. Film animasi sumber terbuka pertama di dunia, bernuansa surealis dan misterius.",
      },
    ],
  },
];

/** Semua tautan video legal, untuk pengecekan cepat. */
export function semuaVideoLegal(): string[] {
  return SERI_LEGAL.flatMap((s) => s.episodes.map((e) => e.videoUrl));
}
