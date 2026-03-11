import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import createAssessmentRouter from "./routes/assessments.js";
import metaRouter from "./routes/meta.js";
import { getRepository } from "./firebase.js";

dotenv.config();

export function createApp() {
  const app = express();
  const repository = getRepository();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  app.get("/", (_req, res) => {
    res.json({
      name: "NETSTAR Auditor Companion API",
      repositoryMode: repository.mode
    });
  });

  app.use("/api", metaRouter);
  app.use("/api/assessments", createAssessmentRouter(repository));

  app.use((error, _req, res, _next) => {
    res.status(500).json({
      message: error.message || "Unexpected server error"
    });
  });

  return app;
}
