# AURAxGOLD — MT5 EA Licensing Portal

Portal lisensi produksi untuk **AURAxGOLD Expert Advisor** MT5, dibangun dengan Next.js 15, TailwindCSS, dan Supabase.

---

## 🚀 Fitur

| Halaman / Endpoint | Deskripsi |
|--------------------|-----------|
| `/` | Landing page dengan branding dan CTA |
| `/activate` | Form pengajuan aktivasi lisensi |
| `/status` | Cek status lisensi berdasarkan MT5 login + server |
| `/admin` | Dashboard admin dengan approval/reject/revoke |
| `GET /api/verify` | Endpoint verifikasi lisensi untuk MT5 EA |
| `POST /api/request-activation` | Submit permintaan aktivasi |
| `GET /api/public-status` | Cek status lisensi (publik) |
| `POST /api/admin/action` | Approve / reject / revoke lisensi |
| `GET /api/admin/list` | Daftar 200 lisensi terbaru |

---

## 📋 Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- Akun [Supabase](https://supabase.com) (free tier cukup)
- Akun [Vercel](https://vercel.com) untuk deployment

---

## ⚙️ Setup Lokal

### 1. Clone & Install

```bash
cd path/to/AURAxGOLD
npm install
```

### 2. Setup Environment Variables

Salin `env.example` ke `.env.local`:

```bash
copy env.example .env.local
```

Isi semua nilai di `.env.local`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ADMIN_PASSWORD=password-admin-anda
EA_VERIFY_API_KEY=random-key-panjang
```

### 3. Setup Database Supabase

1. Buka [Supabase Dashboard](https://app.supabase.com) → pilih project Anda
2. Masuk ke **SQL Editor**
3. Copy-paste isi file `supabase/migrations/001_create_licenses.sql`
4. Klik **Run** untuk menjalankan migrasi

### 4. Jalankan Dev Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Supabase SQL Migration

```sql
-- Jalankan di Supabase SQL Editor
-- File: supabase/migrations/001_create_licenses.sql
```

Tabel `public.licenses`:

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | uuid (PK) | Auto-generated |
| `email` | text | Email pengguna |
| `login` | bigint | MT5 account login |
| `server` | text | MT5 broker server |
| `broker` | text (nullable) | Nama broker |
| `status` | text | `pending\|approved\|rejected\|revoked` |
| `plan_days` | int | 30 atau 90 hari |
| `expires_at` | timestamptz | Tanggal kadaluarsa |
| `approved_at` | timestamptz | Tanggal approval |
| `created_at` | timestamptz | Tanggal dibuat |
| `note` | text (nullable) | Catatan admin |

---

## 🔐 Environment Variables

| Variabel | Deskripsi | Wajib |
|----------|-----------|-------|
| `SUPABASE_URL` | URL project Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase (RAHASIA) | ✅ |
| `ADMIN_PASSWORD` | Password untuk halaman `/admin` | ✅ |
| `EA_VERIFY_API_KEY` | API key untuk endpoint `/api/verify` dari EA MT5 | ✅ |

> ⚠️ **PENTING**: `SUPABASE_SERVICE_ROLE_KEY` dan `EA_VERIFY_API_KEY` harus dijaga kerahasiaannya. Jangan pernah di-expose ke client/browser.

---

## 🌐 Deploy ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "initial: AURAxGOLD licensing portal"
git remote add origin https://github.com/username/auraxgold-portal.git
git push -u origin main
```

### 2. Import ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Import repository dari GitHub
3. Tambahkan **Environment Variables** di Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `EA_VERIFY_API_KEY`
4. Klik **Deploy**

---

## 🤖 Integrasi dengan MT5 EA (MQL5)

Gunakan fungsi WebRequest di MQL5 untuk memanggil endpoint verifikasi:

```mql5
string url     = "https://your-domain.vercel.app/api/verify";
string headers = "x-ea-key: YOUR_EA_VERIFY_API_KEY\r\n";
string params  = "login=" + IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN))
               + "&server=" + AccountInfoString(ACCOUNT_SERVER);

char data[], result[];
string resultHeaders;
int timeout = 5000;

int code = WebRequest("GET", url + "?" + params, headers, timeout, data, result, resultHeaders);

if (code == 200) {
    string resp = CharArrayToString(result);
    // Parse JSON: { "ok": true, "status": "approved", "expiresAt": "..." }
    if (StringFind(resp, "\"ok\":true") >= 0) {
        // Lisensi valid, izinkan EA berjalan
        Print("License VALID");
    } else {
        // Lisensi tidak valid
        Print("License INVALID: ", resp);
        ExpertRemove();
    }
} else {
    Print("Verify request failed, code: ", code);
}
```

> Tambahkan domain ke **Tools > Options > Expert Advisors > Allow WebRequest for listed URL** di MetaTrader 5.

---

## 📁 Struktur Proyek

```
AURAxGOLD/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (Header + Footer)
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── globals.css         # Global styles + Tailwind
│   │   ├── activate/
│   │   │   └── page.tsx        # Halaman aktivasi (/activate)
│   │   ├── status/
│   │   │   └── page.tsx        # Cek status (/status)
│   │   ├── admin/
│   │   │   └── page.tsx        # Admin dashboard (/admin)
│   │   └── api/
│   │       ├── request-activation/route.ts
│   │       ├── public-status/route.ts
│   │       ├── verify/route.ts
│   │       └── admin/
│   │           ├── list/route.ts
│   │           └── action/route.ts
│   ├── components/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── lib/
│       └── supabaseAdmin.ts    # Server-only Supabase client
├── supabase/
│   └── migrations/
│       └── 001_create_licenses.sql
├── env.example
├── package.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🔒 Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` hanya digunakan di server-side (route handlers)
- RLS aktif di tabel `licenses` — semua akses via service role key
- Admin endpoint dilindungi header `x-admin-pass`
- Verify endpoint dilindungi header `x-ea-key`
- Tidak ada data sensitif yang di-expose ke browser

---

## 📄 License

Private — AURAxGOLD © 2024. All rights reserved.
