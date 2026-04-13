# Markdown to DOCX Studio

A small local web application that converts Markdown into `.docx` files using free browser-side libraries.

## Stack

- [Marked](https://marked.js.org/) for Markdown parsing
- [docx](https://www.npmjs.com/package/docx) for Word document generation
- Plain HTML, CSS, and JavaScript for a lightweight local setup

## Features

- Paste Markdown into a local editor
- Import `.md`, `.markdown`, or `.txt` files
- Live HTML preview
- Export to `.docx`
- Add file name, title, author, and subject metadata

## Run locally

Serve the folder with any static server:

```bash
cd /Users/user/Documents/Playground/markdown-docx-webapp
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Notes

- The app loads free libraries from public CDNs, so the browser needs internet access the first time it loads.
- The exported DOCX supports common Markdown elements like headings, paragraphs, lists, blockquotes, code blocks, links, and tables.
