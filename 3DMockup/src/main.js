import { DEFAULT_COVER, OUTPUT_PRESETS } from "./constants.js";
import { MOCKUP_TEMPLATES } from "./mockups.js";
import { BookMockupRenderer } from "./renderer.js";

const dropzone = document.getElementById("dropzone");
const coverInput = document.getElementById("cover-input");
const coverThumb = document.getElementById("cover-thumb");
const bookTitleInput = document.getElementById("book-title-input");
const authorNameInput = document.getElementById("author-name-input");
const templateSelect = document.getElementById("template-select");
const backgroundSelect = document.getElementById("background-select");
const sizeSelect = document.getElementById("size-select");
const shadowRange = document.getElementById("shadow-range");
const tiltRange = document.getElementById("tilt-range");
const exportButton = document.getElementById("export-button");
const templateDescription = document.getElementById("template-description");
const previewTitle = document.getElementById("preview-title");
const previewMeta = document.getElementById("preview-meta");
const canvas = document.getElementById("preview-canvas");

const renderer = new BookMockupRenderer(canvas);

function populateTemplateOptions() {
  templateSelect.innerHTML = "";
  MOCKUP_TEMPLATES.forEach((template) => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.label;
    templateSelect.append(option);
  });
}

function syncTemplateMeta(templateId) {
  const template = MOCKUP_TEMPLATES.find((entry) => entry.id === templateId) ?? MOCKUP_TEMPLATES[0];
  const preset = OUTPUT_PRESETS[sizeSelect.value];
  previewTitle.textContent = template.label;
  templateDescription.textContent = template.description;
  previewMeta.textContent = `${preset.width} x ${preset.height} PNG export`;
}

function showCoverPreview(src) {
  coverThumb.src = src;
  coverThumb.classList.remove("hidden");
}

function loadImage(file) {
  if (!file || !file.type.match(/^image\/(png|jpeg|jpg)$/)) {
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    renderer.setImage(image);
    showCoverPreview(objectUrl);
    URL.revokeObjectURL(objectUrl);
  };
  image.src = objectUrl;
}

function triggerDownload(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

populateTemplateOptions();
renderer.setSpineText(bookTitleInput.value, authorNameInput.value);
coverThumb.src = DEFAULT_COVER;
coverThumb.classList.remove("hidden");
syncTemplateMeta(templateSelect.value || "standing");

dropzone.addEventListener("click", () => coverInput.click());

coverInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  loadImage(file);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragging");
  });
});

dropzone.addEventListener("drop", (event) => {
  const [file] = event.dataTransfer.files;
  loadImage(file);
});

templateSelect.addEventListener("change", () => {
  renderer.setTemplate(templateSelect.value);
  syncTemplateMeta(templateSelect.value);
});

bookTitleInput.addEventListener("input", () => {
  renderer.setSpineText(bookTitleInput.value, authorNameInput.value);
});

authorNameInput.addEventListener("input", () => {
  renderer.setSpineText(bookTitleInput.value, authorNameInput.value);
});

backgroundSelect.addEventListener("change", () => {
  renderer.setBackground(backgroundSelect.value);
});

sizeSelect.addEventListener("change", () => {
  renderer.setSize(sizeSelect.value);
  syncTemplateMeta(templateSelect.value);
});

shadowRange.addEventListener("input", () => {
  renderer.setShadowStrength(Number(shadowRange.value));
});

tiltRange.addEventListener("input", () => {
  renderer.setTilt(Number(tiltRange.value));
});

exportButton.addEventListener("click", () => {
  const result = renderer.exportPng();
  triggerDownload(result.dataUrl, result.filename);
});

window.addEventListener("resize", () => renderer.resizeToDisplay());
