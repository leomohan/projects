import { React, html } from "./lib/react.js";
import { createEmptyListItem, STEP_ORDER } from "./sample-data.js";

function formatDateLabel(value) {
  if (!value) {
    return "Open";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short"
  });
}

export function AuthScreen({ onLogin, onResetDemo, error }) {
  const [email, setEmail] = React.useState("candidate@dossier.dev");
  const [password, setPassword] = React.useState("demo");
  const [role, setRole] = React.useState("candidate");

  const submit = (event) => {
    event.preventDefault();
    onLogin({ email, password, role });
  };

  return html`
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-pane">
          <p className="eyebrow">Structured recruitment</p>
          <h1>Candidate Dossier</h1>
          <p>
            Replace résumé guesswork with a chronological, evidence-backed candidate profile.
            Candidates submit facts. Recruiters review structured dossiers.
          </p>
          <div className="metrics-grid">
            <div className="metric-card">
              <strong>7</strong>
              <span>guided dossier steps</span>
            </div>
            <div className="metric-card">
              <strong>PDF</strong>
              <span>recruiter-ready export</span>
            </div>
            <div className="metric-card">
              <strong>Gap</strong>
              <span>employment gap detection</span>
            </div>
            <div className="metric-card">
              <strong>Local</strong>
              <span>demo mode mirroring Firebase shape</span>
            </div>
          </div>
        </div>

        <form className="auth-form" onSubmit=${submit}>
          <div className="auth-side">
            <p className="eyebrow">Sign in</p>
            <h1>Open the MVP</h1>
            <p>
              Use the demo candidate or recruiter account. Any non-empty password is accepted in
              local mode.
            </p>
          </div>

          <div className="login-grid">
            <div className="field">
              <label>Email</label>
              <input value=${email} onInput=${(event) => setEmail(event.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value=${password}
                onInput=${(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Role</label>
            <select value=${role} onChange=${(event) => setRole(event.target.value)}>
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>

          ${error ? html`<div className="validation-card status-risk">${error}</div>` : null}

          <div className="button-row">
            <button className="button-primary" type="submit">Enter workspace</button>
            <button className="button-ghost" type="button" onClick=${onResetDemo}>
              Reset demo data
            </button>
          </div>

          <p className="support-copy">
            Demo users: <span className="mono">candidate@dossier.dev</span> and
            <span className="mono"> recruiter@dossier.dev</span>
          </p>
        </form>
      </div>
    </div>
  `;
}

function StepSidebar({ step, setStep, validation }) {
  return html`
    <div className="surface sidebar">
      <p className="eyebrow">Dossier workflow</p>
      <h2 className="panel-title">Candidate steps</h2>
      <p className="muted">Each step feeds the recruiter summary and validation engine.</p>
      <div className="step-list">
        ${STEP_ORDER.map(
          (entry) => html`
            <button
              key=${entry.id}
              className=${`step-button ${step === entry.id ? "active" : ""}`}
              onClick=${() => setStep(entry.id)}
            >
              ${entry.label}
            </button>
          `
        )}
      </div>

      <div className="validation-card">
        <div className="summary-row">
          <strong>Completeness</strong>
          <span className=${`score-pill score-${validation.scoreState}`}>
            ${validation.completeness}%
          </span>
        </div>
        <ul>
          <li>${validation.issues.length} blocking issues</li>
          <li>${validation.warnings.length} recruiter warnings</li>
          <li>${validation.gaps.length} employment gaps flagged</li>
        </ul>
      </div>
    </div>
  `;
}

