function createHop(id, hop, latencyMs, ip, hostname, city, country, latitude, longitude, isp, asn, note) {
  return {
    id,
    hop,
    latencyMs,
    ip,
    hostname,
    city,
    country,
    latitude,
    longitude,
    isp,
    asn,
    note
  };
}

export const GEO_LOOKUP = {
  "192.168.1.1": createHop(
    "geo-lan",
    1,
    1.1,
    "192.168.1.1",
    "gateway.local",
    "Dubai",
    "UAE",
    25.2,
    55.27,
    "Private LAN",
    "LAN",
    "Customer gateway before the ISP edge."
  ),
  "195.229.0.1": createHop(
    "geo-du",
    2,
    3.5,
    "195.229.0.1",
    "edge.dubai.example",
    "Dubai",
    "UAE",
    25.2,
    55.27,
    "Emirates carrier",
    "AS5384",
    "Metro aggregation inside the access provider."
  ),
  "80.81.192.1": createHop(
    "geo-fra",
    3,
    84.2,
    "80.81.192.1",
    "core.frankfurt.example",
    "Frankfurt",
    "Germany",
    50.11,
    8.68,
    "DE-CIX peer",
    "AS6695",
    "European exchange point handoff."
  ),
  "145.14.132.20": createHop(
    "geo-ams",
    4,
    96.7,
    "145.14.132.20",
    "ams-transit.example",
    "Amsterdam",
    "Netherlands",
    52.37,
    4.89,
    "Transit backbone",
    "AS9002",
    "Transit backbone near the destination region."
  ),
  "172.217.20.46": createHop(
    "geo-lhr",
    5,
    110.3,
    "172.217.20.46",
    "lhr23s74-in-f14.1e100.net",
    "London",
    "UK",
    51.51,
    -0.13,
    "Google",
    "AS15169",
    "Destination edge in Google's London footprint."
  ),
  "104.18.33.45": createHop(
    "geo-lax",
    6,
    188.4,
    "104.18.33.45",
    "openai.com",
    "San Francisco",
    "USA",
    37.77,
    -122.42,
    "Cloudflare",
    "AS13335",
    "Destination front door terminating near the application edge."
  ),
  "151.101.1.140": createHop(
    "geo-sea",
    6,
    192.2,
    "151.101.1.140",
    "github.com",
    "San Francisco",
    "USA",
    37.77,
    -122.42,
    "Fastly",
    "AS54113",
    "Content edge serving the GitHub application."
  ),
  "142.250.74.14": createHop(
    "geo-sjc",
    6,
    189.8,
    "142.250.74.14",
    "google.com",
    "San Jose",
    "USA",
    37.33,
    -121.89,
    "Google",
    "AS15169",
    "Destination edge terminating within Google's west coast fabric."
  ),
  "1.1.1.1": createHop(
    "geo-cf",
    5,
    102.7,
    "1.1.1.1",
    "one.one.one.one",
    "London",
    "UK",
    51.51,
    -0.13,
    "Cloudflare",
    "AS13335",
    "Anycast resolver node selected for this path."
  )
};

