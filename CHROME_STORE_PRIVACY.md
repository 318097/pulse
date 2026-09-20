# Pulse Chrome Web Store Privacy Submission

## 1. Single purpose

Pulse has a single, narrow purpose: it replaces the Chrome new tab page with one daily refreshed vocabulary card.

When a user opens a new tab, Pulse shows a minimal card-based experience focused on a single piece of curated vocabulary content. The extension does not provide unrelated utilities, background automation, ad blocking, tab management, shopping features, or access to arbitrary websites.

## 2. Permission justification

### `storage`

Pulse uses `chrome.storage.local` to save the currently configured vocabulary entity and its cached content so the new tab experience can load quickly and keep the latest card state between tab opens.

### `https://bubblegum-server.vercel.app/*`

Pulse fetches the vocabulary card content shown on the new tab page from its production content API hosted at `https://bubblegum-server.vercel.app/`.

This host permission is limited to the single API origin required to deliver the extension's only user-facing feature.

## 3. Privacy policy

Pulse now includes a privacy policy in [PRIVACY_POLICY.md](./PRIVACY_POLICY.md).

For the Chrome Web Store listing, publish that policy at a public URL and use that URL in the Privacy Policy field.

## Removed unnecessary permissions

The publishable manifest removes development and placeholder host access that was not required for the production extension:

- `http://localhost:7000/*`
- `https://api.example.com/*`

Only the permissions needed to support Pulse's single purpose remain.
