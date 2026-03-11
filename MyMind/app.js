const STORAGE_KEY = "mymind-map-v2";
const SVG_NS = "http://www.w3.org/2000/svg";
const EXPORT_SCALE = 2;

const palette = [
  { value: "sun", label: "Sunrise", fill: "#f2b05e", text: "#2b1808" },
  { value: "leaf", label: "Canopy", fill: "#73b798", text: "#10251b" },
  { value: "sky", label: "Sky", fill: "#8fb6e8", text: "#102033" },
  { value: "berry", label: "Berry", fill: "#d890b8", text: "#2f1021" },
  { value: "stone", label: "Stone", fill: "#d9cbb8", text: "#312214" },
  { value: "night", label: "Night", fill: "#17354c", text: "#f6efe6" }
];

const defaultMap = {
  rootId: "root",
  nextId: 9,
  nodes: {
    root: {
      id: "root",
      title: "My Universe",
      note: "A focused map for the ideas you want to grow.",
      color: "sun",
      collapsed: false,
      children: ["1", "2", "3", "4"]
    },
    "1": {
      id: "1",
      title: "Career",
      note: "Projects, reputation, and long-term direction.",
      color: "leaf",
      collapsed: false,
      children: ["5", "6"]
    },
    "2": {
      id: "2",
      title: "Health",
      note: "Training, nutrition, and energy systems.",
      color: "sky",
      collapsed: false,
      children: []
    },
    "3": {
      id: "3",
      title: "Relationships",
      note: "Family rituals, friendships, and people to prioritize.",
      color: "berry",
      collapsed: false,
      children: ["7"]
    },
    "4": {
      id: "4",
      title: "Learning",
      note: "Books, experiments, and ideas worth exploring.",
      color: "night",
      collapsed: false,
      children: ["8"]
    },
    "5": {
      id: "5",
      title: "Launch MyMind",
      note: "Prototype a calmer, clearer way to map ideas.",
      color: "sun",
      collapsed: false,
      children: []
    },
    "6": {
      id: "6",
      title: "Weekly review",
      note: "Decide what compounds and what distracts.",
      color: "stone",
      collapsed: false,
      children: []
    },
    "7": {
      id: "7",
      title: "Shared trips",
      note: "Places worth planning together.",
      color: "leaf",
      collapsed: false,
      children: []
    },
    "8": {
      id: "8",
      title: "Design systems",
      note: "Study products with strong mental models.",
      color: "sky",
      collapsed: false,
      children: []
    }
  }
};

const state = {
  map: loadMap(),
  selectedId: null,
  layout: null,
  viewport: {
    scale: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    dragPointerId: null,
    dragStartX: 0,
    dragStartY: 0,
    dragOriginX: 0,
    dragOriginY: 0
  }
};

const elements = {
  canvas: document.querySelector("#map-canvas"),
  breadcrumbs: document.querySelector("#breadcrumbs"),
  focusTitle: document.querySelector("#focus-title"),
  inspectorTitle: document.querySelector("#inspector-title"),
  inspectorNote: document.querySelector("#inspector-note"),
  inspectorCount: document.querySelector("#inspector-count"),
  inspectorDepth: document.querySelector("#inspector-depth"),
  nodeForm: document.querySelector("#node-form"),
  childForm: document.querySelector("#child-form"),
  childFormTitle: document.querySelector("#child-form-title"),
  childFormCopy: document.querySelector("#child-form-copy"),
  colorPalette: document.querySelector("#node-color-palette"),
  nodeTitle: document.querySelector("#node-title"),
  nodeNote: document.querySelector("#node-note"),
  nodeColor: document.querySelector("#node-color"),
  childTitle: document.querySelector("#child-title"),
  childNote: document.querySelector("#child-note"),
  deleteNode: document.querySelector("#delete-node"),
  resetDemo: document.querySelector("#reset-demo"),
  focusParent: document.querySelector("#focus-parent"),
  collapseAll: document.querySelector("#collapse-all"),
  expandAll: document.querySelector("#expand-all"),
  resetView: document.querySelector("#reset-view"),
  exportSvg: document.querySelector("#export-svg"),
  exportPng: document.querySelector("#export-png"),
  exportPdf: document.querySelector("#export-pdf")
};