function PersonalStep({ dossier, onChange }) {
  const personal = dossier.personal;
  return html`
    <div className="list-stack">
      <div className="field-grid">
        <div className="field">
          <label>Full name</label>
          <input
            value=${personal.fullName}
            onInput=${(event) => onChange("personal", "fullName", event.target.value)}
          />
        </div>
        <div className="field">
          <label>Headline</label>
          <input
            value=${personal.headline}
            onInput=${(event) => onChange("personal", "headline", event.target.value)}
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            value=${personal.email}
            onInput=${(event) => onChange("personal", "email", event.target.value)}
          />
        </div>
        <div className="field">
          <label>Phone</label>
          <input
            value=${personal.phone}
            onInput=${(event) => onChange("personal", "phone", event.target.value)}
          />
        </div>
        <div className="field">
          <label>Location</label>
          <input
            value=${personal.location}
            onInput=${(event) => onChange("personal", "location", event.target.value)}
          />
        </div>
        <div className="field">
          <label>Birth date</label>
          <input
            type="date"
            value=${personal.birthDate}
            onInput=${(event) => onChange("personal", "birthDate", event.target.value)}
          />
        </div>
        <div className="field">
          <label>Nationality</label>
          <input
            value=${personal.nationality}
            onInput=${(event) => onChange("personal", "nationality", event.target.value)}
          />
        </div>
        <div className="field-full">
          <label>Family background (optional)</label>
          <textarea
            value=${personal.familyBackground}
            onInput=${(event) => onChange("personal", "familyBackground", event.target.value)}
          ></textarea>
        </div>
      </div>
    </div>
  `;
}

function renderListEditor({ title, items, fields, type, onAdd, onUpdate, onRemove }) {
  return html`
    <div className="list-stack">
      <div className="split-row">
        <div>
          <h3 className="panel-title">${title}</h3>
          <p className="muted">Add chronological, verifiable entries only.</p>
        </div>
        <button className="button-primary" type="button" onClick=${() => onAdd(type)}>
          Add item
        </button>
      </div>

      ${items.length === 0
        ? html`<div className="empty-state">No entries yet.</div>`
        : items.map(
            (item) => html`
              <div key=${item.id} className="list-card">
                <div className="item-header">
                  <div>
                    <h4 className="item-title">
                      ${item.role || item.qualification || item.title || item.name || "New item"}
                    </h4>
                    <div className="tags">
                      ${item.startDate
                        ? html`<span className="tag">
                            ${formatDateLabel(item.startDate)} to ${formatDateLabel(item.endDate)}
                          </span>`
                        : null}
                      ${item.issueDate
                        ? html`<span className="tag">${formatDateLabel(item.issueDate)}</span>`
                        : null}
                    </div>
                  </div>
                  <button className="button-ghost" type="button" onClick=${() => onRemove(type, item.id)}>
                    Remove
                  </button>
                </div>

                <div className="field-grid">
                  ${fields.map(
                    (field) => html`
                      <div className=${field.full ? "field-full" : "field"} key=${field.key}>
                        <label>${field.label}</label>
                        ${field.multiline
                          ? html`
                              <textarea
                                value=${item[field.key] || ""}
                                onInput=${(event) =>
                                  onUpdate(type, item.id, field.key, event.target.value)}
                              ></textarea>
                            `
                          : html`
                              <input
                                type=${field.type || "text"}
                                value=${item[field.key] || ""}
                                onInput=${(event) =>
                                  onUpdate(type, item.id, field.key, event.target.value)}
                              />
                            `}
                      </div>
                    `
                  )}
                </div>
              </div>
            `
          )}
    </div>
  `;
}

function CredentialsStep(props) {
  const certificationFields = [
    { key: "title", label: "Certification title" },
    { key: "issuer", label: "Issuer" },
    { key: "issueDate", label: "Issue date", type: "date" },
    { key: "credentialId", label: "Credential ID" }
  ];
  const achievementFields = [
    { key: "title", label: "Achievement title" },
    { key: "issuer", label: "Awarding body" },
    { key: "issueDate", label: "Date", type: "date" },
    { key: "description", label: "Description", multiline: true, full: true }
  ];
  const trainingFields = [
    { key: "title", label: "Training title" },
    { key: "provider", label: "Provider" },
    { key: "issueDate", label: "Completion date", type: "date" },
    { key: "description", label: "Description", multiline: true, full: true }
  ];

  return html`
    <div className="list-stack">
      ${renderListEditor({
        title: "Certifications",
        items: props.dossier.certifications,
        fields: certificationFields,
        type: "certifications",
        ...props.handlers
      })}
      ${renderListEditor({
        title: "Achievements",
        items: props.dossier.achievements,
        fields: achievementFields,
        type: "achievements",
        ...props.handlers
      })}
      ${renderListEditor({
        title: "Training",
        items: props.dossier.training,
        fields: trainingFields,
        type: "training",
        ...props.handlers
      })}
    </div>
  `;
}

