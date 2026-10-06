/**
 * Subtitel bahasa Indonesia.
 *
 * ATURAN PENTING:
 * Subtitel hanya dibuat untuk video yang memang kita tayangkan secara legal
 * (animasi Jepang domain publik pra-1953 dan film berlisensi Creative Commons).
 * Judul berhak cipta TIDAK diberi subtitel, karena kita memang tidak
 * menayangkan episodenya.
 *
 * Film-film bisu era 1917-1933 aslinya memakai kartu teks berbahasa Jepang
 * yang tidak terbaca oleh penonton Indonesia. Teks di bawah ini adalah
 * keterangan adegan asli yang ditulis sendiri untuk animeil.al, bukan
 * salinan dialog dari karya lain.
 */

export type Baris = { mulai: number; selesai: number; teks: string };

function jam(detik: number): string {
  const j = Math.floor(detik / 3600);
  const m = Math.floor((detik % 3600) / 60);
  const d = Math.floor(detik % 60);
  const ms = Math.round((detik - Math.floor(detik)) * 1000);
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(j)}:${p(m)}:${p(d)}.${p(ms, 3)}`;
}

/** Susun berkas WebVTT dari daftar baris. */
export function buatVTT(baris: Baris[], judul?: string): string {
  const kepala = judul ? `WEBVTT - ${judul}\n\n` : "WEBVTT\n\n";
  const isi = baris
    .map((b, i) => `${i + 1}\n${jam(b.mulai)} --> ${jam(b.selesai)}\n${b.teks}`)
    .join("\n\n");
  return kepala + isi + "\n";
}

/** Bagi teks panjang jadi dua baris agar nyaman dibaca. */
export function rapikan(teks: string, maks = 42): string {
  if (teks.length <= maks) return teks;
  const kata = teks.split(" ");
  const baris: string[] = [];
  let kini = "";
  for (const k of kata) {
    if ((kini + " " + k).trim().length > maks) {
      baris.push(kini.trim());
      kini = k;
    } else {
      kini = (kini + " " + k).trim();
    }
  }
  if (kini) baris.push(kini);
  return baris.slice(0, 2).join("\n");
}

/**
 * Keterangan adegan berbahasa Indonesia untuk tiap film domain publik,
 * dipetakan berdasarkan nomor urut episode dalam seri.
 */
export const SUBTITEL_KURASI: Record<string, Record<number, Baris[]>> = {
  "fajar-anime-era-bisu": {
    1: [
      { mulai: 0, selesai: 5, teks: "Pedang Tumpul (1917)\nKarya Jun'ichi Kōuchi" },
      { mulai: 5, selesai: 11, teks: "Anime tertua di dunia\nyang masih tersimpan." },
      { mulai: 11, selesai: 20, teks: "Seorang samurai mendatangi\npedagang senjata di pinggir jalan." },
      { mulai: 20, selesai: 30, teks: "Pedagang itu menawarkan sebilah\npedang dengan harga tinggi." },
      { mulai: 30, selesai: 42, teks: "Sang samurai membayar mahal,\nyakin ia mendapat senjata terbaik." },
      { mulai: 42, selesai: 54, teks: "Ia pun ingin segera\nmencoba ketajamannya." },
      { mulai: 54, selesai: 68, teks: "Seorang pejalan kaki lewat.\nSamurai itu menghunus pedangnya." },
      { mulai: 68, selesai: 82, teks: "Namun pedang itu ternyata tumpul —\nsama sekali tidak melukai." },
      { mulai: 82, selesai: 96, teks: "Si pejalan kaki balik melawan.\nSamurai itu justru kewalahan." },
      { mulai: 96, selesai: 112, teks: "Ia mencoba lagi pada orang lain,\ndan hasilnya tetap sama saja." },
      { mulai: 112, selesai: 128, teks: "Satu per satu korbannya\nmalah balas memukulinya." },
      { mulai: 128, selesai: 145, teks: "Babak belur, ia sadar telah\ntertipu oleh si pedagang." },
      { mulai: 145, selesai: 160, teks: "Dengan marah ia kembali\nmencari penjual pedang itu." },
      { mulai: 160, selesai: 180, teks: "Pesan ceritanya sederhana:\nharga mahal bukan jaminan mutu." },
      { mulai: 180, selesai: 200, teks: "Sebuah komedi bisu berusia\nlebih dari seabad." },
      { mulai: 200, selesai: 230, teks: "Film ini sempat hilang,\ndan ditemukan kembali di Osaka." },
      { mulai: 230, selesai: 259, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
    2: [
      { mulai: 0, selesai: 6, teks: "Urashima Taro (1931)\nDongeng rakyat Jepang" },
      { mulai: 6, selesai: 16, teks: "Di sebuah desa nelayan,\nhiduplah pemuda bernama Urashima Taro." },
      { mulai: 16, selesai: 28, teks: "Suatu hari ia melihat seekor penyu\nyang sedang disiksa anak-anak." },
      { mulai: 28, selesai: 40, teks: "Dengan iba, Taro menolong\ndan melepaskannya kembali ke laut." },
      { mulai: 40, selesai: 55, teks: "Beberapa waktu kemudian,\npenyu itu datang menemuinya." },
      { mulai: 55, selesai: 70, teks: "Sebagai balas budi, Taro diajak\nke istana di dasar lautan." },
      { mulai: 70, selesai: 88, teks: "Istana itu megah,\ndihuni sang putri laut." },
      { mulai: 88, selesai: 110, teks: "Taro dijamu dengan tarian\ndan hidangan yang tak pernah ia bayangkan." },
      { mulai: 110, selesai: 135, teks: "Hari demi hari berlalu\ntanpa terasa sedikit pun." },
      { mulai: 135, selesai: 160, teks: "Akhirnya Taro rindu rumah\ndan memohon izin untuk pulang." },
      { mulai: 160, selesai: 185, teks: "Sang putri memberinya sebuah kotak,\ndengan satu pesan: jangan dibuka." },
      { mulai: 185, selesai: 215, teks: "Sesampainya di darat,\ndesanya telah berubah total." },
      { mulai: 215, selesai: 245, teks: "Tak satu pun wajah ia kenali.\nRatusan tahun ternyata telah berlalu." },
      { mulai: 245, selesai: 275, teks: "Dalam kebingungan,\nTaro membuka kotak itu." },
      { mulai: 275, selesai: 300, teks: "Asap putih mengepul,\ndan waktu pun merenggut usianya." },
      { mulai: 300, selesai: 330, teks: "Dongeng tentang waktu\nyang tak pernah bisa diputar ulang." },
      { mulai: 330, selesai: 360, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
    3: [
      { mulai: 0, selesai: 6, teks: "Si Kecil Issunboshi (1929)\nDongeng rakyat Jepang" },
      { mulai: 6, selesai: 18, teks: "Sepasang suami istri lama\nmendambakan seorang anak." },
      { mulai: 18, selesai: 32, teks: "Doa mereka terkabul, namun\nanak itu hanya sebesar jari." },
      { mulai: 32, selesai: 48, teks: "Ia diberi nama Issunboshi,\nyang berarti \"si satu inci\"." },
      { mulai: 48, selesai: 66, teks: "Beranjak besar, ia bertekad\nmerantau ke kota." },
      { mulai: 66, selesai: 85, teks: "Sebuah mangkuk menjadi perahunya,\nsumpit menjadi dayungnya." },
      { mulai: 85, selesai: 105, teks: "Sebatang jarum ia bawa\nsebagai pedang." },
      { mulai: 105, selesai: 130, teks: "Di kota, ia mengabdi\npada sebuah keluarga bangsawan." },
      { mulai: 130, selesai: 155, teks: "Suatu hari, seorang raksasa\nmenyerang sang putri." },
      { mulai: 155, selesai: 180, teks: "Tanpa gentar, Issunboshi\nmaju menghadapinya." },
      { mulai: 180, selesai: 210, teks: "Tubuh kecilnya justru\nmenjadi keunggulannya." },
      { mulai: 210, selesai: 240, teks: "Raksasa itu pun kalah\ndan melarikan diri." },
      { mulai: 240, selesai: 270, teks: "Keberanian ternyata tidak\ndiukur dari besar tubuh." },
      { mulai: 270, selesai: 300, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
    4: [
      { mulai: 0, selesai: 6, teks: "Perayaan Desa (1930)\nAnimasi Jepang era bisu" },
      { mulai: 6, selesai: 18, teks: "Sebuah desa bersiap\nmenyambut hari festival." },
      { mulai: 18, selesai: 34, teks: "Lampion dipasang,\npanggung mulai didirikan." },
      { mulai: 34, selesai: 52, teks: "Tabuhan taiko menggema\nke seluruh penjuru desa." },
      { mulai: 52, selesai: 72, teks: "Warga berdatangan\nmengenakan pakaian terbaik." },
      { mulai: 72, selesai: 95, teks: "Tarian pun dimulai,\nmengelilingi panggung." },
      { mulai: 95, selesai: 120, teks: "Para hewan ikut meramaikan\ndengan tingkah jenaka." },
      { mulai: 120, selesai: 150, teks: "Suasana desa yang hangat,\nterekam lebih dari sembilan dekade lalu." },
      { mulai: 150, selesai: 180, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
    5: [
      { mulai: 0, selesai: 6, teks: "Nyanyian Musim Semi (1931)\nAnimasi musikal Jepang" },
      { mulai: 6, selesai: 20, teks: "Salju terakhir mencair,\nmusim dingin berakhir." },
      { mulai: 20, selesai: 38, teks: "Tunas pertama\nmulai menyembul dari tanah." },
      { mulai: 38, selesai: 58, teks: "Burung-burung kembali\ndan mulai bernyanyi." },
      { mulai: 58, selesai: 80, teks: "Bunga sakura bermekaran\nsatu demi satu." },
      { mulai: 80, selesai: 105, teks: "Hewan-hewan terbangun\ndari tidur panjangnya." },
      { mulai: 105, selesai: 135, teks: "Seluruh alam seolah\nmenyanyikan lagu yang sama." },
      { mulai: 135, selesai: 165, teks: "Sebuah perayaan musim semi\ntanpa satu pun kata." },
      { mulai: 165, selesai: 195, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
  },
  "petualangan-momotaro": {
    1: [
      { mulai: 0, selesai: 6, teks: "Momotaro Nomor Satu di Jepang (1928)" },
      { mulai: 6, selesai: 20, teks: "Seorang nenek menemukan\nbuah persik raksasa di sungai." },
      { mulai: 20, selesai: 36, teks: "Ketika dibelah, dari dalamnya\nmuncul seorang bayi laki-laki." },
      { mulai: 36, selesai: 54, teks: "Ia diberi nama Momotaro,\n\"anak dari buah persik\"." },
      { mulai: 54, selesai: 75, teks: "Tumbuh besar, ia mendengar\nkabar tentang para oni." },
      { mulai: 75, selesai: 98, teks: "Momotaro bertekad pergi\nke Pulau Setan." },
      { mulai: 98, selesai: 120, teks: "Di perjalanan ia bertemu\nseekor anjing." },
      { mulai: 120, selesai: 145, teks: "Lalu seekor monyet,\ndan seekor burung pegar." },
      { mulai: 145, selesai: 175, teks: "Berbekal kue kibidango,\nmereka menjadi sekutunya." },
      { mulai: 175, selesai: 210, teks: "Bersama, mereka menyeberangi\nlautan menuju pulau itu." },
      { mulai: 210, selesai: 245, teks: "Pertarungan melawan para oni\npun tak terhindarkan." },
      { mulai: 245, selesai: 280, teks: "Keberanian dan kerja sama\nmembawa mereka pada kemenangan." },
      { mulai: 280, selesai: 320, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
    2: [
      { mulai: 0, selesai: 6, teks: "Momotaro di Angkasa (1931)" },
      { mulai: 6, selesai: 22, teks: "Kali ini sang pahlawan\nmenaklukkan langit." },
      { mulai: 22, selesai: 42, teks: "Pesawat-pesawat disiapkan\nuntuk lepas landas." },
      { mulai: 42, selesai: 65, teks: "Momotaro memimpin\narmada udaranya." },
      { mulai: 65, selesai: 90, teks: "Awan demi awan\nmereka tembus." },
      { mulai: 90, selesai: 120, teks: "Salah satu animasi bertema\npenerbangan paling awal dari Jepang." },
      { mulai: 120, selesai: 155, teks: "Dibuat ketika pesawat terbang\nmasih terasa ajaib." },
      { mulai: 155, selesai: 190, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
    3: [
      { mulai: 0, selesai: 6, teks: "Momotaro di Lautan (1931)" },
      { mulai: 6, selesai: 22, teks: "Petualangan berpindah\nke tengah samudra." },
      { mulai: 22, selesai: 45, teks: "Momotaro berlayar bersama\nkawanan hewan laut." },
      { mulai: 45, selesai: 70, teks: "Ombak besar\nmenghadang perjalanan." },
      { mulai: 70, selesai: 100, teks: "Namun kerja sama membuat\nsemua rintangan terlewati." },
      { mulai: 100, selesai: 135, teks: "Humor khas animasi era bisu\nmewarnai sepanjang cerita." },
      { mulai: 135, selesai: 170, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
    4: [
      { mulai: 0, selesai: 8, teks: "Prajurit Laut Suci (1944)\nFilm animasi panjang pertama Jepang" },
      { mulai: 8, selesai: 24, teks: "Catatan: film ini dibuat pada masa perang\ndan mengandung muatan propaganda." },
      { mulai: 24, selesai: 40, teks: "Ditayangkan di sini\nsebagai dokumen sejarah animasi." },
      { mulai: 40, selesai: 70, teks: "Sekelompok hewan kembali\nke kampung halamannya." },
      { mulai: 70, selesai: 110, teks: "Mereka disambut hangat\noleh keluarga masing-masing." },
      { mulai: 110, selesai: 160, teks: "Pelatihan demi pelatihan\nmereka jalani bersama." },
      { mulai: 160, selesai: 220, teks: "Teknik animasinya sangat maju\nuntuk ukuran zamannya." },
      { mulai: 220, selesai: 300, teks: "Durasi 74 menit menjadikannya\ntonggak penting sejarah anime." },
      { mulai: 300, selesai: 400, teks: "Karya ini memengaruhi banyak\nanimator Jepang generasi berikutnya." },
      { mulai: 400, selesai: 500, teks: "Tontonlah dengan kesadaran\nakan konteks sejarahnya." },
    ],
  },
  "dongeng-hewan-jepang": {
    1: [
      { mulai: 0, selesai: 6, teks: "Si Kucing Hitam (1931)\nAnimasi musikal Jepang" },
      { mulai: 6, selesai: 20, teks: "Sekelompok anak kucing hitam\nberkumpul di malam hari." },
      { mulai: 20, selesai: 40, teks: "Musik mulai mengalun." },
      { mulai: 40, selesai: 62, teks: "Satu per satu\nmereka ikut menari." },
      { mulai: 62, selesai: 88, teks: "Gerakannya mengikuti\nirama lagu." },
      { mulai: 88, selesai: 115, teks: "Salah satu animasi bersuara\npaling awal dari Jepang." },
      { mulai: 115, selesai: 145, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
    2: [
      { mulai: 0, selesai: 6, teks: "Kelelawar (1931)\nFabel klasik" },
      { mulai: 6, selesai: 22, teks: "Seekor kelelawar bingung\nmenentukan jati dirinya." },
      { mulai: 22, selesai: 44, teks: "Ia punya sayap,\nseperti burung." },
      { mulai: 44, selesai: 66, teks: "Tapi juga berbulu,\nseperti hewan menyusui." },
      { mulai: 66, selesai: 92, teks: "Ketika kawanan burung menang,\nia mengaku burung." },
      { mulai: 92, selesai: 118, teks: "Ketika kawanan hewan menang,\nia berganti pengakuan." },
      { mulai: 118, selesai: 145, teks: "Akhirnya kedua pihak\nmenolak menerimanya." },
      { mulai: 145, selesai: 175, teks: "Siapa yang tak punya pendirian,\nakan kehilangan semuanya." },
      { mulai: 175, selesai: 205, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
    3: [
      { mulai: 0, selesai: 6, teks: "Rumah Baru Si Burung (1933)" },
      { mulai: 6, selesai: 22, teks: "Keluarga burung memutuskan\nuntuk pindah rumah." },
      { mulai: 22, selesai: 45, teks: "Barang-barang dikemas\nsatu per satu." },
      { mulai: 45, selesai: 70, teks: "Perjalanan ternyata\ntak semulus bayangan." },
      { mulai: 70, selesai: 100, teks: "Berbagai kerepotan\nmuncul di tengah jalan." },
      { mulai: 100, selesai: 135, teks: "Kerepotan yang akrab bagi siapa pun\nyang pernah pindah rumah." },
      { mulai: 135, selesai: 170, teks: "Akhirnya mereka tiba\ndi rumah barunya." },
      { mulai: 170, selesai: 200, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
  },
  "sinema-animasi-terbuka": {
    1: [
      { mulai: 0, selesai: 8, teks: "Spring (2019)\n© Blender Foundation — CC BY" },
      { mulai: 8, selesai: 25, teks: "Seorang gembala muda menjaga\nternaknya di pegunungan." },
      { mulai: 25, selesai: 50, teks: "Anjing setianya\nselalu menemani." },
      { mulai: 50, selesai: 85, teks: "Musim dingin mulai\nmelepaskan cengkeramannya." },
      { mulai: 85, selesai: 130, teks: "Ia menuruni lembah,\nmenjalankan tugas turun-temurun." },
      { mulai: 130, selesai: 190, teks: "Roh-roh purba\nmengawasi perjalanannya." },
      { mulai: 190, selesai: 260, teks: "Pergantian musim\nharus tetap berjalan." },
      { mulai: 260, selesai: 340, teks: "Film ini hampir tanpa dialog —\nceritanya disampaikan lewat gambar." },
      { mulai: 340, selesai: 420, teks: "Karya terbuka Blender Foundation,\nbebas ditonton dan dibagikan." },
      { mulai: 420, selesai: 480, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
    2: [
      { mulai: 0, selesai: 8, teks: "Big Buck Bunny (2008)\n© Blender Foundation — CC BY" },
      { mulai: 8, selesai: 30, teks: "Pagi yang cerah\ndi tengah hutan." },
      { mulai: 30, selesai: 60, teks: "Seekor kelinci besar\nkeluar dari liangnya." },
      { mulai: 60, selesai: 100, teks: "Ia menikmati pagi\ndengan hati gembira." },
      { mulai: 100, selesai: 150, teks: "Namun tiga hewan pengganggu\nmulai beraksi." },
      { mulai: 150, selesai: 210, teks: "Mereka mengusili\nsiapa pun yang lewat." },
      { mulai: 210, selesai: 280, teks: "Kesabaran si kelinci\nakhirnya habis." },
      { mulai: 280, selesai: 360, teks: "Ia menyusun rencana\nbalasan yang cerdik." },
      { mulai: 360, selesai: 450, teks: "Satu per satu jebakan\nmulai bekerja." },
      { mulai: 450, selesai: 540, teks: "Komedi slapstick\nyang hangat dan penuh warna." },
      { mulai: 540, selesai: 596, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
    3: [
      { mulai: 0, selesai: 8, teks: "Elephants Dream (2006)\n© Blender Foundation — CC BY" },
      { mulai: 8, selesai: 30, teks: "Film animasi sumber terbuka\npertama di dunia." },
      { mulai: 30, selesai: 70, teks: "Dua tokoh menyusuri\nsebuah mesin raksasa." },
      { mulai: 70, selesai: 120, teks: "Yang lebih tua\nseolah tahu segalanya." },
      { mulai: 120, selesai: 180, teks: "Yang lebih muda\nmulai meragukannya." },
      { mulai: 180, selesai: 250, teks: "Mesin itu terus\nberubah bentuk." },
      { mulai: 250, selesai: 330, teks: "Apa yang nyata\ndan apa yang hanya bayangan?" },
      { mulai: 330, selesai: 420, teks: "Sebuah karya surealis\nyang membuka banyak tafsir." },
      { mulai: 420, selesai: 500, teks: "Dirilis terbuka agar siapa pun\nbisa mempelajarinya." },
      { mulai: 500, selesai: 580, teks: "Tamat.\nanimeil.al — teks bahasa Indonesia" },
    ],
  },
};

/** Ambil subtitel kurasi untuk satu episode, bila tersedia. */
export function subtitelKurasi(slug: string, nomor: number): string | null {
  const baris = SUBTITEL_KURASI[slug]?.[nomor];
  if (!baris || baris.length === 0) return null;
  return buatVTT(baris.map((b) => ({ ...b, teks: b.teks })));
}