bootstrap();

function bootstrap() {
  ensureMapShape(state.map);
  state.selectedId = state.map.rootId;

  buildPalette();

  elements.nodeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyNodeDraft();
  });
  elements.childForm.addEventListener("submit", handleChildCreate);
  elements.deleteNode.addEventListener("click", handleDeleteNode);
  elements.resetDemo.addEventListener("click", resetDemo);
  elements.focusParent.addEventListener("click", selectParent);
  elements.collapseAll.addEventListener("click", collapseAllToCenter);
  elements.expandAll.addEventListener("click", expandAll);
  elements.resetView.addEventListener("click", resetViewport);
  elements.exportSvg.addEventListener("click", () => exportCurrentView("svg"));
  elements.exportPng.addEventListener("click", () => exportCurrentView("png"));
  elements.exportPdf.addEventListener("click", () => exportCurrentView("pdf"));
  elements.nodeTitle.addEventListener("input", handleNodeDraftChange);
  elements.nodeNote.addEventListener("input", handleNodeDraftChange);

  render();
}

function buildPalette() {
  const chips = palette.map((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-chip";
    button.title = entry.label;
    button.dataset.value = entry.value;
    button.style.background = entry.fill;
    button.addEventListener("click", () => {
      elements.nodeColor.value = entry.value;
      applyNodeDraft();
    });
    return button;
  });

  elements.colorPalette.replaceChildren(...chips);
}

function handleNodeDraftChange() {
  applyNodeDraft();
}

function applyNodeDraft() {
  const node = getSelectedNode();
  if (!node) return;

  node.title = elements.nodeTitle.value.trim() || "Untitled";
  node.note = elements.nodeNote.value.trim();
  node.color = elements.nodeColor.value || node.color || palette[0].value;
  persist();
  render();
}

function handleChildCreate(event) {
  event.preventDefault();
  const parentNode = getSelectedNode();
  const title = elements.childTitle.value.trim();
  if (!parentNode || !title) return;

  const id = String(state.map.nextId++);
  state.map.nodes[id] = {
    id,
    title,
    note: elements.childNote.value.trim(),
    color: "stone",
    collapsed: false,
    children: []
  };
  parentNode.collapsed = false;
  parentNode.children.push(id);
  state.selectedId = id;
  persist();
  elements.childForm.reset();
  render();
}

function handleDeleteNode() {
  const node = getSelectedNode();
  if (!node || node.id === state.map.rootId) return;

  const parentId = findParentId(node.id);
  if (!parentId) return;

  removeBranch(node.id);
  const parent = state.map.nodes[parentId];
  parent.children = parent.children.filter((childId) => childId !== node.id);
  state.selectedId = parentId;
  persist();
  render();
}

function resetDemo() {
  state.map = cloneMap(defaultMap);
  state.selectedId = state.map.rootId;
  persist();
  render();
}

function selectParent() {
  const parentId = findParentId(state.selectedId);
  if (!parentId) return;
  state.selectedId = parentId;
  render();
}

function collapseAllToCenter() {
  Object.values(state.map.nodes).forEach((node) => {
    node.collapsed = node.id !== state.map.rootId && node.children.length > 0;
  });
  state.selectedId = state.map.rootId;
  persist();
  render();
}

function expandAll() {
  Object.values(state.map.nodes).forEach((node) => {
    node.collapsed = false;
  });
  persist();
  render();
}

function toggleNodeCollapse(nodeId) {
  const node = state.map.nodes[nodeId];
  if (!node || !node.children.length) return;
  node.collapsed = !node.collapsed;
  persist();
  render();
}

