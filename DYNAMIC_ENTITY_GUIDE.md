# Dynamic Entity System - Chrome Extension

This extension includes a powerful dynamic entity system that allows you to fetch and render HTML content from external APIs at specified intervals.

## Features

✅ **API-driven content** - Fetch HTML from any API endpoint  
✅ **Smart caching** - Cache responses in localStorage with automatic refresh  
✅ **Interval-based refresh** - Specify refresh frequency in seconds  
✅ **Error handling** - Graceful error states with retry capability  
✅ **Loading states** - Visual loading indicators during fetches  
✅ **Stale cache fallback** - Uses cached data if API fails

## How It Works

### Entity Configuration

An entity is an object that describes what and when to fetch:

```javascript
{
  _id: "unique-id",           // Unique identifier for caching
  name: "Widget Name",         // Display name (optional)
  api: "https://api.example.com/endpoint",  // API endpoint
  apiParams: {                 // URL parameters
    param1: "value1",
    param2: "value2"
  },
  refreshDuration: 300         // Refresh interval in SECONDS (5 min)
}
```

### Data Flow

1. **Initial Load**: Component checks localStorage for cached data
2. **Cache Check**: If cache exists and is fresh (within refreshDuration), use it
3. **API Call**: If cache is stale or missing, fetch from API
4. **API Response**: Expected format: `{ html, apiParams }`
   - `html` (string): HTML content to render
   - `apiParams` (object): Updated parameters (optional)
5. **Cache Update**: Response is stored with current timestamp
6. **Render**: HTML is rendered via `dangerouslySetInnerHTML`
7. **Auto-refresh**: Interval timer set to refresh at specified duration

## Usage

### Basic Setup

1. Import the `DynamicEntity` component:

```javascript
import DynamicEntity from "./components/DynamicEntity";
```

2. Define your entities:

```javascript
const entities = [
  {
    _id: "weather-widget",
    name: "Weather",
    api: "https://api.example.com/weather",
    apiParams: {
      location: "New York",
      units: "metric",
    },
    refreshDuration: 600, // Refresh every 10 minutes
  },
  {
    _id: "news-feed",
    name: "Latest News",
    api: "https://api.example.com/news",
    apiParams: {
      category: "technology",
      limit: 5,
    },
    refreshDuration: 1800, // Refresh every 30 minutes
  },
];
```

3. Render entities in your component:

```javascript
<div className="entities-grid">
  {entities.map((entity) => (
    <DynamicEntity
      key={entity._id}
      entity={entity}
      onError={handleEntityError}
    />
  ))}
</div>
```

### API Endpoint Requirements

Your API endpoint must return JSON with this structure:

```json
{
  "html": "<div>Your HTML content here</div>",
  "apiParams": {
    "param1": "updated_value",
    "timestamp": "2024-04-24T10:30:00.000Z"
  }
}
```

### Example API Implementation (Node.js/Express)

```javascript
app.get("/api/widget", (req, res) => {
  const { location } = req.query;

  // Fetch or generate your HTML content
  const html = `
    <div class="widget">
      <h3>Weather in ${location}</h3>
      <p>72°F - Partly Cloudy</p>
    </div>
  `;

  res.json({
    html,
    apiParams: {
      location,
      lastUpdatedAt: new Date().toISOString(),
    },
  });
});
```

## Hook Usage

You can also use the `useDynamicEntity` hook directly:

```javascript
import { useDynamicEntity } from "../hooks/useDynamicEntity";

function MyComponent() {
  const entity = {
    _id: "my-widget",
    api: "https://api.example.com/data",
    apiParams: {},
    refreshDuration: 300,
  };

  const { data, loading, error, refetch } = useDynamicEntity(entity);

  if (loading) return <div>Loading...</div>;
  if (error) return <button onClick={refetch}>Retry</button>;

  return <div dangerouslySetInnerHTML={{ __html: data }} />;
}
```

## Caching System

### LocalStorage Format

Cached data is stored as:

```
Key: dynamic_{entity._id}
Value: {
  "html": "<div>cached content</div>",
  "apiParams": { /* params */ },
  "lastUpdatedAt": "2024-04-24T10:30:00.000Z"
}
```

