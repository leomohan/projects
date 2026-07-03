import { Router } from "express";
import { CHECKLIST_SECTIONS, LIFECYCLE_STAGES, QUESTION_BANK, sampleAssessment } from "@netstar/shared";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "netstar-api" });
});

router.get("/template", (_req, res) => {
  res.json({
    lifecycleStages: LIFECYCLE_STAGES,
    questionBank: QUESTION_BANK,
    checklistSections: CHECKLIST_SECTIONS,
    sampleAssessment
  });
});

export default router;
