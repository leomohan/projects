import { CHECKLIST_SECTIONS, QUESTION_BANK } from "@netstar/shared";

function QuestionGroup({ title, questions, responses, onQuestionChange }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Questionnaire</p>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="stack">
        {questions.map((question) => (
          <label key={question.id} className="field">
            <span>{question.prompt}</span>
            <div className="field__row">
              <input
                type="range"
                min="0"
                max={question.maxScore}
                value={responses?.[question.id]?.score ?? 0}
                onChange={(event) => onQuestionChange(question.id, Number(event.target.value))}
              />
              <strong>{responses?.[question.id]?.score ?? 0}/{question.maxScore}</strong>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}

function ChecklistTable({ title, entries, sectionKey, onChecklistChange, stageLabel }) {
  const templates = CHECKLIST_SECTIONS[sectionKey];

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Checklist</p>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Scope item</th>
              <th>{stageLabel}</th>
              {templates.map((item) => (
                <th key={item.id}>{item.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, rowIndex) => (
              <tr key={`${entry.name}-${rowIndex}`}>
                <td>{entry.name}</td>
                <td>{entry.criticality || "Scoped"}</td>
                {templates.map((item) => (
                  <td key={item.id}>
                    <select
                      value={entry.items[item.id]?.status ?? "partial"}
                      onChange={(event) => onChecklistChange(rowIndex, item.id, event.target.value)}
                    >
                      <option value="yes">Yes</option>
                      <option value="partial">Partial</option>
                      <option value="no">No</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EvidencePanel({ evidence, onEvidenceToggle }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Evidence</p>
          <h3>Validation tracker</h3>
        </div>
      </div>
      <div className="stack">
        {evidence.map((item, index) => (
          <label key={`${item.name}-${index}`} className="evidence-row">
            <div>
              <strong>{item.name}</strong>
              <p>
                {item.type} · {item.stage}
              </p>
            </div>
            <input
              type="checkbox"
              checked={item.validated}
              onChange={(event) => onEvidenceToggle(index, event.target.checked)}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

export function AssessmentForm({ assessment, onAssessmentChange }) {
  const updateQuestionnaire = (groupKey, questionId, score) => {
    onAssessmentChange({
      ...assessment,
      questionnaires: {
        ...assessment.questionnaires,
        [groupKey]: {
          ...assessment.questionnaires[groupKey],
          [questionId]: {
            ...assessment.questionnaires[groupKey][questionId],
            score
          }
        }
      }
    });
  };

  const updateChecklist = (collectionKey, index, itemId, status) => {
    const current = assessment[collectionKey][index];
    const nextCollection = assessment[collectionKey].map((entry, entryIndex) =>
      entryIndex === index
        ? {
            ...entry,
            items: {
              ...entry.items,
              [itemId]: {
                ...current.items[itemId],
                status
              }
            }
          }
        : entry
    );

    onAssessmentChange({
      ...assessment,
      [collectionKey]: nextCollection
    });
  };

  const updateEvidence = (index, validated) => {
    onAssessmentChange({
      ...assessment,
      evidence: assessment.evidence.map((item, itemIndex) =>
        itemIndex === index ? { ...item, validated } : item
      )
    });
  };

  return (
    <div className="workspace-grid">
      <QuestionGroup
        title="Stakeholder Questionnaire"
        questions={QUESTION_BANK.stakeholder}
        responses={assessment.questionnaires.stakeholder}
        onQuestionChange={(questionId, score) => updateQuestionnaire("stakeholder", questionId, score)}
      />
      <QuestionGroup
        title="Network Team Questionnaire"
        questions={QUESTION_BANK.networkTeam}
        responses={assessment.questionnaires.networkTeam}
        onQuestionChange={(questionId, score) => updateQuestionnaire("networkTeam", questionId, score)}
      />
      <ChecklistTable
        title="Device Checklist"
        entries={assessment.deviceChecklist}
        sectionKey="devices"
        stageLabel="Criticality"
        onChecklistChange={(index, itemId, status) => updateChecklist("deviceChecklist", index, itemId, status)}
      />
      <ChecklistTable
        title="Procurement Checklist"
        entries={assessment.procurementChecklist}
        sectionKey="procurement"
        stageLabel="Scope"
        onChecklistChange={(index, itemId, status) =>
          updateChecklist("procurementChecklist", index, itemId, status)
        }
      />
      <EvidencePanel evidence={assessment.evidence} onEvidenceToggle={updateEvidence} />
    </div>
  );
}
