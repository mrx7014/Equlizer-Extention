# Equalizer Extension

![Equalizer Extension banner](assets/banner.png)

A lightweight Chrome/Chromium extension that adds real-time echo, reverb, and bass controls to YouTube videos.

## Features

- Real-time echo and reverb effects using the Web Audio API.
- Adjustable dry/original sound level.
- Bass boost with configurable frequency.
- Reverb mix, decay, and damping controls.
- Echo mix, delay time, and feedback controls.
- Presets for Daily, Music, Mosque, Big, Hall, Cave, Slapback, Space, and Bass Boost.
- Settings synced with `chrome.storage.sync`.
- Designed for YouTube's single-page navigation.
- No analytics, external requests, or user data collection.

## Installation

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome, or the equivalent extensions page in Chromium-based browsers.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository folder.
6. Open a YouTube video, play it, and open the extension popup.

## Project structure

```text
.
├── assets/
│   ├── banner.png
│   └── logo.png
├── content.js       # Web Audio processing on YouTube
├── manifest.json    # Manifest V3 configuration
├── popup.html       # Extension popup UI
├── popup.js         # Popup controls and presets
└── README.md
```

## How it works

The extension connects each YouTube video element to a Web Audio graph:

```text
Video source → Dry / Echo / Reverb → Master mix → Bass filter → Speakers
```

The original signal remains available through the dry control, while the wet effects can be blended independently. Audio parameters are smoothly automated to reduce clicks when controls change.

## Permissions

The extension requests only the `storage` permission to save user preferences. It runs on YouTube pages and does not transmit browsing or audio data.

## Development

The project has no build step or dependency installation requirement. Validate the JavaScript files with:

```bash
node --check content.js
node --check popup.js
```

## Repository name

The GitHub repository is named **Equlizer Externtion** to match the requested project name.

## License

MIT
