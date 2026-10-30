# Pulse Chrome Web Store Privacy Submission

## 1. Single purpose

Pulse makes every new tab a quick start point: it replaces the Chrome new tab page with one daily refreshed learning card (a word, a tech read or a keyboard shortcut) and includes Switch, a keyboard launcher for getting to the sites and tabs the user wants next.

Switch lets the user assign a letter to a site and jump there with one key, search web app pages, browser pages and open tabs, sort or cycle through tabs in the current window, and run Chrome's own tab and window actions (such as pin, mute, duplicate or open in Incognito) on the tab it was opened on. It opens over the Pulse new tab, from the toolbar button, or with its keyboard shortcut. The extension does not provide ad blocking, shopping features, or background access to the content of arbitrary websites.

## 2. Permission justification

### `storage`

Pulse uses `chrome.storage.local` to save the configured content sources and their cached cards, so the new tab loads quickly and keeps its state between tab opens. Switch stores the user's shortcuts (name, URL, letter, favorite flag) and any links the user imported, in the same local storage.

### `tabs`

Switch reads the titles and URLs of the tabs in the current window to list them in search, show how many tabs are open for each shortcut, switch to an already open tab instead of opening a duplicate, and sort or cycle tabs on request. Tab data is only used in the browser and is never sent anywhere.

### `activeTab` and `scripting`

When the user runs the YouTube "Fetch playlists" task from Switch on youtube.com/feed/playlists, Pulse reads the playlist names and links from that page so they show up in search. The script only runs on the tab the user opened Switch on, only when they run the task.

### `https://bubblegum-server.vercel.app/*`

Pulse fetches the card content shown on the new tab page from its production content API hosted at `https://bubblegum-server.vercel.app/`.

This host permission is limited to the single API origin required to deliver the cards.

### Keyboard commands

Pulse registers keyboard shortcuts to open Switch, sort tabs and cycle tabs. They need no extra permissions.

## 3. Privacy policy

Pulse now includes a privacy policy in [PRIVACY_POLICY.md](./PRIVACY_POLICY.md).

For the Chrome Web Store listing, publish that policy at a public URL and use that URL in the Privacy Policy field.

## Removed unnecessary permissions

The publishable manifest removes development and placeholder host access that was not required for the production extension:

- `http://localhost:7000/*`
- `https://api.example.com/*`

Only the permissions needed to support Pulse and Switch remain.
