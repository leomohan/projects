import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

function addSection(doc, title, lines, startY) {
  let y = startY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, 14, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);

  lines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 180);
    doc.text(wrapped, 14, y);
    y += wrapped.length * 5 + 2;
    if (y > 280) {
      doc.addPage();
      y = 18;
    }
  });

  return y + 4;
}

export function exportCandidatePdf(dossier, validation) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(dossier.personal.fullName || "Candidate Dossier", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(dossier.personal.headline || "Structured candidate profile", 14, 28);
  doc.text(`Status: ${validation.status.toUpperCase()}  |  Completeness: ${validation.completeness}%`, 14, 35);

  let y = 46;
  y = addSection(
    doc,
    "Personal details",
    [
      `Email: ${dossier.personal.email || "-"}`,
      `Phone: ${dossier.personal.phone || "-"}`,
      `Location: ${dossier.personal.location || "-"}`,
      `Birth date: ${dossier.personal.birthDate || "-"}`,
      `Nationality: ${dossier.personal.nationality || "-"}`,
      `Family background: ${dossier.personal.familyBackground || "Not provided"}`
    ],
    y
  );

  y = addSection(
    doc,
    "Education",
    dossier.education.map(
      (item) =>
        `${item.qualification} | ${item.institution} | ${item.startDate || "-"} to ${item.endDate || "-"} | Grade: ${item.grade || "-"} | Semester marks: ${item.semesterMarks || "-"}`
    ),
    y
  );

  y = addSection(
    doc,
    "Work experience",
    dossier.work.map(
      (item) =>
        `${item.role} | ${item.company} | ${item.startDate || "-"} to ${item.endDate || "Present"} | Responsibilities: ${item.responsibilities || "-"} | Achievements: ${item.achievements || "-"} | Reason for leaving: ${item.reasonForLeaving || "-"} | Reference: ${item.referencePerson || "-"}`
    ),
    y
  );

  y = addSection(
    doc,
    "Credentials and appendices",
    [
      ...dossier.certifications.map(
        (item) => `Certification: ${item.title} | ${item.issuer} | ${item.issueDate || "-"} | Credential ID: ${item.credentialId || "-"}`
      ),
      ...dossier.achievements.map(
        (item) => `Achievement: ${item.title} | ${item.issuer || "-"} | ${item.issueDate || "-"} | ${item.description || "-"}`
      ),
      ...dossier.training.map(
        (item) => `Training: ${item.title} | ${item.provider || "-"} | ${item.issueDate || "-"} | ${item.description || "-"}`
      )
    ],
    y
  );

  y = addSection(
    doc,
    "References and attachments",
    [
      ...dossier.references.map(
        (item) => `Reference: ${item.name} | ${item.relationship} | ${item.company || "-"} | ${item.email || "-"} | ${item.phone || "-"}`
      ),
      ...dossier.attachments.map(
        (item) => `Attachment: ${item.fileName} | ${item.category || "-"} | ${item.sizeLabel || "-"} | Linked claim: ${item.linkedClaim || "-"}`
      )
    ],
    y
  );

  y = addSection(
    doc,
    "Validation summary",
    [
      ...(validation.issues.length ? validation.issues.map((item) => `Issue: ${item}`) : ["No blocking issues detected."]),
      ...(validation.warnings.length ? validation.warnings.map((item) => `Warning: ${item}`) : ["No warnings detected."])
    ],
    y
  );

  doc.save(`${(dossier.personal.fullName || "candidate-dossier").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
