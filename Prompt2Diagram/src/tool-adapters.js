function escapeLabel(value) {
  return value.replaceAll('"', '\\"');
}

function renderNodeDeclaration(node) {
  const label = escapeLabel(node.label);
  switch (node.kind) {
    case "cloud":
      return `${node.id}(("${label}"))`;
    case "zone":
      return `${node.id}[["${label}"]]`;
    case "data":
      return `${node.id}[("${label}")]`;
    default:
      return `${node.id}["${label}"]`;
  }
}

function generateMermaid(model) {
  const lines = ["flowchart LR"];
  model.nodes.forEach((node) => {
    lines.push(`    ${renderNodeDeclaration(node)}`);
  });
  model.edges.forEach((edge) => {
    lines.push(`    ${edge.from} --> ${edge.to}`);
  });
  return lines.join("\n");
}

function plantNodeKeyword(kind) {
  switch (kind) {
    case "cloud":
      return "cloud";
    case "service":
      return "component";
    case "zone":
      return "frame";
    case "data":
      return "database";
    case "router":
    case "security":
    case "compute":
      return "node";
    default:
      return "rectangle";
  }
}

function generatePlantUml(model) {
  const lines = ["@startuml", "left to right direction", "skinparam shadowing false"];
  model.nodes.forEach((node) => {
    lines.push(`${plantNodeKeyword(node.kind)} "${escapeLabel(node.label)}" as ${node.id}`);
  });
  model.edges.forEach((edge) => {
    lines.push(`${edge.from} --> ${edge.to}`);
  });
  lines.push("@enduml");
  return lines.join("\n");
}

async function validateMermaid(code, context) {
  if (!code.startsWith("flowchart")) {
    return { valid: false, message: "Mermaid code must start with a flowchart declaration." };
  }

  try {
    await context.mermaid.parse(code);
    return { valid: true, message: "Mermaid syntax is valid." };
  } catch (error) {
    return {
      valid: false,
      message: error?.message || "Mermaid syntax is invalid."
    };
  }
}

async function renderMermaid(code, context) {
  const renderId = `mermaid-${crypto.randomUUID()}`;
  const { svg } = await context.mermaid.render(renderId, code);
  context.container.innerHTML = svg;
  const element = context.container.querySelector("svg");

  if (!element) {
    throw new Error("Mermaid did not produce an SVG preview.");
  }

  element.removeAttribute("height");
  element.style.maxWidth = "100%";
  element.style.height = "auto";

  return {
    type: "svg",
    fileBase: "prompt2diagram-mermaid",
    svg
  };
}

function validatePlantUml(code) {
  if (!code.startsWith("@startuml") || !code.endsWith("@enduml")) {
    return { valid: false, message: "PlantUML code must include @startuml and @enduml." };
  }

  return { valid: true, message: "PlantUML wrapper is valid." };
}

function encode6bit(value) {
  if (value < 10) {
    return String.fromCharCode(48 + value);
  }
  value -= 10;
  if (value < 26) {
    return String.fromCharCode(65 + value);
  }
  value -= 26;
  if (value < 26) {
    return String.fromCharCode(97 + value);
  }
  value -= 26;
  return value === 0 ? "-" : "_";
}

function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;
  return `${encode6bit(c1 & 0x3f)}${encode6bit(c2 & 0x3f)}${encode6bit(c3 & 0x3f)}${encode6bit(c4 & 0x3f)}`;
}

function encode64(data) {
  let result = "";
  for (let index = 0; index < data.length; index += 3) {
    if (index + 2 === data.length) {
      result += append3bytes(data[index], data[index + 1], 0);
    } else if (index + 1 === data.length) {
      result += append3bytes(data[index], 0, 0);
    } else {
      result += append3bytes(data[index], data[index + 1], data[index + 2]);
    }
  }
  return result;
}

async function compressPlantUml(text) {
  const stream = new CompressionStream("deflate-raw");
  const writer = stream.writable.getWriter();
  await writer.write(new TextEncoder().encode(text));
  await writer.close();
  const response = new Response(stream.readable);
  const buffer = new Uint8Array(await response.arrayBuffer());
  return encode64(buffer);
}

async function renderPlantUml(code, context) {
  const encoded = await compressPlantUml(code);
  const svgUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;
  const pngUrl = `https://www.plantuml.com/plantuml/png/${encoded}`;
  context.container.innerHTML = `<img src="${svgUrl}" alt="Rendered PlantUML diagram" />`;

  return {
    type: "remote",
    fileBase: "prompt2diagram-plantuml",
    svgUrl,
    pngUrl
  };
}

export const ENGINE_OPTIONS = [
  {
    id: "mermaid",
    label: "Mermaid.js",
    description: "Rendered locally in-browser with Mermaid."
  },
  {
    id: "plantuml",
    label: "PlantUML",
    description: "Rendered as an image through a PlantUML server-compatible endpoint."
  }
];

export const ENGINE_ADAPTERS = {
  mermaid: {
    generate: generateMermaid,
    validate: validateMermaid,
    render: renderMermaid
  },
  plantuml: {
    generate: generatePlantUml,
    validate: validatePlantUml,
    render: renderPlantUml
  }
};
