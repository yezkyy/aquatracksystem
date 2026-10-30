# Database AquaTrack

Database utama menggunakan **MySQL**.

## Entitas MVP

Entitas inti:

```text
users
projects
activities
activity_records
expenses
harvests
```

Sistem authentication dan permission dapat menambahkan tabel bawaan Laravel/Spatie.

## users

Menyimpan pengguna aplikasi.

Kolom utama:

- id
- name
- email
- password
- avatar
- timestamps

## projects

Mewakili satu siklus budidaya.

Kolom utama:

- id
- name
- commodity
- location
- start_date
- target_harvest_date
- person_in_charge_id
- status
- notes
- timestamps

Status:

- planning
- active
- completed
- archived

Relasi:

```text
Project belongsTo User
Project hasMany Activities
Project hasMany Expenses
Project hasMany Harvests
```

## activities

Menyimpan metadata aktivitas.

Kolom utama:

- id
- project_id
- user_id
- type
- activity_date
- title
- notes
- timestamps

Jenis aktivitas:

- feeding
- water_quality
- sampling
- mortality
- other

Relasi:

```text
Activity belongsTo Project
Activity belongsTo User
Activity hasOne ActivityRecord
```

## activity_records

Menyimpan data spesifik berdasarkan jenis aktivitas.

Kolom utama:

- id
- activity_id
- data
- timestamps

`data` dapat berupa JSON untuk data yang sifatnya spesifik per jenis aktivitas.

Contoh kualitas air:

```json
{
  "ph": 7.8,
  "temperature": 29.4,
  "do": 5.2,
  "salinity": 15
}
```

Contoh pemberian pakan:

```json
{
  "feed_type": "Starter A",
  "quantity": 25,
  "unit": "kg"
}
```

Catatan penting:

JSON hanya digunakan untuk data aktivitas yang memang memiliki struktur berbeda. Jangan gunakan JSON sebagai pengganti seluruh database relasional.

## expenses

Menyimpan pengeluaran proyek.

Kolom utama:

- id
- project_id
- user_id
- title
- category
- amount
- expense_date
- notes
- timestamps

Kategori:

- seed
- feed
- medicine
- operation
- labor
- other

## harvests

Menyimpan hasil panen.

Kolom utama:

- id
- project_id
- user_id
- harvest_date
- quantity
- price_per_kg
- revenue
- notes
- timestamps

Revenue dapat dihitung dari:

```text
quantity × price_per_kg
```

Sebaiknya nilai revenue tetap disimpan jika dibutuhkan sebagai snapshot transaksi, dengan validasi agar konsisten dengan data sumber.

## Relasi Utama

```text
User
 ├── Projects
 └── Activities

Project
 ├── Activities
 │    └── ActivityRecord
 ├── Expenses
 └── Harvests
```

## KPI yang Dapat Dihasilkan

Dari data aktivitas dan transaksi, dashboard dapat menghitung:

- Progress siklus
- Biomassa
- Bobot rata-rata
- Tingkat kelangsungan hidup
- FCR
- Total biaya
- Pendapatan
- Keuntungan

KPI yang belum memiliki data cukup jangan dibuat seolah-olah tersedia.

## Prinsip Database

- Gunakan foreign key.
- Gunakan index untuk foreign key dan kolom filter.
- Gunakan decimal untuk nilai berat, harga, dan parameter numerik yang membutuhkan presisi.
- Gunakan date/datetime sesuai kebutuhan.
- Hindari soft delete kecuali memang dibutuhkan.
- Jangan membuat tabel hanya untuk memenuhi pola CRUD jika belum ada kebutuhan domain.
