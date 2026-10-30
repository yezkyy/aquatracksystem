# AquaTrack — Dokumentasi Proyek

AquaTrack adalah aplikasi **Manajemen Budidaya Perikanan** berbasis web untuk membantu pengelola budidaya mencatat dan memantau satu siklus produksi dari awal hingga panen.

## Tujuan

AquaTrack dibuat sebagai sistem operasional yang sederhana, cepat digunakan, dan berfokus pada informasi yang benar-benar dibutuhkan dalam aktivitas budidaya.

Prinsip utama:

> **Satu Proyek = Satu Siklus Budidaya**

Satu proyek menjadi pusat seluruh data operasional, meliputi aktivitas, monitoring, biaya, panen, dan performa.

## Alur Utama

```text
Masuk
  ↓
Ringkasan
  ↓
Pilih Proyek
  ↓
Catat Aktivitas
  ↓
Pantau Perkembangan
  ↓
Catat Biaya / Panen
  ↓
Lihat Laporan
```

Tidak terdapat landing page atau halaman marketing. Pengguna langsung masuk ke aplikasi melalui halaman masuk.

## Ruang Lingkup MVP

MVP terdiri dari:

1. Masuk
2. Ringkasan
3. Proyek
4. Aktivitas
5. Keuangan
6. Laporan
7. Pengaturan dasar

### Proyek

Satu proyek merepresentasikan satu siklus budidaya.

Informasi utama:

- Nama proyek
- Komoditas
- Lokasi
- Tanggal mulai
- Target panen
- Penanggung jawab
- Catatan
- Status

Status proyek:

- Perencanaan
- Aktif
- Selesai
- Diarsipkan

### Aktivitas

Semua pencatatan operasional berada dalam satu modul Aktivitas.

Jenis aktivitas MVP:

- Pemberian Pakan
- Kualitas Air
- Sampling
- Kematian
- Lainnya

### Keuangan

Keuangan sengaja dibuat sederhana.

Pengeluaran:

- Benih
- Pakan
- Obat
- Operasional
- Tenaga Kerja
- Lainnya

Panen:

- Tanggal
- Jumlah hasil
- Harga jual per kg
- Pendapatan
- Catatan

Keuntungan dihitung dari:

```text
Pendapatan - Total Biaya = Keuntungan
```

### Laporan

Laporan menampilkan ringkasan:

- Produksi
- Keuangan
- Aktivitas

## Batasan MVP

Jangan menambahkan fitur berikut pada MVP:

- Manajemen supplier
- Manajemen pelanggan
- Inventory kompleks
- IoT
- AI
- Deteksi penyakit
- Prediksi panen
- Akuntansi kompleks
- Chat
- Kalender kompleks
- Multi-tenant kompleks
- Integrasi WhatsApp
- Notifikasi eksternal

Fitur tersebut dapat dipertimbangkan setelah kebutuhan inti tervalidasi.

## Teknologi

Backend:

- Laravel
- MySQL
- Laravel Fortify
- Spatie Laravel Permission

Frontend:

- Inertia.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide React
- Recharts
- Motion

Testing dan kualitas:

- Pest
- Laravel Pint

## Bahasa

Seluruh teks yang terlihat oleh pengguna wajib menggunakan **Bahasa Indonesia**.

Nama produk tetap:

**AquaTrack**

Deskripsi:

**Manajemen Budidaya Perikanan**
