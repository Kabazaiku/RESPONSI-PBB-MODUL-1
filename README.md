# 📚 API Peminjaman Buku Perpustakaan

REST API untuk mengelola data peminjaman buku oleh anggota perpustakaan, dibangun dengan **Node.js**, **Express.js**, dan **Supabase** (PostgreSQL), lalu di-deploy ke **Vercel**.

## Deskripsi & Tujuan

Proyek ini bertujuan menyediakan backend sederhana untuk mencatat peminjaman buku: siapa yang meminjam, buku apa, kapan jatuh tempo, dan apa statusnya. Fitur utama:

- Operasi **CRUD** pada data peminjaman (`/loans`)
- **Filter query**, contoh `GET /loans?status=Terlambat`
- Status **Terlambat** diperbarui otomatis jika `due_date` sudah lewat dan buku belum dikembalikan
- Hasil `GET` menyertakan nama anggota dan judul buku (relasi)

**Link deployment:** https://GANTI-DENGAN-LINK-VERCEL-KAMU.vercel.app

## Struktur Data (Schema)

Relasi: `members` 1—N `loans` N—1 `books`

**members**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint (PK) | Auto increment |
| name | text | Nama anggota |
| email | text (unique) | Email anggota |
| created_at | timestamptz | Waktu dibuat |

**books**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint (PK) | Auto increment |
| title | text | Judul buku |
| author | text | Penulis |
| created_at | timestamptz | Waktu dibuat |

**loans**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint (PK) | Auto increment |
| member_id | bigint (FK → members.id) | Peminjam |
| book_id | bigint (FK → books.id) | Buku yang dipinjam |
| loan_date | date | Tanggal pinjam (default hari ini) |
| due_date | date | Batas pengembalian |
| return_date | date / null | Tanggal dikembalikan |
| status | text | `Dipinjam`, `Dikembalikan`, atau `Terlambat` |
| created_at | timestamptz | Waktu dibuat |

SQL lengkap ada di [`sql/schema.sql`](sql/schema.sql).

## Struktur Folder

```
.
├── api/
│   └── index.js              # entry point untuk Vercel
├── sql/
│   └── schema.sql            # skrip pembuatan tabel + data contoh
├── src/
│   ├── config/
│   │   └── supabase.js       # inisialisasi client Supabase
│   ├── models/
│   │   └── loanModel.js      # query ke tabel loans
│   ├── controllers/
│   │   └── loanController.js # validasi input & response HTTP
│   ├── routes/
│   │   └── loanRoutes.js     # definisi endpoint /loans
│   └── index.js              # setup Express & menjalankan server
├── .env.example
├── package.json
└── vercel.json
```

## Endpoint

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/loans` | Daftar peminjaman (mendukung filter) |
| GET | `/loans/:id` | Detail satu peminjaman |
| POST | `/loans` | Tambah peminjaman |
| PUT | `/loans/:id` | Ubah peminjaman |
| DELETE | `/loans/:id` | Hapus peminjaman |

**Filter query pada `GET /loans`:** `status` (`Dipinjam` / `Dikembalikan` / `Terlambat`), `member_id`, `book_id`. Filter bisa digabung, contoh `/loans?status=Terlambat&member_id=1`.

## Contoh Request & Response

### GET /loans?status=Terlambat

```bash
curl "https://GANTI-DENGAN-LINK-VERCEL-KAMU.vercel.app/loans?status=Terlambat"
```

```json
{
  "count": 1,
  "data": [
    {
      "id": 1,
      "member_id": 1,
      "book_id": 1,
      "loan_date": "2026-09-25",
      "due_date": "2026-10-02",
      "return_date": null,
      "status": "Terlambat",
      "members": { "name": "Ani Lestari", "email": "ani@example.com" },
      "books": { "title": "Laskar Pelangi", "author": "Andrea Hirata" }
    }
  ]
}
```

### GET /loans/1

```json
{
  "data": {
    "id": 1,
    "status": "Terlambat",
    "members": { "name": "Ani Lestari", "email": "ani@example.com" },
    "books": { "title": "Laskar Pelangi", "author": "Andrea Hirata" }
  }
}
```

### POST /loans

```bash
curl -X POST https://GANTI-DENGAN-LINK-VERCEL-KAMU.vercel.app/loans \
  -H "Content-Type: application/json" \
  -d '{"member_id": 2, "book_id": 3, "due_date": "2026-10-20"}'
```

Response `201 Created`:

```json
{
  "message": "Peminjaman berhasil dibuat",
  "data": {
    "id": 3,
    "member_id": 2,
    "book_id": 3,
    "loan_date": "2026-10-09",
    "due_date": "2026-10-20",
    "return_date": null,
    "status": "Dipinjam"
  }
}
```

### PUT /loans/3 (pengembalian buku)

```bash
curl -X PUT https://GANTI-DENGAN-LINK-VERCEL-KAMU.vercel.app/loans/3 \
  -H "Content-Type: application/json" \
  -d '{"status": "Dikembalikan"}'
```

```json
{
  "message": "Peminjaman berhasil diperbarui",
  "data": { "id": 3, "status": "Dikembalikan", "return_date": "2026-10-09" }
}
```

### DELETE /loans/3

```json
{ "message": "Peminjaman berhasil dihapus" }
```

### Contoh Error

`400 Bad Request`
```json
{ "error": "member_id, book_id, dan due_date wajib diisi" }
```

`404 Not Found`
```json
{ "error": "Data peminjaman tidak ditemukan" }
```

## Instalasi & Menjalankan Lokal

**Prasyarat:** Node.js 18+, akun [Supabase](https://supabase.com).

1. Clone repository
   ```bash
   git clone https://github.com/USERNAME/NAMA-REPO.git
   cd NAMA-REPO
   ```
2. Install dependency
   ```bash
   npm install
   ```
3. Buat project di Supabase, lalu buka **SQL Editor** dan jalankan isi `sql/schema.sql`.
4. Salin `.env.example` menjadi `.env`, lalu isi:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_KEY=service_role_key_kamu
   ```
   Keduanya ada di **Project Settings → API**. Jangan pernah meng-commit `.env`.
5. Jalankan server
   ```bash
   npm run dev
   ```
   API tersedia di `http://localhost:3000`.

## Deployment ke Vercel

1. Push repository ke GitHub.
2. Di [vercel.com](https://vercel.com), pilih **Add New → Project** dan import repository.
3. Pada **Environment Variables**, tambahkan `SUPABASE_URL` dan `SUPABASE_KEY`.
4. Klik **Deploy**, lalu salin URL hasilnya ke bagian atas README ini.

## Teknologi

Node.js · Express.js · Supabase (PostgreSQL) · Vercel
