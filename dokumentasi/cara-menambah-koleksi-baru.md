# 📚 Cara Menambah Koleksi Baru

Sistem koleksi otomatis memungkinkan Anda menambah koleksi film/series baru hanya dengan **1 menit** dan **5 baris kode**!

## 🚀 Langkah Mudah Menambah Koleksi

### 1. Buka File Konfigurasi
```
src/config/collections.ts
```

### 2. Tambah Object Baru di Array `COLLECTIONS`
```javascript
{
  id: 'idKoleksiAnda',           // ID unik untuk koleksi
  title: 'Judul Koleksi Anda',  // Judul yang ditampilkan
  slug: 'slug-di-tmdb',         // Slug list di TMDB
  icon: 'NamaIcon',             // Nama icon dari lucide-react
  color: 'text-warna-500',      // Warna icon (tailwind class)
  description: 'Deskripsi...',  // Deskripsi koleksi (opsional)
},
```

### 3. Selesai! 🎉
Koleksi baru akan otomatis:
- ✅ Muncul di homepage
- ✅ Punya halaman detail dengan pagination
- ✅ Icon dan styling otomatis
- ✅ API call otomatis

## 📝 Contoh Lengkap

```javascript
// Tambah di src/config/collections.ts
export const COLLECTIONS: CollectionConfig[] = [
  // ... koleksi yang sudah ada ...
  
  // ✅ KOLEKSI BARU
  {
    id: 'dcMovies',
    title: 'DC Extended Universe',
    slug: 'dc-movies',
    icon: 'Zap',
    color: 'text-blue-600',
    description: 'Complete DC movie collection',
  },
  {
    id: 'horrorClassics',
    title: 'Horror Classics',
    slug: 'horror-classics',
    icon: 'Ghost',
    color: 'text-red-600',
    description: 'Best horror movies of all time',
  },
  {
    id: 'animeMovies',
    title: 'Best Anime Movies',
    slug: 'anime-movies',
    icon: 'Heart',
    color: 'text-pink-500',
    description: 'Top anime movies collection',
  },
];
```

## 🎨 Pilihan Icon

Gunakan nama icon dari [Lucide React](https://lucide.dev/icons/):
- `Film`, `Star`, `Trophy`, `Flame`, `Heart`, `Zap`
- `Ghost`, `Sword`, `Shield`, `Crown`, `Diamond`
- `Rocket`, `Camera`, `Music`, `Gamepad2`, `Palette`

## 🎨 Pilihan Warna

Gunakan Tailwind color classes:
- `text-red-500`, `text-blue-500`, `text-green-500`
- `text-yellow-500`, `text-purple-500`, `text-pink-500`
- `text-indigo-500`, `text-teal-500`, `text-orange-500`

## 🔧 Custom Function (Advanced)

Jika butuh logic khusus, tambah `queryFn`:

```javascript
{
  id: 'customCollection',
  title: 'Custom Collection',
  slug: 'custom-slug',
  icon: 'Star',
  color: 'text-yellow-500',
  queryFn: myCustomFunction, // Function custom Anda
}
```

Function harus return:
```javascript
const myCustomFunction = async (page: number) => {
  return {
    items: [...], // Array movies/shows
    totalPages: 10 // Total halaman
  };
};
```

## 📋 Checklist

- [ ] Tambah object baru di `COLLECTIONS` array
- [ ] Pastikan `id` unik
- [ ] Pastikan `slug` sesuai dengan list di TMDB
- [ ] Pilih `icon` yang sesuai dari Lucide
- [ ] Pilih `color` yang bagus
- [ ] Test di browser

## 🚨 Tips Penting

1. **ID harus unik** - Jangan sama dengan koleksi lain
2. **Slug harus ada di TMDB** - Pastikan list sudah dibuat di TMDB
3. **Icon case-sensitive** - Gunakan PascalCase (contoh: `TrendingUp`)
4. **Warna konsisten** - Gunakan format `text-color-500`

## 🔍 Troubleshooting

### Koleksi tidak muncul?
- Cek apakah `slug` benar di TMDB
- Cek console browser untuk error
- Pastikan syntax JavaScript benar

### Icon tidak muncul?
- Cek nama icon di [Lucide React](https://lucide.dev/icons/)
- Pastikan menggunakan PascalCase

### Error saat pagination?
- Pastikan list di TMDB punya lebih dari 20 item
- Cek network tab untuk error API

## 📞 Bantuan

Jika ada masalah, cek:
1. Console browser untuk error
2. Network tab untuk API calls
3. File `src/config/collections.ts` untuk syntax error
