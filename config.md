# Configuration Reference

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:8080` | API server URL (baked in at build time) |

### Build-time vs Runtime

- `VITE_*` variables are **baked into the client bundle at build time**
- Changing `VITE_API_URL` requires rebuilding the web app
- In GitHub Actions, set `VITE_API_URL` as a repository variable (Settings > Variables > Actions)

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (defaults to http://localhost:5173)
npm run dev

# Build for production
VITE_API_URL=https://api.octopunk.io npm run build

# Preview production build
npm run preview
```

The API server must be running locally (or remotely) for authentication and subscription features to work. See [OctoPunkIO/OctoPunk](https://github.com/OctoPunkIO/OctoPunk) for API setup.
