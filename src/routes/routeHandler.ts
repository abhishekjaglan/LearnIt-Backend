import express from "express";
import { userRouter } from "./userRoutes";
import { summaryRouter } from "./summaryRoutes";

// const router = express.Router();
const routeHandler = express();

routeHandler.use('/user', userRouter);
routeHandler.use('/summary', summaryRouter);

export { routeHandler };