export const TRACE_LIBRARY = {
  "openai.com": {
    id: "trace-openai",
    mode: "simulated live trace",
    targetLabel: "openai.com",
    capturedAt: "2026-03-10T08:15:00.000Z",
    hops: [
      createHop("openai-1", 1, 1.1, "192.168.1.1", "gateway.local", "Dubai", "UAE", 25.2, 55.27, "Private LAN", "LAN", "Local gateway and Wi-Fi handoff."),
      createHop("openai-2", 2, 3.5, "195.229.0.1", "dxb-edge-01", "Dubai", "UAE", 25.2, 55.27, "Emirates carrier", "AS5384", "Last-mile ISP edge."),
      createHop("openai-3", 3, 29.8, "5.53.4.9", "ruh-core-02", "Riyadh", "Saudi Arabia", 24.71, 46.67, "Regional transit", "AS35753", "Gulf regional backbone."),
      createHop("openai-4", 4, 84.2, "80.81.192.1", "fra-exchange-07", "Frankfurt", "Germany", 50.11, 8.68, "DE-CIX peer", "AS6695", "Major European interconnection point."),
      createHop("openai-5", 5, 96.7, "145.14.132.20", "ams-transit-11", "Amsterdam", "Netherlands", 52.37, 4.89, "Transit backbone", "AS9002", "Destination-facing transit path."),
      createHop("openai-6", 6, 137.5, "4.69.210.233", "nyc-fabric-03", "New York", "USA", 40.71, -74.0, "Lumen", "AS3356", "Transatlantic landing and U.S. backbone entry."),
      createHop("openai-7", 7, 188.4, "104.18.33.45", "openai.com", "San Francisco", "USA", 37.77, -122.42, "Cloudflare", "AS13335", "Application edge serving the destination.")
    ]
  },
  "github.com": {
    id: "trace-github",
    mode: "simulated live trace",
    targetLabel: "github.com",
    capturedAt: "2026-03-10T08:16:00.000Z",
    hops: [
      createHop("github-1", 1, 1.0, "192.168.1.1", "gateway.local", "Dubai", "UAE", 25.2, 55.27, "Private LAN", "LAN", "Local gateway and access point."),
      createHop("github-2", 2, 3.2, "195.229.0.1", "dxb-edge-01", "Dubai", "UAE", 25.2, 55.27, "Emirates carrier", "AS5384", "Metro edge and provider ingress."),
      createHop("github-3", 3, 31.4, "5.53.4.9", "ruh-core-02", "Riyadh", "Saudi Arabia", 24.71, 46.67, "Regional transit", "AS35753", "Regional transit aggregation."),
      createHop("github-4", 4, 82.1, "80.81.192.1", "fra-exchange-07", "Frankfurt", "Germany", 50.11, 8.68, "DE-CIX peer", "AS6695", "European exchange point."),
      createHop("github-5", 5, 128.9, "62.115.123.8", "chi-core-12", "Chicago", "USA", 41.88, -87.63, "Arelion", "AS1299", "U.S. inland backbone hop."),
      createHop("github-6", 6, 192.2, "151.101.1.140", "github.com", "San Francisco", "USA", 37.77, -122.42, "Fastly", "AS54113", "Destination edge cache cluster.")
    ]
  },
  "google.com": {
    id: "trace-google",
    mode: "simulated live trace",
    targetLabel: "google.com",
    capturedAt: "2026-03-10T08:17:00.000Z",
    hops: [
      createHop("google-1", 1, 0.9, "192.168.1.1", "gateway.local", "Dubai", "UAE", 25.2, 55.27, "Private LAN", "LAN", "Local Wi-Fi gateway."),
      createHop("google-2", 2, 2.9, "195.229.0.1", "dxb-edge-01", "Dubai", "UAE", 25.2, 55.27, "Emirates carrier", "AS5384", "Provider edge."),
      createHop("google-3", 3, 25.8, "5.53.4.9", "ruh-core-02", "Riyadh", "Saudi Arabia", 24.71, 46.67, "Regional transit", "AS35753", "Regional backbone."),
      createHop("google-4", 4, 79.5, "80.81.192.1", "fra-exchange-07", "Frankfurt", "Germany", 50.11, 8.68, "DE-CIX peer", "AS6695", "European exchange point."),
      createHop("google-5", 5, 135.8, "216.239.57.17", "iad-google-01", "Ashburn", "USA", 39.04, -77.49, "Google", "AS15169", "Google east coast backbone ingress."),
      createHop("google-6", 6, 189.8, "142.250.74.14", "google.com", "San Jose", "USA", 37.33, -121.89, "Google", "AS15169", "Destination edge within Google's west coast network.")
    ]
  },
  "1.1.1.1": {
    id: "trace-cloudflare",
    mode: "simulated live trace",
    targetLabel: "1.1.1.1",
    capturedAt: "2026-03-10T08:18:00.000Z",
    hops: [
      createHop("cf-1", 1, 1.0, "192.168.1.1", "gateway.local", "Dubai", "UAE", 25.2, 55.27, "Private LAN", "LAN", "Local gateway."),
      createHop("cf-2", 2, 3.2, "195.229.0.1", "dxb-edge-01", "Dubai", "UAE", 25.2, 55.27, "Emirates carrier", "AS5384", "Provider edge."),
      createHop("cf-3", 3, 19.6, "5.53.4.9", "ruh-core-02", "Riyadh", "Saudi Arabia", 24.71, 46.67, "Regional transit", "AS35753", "Regional backbone."),
      createHop("cf-4", 4, 58.1, "80.81.192.1", "fra-exchange-07", "Frankfurt", "Germany", 50.11, 8.68, "DE-CIX peer", "AS6695", "European exchange point."),
      createHop("cf-5", 5, 102.7, "1.1.1.1", "one.one.one.one", "London", "UK", 51.51, -0.13, "Cloudflare", "AS13335", "Anycast resolver node selected by the network.")
    ]
  }
};
