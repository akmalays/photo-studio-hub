# wArna Studio Hub 📸

Sistem manajemen terintegrasi untuk wArna Studio, dikembangkan dengan arsitektur **Serverless** modern berbasis React, Vite, dan Supabase.

## Arsitektur Proyek (Serverless)

Proyek ini telah diperbarui menjadi **Arsitektur Serverless** yang sangat ringan, tidak lagi menggunakan Node.js Backend Server (Railway) khusus secara terpisah:

- **Frontend**: Aplikasi web interaktif berbasis React + Vite + Tailwind CSS.
- **Database & API**: Ditangani langsung dari browser via **Supabase Client SDK**. Semua Autentikasi Admin dan Interaksi Data (CRUD) dikunci dan dilindungi melalui kebijakan bawaan **Row Level Security (RLS)** di sisi dasbor Supabase.

## Persiapan & Instalasi

Pastikan Anda memiliki Node.js (v20+) terinstal. **Bun** sangat direkomendasikan untuk performa instalasi dan kompilasi yang jauh lebih cepat.

1.  **Clone Repository**
    ```sh
    git clone https://github.com/akmalays/photo-studio-hub.git
    cd photo-studio-hub
    ```

2.  **Konfigurasi Environment**
    Salin file `.env.example` ke sebuah file baru bernama `.env` di folder utama (root) lalu isikan variabel wajib:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY` / `VITE_SUPABASE_SERVICE_ROLE_KEY` *(Hanya jika ingin memakai fitur Script Backup)*

3.  **Instalasi Dependencies**
    Jalankan perintah ini di root folder:
    ```sh
    bun install
    # atau npm install
    ```

## Cara Menjalankan (Development)

Untuk masuk ke mode *development* web interaktif (Frontend), jalankan perintah:
```sh
bun run dev
# atau npm run dev
```
Website wArna Studio secara default dapat diakses pada bilah URL browser via `http://localhost:3000`. 

## Manajemen Log Data (Backup Supabase)

Terdapat utilitas rahasia (*script*) khusus untuk mengunduh, mengekstrak, dan mencadangkan keseluruhan data tabel penting dari server Supabase Anda ke dalam bentuk file lokal `.json`. Data riwayat backup akan diabaikan secara aman oleh Git (tidak terdorong ke GitHub).

Untuk menginisiasi *auto-backup*, jalankan pada terminal Anda:
```sh
bun run backup
# atau npm run backup
```
File salinan baru (`database-backup-[tanggal].json`) akan otomatis dibuat di jalur `supabase/backups/`.

## Pedoman Deployment

Aplikasi Frontend wArna Studio kini siap dipublikasikan secara **Instan & 100% Gratis** ke layanan Cloud Modern Global (seperti **Vercel**, **Netlify**, atau **Cloudflare Pages**).

- **Panduan Setup di Vercel/Netlify:**
    - Hubungkan repo GitHub ini.
    - Setel Build Command: `npm run build` *(atau `bun run build` jika diatur)* 
    - Setel Output/Publish Directory: `frontend/dist` *(atau cukup biarkan framework automation vite mendeteksinya)*
    - Masukkan Environment Variables (`VITE_SUPABASE...`) ke dasbor Cloud mereka.

## Teknologi Utama

- **Infrastruktur Logic**: React 18, TypeScript, React Router Dom, React Helmet Async.
- **Desain & Interface Visual**: Tailwind CSS, shadcn/ui, Radix UI Primitives, Framer Motion, Recharts.
- **Database & Backend as a Service**: Supabase (PostgreSQL, Realtime, Bucket Storage).