function render() {
  state.layout = computeLayout();
  renderBreadcrumbs();
  renderInspector();
  renderMap();
}

function renderBreadcrumbs() {
  const trail = getTrail(state.selectedId);
  elements.breadcrumbs.replaceChildren(
    ...trail.map((id) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "breadcrumb-button";
      button.textContent = state.map.nodes[id].title;
      button.addEventListener("click", () => {
        state.selectedId = id;
        render();
      });
      return button;
    })
  );
}

function renderInspector() {
  const node = getSelectedNode();
  const depth = getTrail(node.id).length - 1;

  elements.focusTitle.textContent = "Radial map";
  elements.inspectorTitle.textContent = node.title;
  elements.inspectorNote.textContent = node.note || "No note yet. Use the form below to add context.";
  elements.inspectorCount.textContent = String(node.children.length);
  elements.inspectorDepth.textContent = String(depth);
  elements.childFormTitle.textContent = `Add branch to ${node.title}`;
  elements.childFormCopy.textContent = `New branches will appear around "${node.title}" unless that branch is collapsed.`;
  elements.nodeTitle.value = node.title;
  elements.nodeNote.value = node.note;
  elements.nodeColor.value = node.color;
  syncPalette(node.color);
  elements.deleteNode.disabled = node.id === state.map.rootId;
}

function renderMap() {
  const { width, height, positions, visibleNodes, maxDepth } = state.layout;
  elements.canvas.innerHTML = "";
  elements.canvas.style.minHeight = `${Math.max(620, height)}px`;
  elements.canvas.classList.toggle("is-dragging", state.viewport.isDragging);

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("id", "mindmap-svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("xmlns", SVG_NS);
  attachViewportHandlers(svg, width, height);

  const scene = document.createElementNS(SVG_NS, "g");
  scene.setAttribute("id", "mindmap-scene");
  scene.setAttribute(
    "transform",
    `translate(${state.viewport.panX} ${state.viewport.panY}) scale(${state.viewport.scale})`
  );

  const centerX = width / 2;
  const centerY = height / 2;

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const ring = document.createElementNS(SVG_NS, "circle");
    ring.setAttribute("cx", centerX);
    ring.setAttribute("cy", centerY);
    ring.setAttribute("r", String(depth * 132));
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "rgba(67, 48, 31, 0.12)");
    ring.setAttribute("stroke-dasharray", "7 12");
    scene.append(ring);
  }

  visibleNodes.forEach((node) => {
    const point = positions[node.id];
    if (!point.parentId) return;

    const parentPoint = positions[point.parentId];
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", String(parentPoint.x));
    line.setAttribute("y1", String(parentPoint.y));
    line.setAttribute("x2", String(point.x));
    line.setAttribute("y2", String(point.y));
    line.setAttribute("stroke", "rgba(31, 22, 13, 0.18)");
    line.setAttribute("stroke-width", "2");
    scene.append(line);
  });

  visibleNodes.forEach((node) => {
    const point = positions[node.id];
    scene.append(buildNodeGroup(node, point));
  });

  svg.append(scene);
  elements.canvas.append(svg);
}

