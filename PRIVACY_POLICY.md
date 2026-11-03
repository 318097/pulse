# Pulse Privacy Policy

Effective date: 27 October 2026

Pulse is a Chrome extension that replaces the new tab page with a daily learning card and includes Switch, a keyboard launcher for sites, tabs and bookmarks.

## Information Pulse processes

Pulse processes a limited amount of data in order to provide its features.

### 1. Data stored locally in the browser

Pulse uses `chrome.storage.local` to store:

- the current vocabulary entity configuration
- cached vocabulary card content returned by the Pulse API
- timestamps used to determine when content should refresh
- Switch shortcuts the user creates (name, URL, letter and favorite flag)
- links the user imports into Switch, such as YouTube playlist names and links
- which Switch links the user opened, how many times and when, and the links they starred, to list recent and favorite links first

This data stays in the user's browser and is used only to load the new tab page quickly, preserve the current card state between tab opens, and power Switch.

### 2. Tabs and bookmarks read by Switch

When Switch is open, or when the user runs one of its tab commands, Pulse reads the titles and URLs of the tabs in the current window to list them, count the open tabs for each shortcut, switch to a tab, and sort or cycle tabs. This happens only in the browser; tab data is not stored or sent anywhere.

When Switch is open, Pulse also reads the titles, URLs and folders of the user's bookmarks to list them in search and open the one the user picks. Pulse never adds, edits or removes bookmarks, and bookmark data is not stored or sent anywhere.

When the user runs the YouTube "Fetch playlists" task on youtube.com/feed/playlists, Pulse reads the playlist names and links from that page and saves them locally as imported links.

### 3. Data sent when requesting content

When Pulse requests vocabulary content from `https://bubblegum-server.vercel.app/`, the server may receive standard request metadata that is commonly included in web requests, such as:

- IP address
- browser or user agent information
- request time and basic server log data

This information is used only to deliver content, operate the service, and protect the service from abuse or technical issues.

## Information Pulse does not collect

Pulse does not require an account or sign-in.

Pulse does not intentionally collect:

- name
- email address
- precise location
- payment information
- contacts
- browsing history; open tab and bookmark titles and URLs are read only in the browser for Switch and never sent anywhere

## How information is used

Any information processed by Pulse is used only to:

- display the vocabulary card on the new tab page
- cache the latest card locally for performance and continuity
- refresh content at the configured interval
- show, open and switch to the user's Switch shortcuts, destinations, tabs and bookmarks
- monitor service reliability and basic security on the content API

## Sharing of information

Pulse does not sell personal information.

Pulse does not use user data for advertising.

Pulse does not share user data with third parties except when necessary to operate the content service or comply with legal obligations.

## Data retention

Locally cached extension data remains in the browser until it is replaced, cleared by the user, or the extension is removed. Switch's Reset Switch data task deletes its shortcuts, imported links, favorites and usage history at any time.

Server logs, if collected by the hosting provider or API service, are retained only for operational, reliability, and security purposes and only as long as reasonably necessary.

## Security

Pulse uses a limited permission set: host access only to the production content API, plus tab and bookmark access and on-request page scripting for Switch.

## Changes to this policy

This privacy policy may be updated if Pulse's functionality or data practices change. Any updated version will be published at the same public policy URL used in the Chrome Web Store listing.

## Contact

Questions about this privacy policy should be directed to the publisher contact listed on the Chrome Web Store listing or the public repository associated with Pulse.
