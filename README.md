# Nusuk Keys

An unofficial community website for searching and copying Nusuk Keys, browsing community-verified challenge answers, reading campaign help, and checking official winners. Keys are extracted from public comments with the `NG-[A-Za-z0-9]{8}` pattern and deduplicated before publishing.

> **Unofficial.** This project was created by **Zake** and is not affiliated with Nusuk or the Saudi Ministry of Hajj and Umrah. The website does not request or store personal data, usernames, or comment text.

## Live website

https://zake1god.github.io/nusuk-keys/

## Features

- Search across all published keys.
- Google-style pagination with no more than 50 keys per page.
- Copy a key or copy it and open Nusuk in one click.
- Five key cards per row on desktop, with responsive layouts for smaller screens.
- Switch between **All Nusuk Keys**, **Answer Keys**, **Official Winners**, and **FAQ** without scrolling through every directory.
- Browse 411 community-verified answers across the four in-app challenge categories: The Quran, The Prophet’s Biography, Makkah and the Grand Mosque, and Madinah and the Prophet’s Mosque.
- Search questions and answers within the selected category, with 20 answer cards per page and one-click answer copying.
- Read an informative FAQ adapted from the Nusuk app’s Help → Support Center section, beginning with a clear unofficial-project notice.
- Official customer care contacts shown in the app, including phone, email, and social support channels.
- A searchable official winner directory covering the first 25 published daily results.
- Winner pagination with no more than five daily result cards per page.
- Two winner filters: 25 Umrah winners and 250 Zamzam winners.
- Country flags and Latin transliterations for Arabic-script Umrah winner names.
- A clear notice that the complete campaign runs for 50 days.
- SociaBuzz and Ko-fi support links in both the header and page body.
- A visible link back to this public repository for transparency.

Winner names are preserved as published by Nusuk. The current directory contains 275 names announced through November 25, 2026.

## Initial sources

- Official `@mynusuk` key post: https://www.instagram.com/p/DgK0xgAl-e5/?hl=en
- Latest official Zamzam announcement: https://www.instagram.com/p/DgLEFNQFwjm/?hl=en
- Official Umrah results: the Winners screen in the Nusuk app.
- Official `@mynusuk` Instagram account and winner announcements: https://www.instagram.com/mynusuk/?hl=en
- Application link from the caption: https://nusuk.go.link/winners
- Official Nusuk website: https://www.nusuk.sa/

The November 26, 2026 extraction scanned **5,123 top-level comments** available through Instagram pagination. It produced **5,359 unique keys** using case-sensitive deduplication. Instagram reported a larger displayed count that includes replies and content not returned by the top-level iterator. No usernames or other comment text are published.

## Updating keys

The key list is stored in [`keys.js`](keys.js) as the `window.NUSUK_KEYS` array. Only add unique values that match the expected key format:

```js
window.NUSUK_KEYS = Object.freeze([
  "NG-g0kjJSOX",
  "NG-example1",
]);
```

Update the “Last updated” text in `index.html` when needed. GitHub Pages automatically publishes changes from the `main` branch.

Winner data is stored separately in [`winners.js`](winners.js), grouped by campaign day with one Umrah winner and ten Zamzam winners per published day.

Challenge answers are stored separately in [`answers.js`](answers.js), grouped into the same four categories shown in the app. The FAQ text in `index.html` is a concise adaptation of the Nusuk app’s Help → Support Center content; official app information and terms take precedence.

## Running locally

There is no build process or dependency. Open `index.html` directly or serve the directory with any static web server.

## Support

If this project helps you, support **Zake** through [SociaBuzz](https://sociabuzz.com/zakezrk/tribe) or [Ko-fi](https://ko-fi.com/zake).

## License

The source code is available under the [MIT License](LICENSE). The Nusuk name and logo belong to their respective rights holders.

The Nusuk logo is used for identification only and was obtained from the [Saudi Logos](https://salogos.org/logo/676) asset collection. All trademark rights remain with their owner.
