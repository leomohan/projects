import { haversineDistanceKm } from "./map-utils.js";
import { GEO_LOOKUP, TRACE_LIBRARY } from "./trace-data.js";

export const DEMO_HOSTS = Object.keys(TRACE_LIBRARY);

const ORIGIN_HOPS = [
  {
    ip: "192.168.1.1",
    hostname: "gateway.local",
    city: "Dubai",
    country: "UAE",
    latitude: 25.2,
    longitude: 55.27,
    isp: "Private LAN",
    asn: "LAN",
    note: "Local gateway and access layer."
  },
  {
    ip: "195.229.0.1",
    hostname: "dxb-edge-01",
    city: "Dubai",
    country: "UAE",
    latitude: 25.2,
    longitude: 55.27,
    isp: "Emirates carrier",
    asn: "AS5384",
    note: "Provider edge and metro aggregation."
  }
];

const REGIONAL_HOPS = [
  {
    city: "Riyadh",
    country: "Saudi Arabia",
    latitude: 24.71,
    longitude: 46.67,
    isp: "Regional transit",
    asn: "AS35753",
    note: "Regional backbone handoff."
  },
  {
    city: "Mumbai",
    country: "India",
    latitude: 19.08,
    longitude: 72.88,
    isp: "Subsea aggregation",
    asn: "AS9498",
    note: "South Asia aggregation hub."
  },
  {
    city: "Istanbul",
    country: "Turkey",
    latitude: 41.01,
    longitude: 28.97,
    isp: "Mediterranean transit",
    asn: "AS9121",
    note: "Cross-regional transit junction."
  }
];

const EXCHANGE_HOPS = [
  {
    city: "Frankfurt",
    country: "Germany",
    latitude: 50.11,
    longitude: 8.68,
    isp: "DE-CIX peer",
    asn: "AS6695",
    note: "Major European exchange point."
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    latitude: 52.37,
    longitude: 4.89,
    isp: "AMS-IX peer",
    asn: "AS1200",
    note: "European exchange and transit edge."
  },
  {
    city: "London",
    country: "UK",
    latitude: 51.51,
    longitude: -0.13,
    isp: "LINX peer",
    asn: "AS5459",
    note: "Peer exchange closer to destination services."
  },
  {
    city: "Singapore",
    country: "Singapore",
    latitude: 1.29,
    longitude: 103.85,
    isp: "APAC backbone",
    asn: "AS7473",
    note: "APAC exchange and cloud ingress."
  }
];

const DESTINATION_PROFILES = [
  {
    city: "San Francisco",
    country: "USA",
    latitude: 37.77,
    longitude: -122.42,
    isp: "Cloud edge",
    asn: "AS13335"
  },
  {
    city: "New York",
    country: "USA",
    latitude: 40.71,
    longitude: -74.0,
    isp: "Cloud edge",
    asn: "AS16509"
  },
  {
    city: "Toronto",
    country: "Canada",
    latitude: 43.65,
    longitude: -79.38,
    isp: "Cloud edge",
    asn: "AS812"
  },
  {
    city: "London",
    country: "UK",
    latitude: 51.51,
    longitude: -0.13,
    isp: "Cloud edge",
    asn: "AS13335"
  },
  {
    city: "Paris",
    country: "France",
    latitude: 48.86,
    longitude: 2.35,
    isp: "Cloud edge",
    asn: "AS3215"
  },
  {
    city: "Frankfurt",
    country: "Germany",
    latitude: 50.11,
    longitude: 8.68,
    isp: "Cloud edge",
    asn: "AS3320"
  },
  {
    city: "Singapore",
    country: "Singapore",
    latitude: 1.29,
    longitude: 103.85,
    isp: "Cloud edge",
    asn: "AS7473"
  },
  {
    city: "Tokyo",
    country: "Japan",
    latitude: 35.68,
    longitude: 139.69,
    isp: "Cloud edge",
    asn: "AS2516"
  },
  {
    city: "Sydney",
    country: "Australia",
    latitude: -33.87,
    longitude: 151.21,
    isp: "Cloud edge",
    asn: "AS1221"
  },
  {
    city: "Sao Paulo",
    country: "Brazil",
    latitude: -23.55,
    longitude: -46.63,
    isp: "Cloud edge",
    asn: "AS28573"
  }
];

function cloneTrace(trace) {
  return {
    ...trace,
    hops: trace.hops.map((hop) => ({ ...hop })),
    segments: (trace.segments || []).map((segment) => ({
      ...segment,
      from: { ...segment.from },
      to: { ...segment.to }
    }))
  };
}

