function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180.0);
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function buildRadarPoints(stages, size) {
  const center = size / 2;
  const radius = size * 0.34;
  return stages
    .map((stage, index) => {
      const angle = (360 / stages.length) * index;
      const point = polarToCartesian(center, center, radius * (stage.scoreOutOf100 / 100), angle);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

export function StageBreakdown({ stages }) {
  const size = 280;
  const center = size / 2;
  const radius = size * 0.34;
  const rings = [0.25, 0.5, 0.75, 1];
  const axes = stages.map((stage, index) => {
    const angle = (360 / stages.length) * index;
    const point = polarToCartesian(center, center, radius, angle);
    return { stage, point };
  });

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Report</p>
          <h3>Lifecycle scoring breakdown</h3>
        </div>
      </div>
      <div className="radar-layout">
        <svg viewBox={`0 0 ${size} ${size}`} className="radar-chart" role="img" aria-label="Radar chart">
          {rings.map((ring) => (
            <circle
              key={ring}
              cx={center}
              cy={center}
              r={radius * ring}
              fill="none"
              stroke="rgba(126, 165, 154, 0.18)"
              strokeWidth="1"
            />
          ))}
          {axes.map(({ stage, point }) => (
            <g key={stage.id}>
              <line x1={center} y1={center} x2={point.x} y2={point.y} stroke="rgba(126, 165, 154, 0.25)" />
            </g>
          ))}
          <polygon
            points={buildRadarPoints(stages, size)}
            fill="rgba(217, 119, 6, 0.28)"
            stroke="rgba(217, 119, 6, 0.95)"
            strokeWidth="2"
          />
        </svg>
        <div className="stage-grid">
          {stages.map((stage) => (
            <article key={stage.id} className="stage-row">
              <div>
                <strong>{stage.label}</strong>
                <p>{Math.round(stage.weight * 100)}% weighted contribution</p>
              </div>
              <span>{stage.scoreOutOf100}/100</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
