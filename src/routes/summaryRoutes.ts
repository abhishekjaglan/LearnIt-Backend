import express from "express";
import { textSummary } from "../controller/summaryController";

const summaryRouter = express.Router();

// POST: /api/summary/
summaryRouter.route('/').post(textSummary);

export { summaryRouter };