function attachViewportHandlers(svg, width, height) {
  svg.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.08 : 0.92;
      zoomAtPoint(event.clientX, event.clientY, factor, svg);
    },
    { passive: false }
  );

  svg.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest('[data-interactive="true"]')) return;
    state.viewport.isDragging = true;
    state.viewport.dragPointerId = event.pointerId;
    state.viewport.dragStartX = event.clientX;
    state.viewport.dragStartY = event.clientY;
    state.viewport.dragOriginX = state.viewport.panX;
    state.viewport.dragOriginY = state.viewport.panY;
    elements.canvas.classList.add("is-dragging");
    svg.setPointerCapture(event.pointerId);
  });

  svg.addEventListener("pointermove", (event) => {
    if (!state.viewport.isDragging || state.viewport.dragPointerId !== event.pointerId) return;
    state.viewport.panX = state.viewport.dragOriginX + (event.clientX - state.viewport.dragStartX);
    state.viewport.panY = state.viewport.dragOriginY + (event.clientY - state.viewport.dragStartY);
    updateSceneTransform();
  });

  const endDrag = (event) => {
    if (state.viewport.dragPointerId !== event.pointerId) return;
    state.viewport.isDragging = false;
    state.viewport.dragPointerId = null;
    elements.canvas.classList.remove("is-dragging");
    if (svg.hasPointerCapture(event.pointerId)) {
      svg.releasePointerCapture(event.pointerId);
    }
  };

  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);
  svg.addEventListener("pointerleave", (event) => {
    if (!state.viewport.isDragging) return;
    endDrag(event);
  });
}

function zoomAtPoint(clientX, clientY, factor, svg) {
  const nextScale = clamp(state.viewport.scale * factor, 0.4, 2.4);
  const rect = svg.getBoundingClientRect();
  const pointX = clientX - rect.left;
  const pointY = clientY - rect.top;
  const worldX = (pointX - state.viewport.panX) / state.viewport.scale;
  const worldY = (pointY - state.viewport.panY) / state.viewport.scale;

  state.viewport.scale = nextScale;
  state.viewport.panX = pointX - worldX * nextScale;
  state.viewport.panY = pointY - worldY * nextScale;
  updateSceneTransform();
}

function updateSceneTransform() {
  const scene = document.querySelector("#mindmap-scene");
  if (!scene) return;
  scene.setAttribute(
    "transform",
    `translate(${state.viewport.panX} ${state.viewport.panY}) scale(${state.viewport.scale})`
  );
}

function resetViewport() {
  state.viewport.scale = 1;
  state.viewport.panX = 0;
  state.viewport.panY = 0;
  updateSceneTransform();
}

function buildNodeGroup(node, point) {
  const style = getColor(node.color);
  const group = document.createElementNS(SVG_NS, "g");
  group.setAttribute("class", `svg-node${node.id === state.selectedId ? " active" : ""}`);
  group.setAttribute("transform", `translate(${point.x}, ${point.y})`);

  const circle = document.createElementNS(SVG_NS, "circle");
  circle.setAttribute("data-interactive", "true");
  circle.setAttribute("r", String(point.radius));
  circle.setAttribute("fill", style.fill);
  circle.setAttribute("stroke", node.id === state.selectedId ? "rgba(21, 111, 95, 0.6)" : "rgba(26, 18, 10, 0.12)");
  circle.setAttribute("stroke-width", node.id === state.selectedId ? "4" : "2");
  circle.setAttribute("cursor", "pointer");
  circle.addEventListener("click", () => {
    state.selectedId = node.id;
    render();
  });
  group.append(circle);

  const title = document.createElementNS(SVG_NS, "text");
  title.setAttribute("text-anchor", "middle");
  title.setAttribute("fill", style.text);
  title.setAttribute("font-family", "Space Grotesk, sans-serif");
  title.setAttribute("font-size", point.radius > 50 ? "15" : "13");
  title.setAttribute("font-weight", "700");
  title.setAttribute("pointer-events", "none");

  splitTitle(node.title).forEach((line, index, lines) => {
    const tspan = document.createElementNS(SVG_NS, "tspan");
    tspan.setAttribute("x", "0");
    tspan.setAttribute("dy", index === 0 ? `${lines.length === 1 ? 5 : -2}` : "16");
    tspan.textContent = line;
    title.append(tspan);
  });
  group.append(title);

  if (node.children.length > 0) {
    const toggle = document.createElementNS(SVG_NS, "g");
    toggle.setAttribute("data-interactive", "true");
    toggle.setAttribute("transform", `translate(${point.radius * 0.68}, ${-point.radius * 0.68})`);
    toggle.setAttribute("cursor", "pointer");
    toggle.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleNodeCollapse(node.id);
    });

    const badge = document.createElementNS(SVG_NS, "circle");
    badge.setAttribute("r", "14");
    badge.setAttribute("fill", "#fff8ef");
    badge.setAttribute("stroke", "rgba(26, 18, 10, 0.12)");
    badge.setAttribute("stroke-width", "2");
    toggle.append(badge);

    const mark = document.createElementNS(SVG_NS, "text");
    mark.setAttribute("text-anchor", "middle");
    mark.setAttribute("dominant-baseline", "middle");
    mark.setAttribute("font-family", "Space Grotesk, sans-serif");
    mark.setAttribute("font-size", "18");
    mark.setAttribute("font-weight", "700");
    mark.setAttribute("fill", "#21160d");
    mark.textContent = node.collapsed ? "+" : "−";
    toggle.append(mark);

    group.append(toggle);
  }

  return group;
}

