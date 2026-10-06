export function waktuRelatif(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const detik = Math.floor((Date.now() - d.getTime()) / 1000);
  if (detik < 60) return "baru saja";
  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  const bulan = Math.floor(hari / 30);
  if (bulan < 12) return `${bulan} bulan lalu`;
  return `${Math.floor(bulan / 12)} tahun lalu`;
}

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function tanggalIndo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const jam = String(d.getHours()).padStart(2, "0");
  const menit = String(d.getMinutes()).padStart(2, "0");
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()} • ${jam}:${menit} WIB`;
}

export function hitungMundur(target: Date | string): string {
  const d = typeof target === "string" ? new Date(target) : target;
  let sisa = Math.floor((d.getTime() - Date.now()) / 1000);
  if (sisa <= 0) return "Sudah rilis";
  const hari = Math.floor(sisa / 86400);
  sisa -= hari * 86400;
  const jam = Math.floor(sisa / 3600);
  sisa -= jam * 3600;
  const menit = Math.floor(sisa / 60);
  const detik = sisa - menit * 60;
  if (hari > 0) return `${hari} hari ${jam} jam ${menit} menit`;
  if (jam > 0) return `${jam} jam ${menit} menit ${detik} detik`;
  return `${menit} menit ${detik} detik`;
}