function normalizeHost(input) {
  return input.trim().toLowerCase();
}

function hashString(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function chooseFrom(list, seed, offset = 0) {
  return list[(seed + offset) % list.length];
}

function makeSyntheticIp(seed, hop) {
  const second = 16 + ((seed + hop * 11) % 200);
  const third = 10 + ((seed + hop * 17) % 220);
  const fourth = 5 + ((seed + hop * 23) % 240);
  return `100.${second}.${third}.${fourth}`;
}

function createGeneratedHop(seed, hop, latencyMs, location, hostname) {
  return {
    id: `generated-${seed}-${hop}`,
    hop,
    latencyMs,
    ip: makeSyntheticIp(seed, hop),
    hostname,
    city: location.city,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    isp: location.isp,
    asn: location.asn,
    note: location.note
  };
}

function inferDestinationProfile(target) {
  const normalizedTarget = normalizeHost(target);
  const seed = hashString(normalizedTarget || "visual-trace");

  const tldProfileMap = {
    ".uk": "London",
    ".de": "Frankfurt",
    ".fr": "Paris",
    ".sg": "Singapore",
    ".jp": "Tokyo",
    ".au": "Sydney",
    ".br": "Sao Paulo"
  };

  const explicitCity = Object.entries(tldProfileMap).find(([suffix]) => normalizedTarget.endsWith(suffix))?.[1];
  if (explicitCity) {
    return DESTINATION_PROFILES.find((profile) => profile.city === explicitCity);
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalizedTarget)) {
    return chooseFrom(DESTINATION_PROFILES, seed);
  }

  if (normalizedTarget.includes("asia") || normalizedTarget.includes("sg")) {
    return DESTINATION_PROFILES.find((profile) => profile.city === "Singapore");
  }

  if (normalizedTarget.includes("jp") || normalizedTarget.includes("tokyo")) {
    return DESTINATION_PROFILES.find((profile) => profile.city === "Tokyo");
  }

  if (normalizedTarget.includes("eu") || normalizedTarget.includes("europe")) {
    return DESTINATION_PROFILES.find((profile) => profile.city === "Frankfurt");
  }

  return chooseFrom(DESTINATION_PROFILES, seed);
}

function generateTraceForTarget(target) {
  const normalizedTarget = normalizeHost(target);
  if (!normalizedTarget) {
    throw new Error("Enter a hostname or IP address before running a trace.");
  }

  const seed = hashString(normalizedTarget);
  const destination = inferDestinationProfile(normalizedTarget);
  const regional = chooseFrom(REGIONAL_HOPS, seed);
  const exchangeOne = chooseFrom(EXCHANGE_HOPS, seed, 1);
  const exchangeTwo = chooseFrom(
    EXCHANGE_HOPS.filter((entry) => entry.city !== exchangeOne.city),
    seed,
    2
  );

  const routePoints = [
    ORIGIN_HOPS[0],
    ORIGIN_HOPS[1],
    regional,
    exchangeOne,
    exchangeTwo,
    destination
  ];

  const baseLatency = 1 + (seed % 3) * 0.4;
  const hops = routePoints.map((point, index) => {
    if (index < 2) {
      return {
        id: `generated-origin-${seed}-${index + 1}`,
        hop: index + 1,
        latencyMs: index === 0 ? baseLatency : baseLatency + 2.1 + (seed % 4) * 0.3,
        ...point
      };
    }

    const previous = routePoints[index - 1];
    const distance = haversineDistanceKm(previous, point);
    const networkPenalty = 8 + index * 5 + ((seed >> index) % 11);
    const latencyMs =
      Math.max(6, distance / 180) + networkPenalty + (index === routePoints.length - 1 ? 14 : 0);

    return createGeneratedHop(
      seed,
      index + 1,
      Number(latencyMs.toFixed(1)),
      {
        ...point,
        note:
          index === routePoints.length - 1
            ? `Synthetic destination edge inferred for ${normalizedTarget}.`
            : point.note
      },
      index === routePoints.length - 1 ? normalizedTarget : `${point.city.toLowerCase()}-hop-${index + 1}`
    );
  });

  return attachSegments({
    id: `generated-${seed}`,
    mode: "generated exploratory trace",
    targetLabel: normalizedTarget,
    capturedAt: new Date().toISOString(),
    hops
  });
}

