# MyMind

`MyMind` is a lightweight browser-based mind-mapping app inspired by radial tools such as Mindly.

## Files

- `index.html`: app shell and UI structure
- `styles.css`: visual system, layout, and responsive behavior
- `app.js`: recursive radial SVG rendering, branch collapsing, export, and local persistence

## Run

Open [index.html](/Users/user/Documents/Playground/MyMind/index.html) directly in a browser, or serve the folder with any static server.

## Usage

- Click a node to inspect and edit it.
- Use the small `+` or `−` badge on any node with children to collapse or expand that branch.
- Use `Collapse all` to reduce the map to the center node, and `Expand all` to restore it.
- Add children from the right panel.
- Export the current map as `SVG`, `PNG`, or `PDF`.
- The map autosaves to `localStorage`.