function ReferencesStep({ dossier, handlers }) {
  const fields = [
    { key: "name", label: "Reference name" },
    { key: "relationship", label: "Relationship" },
    { key: "company", label: "Company" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" }
  ];

  return renderListEditor({
    title: "Professional references",
    items: dossier.references,
    fields,
    type: "references",
    ...handlers
  });
}

function AttachmentsStep({ dossier, onAdd, onUpdate, onRemove, onFilesSelected }) {
  return html`
    <div className="list-stack">
      <div className="split-row">
        <div>
          <h3 className="panel-title">Evidence attachments</h3>
          <p className="muted">
            In demo mode the app stores file metadata only. Firebase Storage would store the actual
            documents.
          </p>
        </div>
        <button className="button-primary" type="button" onClick=${() => onAdd("attachments")}>
          Add manual entry
        </button>
      </div>

      <div className="list-card">
        <label className="inline-label">Upload files</label>
        <input type="file" multiple onChange=${onFilesSelected} />
      </div>

      ${dossier.attachments.length === 0
        ? html`<div className="empty-state">No evidence added yet.</div>`
        : dossier.attachments.map(
            (item) => html`
              <div key=${item.id} className="list-card">
                <div className="item-header">
                  <div>
                    <h4 className="item-title">${item.fileName || "Untitled attachment"}</h4>
                    <div className="tags">
                      ${item.category ? html`<span className="tag">${item.category}</span>` : null}
                      ${item.sizeLabel ? html`<span className="tag">${item.sizeLabel}</span>` : null}
                    </div>
                  </div>
                  <button className="button-ghost" type="button" onClick=${() => onRemove("attachments", item.id)}>
                    Remove
                  </button>
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label>File name</label>
                    <input
                      value=${item.fileName || ""}
                      onInput=${(event) => onUpdate("attachments", item.id, "fileName", event.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Category</label>
                    <input
                      value=${item.category || ""}
                      onInput=${(event) => onUpdate("attachments", item.id, "category", event.target.value)}
                    />
                  </div>
                  <div className="field-full">
                    <label>Linked claim</label>
                    <input
                      value=${item.linkedClaim || ""}
                      onInput=${(event) => onUpdate("attachments", item.id, "linkedClaim", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            `
          )}
    </div>
  `;
}

function ReviewStep({ dossier, validation }) {
  return html`
    <div className="list-stack">
      <div className="detail-card">
        <h3 className="panel-title">Submission readiness</h3>
        <div className="score-strip">
          <span className=${`score-pill score-${validation.scoreState}`}>
            ${validation.completeness}% complete
          </span>
          <span className=${`status-pill status-${validation.status}`}>${validation.status}</span>
        </div>
        <ul>
          ${validation.issues.map((issue) => html`<li key=${issue}>${issue}</li>`)}
          ${validation.warnings.map((warning) => html`<li key=${warning}>${warning}</li>`)}
        </ul>
      </div>

      <div className="detail-card">
        <h3 className="panel-title">Final checklist</h3>
        <ul>
          <li>${dossier.education.length} education entries recorded</li>
          <li>${dossier.work.length} work entries recorded</li>
          <li>${dossier.references.length} references recorded</li>
          <li>${dossier.attachments.length} attachments linked to claims</li>
        </ul>
      </div>
    </div>
  `;
}

export function CandidateWorkspace({
  user,
  dossier,
  validation,
  step,
  setStep,
  onChangePersonal,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onFilesSelected,
  onSave,
  onExport,
  onSignOut
}) {
  const handlers = { onAdd: onAddItem, onUpdate: onUpdateItem, onRemove: onRemoveItem };

  const content = (() => {
    switch (step) {
      case "personal":
        return html`<${PersonalStep} dossier=${dossier} onChange=${onChangePersonal} />`;
      case "education":
        return renderListEditor({
          title: "Education history",
          items: dossier.education,
          fields: [
            { key: "institution", label: "Institution" },
            { key: "qualification", label: "Qualification" },
            { key: "startDate", label: "Start date", type: "date" },
            { key: "endDate", label: "End date", type: "date" },
            { key: "grade", label: "Grade / GPA" },
            { key: "semesterMarks", label: "Semester marks" },
            { key: "certificateRef", label: "Certificate reference", full: true }
          ],
          type: "education",
          ...handlers
        });
      case "work":
        return renderListEditor({
          title: "Work history",
          items: dossier.work,
          fields: [
            { key: "company", label: "Employer" },
            { key: "role", label: "Role" },
            { key: "startDate", label: "Joining date", type: "date" },
            { key: "endDate", label: "Leaving date", type: "date" },
            { key: "responsibilities", label: "Responsibilities", multiline: true, full: true },
            { key: "achievements", label: "Achievements", multiline: true, full: true },
            { key: "reasonForLeaving", label: "Reason for leaving", multiline: true, full: true },
            { key: "referencePerson", label: "Reference person" }
          ],
          type: "work",
          ...handlers
        });
      case "credentials":
        return html`<${CredentialsStep} dossier=${dossier} handlers=${handlers} />`;
      case "references":
        return html`<${ReferencesStep} dossier=${dossier} handlers=${handlers} />`;
      case "attachments":
        return html`
          <${AttachmentsStep}
            dossier=${dossier}
            onAdd=${onAddItem}
            onUpdate=${onUpdateItem}
            onRemove=${onRemoveItem}
            onFilesSelected=${onFilesSelected}
          />
        `;
      case "review":
        return html`<${ReviewStep} dossier=${dossier} validation=${validation} />`;
      default:
        return null;
    }
  })();

  return html`
    <div className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Candidate workspace</p>
          <h1>${user.displayName}</h1>
          <p>
            Build a structured dossier with dates, evidence, references, and recruiter-readable
            summaries. The validation engine flags chronology mistakes before submission.
          </p>
          <div className="score-strip">
            <span className=${`status-pill status-${validation.status}`}>${validation.status}</span>
            <span className=${`score-pill score-${validation.scoreState}`}>
              ${validation.completeness}% complete
            </span>
            <span className="tag">Storage mode: local demo</span>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <strong>${dossier.work.length}</strong>
            <span>employment records</span>
          </div>
          <div className="metric-card">
            <strong>${dossier.attachments.length}</strong>
            <span>evidence files</span>
          </div>
          <div className="metric-card">
            <strong>${validation.issues.length}</strong>
            <span>blocking validation issues</span>
          </div>
          <div className="metric-card">
            <strong>${validation.gaps.length}</strong>
            <span>employment gaps detected</span>
          </div>
        </div>
      </section>

      <section className="surface">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Current step</p>
            <h2 className="panel-title">
              ${STEP_ORDER.find((entry) => entry.id === step)?.label || "Dossier"}
            </h2>
          </div>
          <div className="toolbar-actions">
            <button className="button-primary" onClick=${onSave}>Save dossier</button>
            <button className="button-secondary" onClick=${onExport}>Download PDF</button>
            <button className="button-ghost" onClick=${() => window.print()}>Print view</button>
            <button className="button-ghost" onClick=${onSignOut}>Sign out</button>
          </div>
        </div>

        <div className="dashboard-grid">
          <${StepSidebar} step=${step} setStep=${setStep} validation=${validation} />

          <div className="surface content-panel">
            ${content}
          </div>

          <div className="surface summary-panel">
            <div className="detail-card">
              <p className="eyebrow">Profile summary</p>
              <h3>${dossier.personal.fullName || "Unnamed candidate"}</h3>
              <p className="muted">${dossier.personal.headline || "Add a professional headline."}</p>
              <div className="divider"></div>
              <p><strong>Email:</strong> ${dossier.personal.email || "-"}</p>
              <p><strong>Phone:</strong> ${dossier.personal.phone || "-"}</p>
              <p><strong>Location:</strong> ${dossier.personal.location || "-"}</p>
            </div>

            <div className="validation-card">
              <p className="eyebrow">Validation</p>
              <div className="score-strip">
                <span className=${`score-pill score-${validation.scoreState}`}>
                  ${validation.completeness}% complete
                </span>
              </div>
              <ul>
                ${validation.issues.length
                  ? validation.issues.map((issue) => html`<li key=${issue}>${issue}</li>`)
                  : html`<li>No blocking issues.</li>`}
              </ul>
            </div>

            <div className="detail-card">
              <p className="eyebrow">Evidence</p>
              <div className="attachment-list">
                ${dossier.attachments.length
                  ? dossier.attachments.map(
                      (item) => html`<span key=${item.id} className="tag">${item.fileName}</span>`
                    )
                  : html`<span className="muted">No files added.</span>`}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function RecruiterWorkspace({
  user,
  candidates,
  selectedCandidateId,
  setSelectedCandidateId,
  filters,
  setFilters,
  onExport,
  onSignOut
}) {
  const selectedCandidate = candidates.find((entry) => entry.id === selectedCandidateId) ?? candidates[0] ?? null;

  return html`
    <div className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Recruiter workspace</p>
          <h1>Structured candidate review</h1>
          <p>
            Filter candidates by dossier completeness, status, and keyword matches. Review the
            structured summary instead of interpreting a free-form CV.
          </p>
          <div className="score-strip">
            <span className="tag">${candidates.length} candidate dossiers</span>
            <span className="tag">PDF export enabled</span>
            <span className="tag">Spark-tier aligned schema</span>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <strong>${candidates.filter((item) => item.validation.status === "ready").length}</strong>
            <span>ready dossiers</span>
          </div>
          <div className="metric-card">
            <strong>${candidates.filter((item) => item.validation.gaps.length > 0).length}</strong>
            <span>gap-flagged dossiers</span>
          </div>
          <div className="metric-card">
            <strong>${Math.round(
              candidates.reduce((acc, item) => acc + item.validation.completeness, 0) /
                Math.max(1, candidates.length)
            )}%</strong>
            <span>average completeness</span>
          </div>
          <div className="metric-card">
            <strong>${selectedCandidate?.attachments.length || 0}</strong>
            <span>attachments in selected dossier</span>
          </div>
        </div>
      </section>

      <section className="surface">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Signed in as</p>
            <h2 className="panel-title">${user.displayName}</h2>
          </div>
          <div className="toolbar-actions">
            <button className="button-secondary" onClick=${() => selectedCandidate && onExport(selectedCandidate)}>
              Download selected PDF
            </button>
            <button className="button-ghost" onClick=${onSignOut}>Sign out</button>
          </div>
        </div>

        <div className="filters">
          <input
            placeholder="Search name, role, company"
            value=${filters.query}
            onInput=${(event) => setFilters({ ...filters, query: event.target.value })}
          />
          <select
            value=${filters.status}
            onChange=${(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <option value="all">All statuses</option>
            <option value="ready">Ready</option>
            <option value="risk">Risk</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value=${filters.minCompleteness}
            onChange=${(event) =>
              setFilters({ ...filters, minCompleteness: Number(event.target.value) })
            }
          >
            <option value="0">Any completeness</option>
            <option value="50">50%+</option>
            <option value="70">70%+</option>
            <option value="85">85%+</option>
          </select>
        </div>

        <div className="dashboard-grid">
          <div className="surface sidebar">
            <p className="eyebrow">Candidate list</p>
            <div className="table-grid">
              ${candidates.length
                ? candidates.map(
                    (candidate) => html`
                      <button
                        key=${candidate.id}
                        className=${`step-button ${candidate.id === selectedCandidate?.id ? "active" : ""}`}
                        onClick=${() => setSelectedCandidateId(candidate.id)}
                      >
                        <strong>${candidate.personal.fullName}</strong>
                        <div className="muted">${candidate.personal.headline}</div>
                        <div className="tags">
                          <span className=${`status-pill status-${candidate.validation.status}`}>
                            ${candidate.validation.status}
                          </span>
                          <span className=${`score-pill score-${candidate.validation.scoreState}`}>
                            ${candidate.validation.completeness}%
                          </span>
                        </div>
                      </button>
                    `
                  )
                : html`<div className="empty-state">No candidates match the current filters.</div>`}
            </div>
          </div>

          <div className="surface content-panel">
            ${selectedCandidate
              ? html`
                  <div className="candidate-card">
                    <div className="card-header">
                      <div>
                        <p className="eyebrow">Selected dossier</p>
                        <h3>${selectedCandidate.personal.fullName}</h3>
                        <p>${selectedCandidate.personal.headline}</p>
                      </div>
                      <div className="tags">
                        <span className=${`status-pill status-${selectedCandidate.validation.status}`}>
                          ${selectedCandidate.validation.status}
                        </span>
                        <span className=${`score-pill score-${selectedCandidate.validation.scoreState}`}>
                          ${selectedCandidate.validation.completeness}% complete
                        </span>
                      </div>
                    </div>

                    <div className="mini-grid">
                      <div className="mini-card">
                        <strong>Current role</strong>
                        <p>
                          ${selectedCandidate.work.find((item) => !item.endDate)?.role ||
                          selectedCandidate.work[selectedCandidate.work.length - 1]?.role ||
                          "Not provided"}
                        </p>
                      </div>
                      <div className="mini-card">
                        <strong>Location</strong>
                        <p>${selectedCandidate.personal.location || "Missing"}</p>
                      </div>
                      <div className="mini-card">
                        <strong>Education records</strong>
                        <p>${selectedCandidate.education.length}</p>
                      </div>
                      <div className="mini-card">
                        <strong>Evidence files</strong>
                        <p>${selectedCandidate.attachments.length}</p>
                      </div>
                    </div>

                    <div className="detail-card">
                      <strong>Work history</strong>
                      <ul>
                        ${selectedCandidate.work.map(
                          (item) => html`
                            <li key=${item.id}>
                              ${item.role} at ${item.company} (${formatDateLabel(item.startDate)} to
                              ${formatDateLabel(item.endDate)}) - ${item.achievements || "No achievement noted"}
                            </li>
                          `
                        )}
                      </ul>
                    </div>

                    <div className="detail-card">
                      <strong>Validation notes</strong>
                      <ul>
                        ${selectedCandidate.validation.issues.length
                          ? selectedCandidate.validation.issues.map(
                              (issue) => html`<li key=${issue}>${issue}</li>`
                            )
                          : html`<li>No blocking issues detected.</li>`}
                        ${selectedCandidate.validation.warnings.map(
                          (warning) => html`<li key=${warning}>${warning}</li>`
                        )}
                      </ul>
                    </div>

                    <div className="detail-card">
                      <strong>Attachments</strong>
                      <div className="attachment-list">
                        ${selectedCandidate.attachments.length
                          ? selectedCandidate.attachments.map(
                              (item) => html`
                                <span key=${item.id} className="tag">
                                  ${item.fileName} · ${item.category || "uncategorized"}
                                </span>
                              `
                            )
                          : html`<span className="muted">No attachments linked.</span>`}
                      </div>
                    </div>
                  </div>
                `
              : html`<div className="empty-state">Select a candidate to inspect the dossier.</div>`}
          </div>

          <div className="surface summary-panel">
            <div className="validation-card">
              <p className="eyebrow">Recruiter notes</p>
              <ul>
                <li>Chronological structure makes employment gaps explicit.</li>
                <li>Evidence list is available before interview scheduling.</li>
                <li>Exported PDF preserves recruiter-friendly sectioning.</li>
              </ul>
            </div>

            <div className="detail-card">
              <p className="eyebrow">Future module hooks</p>
              <ul>
                <li>Automated candidate scoring</li>
                <li>Interview scheduling workflow</li>
                <li>Recruiter analytics and pipeline reporting</li>
              </ul>
            </div>

            <p className="print-note">
              PDF export uses a client-side generator now. In Firebase production mode, signed
              attachment URLs and audit trails would be included here.
            </p>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function appendUploadMetadata(currentAttachments, fileList) {
  const nextItems = [...currentAttachments];
  Array.from(fileList || []).forEach((file) => {
    const entry = createEmptyListItem("attachments");
    entry.fileName = file.name;
    entry.category = "Uploaded document";
    entry.sizeLabel = `${Math.max(1, Math.round(file.size / 1024))} KB`;
    entry.linkedClaim = "";
    nextItems.push(entry);
  });
  return nextItems;
}
