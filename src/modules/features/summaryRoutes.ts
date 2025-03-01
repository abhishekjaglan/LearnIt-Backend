import express from "express";
import { textSummary } from "./summaryController";

const summaryRouter = express.Router();

// POST: /api/summary/
summaryRouter.route('/').post(textSummary);

export { summaryRouter };