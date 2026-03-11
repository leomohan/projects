import {
  CHECKLIST_SECTIONS,
  DEVICE_CRITICALITY,
  LIFECYCLE_STAGES,
  PENALTY_RULES,
  QUESTION_BANK,
  SCORE_LIMITS
} from "./constants.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeStatus(status) {
  if (status === "yes") return 1;
  if (status === "partial") return 0.5;
  return 0;
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function criticalityAdjustedValue(normalizedValue, multiplier) {
  if (normalizedValue >= 1) return 1;
  return clamp(normalizedValue / multiplier, 0, 1);
}

function scoreQuestionnaireGroup(groupKey, responses) {
  const questions = QUESTION_BANK[groupKey];
  return questions.map((question) => {
    const response = responses?.[question.id];
    const normalized = clamp((response?.score ?? 0) / question.maxScore, 0, 1);
    return {
      questionId: question.id,
      stage: question.stage,
      value: normalized,
      note: response?.note ?? ""
    };
  });
}

function scoreDeviceChecklist(deviceChecklist = []) {
  return deviceChecklist.flatMap((device) => {
    const multiplier = DEVICE_CRITICALITY[device.criticality]?.penaltyMultiplier ?? 1;
    return Object.entries(device.items || {}).map(([key, item]) => {
      const template = CHECKLIST_SECTIONS.devices.find((entry) => entry.id === key);
      const normalizedValue = normalizeStatus(item.status);
      return {
        source: device.name,
        stage: template?.stage ?? "operations",
        value: criticalityAdjustedValue(normalizedValue, multiplier),
        evidenceCount: device.evidenceCount ?? 0,
        criticality: device.criticality,
        label: template?.label ?? key
      };
    });
  });
}

function scoreProcurementChecklist(procurementChecklist = []) {
  return procurementChecklist.flatMap((record) =>
    Object.entries(record.items || {}).map(([key, item]) => {
      const template = CHECKLIST_SECTIONS.procurement.find((entry) => entry.id === key);
      return {
        source: record.name,
        stage: template?.stage ?? "procurement",
        value: normalizeStatus(item.status),
        evidenceCount: record.evidenceCount ?? 0,
        label: template?.label ?? key
      };
    })
  );
}

function stageEvidenceFactor(assessment, stageId) {
  const stageEvidence = (assessment.evidence || []).filter((item) => item.stage === stageId);
  if (!stageEvidence.length) return 0.85;
  const validatedRatio = average(stageEvidence.map((item) => (item.validated ? 1 : 0.5)));
  return clamp(validatedRatio, 0.7, 1);
}

function buildStageBreakdown(assessment) {
  const stakeholder = scoreQuestionnaireGroup("stakeholder", assessment.questionnaires?.stakeholder);
  const networkTeam = scoreQuestionnaireGroup("networkTeam", assessment.questionnaires?.networkTeam);
  const devices = scoreDeviceChecklist(assessment.deviceChecklist);
  const procurement = scoreProcurementChecklist(assessment.procurementChecklist);
  const combined = [...stakeholder, ...networkTeam, ...devices, ...procurement];

  return LIFECYCLE_STAGES.map((stage) => {
    const entries = combined.filter((entry) => entry.stage === stage.id);
    const baseScore = average(entries.map((entry) => entry.value));
    const evidenceFactor = stageEvidenceFactor(assessment, stage.id);
    const weightedScore = baseScore * evidenceFactor * stage.weight;
    return {
      id: stage.id,
      label: stage.label,
      weight: stage.weight,
      baseScore,
      evidenceFactor,
      weightedScore,
      scoreOutOf100: Math.round(weightedScore * 100 / stage.weight),
      entryCount: entries.length
    };
  });
}

function computePenalties(assessment) {
  return PENALTY_RULES.filter((rule) => rule.appliesTo(assessment)).map((rule) => ({
    id: rule.id,
    description: rule.description,
    points: rule.points
  }));
}

function deriveStarRating(totalScore) {
  if (totalScore >= 850) return 5;
  if (totalScore >= 700) return 4;
  if (totalScore >= 500) return 3;
  if (totalScore >= 300) return 2;
  return 1;
}

function deriveInsights(stageBreakdown, penalties) {
  const lowestStage = [...stageBreakdown].sort((a, b) => a.scoreOutOf100 - b.scoreOutOf100)[0];
  const strongestStage = [...stageBreakdown].sort((a, b) => b.scoreOutOf100 - a.scoreOutOf100)[0];
  const observations = [];
  const recommendations = [];

  if (lowestStage) {
    observations.push(`${lowestStage.label} is the weakest lifecycle stage in the current assessment.`);
    recommendations.push(`Prioritize a remediation plan for ${lowestStage.label.toLowerCase()} controls and evidence quality.`);
  }

  if (strongestStage) {
    observations.push(`${strongestStage.label} currently shows the best maturity performance.`);
  }

  penalties.forEach((penalty) => {
    observations.push(`Penalty applied: ${penalty.description}.`);
    recommendations.push(`Resolve the condition behind "${penalty.description}" to recover lost maturity points.`);
  });

  return { observations, recommendations };
}

export function scoreAssessment(assessment) {
  const stageBreakdown = buildStageBreakdown(assessment);
  const baseTotal = Math.round(stageBreakdown.reduce((sum, stage) => sum + stage.weightedScore, 0) * SCORE_LIMITS.max);
  const penalties = computePenalties(assessment);
  const penaltyTotal = penalties.reduce((sum, penalty) => sum + penalty.points, 0);
  const totalScore = clamp(baseTotal + penaltyTotal, SCORE_LIMITS.min, SCORE_LIMITS.max);
  const starRating = deriveStarRating(totalScore);
  const insights = deriveInsights(stageBreakdown, penalties);

  return {
    assessmentId: assessment.id,
    totalScore,
    starRating,
    baseTotal,
    penaltyTotal,
    stageBreakdown,
    penalties,
    insights
  };
}
