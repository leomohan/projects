import { useEffect, useState } from "react";
import { sampleAssessment, scoreAssessment } from "@netstar/shared";
import { AssessmentForm } from "./components/AssessmentForm.jsx";
import { ReportView } from "./components/ReportView.jsx";
import { ScoreCard } from "./components/ScoreCard.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function loadTemplate() {
  const response = await fetch(`${API_URL}/template`);
  if (!response.ok) {
    throw new Error("Failed to load template");
  }
  return response.json();
}

async function persistAssessment(assessment) {
  const response = await fetch(`${API_URL}/assessments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(assessment)
  });

  if (!response.ok) {
    throw new Error("Failed to save assessment");
  }

  return response.json();
}

export default function App() {
  const [assessment, setAssessment] = useState(sampleAssessment);
  const [template, setTemplate] = useState(null);
  const [mode, setMode] = useState("dashboard");
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    loadTemplate()
      .then((payload) => {
        setTemplate(payload);
        setAssessment(payload.sampleAssessment);
      })
      .catch(() => {
        setError("API unavailable. Running in local demo mode with bundled sample data.");
      });
  }, []);

  const score = scoreAssessment(assessment);
  const completedEvidence = assessment.evidence.filter((item) => item.validated).length;
  const totalEvidence = assessment.evidence.length;

  const handleSave = async () => {
    setSaveMessage("");
    try {
      await persistAssessment(assessment);
      setSaveMessage("Assessment saved to the API repository.");
    } catch (_saveError) {
      setSaveMessage("API save unavailable in local demo mode.");
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="brand">NETSTAR</p>
          <h1>Auditor Companion</h1>
          <p className="sidebar__copy">
            Evidence-backed network maturity assessments for human auditors. No automated scanning claims.
          </p>
        </div>
        <nav className="nav">
          {["dashboard", "workspace", "reports"].map((item) => (
            <button
              key={item}
              className={mode === item ? "nav__item nav__item--active" : "nav__item"}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar__foot">
          <span>Organization</span>
          <strong>{assessment.organization.name}</strong>
          <span>{assessment.scope.title}</span>
        </div>
      </aside>

      <main className="content">
        <header className="hero">
          <div>
            <p className="eyebrow">Network Maturity Model Companion</p>
            <h2>Audit lifecycle scoring with explicit evidence and validation checkpoints</h2>
            <p className="hero__copy">
              Track questionnaires, checklists, remediation signals, and maturity reporting across procurement,
              design, operations, security, and lifecycle retirement.
            </p>
          </div>
          <div className="hero__actions">
            <button className="hero__button" onClick={handleSave}>
              Save assessment
            </button>
            <div className="hero__badge">
              <span>Current rating</span>
              <strong>{score.starRating} / 5 stars</strong>
            </div>
          </div>
        </header>

        {error ? <div className="banner">{error}</div> : null}
        {template ? <div className="banner banner--soft">Template loaded from API.</div> : null}
        {saveMessage ? <div className="banner banner--soft">{saveMessage}</div> : null}

        <section className="score-grid">
          <ScoreCard label="Total maturity" value={`${score.totalScore}/1000`} accent="#f59e0b" helper="Weighted lifecycle score" />
          <ScoreCard label="Penalty total" value={`${score.penaltyTotal}`} accent="#f87171" helper="Risk deductions applied" />
          <ScoreCard
            label="Evidence readiness"
            value={`${completedEvidence}/${totalEvidence}`}
            accent="#7ea59a"
            helper="Validated evidence items"
          />
          <ScoreCard label="Scoped assets" value={String(Object.values(assessment.scope.deviceTotals).reduce((sum, count) => sum + count, 0))} accent="#d8c29d" helper="Red, orange, and green devices" />
        </section>

        {mode === "dashboard" ? (
          <section className="dashboard-grid">
            <section className="panel panel--hero">
              <div className="panel__header">
                <div>
                  <p className="eyebrow">Assessment overview</p>
                  <h3>Active assessments</h3>
                </div>
              </div>
              <article className="assessment-card">
                <div>
                  <strong>{assessment.scope.title}</strong>
                  <p>{assessment.scope.summary}</p>
                </div>
                <span className="pill">{assessment.status}</span>
              </article>
              <div className="mini-grid">
                {score.stageBreakdown.map((stage) => (
                  <article key={stage.id} className="mini-metric">
                    <span>{stage.label}</span>
                    <strong>{stage.scoreOutOf100}</strong>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel__header">
                <div>
                  <p className="eyebrow">Core principle</p>
                  <h3>Human validation required</h3>
                </div>
              </div>
              <div className="stack">
                <article className="note-card">
                  Redundancy claims remain unproven until an auditor verifies the actual power path, circuit diversity,
                  and evidence quality.
                </article>
                <article className="note-card">
                  NETSTAR records evidence and scoring logic, but it does not replace on-site or design-level review.
                </article>
              </div>
            </section>
          </section>
        ) : null}

        {mode === "workspace" ? <AssessmentForm assessment={assessment} onAssessmentChange={setAssessment} /> : null}
        {mode === "reports" ? <ReportView score={score} /> : null}
      </main>
    </div>
  );
}
