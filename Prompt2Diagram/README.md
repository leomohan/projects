# Prompt2Diagram

Prompt2Diagram is a browser-based prototype that turns structured natural-language network prompts into deterministic diagram syntax and a rendered preview.

The first release supports:

- Mermaid.js generation, validation, rendering, and SVG/PNG export
- PlantUML generation and preview via a PlantUML server endpoint
- Rule-based prompt parsing for common network components
- Editable generated syntax with re-render and validation controls
- A three-panel UI for prompt input, preview, and code editing

## Run locally

Serve the folder over a simple local web server because the app uses ES modules.

```bash
cd /Users/user/Documents/Playground
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Project structure

```text
/src
  main.js
  parser.js
  tool-adapters.js
  utils.js
index.html
styles.css
README.md
```

## Architecture

### Frontend

- `index.html` defines the three-panel layout
- `styles.css` provides the visual system and responsive layout
- `src/main.js` coordinates parsing, generation, rendering, validation, copy, and export actions

### Parsing

- `src/parser.js` contains a deterministic rule-based parser
- Prompts are normalized, known component aliases are detected in order, quantities are extracted, and a simple node/edge model is produced
- The model is then reused by each diagram engine adapter

### Diagram engines

- `src/tool-adapters.js` exposes engine-specific `generate`, `validate`, and `render` functions
- Mermaid renders locally in-browser
- PlantUML syntax is compressed into a PlantUML-compatible URL and previewed through the public PlantUML server

## Current behavior

- The parser handles common network nouns such as internet, router, firewall, switch, LAN, DMZ, VPN, server, database, wireless AP, and clients
- Repeated endpoints like clients and servers are expanded into multiple nodes
- Generated syntax is deterministic from the parsed model instead of relying on free-form AI drawing behavior

## Extension points

- Add Graphviz and Blockdiag adapters beside Mermaid and PlantUML
- Replace or supplement the browser parser with a Node.js API if server-side validation or persistence is needed
- Swap the textarea editor for Monaco without changing the adapter or parser contract

## Notes

- Mermaid rendering requires network access to load the Mermaid ESM bundle from jsDelivr in the browser
- PlantUML preview and export require access to a PlantUML server endpoint
