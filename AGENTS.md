<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Project NAIK — Development Rules

> Project name: **naik** (codename for **Summittact**)
> Purpose: Web app untuk merencanakan dan mengestimasi biaya perjalanan pendakian gunung di Pulau Jawa.
> Developer: Beginner — prioritaskan kesederhanaan dan keterbacaan kode di atas segalanya.

---

## Tech Stack

| Concern | Technology |
|---------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript — wajib, tidak ada file `.js` baru |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (gunakan hanya jika memang diperlukan) |
| Database | Supabase (PostgreSQL) via `@supabase/supabase-js` |
| Forms & Validation | React Hook Form + Zod |
| Maps | `@vis.gl/react-google-maps` (Places Autocomplete: frontend; Distance Matrix: backend API Route) |

---

## Aturan Wajib

### ✅ Yang Harus Dilakukan

1. **TypeScript selalu** — semua file baru harus `.ts` atau `.tsx`, dengan typing yang benar.
2. **App Router** — gunakan konvensi `app/` directory, bukan `pages/`.
3. **Mobile-first** — desain dimulai dari layar kecil, lalu diperbesar dengan breakpoint Tailwind.
4. **Komponen sederhana** — komponen harus mudah dibaca oleh developer pemula. Hindari abstraksi yang tidak perlu.
5. **Lint dan build setelah perubahan besar** — jalankan `npm run lint` dan `npm run build` untuk memastikan tidak ada error sebelum melaporkan selesai.
6. **Supabase via API Routes** — akses database hanya dari `app/api/` (server-side), tidak langsung dari komponen client-side.

### ❌ Yang Tidak Boleh Dilakukan

7. **Jangan gunakan Prisma** — gunakan `@supabase/supabase-js` secara langsung.
8. **Jangan gunakan Zustand** — gunakan React `useState` biasa. Jika ada kasus yang benar-benar membutuhkan global state, jelaskan dulu dan tunggu persetujuan.
9. **Jangan buat authentication/login** — V1 tidak memerlukan auth.
10. **Jangan buat fitur di luar task yang sedang dikerjakan** — fokus pada satu task per sesi.
11. **Jangan overengineering** — tidak perlu pattern kompleks (factory, repository, dll) untuk project ini.
12. **Jangan buat microservices** — semua kode ada dalam satu Next.js project.

### ⚠️ Yang Perlu Persetujuan Terlebih Dahulu

13. **Dependency baru** — sebelum menambahkan package apapun, jelaskan:
    - Nama dependency
    - Kegunaannya
    - Mengapa diperlukan
    - Apakah ada cara mengerjakannya tanpa dependency tersebut
14. **Perubahan database schema** — jangan ubah struktur tabel tanpa penjelasan dan persetujuan eksplisit.
15. **Perubahan arsitektur** — jangan ubah pola atau struktur folder tanpa menjelaskan alasannya terlebih dahulu.

### 🛑 Penanganan Error

16. **Jangan auto-fix error besar** — jika menemukan error yang membutuhkan perubahan signifikan, STOP, jelaskan penyebab dan pilihan solusi, tunggu persetujuan baru lanjut.

---

## Struktur Folder

```
naik/
├── app/
│   ├── layout.tsx          ← Root layout
│   ├── page.tsx            ← Halaman beranda (/)
│   ├── mountains/          ← Daftar & detail gunung
│   ├── planner/            ← Kalkulator budget utama
│   └── api/                ← API Routes (backend logic)
│       ├── mountains/
│       ├── distance/       ← Panggil Google Distance Matrix
│       └── calculate/      ← Logika kalkulasi budget
├── components/             ← Komponen UI reusable
│   └── ui/                 ← shadcn/ui components (auto-generated)
├── lib/
│   ├── supabase.ts         ← Supabase client
│   └── calculations.ts     ← Fungsi hitung BBM, tol, dll
├── types/
│   └── index.ts            ← TypeScript types & interfaces
└── public/                 ← Aset statis
```

---

## Fokus V1

Fitur yang boleh dibangun di V1 (tidak lebih, tidak kurang):

- [x] Database gunung dan basecamp di Pulau Jawa
- [x] Kalkulasi jarak perjalanan (via Google Distance Matrix)
- [x] Estimasi biaya BBM (jarak × konsumsi × harga BBM)
- [x] Estimasi biaya tol (data manual)
- [x] Biaya gunung (tiket masuk + parkir)
- [x] Total estimasi budget trip
- [x] Pembagian biaya per anggota grup (split bill)
- [ ] Settlement (siapa harus bayar ke siapa) — boleh masuk V1 jika sederhana
- [ ] Share trip — boleh masuk V1 **hanya jika implementasinya tetap sederhana** (misal: share URL stateless)

**Di luar daftar ini = V2 atau di luar scope.**