### Refresh Logic

- **Timestamp**: `lastUpdatedAt` is set when data is cached
- **Duration**: Compare `(lastUpdatedAt + refreshDuration)` with current time
- **Fresh**: If cache timestamp + duration > now, use cached data
- **Stale**: If cache is older than duration, fetch new data

Example:

```
lastUpdatedAt = 10:00 AM
refreshDuration = 600 seconds (10 minutes)
Cache expires at = 10:10 AM
Current time = 10:08 AM → Use cache
Current time = 10:11 AM → Fetch new data
```

## Error Handling

The component handles errors gracefully:

1. **API Failure**: Shows error message with retry button
2. **Fallback to Cache**: If API fails, tries to use last cached data
3. **Stale Data**: Displays both error and cached content
4. **Timeout**: 10-second timeout on API requests

## Security Considerations

⚠️ **Warning**: `dangerouslySetInnerHTML` can execute scripts in returned HTML.

### Best Practices:

1. **Trust your API**: Only use endpoints you control or fully trust
2. **Sanitize HTML**: If using untrusted sources, sanitize HTML before rendering:

```javascript
import DOMPurify from "dompurify";

// In your API handler or component:
const sanitizedHTML = DOMPurify.sanitize(apiResponse.html);
```

3. **CSP Headers**: Set Content Security Policy in manifest.json to restrict scripts
4. **Validate URLs**: Check API endpoints before adding them

## Manifest.json Permissions

For external API calls, ensure your `manifest.json` includes proper permissions:

```json
{
  "permissions": ["storage"],
  "host_permissions": ["https://*/*", "http://*/*"]
}
```

## Loading into Chrome

After configuring entities:

1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder
5. Open a new tab to test

## Troubleshooting

### Content not loading?

1. **Check API endpoint**: Verify the URL returns valid JSON with `html` field
2. **CORS issues**: Your API must allow requests from `chrome-extension://` origins
3. **Check console**: Open extension details → Errors tab for error messages

### Cache not updating?

1. **Duration too long**: Lower `refreshDuration` value for faster updates
2. **Check timestamp**: Verify API returns valid `lastUpdatedAt` timestamp
3. **Clear cache**: Open DevTools, Application → Local Storage → Clear

### HTML not rendering?

1. **Invalid HTML**: API must return valid HTML strings
2. **Security policy**: Check if CSP is blocking content
3. **Special characters**: Ensure HTML is properly escaped in JSON

## Performance Tips

- **Optimize refresh duration**: Higher durations = lower API calls
- **Batch updates**: Group related entities with same refresh duration
- **Lazy load**: Load entities only when needed
- **Cache size**: Each entity stores ~5-50KB depending on content
- **Parallel requests**: Multiple entities fetch simultaneously

## Example: Real Weather Widget

```javascript
const weatherEntity = {
  _id: "weather",
  name: "Current Weather",
  api: "https://api.openweathermap.org/data/2.5/weather",
  apiParams: {
    q: "London",
    appid: "YOUR_API_KEY",
    units: "metric",
  },
  refreshDuration: 600, // Update every 10 minutes
};

// Your backend transforms OpenWeather API to extension format:
// GET /api/weather?q=London&units=metric
// Returns: { html: "<p>London: 15°C ☁️</p>", apiParams: {...} }
```

## API Rate Limiting

Consider rate limits when setting `refreshDuration`:

- **Per-minute limits**: Set `refreshDuration` to be respectful
- **Quota tracking**: Monitor your API usage
- **Fallback caching**: Longer cache duration handles rate limit hits

Example for rate-limited API:

```javascript
{
  _id: "api-limited",
  api: "https://api.example.com/data",
  apiParams: {},
  refreshDuration: 3600  // Only refresh once per hour
}
```

## Contributing & Extending

To add new features:

1. Extend `useDynamicEntity` hook for custom logic
2. Create specialized components wrapping `DynamicEntity`
3. Add authentication for private APIs
4. Implement custom caching strategies

---

**Built with React 18** | **Chrome Extensions Manifest v3** | **Webpack 5**
