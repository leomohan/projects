import { React, html } from "./lib/react.js";
import { buildArcPath, formatLatency, projectPoint } from "./map-utils.js";

function formatTimestamp(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatHopLabel(hop) {
  return hop.hostname || hop.ip;
}

function formatLoss(lossPct) {
  return `${Math.round(lossPct)}%`;
}

export function Header({ trace, metrics }) {
  return html`
    <header className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Visual Trace</p>
        <h1>See packet paths as a living route, not a terminal dump.</h1>
        <p className="hero-text">
          A warm, analytical traceroute workspace for following each hop across the world,
          comparing latency, and understanding where paths bend or stall.
        </p>
      </div>

      <div className="hero-card">
        <div className="hero-card-row">
          <span>Current route</span>
          <strong>${trace.targetLabel}</strong>
        </div>
        <div className="hero-card-row">
          <span>Captured</span>
          <strong>${formatTimestamp(trace.capturedAt)}</strong>
        </div>
        <div className="hero-card-row">
          <span>Total distance</span>
          <strong>${Math.round(metrics.totalDistanceKm).toLocaleString()} km</strong>
        </div>
      </div>
    </header>
  `;
}

export function SummaryStrip({ trace, metrics }) {
  return html`
    <section className="summary-strip">
      <article className="summary-card">
        <span>Hop count</span>
        <strong>${trace.hops.length}</strong>
      </article>
      <article className="summary-card">
        <span>End-to-end latency</span>
        <strong>${formatLatency(metrics.totalLatencyMs)}</strong>
      </article>
      <article className="summary-card">
        <span>Average hop latency</span>
        <strong>${formatLatency(metrics.averageLatencyMs)}</strong>
      </article>
      <article className="summary-card">
        <span>Estimated packet loss</span>
        <strong>${formatLoss(metrics.lossPct)}</strong>
      </article>
    </section>
  `;
}

export function CommandPanel({
  target,
  setTarget,
  manualInput,
  setManualInput,
  demoHosts,
  trace,
  loading,
  error,
  onRunTrace,
  onParseManual
}) {
  const recentSummary = trace.hops
    .map((hop) => `${String(hop.hop).padStart(2, "0")}  ${hop.ip}  ${formatLatency(hop.latencyMs)}`)
    .join("\n");

  return html`
    <section className="panel command-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Input</p>
          <h2>Trace control</h2>
        </div>
        <span className="status-pill ${loading ? "status-live" : "status-idle"}">
          ${loading ? "running" : "ready"}
        </span>
      </div>

      <div className="field-block">
        <label htmlFor="target">Hostname or IP</label>
        <input
          id="target"
          value=${target}
          placeholder="openai.com"
          onInput=${(event) => setTarget(event.target.value)}
        />
      </div>

      <div className="chip-row">
        ${demoHosts.map(
          (host) => html`
            <button key=${host} className="chip" type="button" onClick=${() => setTarget(host)}>
              ${host}
            </button>
          `
        )}
      </div>

      <div className="button-row">
        <button className="button-primary" type="button" disabled=${loading} onClick=${onRunTrace}>
          ${loading ? "Tracing..." : "Run simulated trace"}
        </button>
        <button className="button-secondary" type="button" onClick=${onParseManual}>
          Parse pasted traceroute
        </button>
      </div>

      <div className="field-block">
        <label htmlFor="manual-trace">Manual traceroute input</label>
        <textarea
          id="manual-trace"
          rows="10"
          placeholder=" 1  192.168.1.1  1.1 ms  1.2 ms  1.0 ms"
          value=${manualInput}
          onInput=${(event) => setManualInput(event.target.value)}
        ></textarea>
      </div>

      ${error ? html`<div className="error-card">${error}</div>` : null}

      <div className="terminal-card">
        <div className="terminal-header">
          <span>Trace snapshot</span>
          <span>${trace.mode}</span>
        </div>
        <pre>${recentSummary}</pre>
      </div>
    </section>
  `;
}

export function MapPanel({ trace, activeHopId, onSelectHop }) {
  const width = 960;
  const height = 540;
  const graticuleLines = [];

  for (let lon = -150; lon <= 150; lon += 30) {
    const start = projectPoint(lon, 70, width, height);
    const end = projectPoint(lon, -55, width, height);
    graticuleLines.push({ key: `lon-${lon}`, x1: start.x, y1: start.y, x2: end.x, y2: end.y });
  }

  for (let lat = -30; lat <= 60; lat += 30) {
    const start = projectPoint(-180, lat, width, height);
    const end = projectPoint(180, lat, width, height);
    graticuleLines.push({ key: `lat-${lat}`, x1: start.x, y1: start.y, x2: end.x, y2: end.y });
  }

  return html`
    <section className="panel map-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Map</p>
          <h2>Global route canvas</h2>
        </div>
        <span className="muted-label">2D equirectangular projection</span>
      </div>

      <div className="map-frame">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="World packet path map">
          <defs>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dce9ea" />
              <stop offset="100%" stopColor="#bed1d2" />
            </linearGradient>
            <linearGradient id="routeGradient" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#f6c177" />
              <stop offset="50%" stopColor="#ff8f5a" />
              <stop offset="100%" stopColor="#f97352" />
            </linearGradient>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(255, 231, 196, 0.95)" />
              <stop offset="100%" stopColor="rgba(255, 231, 196, 0)" />
            </radialGradient>
          </defs>

          <rect className="map-ocean" x="0" y="0" width=${width} height=${height}></rect>

          ${graticuleLines.map(
            (line) => html`
              <line
                key=${line.key}
                className="graticule"
                x1=${line.x1}
                y1=${line.y1}
                x2=${line.x2}
                y2=${line.y2}
              />
            `
          )}

          <g className="continents">
            <path
              d="M65 120 C120 70, 220 55, 290 110 C320 132, 330 180, 300 210 C278 230, 282 270, 250 294 C206 328, 154 314, 118 274 C85 238, 40 204, 52 156 C56 139, 58 132, 65 120 Z"
            />
            <path
              d="M315 94 C356 62, 418 56, 470 80 C504 96, 546 102, 592 110 C652 122, 710 146, 748 180 C796 222, 804 254, 780 278 C760 298, 732 292, 705 278 C680 266, 642 268, 620 292 C598 318, 560 324, 530 308 C508 296, 488 294, 462 304 C424 318, 394 312, 378 282 C364 256, 366 232, 346 216 C310 186, 290 112, 315 94 Z"
            />
            <path
              d="M360 246 C390 230, 434 242, 454 274 C468 296, 474 344, 454 388 C432 434, 388 468, 360 452 C332 436, 318 390, 318 346 C318 300, 334 260, 360 246 Z"
            />
            <path
              d="M710 332 C740 324, 776 338, 808 366 C840 394, 850 426, 824 448 C794 470, 742 468, 706 446 C670 424, 658 388, 674 360 C682 346, 694 336, 710 332 Z"
            />
          </g>

          ${trace.segments.map((segment) => {
            const fromPoint = projectPoint(segment.from.longitude, segment.from.latitude, width, height);
            const toPoint = projectPoint(segment.to.longitude, segment.to.latitude, width, height);
            return html`
              <path
                key=${segment.id}
                className="route-segment"
                d=${buildArcPath(fromPoint, toPoint)}
              />
            `;
          })}

          ${trace.hops.map((hop) => {
            const point = projectPoint(hop.longitude, hop.latitude, width, height);
            const active = hop.id === activeHopId;
            return html`
              <g
                key=${hop.id}
                className=${`hop-node ${active ? "active" : ""}`}
                transform=${`translate(${point.x} ${point.y})`}
                onMouseEnter=${() => onSelectHop(hop.id)}
                onFocus=${() => onSelectHop(hop.id)}
                onClick=${() => onSelectHop(hop.id)}
                tabIndex="0"
              >
                <circle className="hop-glow" r="18" fill="url(#nodeGlow)"></circle>
                <circle className="hop-dot" r=${active ? "7" : "5"}></circle>
                <text className="hop-index" x="0" y="-14">${hop.hop}</text>
              </g>
            `;
          })}
        </svg>
      </div>

      <div className="map-caption">
        <strong>${trace.pathLabel}</strong>
        <span>${trace.summary}</span>
      </div>
    </section>
  `;
}

export function HopInspector({ trace, activeHop, metrics, onSelectHop }) {
  return html`
    <aside className="panel inspector-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Analysis</p>
          <h2>Hop inspector</h2>
        </div>
      </div>

      ${activeHop
        ? html`
            <div className="inspector-card active-hop-card">
              <div className="active-hop-top">
                <span className="hop-badge">Hop ${activeHop.hop}</span>
                <span className="asn-pill">${activeHop.asn}</span>
              </div>
              <h3>${formatHopLabel(activeHop)}</h3>
              <p>${activeHop.city}, ${activeHop.country}</p>
              <div className="detail-grid">
                <div>
                  <span>IP</span>
                  <strong>${activeHop.ip}</strong>
                </div>
                <div>
                  <span>Latency</span>
                  <strong>${formatLatency(activeHop.latencyMs)}</strong>
                </div>
                <div>
                  <span>ISP</span>
                  <strong>${activeHop.isp}</strong>
                </div>
                <div>
                  <span>Coordinates</span>
                  <strong>${activeHop.latitude.toFixed(1)}, ${activeHop.longitude.toFixed(1)}</strong>
                </div>
              </div>
              <p className="hop-note">${activeHop.note}</p>
            </div>
          `
        : null}

      <div className="inspector-card">
        <div className="subheading-row">
          <h3>Latency graph</h3>
          <span>${formatLatency(metrics.maxLatencyMs)} max</span>
        </div>
        <div className="latency-list">
          ${trace.hops.map((hop) => html`
            <button
              key=${hop.id}
              className=${`latency-row ${activeHop?.id === hop.id ? "selected" : ""}`}
              type="button"
              onClick=${() => onSelectHop(hop.id)}
            >
              <span className="latency-label">Hop ${hop.hop}</span>
              <span className="latency-bar-track">
                <span
                  className="latency-bar-fill"
                  style=${{ width: `${(hop.latencyMs / metrics.maxLatencyMs) * 100}%` }}
                ></span>
              </span>
              <strong>${formatLatency(hop.latencyMs)}</strong>
            </button>
          `)}
        </div>
      </div>

      <div className="inspector-card">
        <div className="subheading-row">
          <h3>Route manifest</h3>
          <span>${trace.mode}</span>
        </div>
        <div className="hop-list">
          ${trace.hops.map((hop) => html`
            <button
              key=${hop.id}
              className=${`hop-list-item ${activeHop?.id === hop.id ? "selected" : ""}`}
              type="button"
              onClick=${() => onSelectHop(hop.id)}
            >
              <span className="hop-seq">${hop.hop}</span>
              <span className="hop-copy">
                <strong>${formatHopLabel(hop)}</strong>
                <small>${hop.city}, ${hop.country}</small>
              </span>
              <span className="hop-latency">${formatLatency(hop.latencyMs)}</span>
            </button>
          `)}
        </div>
      </div>
    </aside>
  `;
}
