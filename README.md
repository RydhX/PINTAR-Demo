# PINTAR - Peta Interaktif Area & Tenant PT INTI

PINTAR adalah WebGIS ringan untuk melihat dan mengelola informasi tenant di kawasan PT INTI. Pengguna menelusuri peta secara bertahap, dari site plan Area 77 sampai denah lantai, lalu mengeklik ruang untuk melihat data tenantnya.

**Demo:** https://rydhx.github.io/pintar-demo/

> **Catatan:** seluruh data tenant pada demo ini adalah **data contoh**. Nama perusahaan, nilai sewa, status pembayaran, dan kontak PIC bukan data sebenarnya.

## Alur penggunaan

```
Area 77  ->  pilih gedung  ->  pilih lantai  ->  denah lantai  ->  pilih ruang
```

1. **Area 77**: site plan kawasan. Klik gedung yang aktif.
2. **Pilih lantai**: daftar lantai gedung tersebut.
3. **Denah lantai**: ruang diberi warna sesuai status dan label nama tenant.
4. **Detail ruang**: klik ruang di peta atau di daftar unit untuk membuka panel detail.

Tombol **Kembali** mundur satu tingkat, dan tombol **Esc** menutup panel detail.

## Fitur

- Navigasi bertingkat: area, gedung, lantai, ruang.
- Pewarnaan ruang berdasarkan status:
  - Biru: kosong
  - Hijau: terisi dan pembayaran lancar
  - Merah: tunggakan pembayaran
- Label nama tenant otomatis di tengah tiap ruang.
- Ringkasan unit (total, kosong, terisi, tunggakan, kontrak berakhir dalam 90 hari) yang sekaligus berfungsi sebagai legenda.
- Daftar unit di sidebar yang tersinkron dengan klik pada peta.
- Pencarian unit atau tenant, dan filter status.
- Panel detail: tenant, status, pembayaran, luas, masa sewa, sisa kontrak, sewa per bulan, PIC, dan kontak.
- Tampilan responsif untuk layar kecil.

## Teknologi

HTML, CSS, dan JavaScript murni. Tidak ada framework, proses build, atau library tambahan. Peta berupa file SVG (diekspor dari CorelDRAW) yang dimuat langsung ke halaman, sehingga setiap poligon dapat diberi gaya dan interaksi lewat CSS dan JavaScript.

## Struktur proyek

```
PINTAR/
├── index.html      Kerangka halaman
├── style.css       Seluruh tampilan
├── data.js         Satu-satunya sumber data (gedung, lantai, ruang)
├── app.js          Logika aplikasi
└── assets/
    ├── Area77_DraftTata.svg      Site plan Area 77
    └── GKP_LT_2_DraftTata.svg    Denah Gedung Kantor Pusat, Lantai 2
```

## Cara menjalankan di komputer

Aplikasi memuat file SVG dengan `fetch()`, sehingga **tidak bisa dibuka langsung dengan klik dua kali** pada `index.html`. Gunakan server lokal:

1. Buka folder proyek di VS Code.
2. Pasang ekstensi **Live Server**.
3. Klik kanan `index.html`, lalu pilih **Open with Live Server**.

## Cara kerja

Aplikasi memakai satu objek `state` dan satu fungsi `render()`. Setiap klik hanya mengubah `state`, lalu `render()` menggambar tampilan yang sesuai. Data ruang dan geometri digabung lewat **ID elemen di SVG**, sama seperti menggabungkan tabel atribut dengan layer melalui kolom kunci.

## Mengelola data

Semua data berada di `data.js`.

### Struktur

```js
DATA = {
  buildings: [{
    id: "GKP",
    name: "Gedung Kantor Pusat",
    active: true,
    polygonId: "GD_GKP",          // ID polygon gedung di SVG Area 77
    floors: [{
      id: "L2",
      name: "Lantai 2",
      svg: "assets/GKP_LT_2_DraftTata.svg",
      rooms: { /* data ruang */ }
    }]
  }]
}
```

### Data ruang

Kunci tiap ruang harus sama persis dengan ID polygon ruang di SVG.

```js
L2_R02: {
  tenant: "PT Contoh Satu",
  status: "occupied",       // "occupied" atau "vacant"
  payment: "Lunas",         // "Lunas" atau "Belum bayar"
  area: 120,                // m2, angka saja
  start: "2024-01-01",      // TAHUN-BULAN-TANGGAL
  end: "2026-12-31",
  rent: 15000000,           // rupiah per bulan, angka saja
  pic: "Nama PIC",
  contact: "08123456789"
}
```

Ruang kosong cukup ditulis `{ status: "vacant" }`. Field yang tidak diisi akan tampil sebagai `-`.

### Menambah lantai

1. Siapkan SVG denah lantai dengan ID ruang yang unik.
2. Tambahkan satu objek di `floors` pada `data.js`.
3. Isi `rooms` dengan ID yang sama seperti di SVG.

Tidak ada kode di `app.js` yang perlu diubah.

### Menambah gedung

Tambahkan satu objek di `buildings`, dengan `polygonId` yang sesuai dengan ID gedung pada SVG Area 77. Gedung dengan `active: false` tampil pudar dan belum bisa dibuka.

## Aturan ID pada SVG

- ID harus unik di dalam satu file SVG.
- ID ruang pada denah lantai harus sama dengan kunci di `rooms`.
- Elemen non-tenant seperti koridor, lift, tangga, dan toilet boleh punya ID sendiri dan diatur lewat CSS.
- Jika file SVG diekspor ulang dari CorelDRAW, pastikan ID tidak berubah.

## Catatan teknis

- **Encoding SVG:** CorelDRAW dapat menyimpan SVG dalam UTF-16. Aplikasi mendeteksi encoding dari BOM file, sehingga UTF-8 maupun UTF-16 terbaca.
- **Nama file peka huruf besar kecil** pada GitHub Pages. Pastikan nama file di `data.js` sama persis dengan nama file di folder `assets`.
- **Peringatan di console:** `Ruang tidak ada di SVG` atau `Polygon gedung tidak ditemukan` berarti ID di `data.js` belum cocok dengan SVG.

## Rencana pengembangan

- [x] Navigasi area, gedung, lantai, ruang
- [x] Detail ruang, label, daftar unit, ringkasan
- [x] Pencarian dan filter status
- [ ] Data ruang lengkap untuk semua tenant
- [ ] Zoom dan geser peta
- [ ] Penanda fasilitas (lift, toilet, tangga)
- [ ] Lantai dan gedung lain
- [ ] Sumber data eksternal (CSV atau spreadsheet)
- [ ] Rute antar ruang

## Pengelola

Dikelola oleh Bagian Umum & K3LH, PT INTI.
