import express from "express";

const summaryRouter = express.Router();

summaryRouter.route('/').post();

export { summaryRouter };