function computeLayout() {
  const root = state.map.nodes[state.map.rootId];
  const positions = {};
  const visibleNodes = [];
  const leaves = countLeaves(root.id);
  const maxDepth = getVisibleDepth(root.id, 0);
  const padding = 180;
  const width = Math.max(900, padding * 2 + maxDepth * 264);
  const height = Math.max(900, padding * 2 + maxDepth * 264);
  const centerX = width / 2;
  const centerY = height / 2;

  assignPosition(root.id, 0, 0, Math.PI * 2, null);

  return { width, height, positions, visibleNodes, maxDepth, leaves };

  function assignPosition(nodeId, depth, startAngle, endAngle, parentId) {
    const node = state.map.nodes[nodeId];
    const angle = depth === 0 ? -Math.PI / 2 : (startAngle + endAngle) / 2;
    const radius = depth === 0 ? 62 : Math.max(42, 58 - depth * 4);
    const orbit = depth * 132;
    const point = {
      x: centerX + Math.cos(angle) * orbit,
      y: centerY + Math.sin(angle) * orbit,
      depth,
      radius,
      parentId
    };

    positions[nodeId] = point;
    visibleNodes.push(node);

    if (node.collapsed || node.children.length === 0) {
      return;
    }

    const span = endAngle - startAngle;
    let cursor = startAngle;
    const totalLeaves = node.children.reduce((sum, childId) => sum + countLeaves(childId), 0);

    node.children.forEach((childId) => {
      const share = (countLeaves(childId) / totalLeaves) * span;
      const childStart = cursor;
      const childEnd = cursor + share;
      assignPosition(childId, depth + 1, childStart, childEnd, nodeId);
      cursor += share;
    });
  }
}

function countLeaves(nodeId) {
  const node = state.map.nodes[nodeId];
  if (!node || node.collapsed || node.children.length === 0) {
    return 1;
  }

  return node.children.reduce((sum, childId) => sum + countLeaves(childId), 0);
}

function getVisibleDepth(nodeId, depth) {
  const node = state.map.nodes[nodeId];
  if (!node || node.collapsed || node.children.length === 0) {
    return depth;
  }

  return Math.max(...node.children.map((childId) => getVisibleDepth(childId, depth + 1)));
}

async function exportCurrentView(kind) {
  const svg = document.querySelector("#mindmap-svg");
  if (!svg) return;

  if (kind === "svg") {
    const blob = new Blob([serializeSvg(svg)], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, "mymind-map.svg");
    return;
  }

  const canvas = await renderSvgToCanvas(svg, EXPORT_SCALE);
  if (kind === "png") {
    const blob = await canvasToBlob(canvas, "image/png");
    downloadBlob(blob, "mymind-map.png");
    return;
  }

  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const pdfBlob = buildPdfFromJpeg(jpegDataUrl, canvas.width, canvas.height);
  downloadBlob(pdfBlob, "mymind-map.pdf");
}

