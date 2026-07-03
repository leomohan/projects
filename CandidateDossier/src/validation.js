const DAY_MS = 1000 * 60 * 60 * 24;

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthsBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS / 30);
}

function sortByStart(list) {
  return [...list].sort((left, right) => {
    const leftDate = parseDate(left.startDate || left.issueDate)?.getTime() ?? 0;
    const rightDate = parseDate(right.startDate || right.issueDate)?.getTime() ?? 0;
    return leftDate - rightDate;
  });
}

function checkChronology(items, label) {
  const issues = [];

  items.forEach((item) => {
    const start = parseDate(item.startDate || item.issueDate);
    const end = parseDate(item.endDate);
    if (start && end && end < start) {
      issues.push(`${label}: ${item.role || item.qualification || item.title || item.company} ends before it starts.`);
    }
  });

  return issues;
}

function findEmploymentGaps(workItems) {
  const sorted = sortByStart(workItems).filter((item) => item.startDate);
  const gaps = [];

  for (let index = 1; index < sorted.length; index += 1) {
    const previousEnd = parseDate(sorted[index - 1].endDate);
    const currentStart = parseDate(sorted[index].startDate);
    if (!previousEnd || !currentStart) {
      continue;
    }

    const months = monthsBetween(previousEnd, currentStart);
    if (months > 2) {
      gaps.push({
        from: sorted[index - 1].company,
        to: sorted[index].company,
        months
      });
    }
  }

  return gaps;
}

function countFilled(values) {
  return values.filter((entry) => String(entry || "").trim().length > 0).length;
}

export function validateDossier(dossier) {
  const issues = [];
  const warnings = [];

  if (!dossier.personal.fullName || !dossier.personal.email || !dossier.personal.phone) {
    issues.push("Personal details are incomplete. Full name, email, and phone are required.");
  }

  if (dossier.education.length === 0) {
    issues.push("Education history is empty.");
  }

  if (dossier.work.length === 0) {
    issues.push("Work history is empty.");
  }

  issues.push(...checkChronology(dossier.education, "Education"));
  issues.push(...checkChronology(dossier.work, "Work entry"));
  issues.push(...checkChronology(dossier.certifications, "Certification"));
  issues.push(...checkChronology(dossier.training, "Training"));

  const gaps = findEmploymentGaps(dossier.work);
  gaps.forEach((gap) => {
    warnings.push(`Employment gap detected: ${gap.months} months between ${gap.from} and ${gap.to}.`);
  });

  if (dossier.work.some((item) => !item.referencePerson)) {
    warnings.push("At least one work entry is missing a reference person.");
  }

  if (dossier.attachments.length < Math.max(1, dossier.education.length + dossier.work.length - 1)) {
    warnings.push("Evidence coverage is thin. Add degree, mark sheet, or employment proof attachments.");
  }

  const filledCoreFields = countFilled([
    dossier.personal.fullName,
    dossier.personal.headline,
    dossier.personal.email,
    dossier.personal.phone,
    dossier.personal.location,
    dossier.personal.birthDate,
    dossier.personal.nationality
  ]);

  const completenessBase =
    filledCoreFields * 5 +
    dossier.education.length * 10 +
    dossier.work.length * 12 +
    dossier.certifications.length * 4 +
    dossier.achievements.length * 4 +
    dossier.training.length * 4 +
    dossier.references.length * 6 +
    dossier.attachments.length * 5;

  const completeness = Math.min(100, completenessBase);
  const scoreState = issues.length > 0 ? "bad" : warnings.length > 0 ? "warn" : "good";
  const status = issues.length > 0 ? "draft" : warnings.length > 0 ? "risk" : "ready";

  return {
    issues,
    warnings,
    gaps,
    completeness,
    scoreState,
    status
  };
}

export function summarizeCandidate(dossier, validation) {
  const currentRole = dossier.work.find((item) => !item.endDate) ?? dossier.work[dossier.work.length - 1];
  return {
    fullName: dossier.personal.fullName || "Unnamed candidate",
    headline: dossier.personal.headline || "No headline added",
    currentRole: currentRole ? `${currentRole.role} at ${currentRole.company}` : "No current role",
    location: dossier.personal.location || "Location missing",
    completeness: validation.completeness,
    status: validation.status,
    attachmentCount: dossier.attachments.length,
    educationCount: dossier.education.length,
    workCount: dossier.work.length
  };
}