function attachSegments(trace) {
  const segments = [];
  for (let index = 1; index < trace.hops.length; index += 1) {
    const from = trace.hops[index - 1];
    const to = trace.hops[index];
    segments.push({
      id: `${from.id}-${to.id}`,
      from,
      to
    });
  }

  return {
    ...trace,
    pathLabel: `${trace.hops[0].city} to ${trace.hops[trace.hops.length - 1].city}`,
    summary: `Observed ${trace.hops.length} hops via ${trace.hops.map((hop) => hop.city).join(" -> ")}`,
    segments
  };
}

export function getDefaultTrace() {
  const fallback = TRACE_LIBRARY["openai.com"];
  return attachSegments(cloneTrace(fallback));
}

export async function runTraceSimulation(target) {
  const normalizedTarget = normalizeHost(target);
  const selected = TRACE_LIBRARY[normalizedTarget];

  await new Promise((resolve) => window.setTimeout(resolve, 850));

  if (selected) {
    return attachSegments({
      ...cloneTrace(selected),
      targetLabel: target.trim() || selected.targetLabel,
      capturedAt: new Date().toISOString(),
      mode: "simulated live trace"
    });
  }

  return generateTraceForTarget(target);
}

function extractLatencyMs(line) {
  const matches = Array.from(line.matchAll(/(\d+(?:\.\d+)?)\s*ms/gi)).map((match) => Number(match[1]));
  if (matches.length === 0) {
    return null;
  }

  return matches.reduce((total, entry) => total + entry, 0) / matches.length;
}

function getGeoForIp(ip, hopNumber, totalHops) {
  if (GEO_LOOKUP[ip]) {
    return GEO_LOOKUP[ip];
  }

  if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.16.")) {
    return {
      ip,
      hostname: "local-gateway",
      city: "Local Network",
      country: "Private",
      latitude: 25.2,
      longitude: 55.27,
      isp: "Customer Premise Equipment",
      asn: "LAN",
      note: "Private address hop inferred as the local gateway."
    };
  }

  const progress = totalHops <= 1 ? 0 : (hopNumber - 1) / (totalHops - 1);
  return {
    ip,
    hostname: `hop-${hopNumber}`,
    city: "Unresolved",
    country: "Unknown",
    latitude: 25.2 + progress * 22,
    longitude: 55.27 - progress * 130,
    isp: "Unknown carrier",
    asn: "ASN unknown",
    note: "No geolocation match in the local prototype dataset. Position is estimated for visualization."
  };
}

export function buildTraceFromManualInput(rawInput, target) {
  const lines = rawInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsedLines = lines
    .map((line) => {
      const hopMatch = line.match(/^(\d+)\s+/);
      const ipMatch = line.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
      const latencyMs = extractLatencyMs(line);
      if (!hopMatch || !ipMatch || latencyMs === null) {
        return null;
      }

      return {
        hop: Number(hopMatch[1]),
        ip: ipMatch[0],
        latencyMs
      };
    })
    .filter(Boolean);

  if (parsedLines.length < 2) {
    throw new Error("Paste at least two traceroute hop lines with hop number, IP, and latency.");
  }

  const totalHops = parsedLines.length;
  const hops = parsedLines.map((entry) => {
    const geo = getGeoForIp(entry.ip, entry.hop, totalHops);
    return {
      id: `manual-${entry.hop}`,
      hop: entry.hop,
      latencyMs: entry.latencyMs,
      ...geo
    };
  });

  return attachSegments({
    id: "manual-trace",
    mode: "manual traceroute import",
    targetLabel: target.trim() || "manual target",
    capturedAt: new Date().toISOString(),
    hops
  });
}

export function buildTraceMetrics(trace) {
  const totalLatencyMs = trace.hops[trace.hops.length - 1]?.latencyMs ?? 0;
  const averageLatencyMs =
    trace.hops.reduce((sum, hop) => sum + hop.latencyMs, 0) / Math.max(trace.hops.length, 1);
  const maxLatencyMs = Math.max(...trace.hops.map((hop) => hop.latencyMs));
  const totalDistanceKm = trace.segments.reduce(
    (sum, segment) => sum + haversineDistanceKm(segment.from, segment.to),
    0
  );

  const jitterWindow = trace.hops.slice(1).map((hop, index) => Math.abs(hop.latencyMs - trace.hops[index].latencyMs));
  const lossPct = Math.min(18, jitterWindow.reduce((sum, value) => sum + value, 0) / Math.max(jitterWindow.length, 1) / 3);

  return {
    totalLatencyMs,
    averageLatencyMs,
    maxLatencyMs,
    totalDistanceKm,
    lossPct
  };
}
