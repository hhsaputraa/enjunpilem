# 📋 Laporan Daftar Temuan Kode (Refactoring & Bug Report) - EnjunPilem

Dokumen ini mencatat beberapa temuan penting terkait kerapian kode, redundansi, berkas tidak terpakai (*dead code*), serta fungsionalitas setengah matang (*unfinished features*) di dalam repositori **EnjunPilem**. 

Dokumen ini disusun untuk dibahas bersama sebelum melakukan tindakan perubahan kode apa pun.

---

## 🛠️ Ringkasan Temuan

| No | File / Lokasi | Kategori | Deskripsi Singkat | Dampak / Risiko |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `src/components/mobile/pages/MobileWatchlist.tsx` | **Bug Kritis** | Menampilkan kartu kosong (*blank cards*) karena detail TMDB (judul/poster) tidak di-fetch. Ada array data mock mati. | Pengguna mobile tidak bisa melihat poster/judul film yang ada di watchlist. |
| **2** | `src/pages/index-header.tsx` | **Dead Code** | Berkas sepanjang 291 baris yang tidak diimpor atau digunakan di mana pun. | Memperberat struktur direktori & membingungkan. |
| **3** | `src/components/Navbar.tsx` | **Redundansi UI** | Terdapat komponen menu samping (*Sheet*) mobile yang sangat panjang di dalam navbar desktop. | Ukuran berkas membengkak, kode mubazir karena desktop layout tidak merender menu ini. |
| **4** | `src/components/mobile/pages/MobileWatch.tsx` | **Unfinished Code** | Tombol Watchlist masih berupa `TODO console.log` statis dan daftar episode serial TV di-hardcode ke 10 item dummy. | Fitur watchlist tidak berfungsi di halaman tonton mobile, data episode TV tidak akurat. |
| **5** | `src/components/mobile/MobileVideoPlayer.tsx` | **Redundansi Logika** | Tombol kontrol kustom (play/pause/slider) hanya hiasan UI dan tidak benar-benar mengontrol video di dalam iframe. | Kebingungan UX jika tombol kustom bertabrakan dengan tombol bawaan iframe. |

---

## 🔍 Detail Penjelasan & Rekomendasi Solusi

### 1. Bug Kritis & Mock Data di `MobileWatchlist.tsx`
* **Analisis Masalah**: 
  Saat ini, data diambil langsung dari tabel Supabase `watchlist` melalui `useMobileWatchlist()`. Tabel Supabase tersebut hanya berisi data relasional dasar: `{ id, user_id, media_id, media_type, added_at }`. 
  Kode langsung memetakan data ini tanpa melakukan query sekunder ke TMDB untuk mengambil `title`, `poster_path`, atau `vote_average`:
  ```typescript
  const items = watchlist.map(transformWatchlistItem);
  ```
  Sehingga, detail UI bernilai `undefined` dan merender kartu kosong. Selain itu, terdapat variabel mock `mockWatchlistItems` di atas berkas yang tidak terpakai sama sekali.
* **Rekomendasi Perbaikan**:
  * Menggunakan pendekatan `useQueries` (seperti di `MobileFavorites.tsx`) atau `Promise.all` di dalam hook untuk melengkapi data film dari API TMDB sebelum dirender.
  * Menghapus array `mockWatchlistItems` untuk menjaga kebersihan berkas.

---

### 2. Berkas Mati `src/pages/index-header.tsx`
* **Analisis Masalah**:
  Berkas `index-header.tsx` tidak direferensikan dalam `App.tsx` maupun berkas navigasi lainnya. Ini tampaknya merupakan sisa peninggalan dari pengembangan awal navigasi desktop.
* **Rekomendasi Perbaikan**:
  * Menghapus berkas ini secara permanen setelah memastikan tidak ada ketergantungan tersembunyi.

---

### 3. Redundansi Menu Mobile di Desktop `Navbar.tsx`
* **Analisis Masalah**:
  Di dalam `Navbar.tsx` terdapat komponen `<Sheet>` mobile (baris 226-345) untuk navigasi samping. Namun, `Navbar.tsx` hanya dirender untuk desktop di `App.tsx` ketika `isMobile` bernilai `false`. Di sisi mobile, sistem sudah memiliki `MobileHeader` dan `BottomNav` tersendiri di dalam ekosistem `/components/mobile/*`.
* **Rekomendasi Perbaikan**:
  * Memisahkan menu mobile tersebut atau menghapusnya langsung dari `Navbar.tsx` untuk menyederhanakan kode desktop navbar dan mengurangi beban ukuran file bundel produksi.

---

### 4. Fitur Setengah Matang di `MobileWatch.tsx`
* **Analisis Masalah**:
  * Tombol **Tambah ke Watchlist** (`Plus`) hanya memanggil `console.log('Toggle watchlist for:', movieId)` alih-alih mengaktifkan mutasi data Supabase.
  * Bagian **Episode List** untuk serial TV di-hardcode ke angka `10` dengan teks generik "Episode Title", padahal data detail seasons dari TMDB sudah ter-fetch di dalam komponen.
* **Rekomendasi Perbaikan**:
  * Hubungkan `handleWatchlistToggle` dengan mutasi dari `useMobileWatchlist()`.
  * Integrasikan daftar episode TV agar menarik data secara dinamis dari detail season TMDB (sama seperti implementasi yang ada pada desktop `Watch.tsx`).

---

### 5. Kontrol Hiasan pada `MobileVideoPlayer.tsx`
* **Analisis Masalah**:
  Pemutar video mobile menggunakan element `iframe` yang memuat domain eksternal. Secara teknis, interaksi di dalam iframe tidak dapat dikendalikan dengan mudah dari luar (karena kebijakan keamanan *Cross-Origin* browser). Akibatnya, tombol-tombol kontrol seperti play, pause, volume, dan slider waktu hanya mengubah state internal UI aplikasi tanpa mempengaruhi video aslinya.
* **Rekomendasi Perbaikan**:
  * Menyederhanakan overlay kontrol kustom atau membiarkan kontrol bawaan dari pemutar video `iframe` yang bekerja secara alami guna menghindari kebingungan pengguna.

---

## 💬 Rencana Tindakan Pembahasan
Silakan ulas daftar temuan ini. Anda bisa memilih bagian mana yang ingin diprioritaskan terlebih dahulu untuk dibersihkan atau diperbaiki:
1. Apakah kita ingin fokus membereskan bug tampilan kosong pada **Mobile Watchlist**?
2. Apakah kita ingin merapikan berkas mati dan redundansi kode (**index-header** dan **Navbar.tsx**)?
3. Apakah kita ingin menuntaskan fitur setengah matang di **Mobile Watch** (Watchlist nyata & Episode dinamis)?
