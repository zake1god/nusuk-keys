# Nusuk Keys

Situs komunitas sederhana untuk menyalin Nusuk Key terbaru dan membuka tautan resmi Nusuk dalam satu klik.

> Proyek ini bukan situs resmi Nusuk dan tidak berafiliasi dengan Nusuk atau Kementerian Haji dan Umrah Arab Saudi. Situs tidak meminta atau menyimpan data pribadi.

## Live site

https://zake1god.github.io/nusuk-keys/

## Sumber awal

- Postingan resmi Instagram `@mynusuk`: https://www.instagram.com/p/DgIDDFmFyNy/?hl=en
- Tautan aplikasi dari caption: https://nusuk.go.link/winners
- Situs resmi Nusuk: https://www.nusuk.sa/

Nilai awal yang ditampilkan adalah **24**, sesuai posting sumber di atas.

## Memperbarui key

Edit array `nusukKeys` di [`script.js`](script.js). Tambahkan data terbaru di posisi paling atas:

```js
{
  value: "KEY_BARU",
  label: "Nusuk Key terbaru",
  description: "Key yang diambil dari posting resmi @mynusuk.",
  sourceName: "Instagram @mynusuk",
  sourceUrl: "URL_POSTING_SUMBER",
  submitUrl: "https://nusuk.go.link/winners",
  status: "Terbaru",
},
```

Perbarui juga teks “Update terakhir” di `index.html` bila diperlukan. GitHub Pages akan menerbitkan perubahan dari branch `main` secara otomatis.

## Menjalankan secara lokal

Tidak ada proses build atau dependency. Buka `index.html` langsung, atau jalankan server statis pilihan Anda.

## Support

Jika proyek ini bermanfaat, dukung pengembang melalui [SociaBuzz](https://sociabuzz.com/zakezrk/tribe).

## Lisensi

Kode sumber tersedia di bawah [MIT License](LICENSE). Nama dan logo Nusuk adalah milik pemegang hak masing-masing.
