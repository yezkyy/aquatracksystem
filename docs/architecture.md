# Arsitektur AquaTrack

## Pendekatan

AquaTrack menggunakan pendekatan **Laravel Monolith + Inertia.js + React**.

Frontend tidak dibuat sebagai aplikasi React terpisah dan tidak menggunakan REST API sebagai jalur utama untuk halaman internal.

```text
Browser
   ↓
Laravel Route
   ↓
Controller
   ↓
Service / Business Logic
   ↓
Model / MySQL
   ↓
Inertia Response
   ↓
React Page
```

Pendekatan ini dipilih agar MVP tetap sederhana dan mudah dipelihara.

Jika pada masa depan diperlukan aplikasi mobile native atau public API, API layer dapat ditambahkan tanpa harus mengubah seluruh struktur aplikasi.

## Authentication

Gunakan Laravel Fortify untuk:

- Login
- Logout
- Session authentication
- Lupa kata sandi
- Reset kata sandi
- Verifikasi email jika diperlukan

UI authentication dibuat sendiri menggunakan React.

Breeze tidak digunakan.

## Authorization

Gunakan Spatie Laravel Permission untuk role dan permission.

Role awal dapat berupa:

- Administrator
- Pengelola
- Operator

Namun role tidak perlu dibuat terlalu kompleks sebelum kebutuhan pengguna nyata diketahui.

## Struktur Frontend

```text
resources/js/
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── projects/
│   ├── activities/
│   └── financial/
├── layouts/
│   ├── AppLayout.tsx
│   └── AuthLayout.tsx
├── pages/
│   ├── Auth/
│   │   └── Login.tsx
│   ├── Dashboard/
│   │   └── Index.tsx
│   ├── Projects/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   └── Show.tsx
│   ├── Activities/
│   │   ├── Index.tsx
│   │   └── Create.tsx
│   ├── Financial/
│   │   └── Index.tsx
│   ├── Reports/
│   │   └── Index.tsx
│   └── Settings/
│       └── Index.tsx
├── hooks/
├── lib/
├── types/
└── app.tsx
```

## Struktur Backend

```text
app/
├── Http/
│   ├── Controllers/
│   └── Requests/
├── Models/
├── Services/
└── Policies/
```

Business logic yang mulai kompleks sebaiknya ditempatkan pada Service, bukan ditumpuk di Controller.

## Prinsip Data

Gunakan database relasional untuk data yang:

- Sering dicari
- Sering difilter
- Digunakan untuk perhitungan
- Menjadi KPI
- Memiliki relasi penting

Data aktivitas yang bentuknya berbeda dapat menggunakan pendekatan fleksibel, tetapi jangan menyimpan seluruh domain aplikasi sebagai JSON.

Data KPI seperti biomass, average weight, mortality, biaya, dan revenue harus tetap dapat dihitung secara terstruktur.

## Routing Utama

```text
/login
/dashboard

/projects
/projects/create
/projects/{project}

/activities
/activities/create

/financial
/reports
/settings
```

Nama route internal boleh menggunakan Bahasa Inggris mengikuti konvensi kode, tetapi seluruh teks yang terlihat pengguna harus Bahasa Indonesia.

## Prinsip Arsitektur

- Hindari over-engineering.
- Controller tetap tipis.
- Validasi menggunakan Form Request.
- Business logic penting menggunakan Service.
- Authorization menggunakan Policy/Permission.
- Komponen React dibuat reusable.
- UI tidak bergantung pada halaman tertentu jika komponen bersifat umum.
- Jangan membuat API layer hanya untuk kebutuhan yang sudah dapat ditangani Inertia.
