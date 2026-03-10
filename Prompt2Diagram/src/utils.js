function triggerDownload(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

function blobFromSvg(svg) {
  return new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Unable to read SVG data."));
    reader.readAsDataURL(blob);
  });
}

async function svgToPngBlob(svg) {
  const svgBlob = blobFromSvg(svg);
  const dataUrl = await readBlobAsDataUrl(svgBlob);
  const image = new Image();

  const loaded = new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  image.crossOrigin = "anonymous";
  image.src = dataUrl;
  await loaded;

  const sourceWidth = image.naturalWidth || image.width || 1200;
  const sourceHeight = image.naturalHeight || image.height || 800;
  const exportScale = 2;
  const width = Math.round(sourceWidth * exportScale);
  const height = Math.round(sourceHeight * exportScale);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  try {
    context.drawImage(image, 0, 0, width, height);
  } catch (error) {
    throw new Error("PNG export is blocked by the browser for this SVG content.");
  }

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

export async function copyText(value) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch (error) {
      // Fall back to selection-based copy when clipboard APIs are blocked.
    }
  }

  const tempArea = document.createElement("textarea");
  tempArea.value = value;
  tempArea.setAttribute("readonly", "true");
  tempArea.style.position = "fixed";
  tempArea.style.top = "-9999px";
  tempArea.style.left = "-9999px";
  document.body.append(tempArea);
  tempArea.select();
  tempArea.setSelectionRange(0, tempArea.value.length);
  const copied = document.execCommand("copy");
  tempArea.remove();

  if (!copied) {
    throw new Error("Copy failed. Use a secure localhost/HTTPS page or copy the code manually.");
  }
}

export async function downloadDiagram(rendered, format) {
  if (rendered.type === "remote") {
    const url = format === "svg" ? rendered.svgUrl : rendered.pngUrl;
    triggerDownload(url, `${rendered.fileBase}.${format}`);
    return;
  }

  if (format === "svg") {
    const blob = blobFromSvg(rendered.svg);
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, `${rendered.fileBase}.svg`);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    return;
  }

  const pngBlob = await svgToPngBlob(rendered.svg);
  if (!pngBlob) {
    throw new Error("PNG export is unavailable for the current diagram.");
  }

  const objectUrl = URL.createObjectURL(pngBlob);
  triggerDownload(objectUrl, `${rendered.fileBase}.png`);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
