# TabTidy Privacy Policy

Last updated: June 28, 2026

TabTidy is designed as a local-first Chrome extension. It helps users open adjacent tabs, duplicate tabs, and manage tabs in a visual board.

## Data Collection

TabTidy does not collect personal information.

TabTidy does not send browsing history, tab titles, tab URLs, screenshots, analytics, identifiers, or any other user data to external servers.

## Local Data Storage

TabTidy stores a local thumbnail cache in `chrome.storage.local`. These thumbnails are generated only when Chrome allows the extension to capture the currently visible ordinary webpage.

The thumbnail cache may include:

- A compressed image of a recently visible page.
- The tab title at capture time.
- The tab URL at capture time.
- A timestamp used to prune old cached thumbnails.

This data remains on the user's device inside Chrome extension storage. It is not transmitted by TabTidy.

## Permissions

TabTidy uses Chrome extension permissions only for its tab management features:

- `tabs`: to query, create, duplicate, move, activate, and close tabs.
- `tabGroups`: to read tab group information and move tabs in or out of native Chrome tab groups.
- `storage`: to save local thumbnail cache entries.
- `unlimitedStorage`: to prevent the local thumbnail cache from failing when many tabs are used.
- `activeTab` and `<all_urls>`: to capture local thumbnails for currently visible ordinary webpages when Chrome permits it.

## Third Parties

TabTidy does not share data with third parties.

TabTidy does not use remote code, advertising SDKs, analytics SDKs, or tracking services.

## User Control

Users can remove TabTidy and its local extension data at any time from `chrome://extensions`.

## Contact

For questions about this privacy policy, contact the extension publisher through the Chrome Web Store listing.
