# Visual Trace

Visual Trace is a browser-based traceroute visualization prototype. It turns raw hop data into a warm, readable 2D network path view with animated packet routes, hop inspection, and latency context.

## What is implemented

- React single-page UI with left input panel, central animated map, and right-side hop analytics
- Simulated traceroute execution for common demo targets such as `openai.com`, `github.com`, `google.com`, and `1.1.1.1`
- Manual traceroute parsing for pasted terminal output
- Local IP-to-geo enrichment dataset with ASN, ISP, coordinates, and notes
- Animated SVG world map with node hover/select interactions
- Hop manifest and latency graph for route analysis

## Architecture

### Frontend

- [`/Users/user/Documents/Playground/src/app.js`](/Users/user/Documents/Playground/src/app.js): top-level orchestration and app state
- [`/Users/user/Documents/Playground/src/components.js`](/Users/user/Documents/Playground/src/components.js): UI composition for controls, map, and inspector panels
- [`/Users/user/Documents/Playground/src/map-utils.js`](/Users/user/Documents/Playground/src/map-utils.js): projection math, arc generation, and distance calculation
- [`/Users/user/Documents/Playground/src/trace-service.js`](/Users/user/Documents/Playground/src/trace-service.js): simulated trace runner, manual parser, and metrics
- [`/Users/user/Documents/Playground/src/trace-data.js`](/Users/user/Documents/Playground/src/trace-data.js): curated route library and geolocation metadata

### Recommended backend extension

For a production version, replace the mock service with a Node.js API:

1. `POST /api/trace`
   Accepts hostname or IP, executes `traceroute` or `mtr`, normalizes hop output.
2. `POST /api/trace/parse`
   Accepts pasted traceroute text and returns parsed hops.
3. `POST /api/geolocate`
   Resolves hop IPs through MaxMind, IPinfo, or a private geolocation source.
4. `POST /api/asn`
   Enriches routes with ASN and ISP metadata.

The current frontend already isolates those concerns behind [`/Users/user/Documents/Playground/src/trace-service.js`](/Users/user/Documents/Playground/src/trace-service.js), so the mock implementation can be swapped for real `fetch` calls with limited UI churn.

## Run locally

Serve the directory with any static file server:

```bash
cd /Users/user/Documents/Playground
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Manual traceroute format

The parser expects lines containing:

- hop number at the start of the line
- an IPv4 address
- one or more latency values ending in `ms`

Example:

```text
1  192.168.1.1  1.1 ms  1.2 ms  1.0 ms
2  195.229.0.1  3.3 ms  3.5 ms  3.6 ms
3  80.81.192.1  84.1 ms  84.2 ms  84.5 ms
4  104.18.33.45  188.4 ms  188.3 ms  188.5 ms
```

## Future work

- Real traceroute execution from a backend probe service
- Historical route comparison and route drift detection
- Latency heatmaps and packet-loss overlays
- Export to PNG, SVG, and incident report bundles
- Multi-vantage-point comparison for operations teams
