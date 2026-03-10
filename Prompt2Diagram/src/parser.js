const NUMBER_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10
};

const COMPONENT_PATTERNS = [
  { type: "internet", label: "Internet", aliases: ["internet link", "internet", "isp", "wan"] },
  { type: "router", label: "Router", aliases: ["edge router", "router"] },
  { type: "firewall", label: "Firewall", aliases: ["next-generation firewall", "firewall"] },
  { type: "vpn", label: "VPN Gateway", aliases: ["vpn gateway", "vpn"] },
  { type: "load_balancer", label: "Load Balancer", aliases: ["load balancer", "balancer"] },
  { type: "ids", label: "IDS/IPS", aliases: ["ids/ips", "ids", "ips"] },
  { type: "switch", label: "LAN Switch", aliases: ["lan switch", "switch"] },
  { type: "dmz", label: "DMZ", aliases: ["dmz"] },
  { type: "lan", label: "LAN", aliases: ["internal lan", "lan"] },
  { type: "wireless", label: "Wireless AP", aliases: ["wireless access point", "wireless ap", "access point", "wifi"] },
  { type: "server", label: "Application Server", aliases: ["application server", "server", "servers"] },
  { type: "database", label: "Database", aliases: ["database", "db"] },
  { type: "client", label: "Client", aliases: ["client machines", "client machine", "clients", "client", "workstations", "workstation", "pc", "pcs"] }
];

const TYPE_STYLES = {
  internet: "cloud",
  router: "router",
  firewall: "security",
  vpn: "security",
  load_balancer: "service",
  ids: "security",
  switch: "network",
  dmz: "zone",
  lan: "zone",
  wireless: "network",
  server: "compute",
  database: "data",
  client: "endpoint"
};

export const EXAMPLE_PROMPTS = [
  {
    label: "Basic LAN",
    text: "Create a network with one Internet link connected to a router, followed by a firewall, then a LAN with three client machines."
  },
  {
    label: "DMZ",
    text: "Create an internet edge with a router, a firewall, then a DMZ with one web server and one database, plus an internal LAN with two clients."
  },
  {
    label: "Remote Access",
    text: "Build a network with internet, router, firewall, vpn gateway, LAN switch, one application server, one database, and four client workstations."
  }
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readQuantity(normalizedPrompt, matchIndex) {
  const context = normalizedPrompt.slice(Math.max(0, matchIndex - 24), matchIndex).trim();
  const numericMatch = context.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+$/);
  if (!numericMatch) {
    return 1;
  }

  const token = numericMatch[1];
  return Number(token) || NUMBER_WORDS[token] || 1;
}

function normalizePrompt(prompt) {
  return (prompt || "")
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findComponents(normalizedPrompt) {
  const matches = [];

  COMPONENT_PATTERNS.forEach((pattern) => {
    pattern.aliases.forEach((alias) => {
      const regex = new RegExp(`\\b${escapeRegExp(alias)}\\b`, "g");
      let result = regex.exec(normalizedPrompt);
      while (result) {
        matches.push({
          index: result.index,
          length: alias.length,
          quantity: readQuantity(normalizedPrompt, result.index),
          pattern
        });
        result = regex.exec(normalizedPrompt);
      }
    });
  });

  matches.sort((left, right) => left.index - right.index || right.length - left.length);

  return matches.filter((match, index, allMatches) => {
    const previous = allMatches[index - 1];
    if (!previous) {
      return true;
    }

    return match.index >= previous.index + previous.length;
  });
}

function createNode(type, label, count) {
  return {
    id: `${type}_${count}`,
    type,
    kind: TYPE_STYLES[type] || "network",
    label: count > 1 ? `${label} ${count}` : label
  };
}

function connectNodes(edges, fromId, toId) {
  if (!edges.some((edge) => edge.from === fromId && edge.to === toId)) {
    edges.push({ from: fromId, to: toId });
  }
}

export function buildDiagramModel(prompt) {
  const normalizedPrompt = normalizePrompt(prompt);
  const detected = findComponents(normalizedPrompt);
  const nodes = [];
  const edges = [];
  const counters = {};
  let previousLinearNodeId = null;
  let lanAnchorId = null;

  if (detected.length === 0) {
    const internet = createNode("internet", "Internet", 1);
    const router = createNode("router", "Router", 1);
    const firewall = createNode("firewall", "Firewall", 1);
    nodes.push(internet, router, firewall);
    connectNodes(edges, internet.id, router.id);
    connectNodes(edges, router.id, firewall.id);

    return {
      nodes,
      edges,
      summary: ["Fallback chain used: Internet -> Router -> Firewall"]
    };
  }

  detected.forEach(({ pattern, quantity }) => {
    const count = counters[pattern.type] ?? 0;
    const total = Math.min(quantity, 8);

    if (pattern.type === "client" || pattern.type === "server") {
      for (let index = 1; index <= total; index += 1) {
        const node = createNode(pattern.type, pattern.label, count + index);
        nodes.push(node);
        if (lanAnchorId) {
          connectNodes(edges, lanAnchorId, node.id);
        } else if (previousLinearNodeId) {
          connectNodes(edges, previousLinearNodeId, node.id);
        }
      }
      counters[pattern.type] = count + total;
      return;
    }

    const node = createNode(pattern.type, pattern.label, count + 1);
    nodes.push(node);
    counters[pattern.type] = count + 1;

    if (previousLinearNodeId) {
      connectNodes(edges, previousLinearNodeId, node.id);
    }

    previousLinearNodeId = node.id;

    if (pattern.type === "lan" || pattern.type === "switch" || pattern.type === "dmz") {
      lanAnchorId = node.id;
    }
  });

  return {
    nodes,
    edges,
    summary: [
      `Detected ${nodes.length} node${nodes.length === 1 ? "" : "s"}`,
      `Detected ${edges.length} connection${edges.length === 1 ? "" : "s"}`
    ]
  };
}

export function describeDiagramModel(model) {
  const labels = model.nodes.map((node) => node.label).join(" -> ");
  const lines = [...model.summary];
  if (labels) {
    lines.push(`Flow: ${labels}`);
  }
  return lines;
}
