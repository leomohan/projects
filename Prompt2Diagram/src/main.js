import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
import { buildDiagramModel, describeDiagramModel, EXAMPLE_PROMPTS } from "./parser.js";
import { ENGINE_ADAPTERS, ENGINE_OPTIONS } from "./tool-adapters.js";
import { copyText, downloadDiagram } from "./utils.js";

const engineSelect = document.getElementById("engine-select");
const promptInput = document.getElementById("prompt-input");
const codeEditor = document.getElementById("code-editor");
const previewFrame = document.getElementById("preview-frame");
const previewEmpty = document.getElementById("preview-empty");
const parseSummary = document.getElementById("parse-summary");
const previewTitle = document.getElementById("preview-title");
const previewMeta = document.getElementById("preview-meta");
const statusBadge = document.getElementById("status-badge");
const validationMessage = document.getElementById("validation-message");
const exampleList = document.getElementById("example-list");
const generateButton = document.getElementById("generate-button");
const resetButton = document.getElementById("reset-button");
const renderButton = document.getElementById("render-button");
const validateButton = document.getElementById("validate-button");
const copyButton = document.getElementById("copy-button");
const downloadSvgButton = document.getElementById("download-svg-button");
const downloadPngButton = document.getElementById("download-png-button");

const initialPrompt = promptInput.value.trim();

const state = {
  rendered: null
};

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: false,
    curve: "basis"
  },
  theme: "base",
  themeVariables: {
    primaryColor: "#dff3ef",
    primaryTextColor: "#102235",
    primaryBorderColor: "#0f7b6c",
    lineColor: "#124b62",
    secondaryColor: "#edf5ff",
    tertiaryColor: "#f7fbff",
    fontFamily: "IBM Plex Sans, sans-serif"
  }
});

function setStatus(kind, message) {
  statusBadge.className = `status-badge status-${kind}`;
  statusBadge.textContent = kind;
  validationMessage.textContent = message;
}

function setPreviewMeta(engineKey) {
  const option = ENGINE_OPTIONS.find((entry) => entry.id === engineKey) ?? ENGINE_OPTIONS[0];
  previewTitle.textContent = `${option.label} Preview`;
  previewMeta.textContent = option.description;
}

function renderExamples() {
  EXAMPLE_PROMPTS.forEach((prompt) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "example-chip";
    button.textContent = prompt.label;
    button.addEventListener("click", () => {
      promptInput.value = prompt.text;
      generateFromPrompt();
    });
    exampleList.append(button);
  });
}

function updateParseSummary(model) {
  parseSummary.innerHTML = describeDiagramModel(model).map((line) => `<div>${line}</div>`).join("");
}

function showPreviewPlaceholder(message) {
  previewFrame.innerHTML = "";
  previewEmpty.textContent = message;
  previewEmpty.classList.remove("hidden");
}

async function renderCurrentCode() {
  const engineKey = engineSelect.value;
  const adapter = ENGINE_ADAPTERS[engineKey];
  const code = codeEditor.value.trim();

  try {
    const validation = await adapter.validate(code, { mermaid });
    if (!validation.valid) {
      showPreviewPlaceholder(validation.message);
      state.rendered = null;
      setStatus("error", validation.message);
      return;
    }

    const rendered = await adapter.render(code, { mermaid, container: previewFrame });
    previewEmpty.classList.add("hidden");
    state.rendered = rendered;
    setStatus("valid", validation.message);
  } catch (error) {
    showPreviewPlaceholder(error.message || "Rendering failed.");
    state.rendered = null;
    setStatus("error", error.message || "Rendering failed.");
  }
}

async function validateCurrentCode() {
  const engineKey = engineSelect.value;
  const adapter = ENGINE_ADAPTERS[engineKey];
  const code = codeEditor.value.trim();

  try {
    const validation = await adapter.validate(code, { mermaid });
    setStatus(validation.valid ? "valid" : "warning", validation.message);
  } catch (error) {
    setStatus("error", error.message || "Validation failed.");
  }
}

async function generateFromPrompt() {
  const engineKey = engineSelect.value;
  const adapter = ENGINE_ADAPTERS[engineKey];
  const model = buildDiagramModel(promptInput.value);
  codeEditor.value = adapter.generate(model);
  updateParseSummary(model);
  setPreviewMeta(engineKey);
  await renderCurrentCode();
}

async function exportCurrentDiagram(format) {
  if (!state.rendered) {
    setStatus("warning", "Generate and render a diagram before exporting.");
    return;
  }

  try {
    await downloadDiagram(state.rendered, format);
    setStatus("valid", `${format.toUpperCase()} export started.`);
  } catch (error) {
    setStatus("error", error.message || `Unable to export ${format.toUpperCase()}.`);
  }
}

engineSelect.addEventListener("change", () => {
  setPreviewMeta(engineSelect.value);
  generateFromPrompt();
});

generateButton.addEventListener("click", () => {
  generateFromPrompt();
});

resetButton.addEventListener("click", () => {
  promptInput.value = initialPrompt;
  engineSelect.value = "mermaid";
  generateFromPrompt();
});

renderButton.addEventListener("click", () => {
  renderCurrentCode();
});

validateButton.addEventListener("click", () => {
  validateCurrentCode();
});

copyButton.addEventListener("click", async () => {
  await copyText(codeEditor.value);
  setStatus("valid", "Diagram syntax copied to clipboard.");
});

downloadSvgButton.addEventListener("click", () => {
  exportCurrentDiagram("svg");
});

downloadPngButton.addEventListener("click", () => {
  exportCurrentDiagram("png");
});

renderExamples();
generateFromPrompt();
