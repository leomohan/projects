import { Router } from "express";
import { sampleAssessment, scoreAssessment } from "@netstar/shared";

export default function createAssessmentRouter(repository) {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const assessments = await repository.listAssessments();
      const seeded = assessments.length ? assessments : [sampleAssessment];
      res.json(
        seeded.map((assessment) => ({
          ...assessment,
          score: scoreAssessment(assessment)
        }))
      );
    } catch (error) {
      next(error);
    }
  });

  router.post("/score", (req, res) => {
    res.json(scoreAssessment(req.body));
  });

  router.post("/", async (req, res, next) => {
    try {
      const assessment = req.body;
      const saved = await repository.saveAssessment(assessment);
      res.status(201).json({
        assessment: saved,
        score: scoreAssessment(saved)
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
