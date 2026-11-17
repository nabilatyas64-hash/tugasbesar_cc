# Pendekin – URL Shortener + Statistik Klik

Startup fiktif tautan pendek untuk pelaku UMKM. Proyek Tugas Besar 1 Komputasi Awan (K01).

## Anggota
| Nama | Peran |
|---|---|
| (isi) | Tech Lead / Backend |
| (isi) | DevOps Engineer |
| (isi) | Container Engineer |
| (isi) | QA Engineer & Tech Writer |

## Stack
Node.js 20, Express 4, MySQL 8 (Knex), Redis (cache redirect), Jest + Supertest.

## Endpoint
| Method | Path | Keterangan |
|---|---|---|
| GET | `/` | Halaman web (tempel link, klik, dapat link pendek) |
| POST | `/api/guest` | Buat akun tamu otomatis, mengembalikan `api_key` |
| GET | `/health` | 200 + status DB/Redis (503 jika DB mati) |
| POST | `/api/links` | body: `url`, `alias?`, `expires_at?` |
| GET | `/api/links` | daftar link milik user |
| GET | `/api/links/:code/stats` | klik per hari |
| PATCH | `/api/links/:code/deactivate` | nonaktifkan link |
| GET | `/:code` | 302 redirect / 404 / 410 |

Halaman web membuat akun tamu otomatis dan menyimpan kuncinya di browser. Endpoint `/api/links` memakai header `X-API-Key` (seeder: `demo-key-budi`, `demo-key-siti`).

## Aturan bisnis
1. Alias unik, hanya huruf/angka/tanda hubung (3-30 karakter).
2. URL tujuan wajib http/https.
3. Link nonaktif atau kedaluwarsa -> 410, bukan redirect.

## Menjalankan test (tanpa DB/Redis)
```bash
npm ci
npm test
```

## Menjalankan lokal
```bash
cp .env.example .env      # isi nilai, DB_HOST/REDIS_HOST=localhost jika tanpa Docker
npm run migrate
npm run seed
npm start
```
Contoh: `curl -i http://localhost:8000/demo01` -> 302.

## Alur kerja Git
Branch `feature/<nama>` -> Pull Request -> merge ke `main` (tidak ada push langsung).
