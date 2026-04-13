const {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} = window.docx;

const markdownInput = document.getElementById("markdownInput");
const preview = document.getElementById("preview");
const status = document.getElementById("status");
const fileNameInput = document.getElementById("fileName");
const docTitleInput = document.getElementById("docTitle");
const docAuthorInput = document.getElementById("docAuthor");
const docSubjectInput = document.getElementById("docSubject");
const exportButton = document.getElementById("exportDocx");
const sampleButton = document.getElementById("loadSample");
const fileInput = document.getElementById("markdownFile");

const sampleMarkdown = `# Project Brief

Turn Markdown into a Microsoft Word document right from a local browser app.

## Highlights

- No paid APIs
- Free open source libraries
- Runs as a static site

> This preview is HTML, while the export creates a real \`.docx\` file.

## Example Table

| Feature | Status |
| --- | --- |
| Headings | Ready |
| Lists | Ready |
| Tables | Ready |
| Code blocks | Ready |

## Code Sample

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Links

Visit [OpenAI](https://openai.com) or your internal project wiki.
`;

marked.setOptions({
  breaks: true,
  gfm: true,
});

function setStatus(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? "#9f2f2f" : "";
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function inlineTokensToText(tokens = []) {
  return tokens
    .map((token) => {
      if (token.type === "br") {
        return "\n";
      }

      if (typeof token.text === "string") {
        return token.text;
      }

      if (token.tokens) {
        return inlineTokensToText(token.tokens);
      }

      if (typeof token.raw === "string") {
        return token.raw.replace(/<[^>]+>/g, "");
      }

      return "";
    })
    .join("");
}

function inlineTokensToRuns(tokens = [], styles = {}) {
  const runs = [];

  tokens.forEach((token) => {
    if (token.type === "text") {
      if (token.tokens?.length) {
        runs.push(...inlineTokensToRuns(token.tokens, styles));
      } else {
        runs.push(new TextRun({ text: token.text, ...styles }));
      }
      return;
    }

    if (token.type === "strong") {
      runs.push(...inlineTokensToRuns(token.tokens, { ...styles, bold: true }));
      return;
    }

    if (token.type === "em") {
      runs.push(...inlineTokensToRuns(token.tokens, { ...styles, italics: true }));
      return;
    }

    if (token.type === "codespan") {
      runs.push(
        new TextRun({
          text: token.text,
          font: "Courier New",
          shading: { fill: "EEE7DA" },
          ...styles,
        }),
      );
      return;
    }

    if (token.type === "br") {
      runs.push(new TextRun({ text: "", break: 1, ...styles }));
      return;
    }

    if (token.type === "link") {
      const linkText = inlineTokensToText(token.tokens) || token.href;
      runs.push(
        new ExternalHyperlink({
          link: token.href,
          children: [
            new TextRun({
              text: linkText,
              style: "Hyperlink",
              ...styles,
            }),
          ],
        }),
      );
      return;
    }

    if (token.type === "html") {
      const htmlText = token.raw.replace(/<[^>]+>/g, "");
      if (htmlText) {
        runs.push(new TextRun({ text: htmlText, ...styles }));
      }
      return;
    }

    if (token.tokens) {
      runs.push(...inlineTokensToRuns(token.tokens, styles));
    }
  });

  return runs.length > 0 ? runs : [new TextRun({ text: "", ...styles })];
}

function headingLevelFromDepth(depth) {
  return {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  }[depth] ?? HeadingLevel.HEADING_2;
}

function paragraphFromInlineTokens(tokens, options = {}) {
  return new Paragraph({
    children: inlineTokensToRuns(tokens),
    ...options,
  });
}

function tableFromToken(token) {
  const rows = [];
  const headers = token.header ?? [];
  const bodyRows = token.rows ?? [];

  if (headers.length > 0) {
    rows.push(
      new TableRow({
        tableHeader: true,
        children: headers.map((cell) =>
          new TableCell({
            children: [
              new Paragraph({
                children: inlineTokensToRuns(cell.tokens),
              }),
            ],
          }),
        ),
      }),
    );
  }

  bodyRows.forEach((row) => {
    rows.push(
      new TableRow({
        children: row.map((cell) =>
          new TableCell({
            children: [
              new Paragraph({
                children: inlineTokensToRuns(cell.tokens),
              }),
            ],
          }),
        ),
      }),
    );
  });

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}

function tokensToDocxChildren(tokens) {
  const children = [];

  tokens.forEach((token) => {
    if (token.type === "space") {
      return;
    }

    if (token.type === "heading") {
      children.push(
        paragraphFromInlineTokens(token.tokens, {
          heading: headingLevelFromDepth(token.depth),
          spacing: { before: 240, after: 120 },
        }),
      );
      return;
    }

    if (token.type === "paragraph") {
      children.push(
        paragraphFromInlineTokens(token.tokens, {
          spacing: { after: 160 },
        }),
      );
      return;
    }

    if (token.type === "blockquote") {
      token.tokens.forEach((nestedToken) => {
        if (nestedToken.tokens) {
          children.push(
            paragraphFromInlineTokens(nestedToken.tokens, {
              indent: { left: 520 },
              border: {
                left: { color: "C96F3F", space: 10, style: BorderStyle.SINGLE, size: 12 },
              },
              spacing: { after: 140 },
            }),
          );
        }
      });
      return;
    }

    if (token.type === "list") {
      token.items.forEach((item) => {
        const itemContent = item.tokens?.length
          ? item.tokens.flatMap((entry) =>
              entry.tokens?.length ? inlineTokensToRuns(entry.tokens) : inlineTokensToRuns([entry]),
            )
          : [new TextRun({ text: "" })];

        children.push(
          new Paragraph({
            children: [new TextRun({ text: token.ordered ? `${item.index}. ` : "• " }), ...itemContent],
            indent: { left: 360, hanging: 220 },
            spacing: { after: 90 },
          }),
        );
      });
      return;
    }

    if (token.type === "code") {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: token.text,
              font: "Courier New",
            }),
          ],
          spacing: { after: 180 },
          shading: { fill: "1D2B28" },
          border: {
            top: { color: "1D2B28", size: 6, style: BorderStyle.SINGLE },
            bottom: { color: "1D2B28", size: 6, style: BorderStyle.SINGLE },
            left: { color: "1D2B28", size: 6, style: BorderStyle.SINGLE },
            right: { color: "1D2B28", size: 6, style: BorderStyle.SINGLE },
          },
        }),
      );
      return;
    }

    if (token.type === "hr") {
      children.push(
        new Paragraph({
          border: {
            bottom: { color: "C7CEC8", size: 6, style: BorderStyle.SINGLE },
          },
          spacing: { after: 180 },
        }),
      );
      return;
    }

    if (token.type === "table") {
      children.push(tableFromToken(token));
      children.push(new Paragraph({}));
      return;
    }

    if (token.type === "html") {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: token.raw.replace(/<[^>]+>/g, "") })],
          spacing: { after: 160 },
        }),
      );
      return;
    }
  });

  return children;
}

