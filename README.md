# Nusuk Keys

Situs komunitas untuk mencari dan menyalin Nusuk Keys, lalu membuka tautan Nusuk dalam satu klik. Key diekstrak dari komentar publik dengan regex `NG-[A-Za-z0-9]{8}`, kemudian dideduplikasi sebelum diterbitkan.

> **Unofficial.** Proyek ini dibuat langsung oleh **Zaki Zarkasih Al Mustafa** dan tidak berafiliasi dengan Nusuk atau Kementerian Haji dan Umrah Arab Saudi. Situs tidak meminta atau menyimpan data pribadi, username, atau isi komentar.

## Live site

https://zake1god.github.io/nusuk-keys/

## Sumber awal

- Postingan resmi Instagram `@mynusuk`: https://www.instagram.com/p/DgIDDFmFyNy/?hl=en
- Tautan aplikasi dari caption: https://nusuk.go.link/winners
- Situs resmi Nusuk: https://www.nusuk.sa/

Ekstraksi 25 November 2026 memindai **12.253 komentar utama** dan **4.317 balasan** yang tersedia melalui pagination Instagram. Hasil akhirnya adalah **10.303 key unik** dengan deduplikasi case-sensitive. Tidak ada username atau teks komentar lain yang diterbitkan.

## Memperbarui key

Daftar key tersimpan di [`keys.js`](keys.js) sebagai array `window.NUSUK_KEYS`. Hanya masukkan nilai unik yang cocok persis dengan pola berikut:

```js
window.NUSUK_KEYS = Object.freeze([
  "NG-g0kjJSOX",
  "NG-contoh12",
]);
```

Perbarui juga teks “Update terakhir” di `index.html` bila diperlukan. GitHub Pages akan menerbitkan perubahan dari branch `main` secara otomatis. Antarmuka menampilkan 48 key per batch dan menyediakan pencarian agar daftar besar tetap ringan.

## Menjalankan secara lokal

Tidak ada proses build atau dependency. Buka `index.html` langsung, atau jalankan server statis pilihan Anda.

## Support

Jika proyek ini bermanfaat, dukung **Zaki Zarkasih Al Mustafa** melalui [SociaBuzz](https://sociabuzz.com/zakezrk/tribe).

## Lisensi

Kode sumber tersedia di bawah [MIT License](LICENSE). Nama dan logo Nusuk adalah milik pemegang hak masing-masing.

Logo Nusuk pada situs digunakan hanya untuk identifikasi dan bersumber dari koleksi aset [Saudi Logos](https://salogos.org/logo/676). Seluruh hak merek tetap milik pemiliknya.
