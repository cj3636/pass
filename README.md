# Password Generator

![App Type](https://img.shields.io/badge/type-static%20web-blue)
![Stack](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20JS-brightgreen)
![Data](https://img.shields.io/badge/storage-local%20%26%20session%20only-orange)
![License](https://img.shields.io/badge/license-not%20specified-lightgrey)

A glassmorphism-themed password generator and entry manager focused on quick, shareable passwords. The app runs entirely in the browser, stores data locally, and ships without external dependencies.

## Features
- Word-stream passwords (WSN: word + symbol + numbers) plus customizable word-list passwords.
- Adjustable options: word length, capitalization rules, symbol counts/simple-only toggle, and number counts.
- Inline save form with visibility toggles, bulk clear, export/import for saved entries, and auto-save to localStorage.
- Toast notifications, header feedback badges, and modal dialogs for confirms/prompts.
- No build step: open the page or serve the folder; works offline once cached.

## Quick start
1. Clone or download the repository.
2. Open `index.html` directly in a modern browser **or** serve the folder (e.g., `python -m http.server 8000`).
3. Wait for the word list badge to show "Word list ready", then generate passwords.

> Tip: Using a local server ensures clipboard access works in all browsers.

## Usage
- **WSN Generator**: Click `Generate` in the header to create a word + symbol + digits password.
- **Word Password Generator**: Pick the length, capitalization, symbols, and numbers, then click `Generate`. If the dictionary is still loading you will see a notice.
- **Save entry**: Fill name/username/password and click `Save Entry`; use the adjacent toggle to show/hide the password.
- **Auto-save**: Toggle in the Actions card. When enabled, entries persist to `localStorage`; when off, storage is cleared and manual export is recommended.
- **Export/Import**: Exports a JSON file with version metadata; importing expects that format and replaces in-memory entries.
- **Clear All**: Removes all saved entries after confirmation.

## Project layout
- `index.html` — App shell, controls, templates, and script/style includes.
- `css/style.css` — Glass UI theme, responsive grid, inputs, toggles, toasts, and modal styling.
- `js/main.js` — Core logic: generators, settings, storage, UI binding, dialog/notification helpers.
- `js/words/` — Word list scripts (do not commit large lists into version control if unnecessary).

## Data & security
- Saved entries live in `localStorage` under `pass:savedEntries`; last generated password is held in `sessionStorage`.
- Everything runs client-side; no network calls are made by default.
- Clipboard writes are attempted when generating passwords; browsers may prompt for permission.
- Exports are plain JSON; handle them securely and delete when done.

## Extending password types
The generator code is centralized in `js/main.js` under the `Generators` object.
1. Add a new generator function that returns a password string.
2. Create UI controls (button/inputs) in `index.html` and wire them to an event handler similar to `handleGenerateWSN`.
3. If the generator needs configuration, mirror the pattern used in `handleGenerateWordPassword` (read inputs, clamp values, pass options).
4. Call `handlePasswordCreated(newPassword, { label: 'Your label' })` to reuse clipboard, status, and toast behavior.
5. Update the README section above as new password types are added.

For additional word lists, add a script tag similar to `js/words/small.js` with `window.WordList` populated; the loader waits for it before enabling dictionary-based generation.

## Development notes
- The UI relies on standard DOM APIs—no frameworks or build tooling.
- Use any static server for testing; ensure HTTPS or localhost for reliable clipboard access.
- Keep word lists concise in source control; if you need larger lists consider loading them at runtime or splitting by size.

## License
Not specified. Add a license file and update the badge when one is chosen.