function serializeSvg(svg) {
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", SVG_NS);
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  return new XMLSerializer().serializeToString(clone);
}

function renderSvgToCanvas(svg, scale) {
  return new Promise((resolve, reject) => {
    const markup = serializeSvg(svg);
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const viewBox = svg.viewBox.baseVal;
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewBox.width * scale);
      canvas.height = Math.ceil(viewBox.height * scale);
      const context = canvas.getContext("2d");
      context.fillStyle = "#f8f2e7";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to render SVG for export."));
    };

    image.src = url;
  });
}

function canvasToBlob(canvas, mimeType) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType);
  });
}

function buildPdfFromJpeg(dataUrl, width, height) {
  const bytes = dataUrlToBytes(dataUrl);
  const textEncoder = new TextEncoder();
  const objects = [];

  const imageObject =
    `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB ` +
    `/BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`;

  const contentStream = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`;

  objects.push(textEncoder.encode("<< /Type /Catalog /Pages 2 0 R >>"));
  objects.push(textEncoder.encode("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));
  objects.push(
    textEncoder.encode(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>`
    )
  );
  objects.push(joinBytes(textEncoder.encode(imageObject), bytes, textEncoder.encode("\nendstream")));
  objects.push(
    joinBytes(
      textEncoder.encode(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream`)
    )
  );

  const header = textEncoder.encode("%PDF-1.3\n");
  const bodyParts = [header];
  const offsets = [0];
  let position = header.length;

  objects.forEach((objectBytes, index) => {
    offsets.push(position);
    const prefix = textEncoder.encode(`${index + 1} 0 obj\n`);
    const suffix = textEncoder.encode("\nendobj\n");
    bodyParts.push(prefix, objectBytes, suffix);
    position += prefix.length + objectBytes.length + suffix.length;
  });

  const xrefStart = position;
  const xrefLines = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  offsets.slice(1).forEach((offset) => {
    xrefLines.push(`${String(offset).padStart(10, "0")} 00000 n `);
  });

  const trailer =
    `${xrefLines.join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  bodyParts.push(textEncoder.encode(trailer));
  return new Blob(bodyParts, { type: "application/pdf" });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function splitTitle(title) {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    return [title];
  }

  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function joinBytes(...parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    merged.set(part, offset);
    offset += part.length;
  });
  return merged;
}

function getSelectedNode() {
  return state.map.nodes[state.selectedId];
}

function findParentId(nodeId) {
  return Object.values(state.map.nodes).find((node) => node.children.includes(nodeId))?.id ?? null;
}

function getTrail(nodeId) {
  const trail = [nodeId];
  let current = nodeId;

  while (current !== state.map.rootId) {
    const parentId = findParentId(current);
    if (!parentId) break;
    trail.unshift(parentId);
    current = parentId;
  }

  return trail;
}

function removeBranch(nodeId) {
  const node = state.map.nodes[nodeId];
  if (!node) return;

  node.children.forEach(removeBranch);
  delete state.map.nodes[nodeId];
}

function getColor(value) {
  return palette.find((entry) => entry.value === value) ?? palette[0];
}

function ensureMapShape(map) {
  Object.values(map.nodes).forEach((node) => {
    if (!Array.isArray(node.children)) node.children = [];
    if (typeof node.collapsed !== "boolean") node.collapsed = false;
    if (!node.color) node.color = "stone";
  });
}

function loadMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneMap(defaultMap);
    const parsed = JSON.parse(raw);
    if (!parsed?.rootId || !parsed?.nodes) {
      return cloneMap(defaultMap);
    }
    return parsed;
  } catch {
    return cloneMap(defaultMap);
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.map));
  } catch {
    // Ignore storage failures so the in-memory map still works.
  }
}

function syncPalette(value) {
  const chips = elements.colorPalette.querySelectorAll(".color-chip");
  chips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.value === value);
  });
}

function cloneMap(map) {
  return JSON.parse(JSON.stringify(map));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
