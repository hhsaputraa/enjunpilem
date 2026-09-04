# Design Specification: Custom Collection Cover & Expanded Sub-Poster Strip (Desktop)

**Date**: 2026-09-04  
**Target File**: `src/pages/Collections.tsx`  
**Related Components**: `src/components/CollectionDetails.tsx`, `src/components/mobile/pages/MobileCollections.tsx` (dual-tree sync)

---

## 1. Problem Statement & Goals

1. **Custom Hero Banner Poster**:
   - Saat ini kartu koleksi di halaman desktop (`Collections.tsx`) selalu mengambil poster dari item urutan pertama (`items[0]?.poster_path`) sebagai gambar hero/banner besar (rasio 16:9).
   - Pengguna menginginkan kemampuan untuk memilih poster film mana pun yang ada di dalam koleksi tersebut sebagai cover utama koleksi, tanpa harus mengubah urutan asli film di dalam koleksi.
   - Pilihan cover harus tersimpan persisten di Supabase dan tersinkronisasi antar-perangkat serta tetap terlihat jika koleksi di-share publik.

2. **Expanded Sub-Poster Thumbnail Strip**:
   - Strip poster mini (sub-poster) saat ini dibatasi kaku `slice(0, 4)`.
   - Pada kartu grid desktop yang memiliki lebar kontainer ~350px–400px, pembatasan 4 poster menyisakan ruang kosong besar di sebelah kanan.
   - Pengguna menginginkan deretan sub-poster membentang penuh ke kanan secara proporsional (hingga 6 poster per kartu), dan jika masih ada sisa film, slot terakhir menampilkan badge overlay `+N`.

---

## 2. Technical Architecture & Design

### 2.1 Storage & Data Persistence (Transparent Metadata in `description`)
Tabel `collections` Supabase memiliki skema:
`id`, `name`, `description`, `is_shared`, `user_id`, `created_at`.

Untuk menghindari migrasi DDL database remote dan memastikan kompatibilitas serta portabilitas:
- Path cover yang dipilih disimpan di dalam field `description` dengan format metadata tersembunyi/komentar yang bersih: `<!--cover:/path-to-poster.jpg-->`.
- Helper utility functions:
  ```ts
  export function parseCollectionDescription(rawDescription: string | null | undefined): {
    description: string;
    customCoverPath: string | null;
  } {
    if (!rawDescription) return { description: '', customCoverPath: null };
    const match = rawDescription.match(/<!--cover:(.*?)-->/);
    const customCoverPath = match ? match[1].trim() : null;
    const cleanDescription = rawDescription.replace(/<!--cover:.*?-->/g, '').trim();
    return { description: cleanDescription, customCoverPath };
  }

  export function formatCollectionDescription(cleanDescription: string, coverPath: string | null): string {
    const trimmed = cleanDescription.trim();
    if (!coverPath) return trimmed;
    return trimmed ? `${trimmed} <!--cover:${coverPath}-->` : `<!--cover:${coverPath}-->`;
  }
  ```

### 2.2 Cover Selection Dialog ("Pilih Poster Utama")
- Pada menu titik tiga kartu (`DropdownMenu`), ditambahkan menu item:
  - Label: `Pilih Poster Utama`
  - Icon: `ImageIcon` (Lucide React)
- Mengklik opsi ini membuka `Dialog` baru: `coverSelectionCollection`
  - Menampilkan judul: `Pilih Poster Utama: <Nama Koleksi>`
  - Menampilkan grid poster dari seluruh film yang ada di dalam koleksi (`collection.collection_items`).
  - Item yang saat ini aktif sebagai cover ditandai dengan border `ring-2 ring-primary` dan badge `Active Cover`.
  - Mengklik salah satu poster akan memicu mutasi update ke Supabase (`updateCollection.mutate(...)`) dengan description yang diperbarui membawa tag `<!--cover:selected_path-->`.
  - Terdapat tombol `Reset ke Default` untuk mengembalikan cover ke item pertama koleksi.

### 2.3 Expanded Sub-Posters Strip
- Maksimal slot yang muat dalam satu baris kartu grid desktop: 6 thumbnail (`MAX_THUMBS = 6`).
- Logika penentuan thumbnail:
  ```ts
  const MAX_THUMBS = 6;
  const hasOverflow = items.length > MAX_THUMBS;
  const visibleCount = hasOverflow ? MAX_THUMBS - 1 : Math.min(items.length, MAX_THUMBS);
  const displayedThumbs = items.slice(0, visibleCount);
  const remainingCount = items.length - visibleCount;
  ```
- Jika ada overflow:
  - 5 slot pertama menampilkan poster mini film 1 sampai 5.
  - Slot ke-6 menampilkan poster mini film ke-6 dengan overlay gelap `bg-black/75` dan teks `+N` (di mana $N = \text{total} - 5$).
- Styling strip:
  - `flex items-center gap-1.5 -mt-8 relative z-20 w-full overflow-hidden`
  - Setiap thumbnail memiliki lebar `w-11 h-16` dengan `border-2 border-card shadow-sm shrink-0 rounded-md`.

### 2.4 Hero Poster Resolution
- Pada setiap kartu koleksi:
  ```ts
  const { customCoverPath } = parseCollectionDescription(collection.description);
  // Validasi: pastikan poster pilihan memang masih ada di dalam koleksi
  const isCustomCoverValid = items.some(item => item.poster_path === customCoverPath);
  const heroPoster = (isCustomCoverValid ? customCoverPath : null) || items[0]?.poster_path;
  ```
- Ditampilkan dengan resolusi `getImageUrl(heroPoster, 'w500')` dengan `aspect-[16/9]` dan gradient bottom cinematic.

---

## 3. Dual-Tree Architecture Parity
Sesuai `AGENTS.md` Rule #1, logika parsing metadata cover dan tampilan deskripsi bersih juga akan dipastikan bekerja selaras di `src/components/mobile/pages/MobileCollections.tsx` agar mobile view tidak menampilkan raw comment `<!--cover:...-->`.

---

## 4. Testing & Verification Plan
- Type-check via `tsc --noEmit`.
- Automated test run via `npm run test`.
- Automated full verification via `npm run verify-all`.
