# AquaTrack — UI/UX Guidelines

## Arah Visual

AquaTrack menggunakan visual:

- Modern SaaS
- Clean enterprise
- Bento dashboard
- Card modular
- Rounded corner
- Whitespace
- KPI besar
- Data visualization sederhana
- Subtle aquatic identity

Referensi visual boleh terinspirasi dari dashboard SaaS modern, tetapi hasil akhir harus original.

AquaTrack bukan:

- Website marketing
- Admin template generik
- Aplikasi edukasi perikanan
- Aplikasi bertema ikan secara literal
- Dashboard dengan terlalu banyak warna

## Warna

```text
Aqua          #0EA5A8
Aqua Dark     #087F83
Aqua Light    #E6F7F7

Background    #F7F8F8
Surface       #FFFFFF
Foreground    #172022
Muted         #667276
Border        #E4E8E8

Dark Surface  #171A1B

Success       #16A34A
Warning       #F59E0B
Danger        #DC2626
Info          #3B82F6
```

Aqua adalah aksen utama. Sebagian besar interface tetap netral.

## Typography

Font:

**Inter**

Gunakan hierarchy yang jelas:

- Judul halaman: 28–32px
- Judul section: 18–20px
- Judul card: 14–16px
- Body: 14px
- Secondary: 13–14px
- KPI: 28–36px
- Tabel: 13–14px

## Layout

Desktop:

- Sidebar 240–260px
- Header sederhana
- Konten dengan max-width yang nyaman
- Dashboard menggunakan bento grid

Tablet:

- Sidebar dapat diciutkan
- Grid menjadi dua kolom

Mobile:

- Sidebar drawer atau navigasi bawah
- Card satu kolom
- Form satu kolom
- Tabel dapat digeser horizontal
- Tombol utama mudah dijangkau

## Sidebar

### Ruang Kerja

- Ringkasan
- Proyek
- Aktivitas

### Analisis

- Laporan

### Sistem

- Pengaturan

Bagian bawah:

- Profil
- Peran
- Keluar

Gunakan Lucide Icons.

## Form Design System

Seluruh form harus memiliki visual yang konsisten.

Jangan menggunakan form polos seperti HTML CRUD default.

Gunakan:

- Card dengan radius 18–24px
- Padding lega
- Section grouping
- Label yang jelas
- Helper text bila diperlukan
- Border #E4E8E8
- Focus Aqua #0EA5A8
- Input radius 10–12px
- Height sekitar 42–46px
- Shadow sangat subtle

Form sebaiknya memiliki struktur:

```text
Judul
Deskripsi

[ Informasi Utama ]
Field
Field

[ Data Operasional ]
Field
Field

[ Catatan ]
Textarea

[Batal] [Simpan]
```

Jangan membuat setiap section menjadi card terpisah secara berlebihan.

### Unit

Data seperti:

- kg
- gram
- mg/L
- °C
- ppt
- %

harus memiliki suffix yang terintegrasi dengan input.

### Select

Gunakan select modern dengan:

- Chevron
- Hover state
- Selected state
- Dropdown yang rapi

### Validasi

Error ditampilkan dekat field.

Contoh:

> Nilai pH berada di luar rentang yang valid.

### Action

Primary:

> Simpan

Secondary:

> Batal

## Halaman Login

Tidak ada landing page.

Flow:

```text
/login
  ↓
/dashboard
```

Gunakan:

- Logo AquaTrack
- Nama AquaTrack
- Manajemen Budidaya Perikanan
- Alamat email
- Kata sandi
- Ingat saya
- Lupa kata sandi?
- Masuk

Background boleh menggunakan pola atau gradient aqua yang sangat halus.

## Ringkasan

Dashboard menampilkan:

- Proyek aktif
- Total biomassa
- Tingkat kelangsungan hidup
- Total biaya
- Perkembangan produksi
- Kualitas air
- Proyek aktif
- Aktivitas terbaru
- Ringkasan keuangan
- Perlu perhatian

## Detail Proyek

Tab:

- Ringkasan
- Aktivitas
- Produksi
- Keuangan

KPI:

- Progress
- Biomassa
- Bobot rata-rata
- Tingkat kelangsungan hidup
- FCR

## Bahasa

Seluruh teks yang terlihat oleh pengguna harus menggunakan **Bahasa Indonesia**.

Gunakan istilah seperti:

- Ringkasan
- Proyek
- Aktivitas
- Laporan
- Pengaturan
- Masuk
- Keluar
- Buat
- Ubah
- Hapus
- Simpan
- Batal
- Aktif
- Selesai
- Perencanaan
- Diarsipkan

Gunakan format Indonesia untuk data:

- Rp57.200.000
- 3,8 ton
- 18,5 gram
- 87%

## Prinsip UX

1. Kejelasan
2. Kecepatan
3. Mudah dipindai
4. Konsisten
5. Beban kognitif rendah
6. Profesional
7. Mobile-friendly

Operator lapangan harus dapat mencatat aktivitas dengan langkah seminimal mungkin.

## Komponen

Gunakan:

- shadcn/ui
- Radix UI
- Lucide Icons
- Recharts
- Motion

Jangan menggunakan komponen yang terlalu kompleks jika tidak dibutuhkan.

## Prinsip Implementasi UI

- Komponen reusable.
- Hindari duplikasi.
- Gunakan design token.
- Jangan hardcode warna di setiap komponen.
- Jangan menggunakan shadow berat.
- Jangan menggunakan gradient berlebihan.
- Jangan menggunakan glassmorphism.
- Jangan mencampur icon library.
