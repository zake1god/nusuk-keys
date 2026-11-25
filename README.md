# Nusuk Keys

An unofficial community website for searching and copying Nusuk Keys, then opening Nusuk in one click. Keys are extracted from public comments with the `NG-[A-Za-z0-9]{8}` pattern and deduplicated before publishing.

> **Unofficial.** This project was created by **Zaki Zarkasih Al Mustafa** and is not affiliated with Nusuk or the Saudi Ministry of Hajj and Umrah. The website does not request or store personal data, usernames, or comment text.

## Live website

https://zake1god.github.io/nusuk-keys/

## Features

- Search across all published keys.
- Google-style pagination with no more than 50 keys per page.
- Copy a key or copy it and open Nusuk in one click.
- Separate menus for Umrah Winners and Daily Zamzam Winners.
- A clear notice that the community winner tracker covers 50 campaign days only.

Winner names are not invented or inferred. The winner lists remain empty until verified official results are available.

## Initial sources

- Official `@mynusuk` Instagram post: https://www.instagram.com/p/DgIDDFmFyNy/?hl=en
- Application link from the caption: https://nusuk.go.link/winners
- Official Nusuk website: https://www.nusuk.sa/

The November 25, 2026 extraction scanned **12,253 top-level comments** and **4,317 replies** available through Instagram pagination. It produced **10,303 unique keys** using case-sensitive deduplication. No usernames or other comment text are published.

## Updating keys

The key list is stored in [`keys.js`](keys.js) as the `window.NUSUK_KEYS` array. Only add unique values that match the expected key format:

```js
window.NUSUK_KEYS = Object.freeze([
  "NG-g0kjJSOX",
  "NG-example1",
]);
```

Update the “Last updated” text in `index.html` when needed. GitHub Pages automatically publishes changes from the `main` branch.

## Running locally

There is no build process or dependency. Open `index.html` directly or serve the directory with any static web server.

## Support

If this project helps you, support **Zaki Zarkasih Al Mustafa** through [SociaBuzz](https://sociabuzz.com/zakezrk/tribe).

## License

The source code is available under the [MIT License](LICENSE). The Nusuk name and logo belong to their respective rights holders.

The Nusuk logo is used for identification only and was obtained from the [Saudi Logos](https://salogos.org/logo/676) asset collection. All trademark rights remain with their owner.