function renderPreview() {
  const markdown = markdownInput.value.trim();
  preview.innerHTML = markdown ? marked.parse(markdown) : `<p>${escapeHtml("Start typing Markdown to preview it here.")}</p>`;
}

async function exportDocx() {
  const markdown = markdownInput.value.trim();

  if (!markdown) {
    setStatus("Add some Markdown before exporting.", true);
    return;
  }

  exportButton.disabled = true;
  setStatus("Building DOCX file...");

  try {
    const tokens = marked.lexer(markdown);
    const fileName = (fileNameInput.value.trim() || "markdown-export").replace(/\.docx$/i, "");
    const title = docTitleInput.value.trim() || "Markdown Export";
    const author = docAuthorInput.value.trim() || "Markdown to DOCX Studio";
    const subject = docSubjectInput.value.trim() || "Markdown conversion";

    const wordDocument = new Document({
      creator: author,
      title,
      subject,
      description: "Generated from Markdown using a local web app.",
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            run: {
              size: 24,
              color: "1F241F",
              font: "Aptos",
            },
            paragraph: {
              spacing: {
                line: 360,
              },
            },
          },
        ],
      },
      sections: [
        {
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 180 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `Author: ${author}` })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `Subject: ${subject}` })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 280 },
            }),
            new Paragraph({
              children: [new PageBreak()],
            }),
            ...tokensToDocxChildren(tokens),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(wordDocument);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.docx`;
    link.click();
    URL.revokeObjectURL(url);

    setStatus(`Exported ${fileName}.docx successfully.`);
  } catch (error) {
    console.error(error);
    setStatus(`Export failed: ${error.message}`, true);
  } finally {
    exportButton.disabled = false;
  }
}

sampleButton.addEventListener("click", () => {
  markdownInput.value = sampleMarkdown;
  renderPreview();
  setStatus("Sample Markdown loaded.");
});

fileInput.addEventListener("change", async (event) => {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    markdownInput.value = text;
    if (!fileNameInput.value || fileNameInput.value === "markdown-export") {
      fileNameInput.value = file.name.replace(/\.[^.]+$/, "");
    }
    if (!docTitleInput.value || docTitleInput.value === "Markdown Export") {
      docTitleInput.value = file.name.replace(/\.[^.]+$/, "");
    }
    renderPreview();
    setStatus(`Loaded ${file.name}.`);
    fileInput.value = "";
  } catch (error) {
    setStatus(`Could not read ${file.name}.`, true);
  }
});

markdownInput.addEventListener("input", renderPreview);
exportButton.addEventListener("click", exportDocx);

markdownInput.value = sampleMarkdown;
renderPreview();
