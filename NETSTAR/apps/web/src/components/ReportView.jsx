import { StageBreakdown } from "./StageBreakdown.jsx";

export function ReportView({ score }) {
  return (
    <section className="report-grid">
      <StageBreakdown stages={score.stageBreakdown} />
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Audit Report</p>
            <h3>Risk observations</h3>
          </div>
        </div>
        <div className="stack">
          {score.insights.observations.map((item, index) => (
            <article key={index} className="note-card">
              {item}
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Remediation</p>
            <h3>Recommended next steps</h3>
          </div>
        </div>
        <div className="stack">
          {score.insights.recommendations.map((item, index) => (
            <article key={index} className="note-card note-card--accent">
              {item}
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Penalties</p>
            <h3>Scoring deductions</h3>
          </div>
        </div>
        <div className="stack">
          {score.penalties.length ? (
            score.penalties.map((penalty) => (
              <article key={penalty.id} className="penalty-row">
                <span>{penalty.description}</span>
                <strong>{penalty.points}</strong>
              </article>
            ))
          ) : (
            <article className="note-card">No active penalty conditions detected in the current sample.</article>
          )}
        </div>
      </section>
    </section>
  );
}
