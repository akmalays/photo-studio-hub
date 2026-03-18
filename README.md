# wArna Studio Hub 📸

Sistem manajemen terintegrasi untuk wArna Studio, mencakup Frontend (User Interface) dan Backend (API & Database).

## Struktur Proyek

Proyek ini menggunakan **NPM Workspaces** untuk memisahkan frontend dan backend secara mandiri:

- **`frontend/`**: Aplikasi web berbasis React + Vite + Tailwind CSS.
- **`backend/`**: Server API berbasis Express (Node.js) + Supabase Edge Functions.

## Persiapan & Instalasi

Pastikan Anda memiliki Node.js (v20+) dan NPM terinstal. Bun direkomendasikan untuk performa lebih cepat.

1.  **Clone Repository**
    ```sh
    git clone https://github.com/akmalays/photo-studio-hub.git
    cd photo-studio-hub
    ```

2.  **Konfigurasi Environment**
    Salin file `.env.example` menjadi `.env` di root folder dan isi variabel yang diperlukan (Supabase URL, Keys, dll).

3.  **Instalasi Dependencies**
    Jalankan perintah ini di root folder:
    ```sh
    npm install
    ```

## Cara Menjalankan (Development)

Anda dapat menjalankan seluruh sistem atau hanya bagian tertentu dari root folder:

- **Menjalankan Keduanya (Frontend & Backend)**
  ```sh
  npm run dev
  ```
- **Hanya Frontend** (Web UI di port 8080)
  ```sh
  npm run dev:frontend
  ```
- **Hanya Backend** (API di port 8080/Railway default)
  ```sh
  npm run dev:backend
  ```

## Deployment

### Backend (Railway)
Proyek ini sudah dikonfigurasi untuk Railway menggunakan `nixpacks.toml`. Cukup hubungkan repo ini ke Railway dan dia akan otomatis mendeteksi script `build` dan `start` di root.

### Frontend
Dapat dideploy ke Vercel, Netlify, atau platform statis lainnya dengan mengarahkan root directory ke folder `frontend/` dan menggunakan build command `npm run build`.

## Teknologi yang Digunakan

- **Frontend**: Vite, React, TypeScript, shadcn/ui, Tailwind CSS.
- **Backend**: Node.js, Express, tsx, Bun.
- **Database/Auth**: Supabase.
