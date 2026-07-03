import { React, html } from "./lib/react.js";
import { AuthScreen, CandidateWorkspace, RecruiterWorkspace, appendUploadMetadata } from "./components.js";
import { exportCandidatePdf } from "./pdf.js";
import { storage } from "./storage.js";
import { createEmptyListItem, STEP_ORDER } from "./sample-data.js";
import { validateDossier } from "./validation.js";

function buildRecruiterCandidates(filters) {
  const query = filters.query.trim().toLowerCase();

  return storage
    .listCandidates()
    .map((candidate) => ({
      ...candidate,
      validation: validateDossier(candidate)
    }))
    .filter((candidate) => {
      const haystack = [
        candidate.personal.fullName,
        candidate.personal.headline,
        ...candidate.work.flatMap((item) => [item.company, item.role])
      ]
        .join(" ")
        .toLowerCase();

      const queryMatches = query.length === 0 || haystack.includes(query);
      const statusMatches = filters.status === "all" || candidate.validation.status === filters.status;
      const completenessMatches = candidate.validation.completeness >= filters.minCompleteness;
      return queryMatches && statusMatches && completenessMatches;
    });
}

export function App() {
  const [sessionUser, setSessionUser] = React.useState(() => storage.getCurrentUser());
  const [authError, setAuthError] = React.useState("");
  const [step, setStep] = React.useState(STEP_ORDER[0].id);
  const [dossier, setDossier] = React.useState(() =>
    sessionUser?.role === "candidate" ? storage.getCandidateDossier(sessionUser.id) : null
  );
  const [filters, setFilters] = React.useState({
    query: "",
    status: "all",
    minCompleteness: 0
  });
  const recruiterCandidates = buildRecruiterCandidates(filters);
  const [selectedCandidateId, setSelectedCandidateId] = React.useState(() => recruiterCandidates[0]?.id ?? null);

  React.useEffect(() => {
    if (!sessionUser) {
      setDossier(null);
      return;
    }

    if (sessionUser.role === "candidate") {
      setDossier(storage.getCandidateDossier(sessionUser.id));
      setStep(STEP_ORDER[0].id);
    } else {
      setDossier(null);
    }
  }, [sessionUser]);

  React.useEffect(() => {
    if (!recruiterCandidates.some((item) => item.id === selectedCandidateId)) {
      setSelectedCandidateId(recruiterCandidates[0]?.id ?? null);
    }
  }, [recruiterCandidates, selectedCandidateId]);

  const login = (credentials) => {
    try {
      const user = storage.signIn(credentials);
      setSessionUser(user);
      setAuthError("");
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const signOut = () => {
    storage.signOut();
    setSessionUser(null);
    setAuthError("");
  };

  const resetDemo = () => {
    storage.resetDemoData();
    setSessionUser(null);
    setAuthError("");
    setFilters({ query: "", status: "all", minCompleteness: 0 });
    setSelectedCandidateId(null);
  };

  const saveDossier = () => {
    if (!sessionUser || sessionUser.role !== "candidate" || !dossier) {
      return;
    }

    const validation = validateDossier(dossier);
    const nextPayload = {
      ...dossier,
      status: validation.status
    };
    const saved = storage.saveCandidateDossier(sessionUser.id, nextPayload);
    setDossier(saved);
  };

  const updatePersonal = (section, field, value) => {
    setDossier((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value
      }
    }));
  };

  const addItem = (type) => {
    const sectionKey = type === "training" ? "training" : type;
    setDossier((current) => ({
      ...current,
      [sectionKey]: [...current[sectionKey], createEmptyListItem(type)]
    }));
  };

  const updateItem = (type, itemId, field, value) => {
    const sectionKey = type === "training" ? "training" : type;
    setDossier((current) => ({
      ...current,
      [sectionKey]: current[sectionKey].map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (type, itemId) => {
    const sectionKey = type === "training" ? "training" : type;
    setDossier((current) => ({
      ...current,
      [sectionKey]: current[sectionKey].filter((item) => item.id !== itemId)
    }));
  };

  const addFiles = (event) => {
    const files = event.target.files;
    setDossier((current) => ({
      ...current,
      attachments: appendUploadMetadata(current.attachments, files)
    }));
    event.target.value = "";
  };

  if (!sessionUser) {
    return html`<${AuthScreen} onLogin=${login} onResetDemo=${resetDemo} error=${authError} />`;
  }

  if (sessionUser.role === "candidate" && dossier) {
    const validation = validateDossier(dossier);
    return html`
      <${CandidateWorkspace}
        user=${sessionUser}
        dossier=${dossier}
        validation=${validation}
        step=${step}
        setStep=${setStep}
        onChangePersonal=${updatePersonal}
        onAddItem=${addItem}
        onUpdateItem=${updateItem}
        onRemoveItem=${removeItem}
        onFilesSelected=${addFiles}
        onSave=${saveDossier}
        onExport=${() => exportCandidatePdf(dossier, validation)}
        onSignOut=${signOut}
      />
    `;
  }

  return html`
    <${RecruiterWorkspace}
      user=${sessionUser}
      candidates=${recruiterCandidates}
      selectedCandidateId=${selectedCandidateId}
      setSelectedCandidateId=${setSelectedCandidateId}
      filters=${filters}
      setFilters=${setFilters}
      onExport=${(candidate) => exportCandidatePdf(candidate, candidate.validation)}
      onSignOut=${signOut}
    />
  `;
}
