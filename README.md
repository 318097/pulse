# Pulse Chrome Extension - New Tab

A beautiful custom new tab page for Chrome built with React.

## Features

- ⏰ Real-time clock display
- 💡 Inspirational quotes with refresh button
- 🔗 Quick shortcuts to frequently visited sites
- 🎨 Modern glassmorphism UI with gradient background
- ⚡ Fast and lightweight

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Chrome browser

### Installation

1. Install dependencies:

```bash
npm install
```

2. Build the extension:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run dev
```

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Navigate to the `dist` folder in this project and select it
5. The extension will be installed and active immediately
6. Open a new tab to see your new tab page

## Project Structure

```
extension/
├── src/
│   ├── App.jsx         # Main React component
│   ├── index.jsx       # React entry point
│   └── index.css       # App styles
├── styles/
│   └── global.css      # Global styles
├── index.html          # HTML template
├── manifest.json       # Chrome extension manifest
├── webpack.config.js   # Webpack configuration
├── package.json        # Dependencies
└── README.md           # This file
```

## Development

### File Structure Explanation

- **manifest.json**: Defines extension metadata and permissions. The `chrome_url_overrides` key replaces the default new tab page.
- **index.html**: Entry HTML file that loads the React app
- **src/App.jsx**: Main React component with time display, quotes, and shortcuts
- **webpack.config.js**: Bundler configuration to compile React and CSS

### Customization

#### Change the Theme

Edit `src/index.css` to modify:

- Gradient colors in `.app-container`
- Font styles and sizes
- Component spacing and sizing

#### Add/Modify Quick Links

Edit the `shortcuts` section in `src/App.jsx`:

```jsx
<a href="https://your-url.com" className="shortcut">
  <span>Your Link</span>
</a>
```

#### Add More Features

Modify `src/App.jsx` to add:

- Weather widget
- Todo list
- Productivity tracker
- News feed
- Custom search

## Build Commands

- `npm run build` - Create production build in `dist/` folder
- `npm run dev` - Watch mode for development
- `npm run watch` - Continuous build during development

## Troubleshooting

### Extension not loading?

1. Make sure you've run `npm run build` first
2. Check that the `dist` folder exists with bundled files
3. Try refreshing the extensions page (Ctrl+R or Cmd+R)
4. Check the console for errors (right-click extension → Details → Errors)

### Styles not showing?

1. Make sure webpack copied `styles/global.css` to `dist/`
2. Clear the cache: `npm run build` again
3. Reload the extension on chrome://extensions

## Contributing

Feel free to customize and extend this extension for your needs!

## License

MIT
