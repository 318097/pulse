# Pulse Privacy Policy

Effective date: 26 April 2026

Pulse is a Chrome extension that replaces the new tab page with a daily vocabulary card.

## Information Pulse processes

Pulse processes a limited amount of data in order to provide its single feature.

### 1. Data stored locally in the browser

Pulse uses `chrome.storage.local` to store:

- the current vocabulary entity configuration
- cached vocabulary card content returned by the Pulse API
- timestamps used to determine when content should refresh

This data stays in the user's browser and is used only to load the new tab page quickly and preserve the current card state between tab opens.

### 2. Data sent when requesting content

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
- browsing history outside the Pulse new tab request needed to load content

## How information is used

Any information processed by Pulse is used only to:

- display the vocabulary card on the new tab page
- cache the latest card locally for performance and continuity
- refresh content at the configured interval
- monitor service reliability and basic security on the content API

## Sharing of information

Pulse does not sell personal information.

Pulse does not use user data for advertising.

Pulse does not share user data with third parties except when necessary to operate the content service or comply with legal obligations.

## Data retention

Locally cached extension data remains in the browser until it is replaced, cleared by the user, or the extension is removed.

Server logs, if collected by the hosting provider or API service, are retained only for operational, reliability, and security purposes and only as long as reasonably necessary.

## Security

Pulse uses a limited permission set and requests access only to the production API origin needed to provide its feature.

## Changes to this policy

This privacy policy may be updated if Pulse's functionality or data practices change. Any updated version will be published at the same public policy URL used in the Chrome Web Store listing.

## Contact

Questions about this privacy policy should be directed to the publisher contact listed on the Chrome Web Store listing or the public repository associated with Pulse.
