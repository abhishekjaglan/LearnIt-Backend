import express from "express";
import { userRouter } from "./modules/users/userRoutes";
import { summaryRouter } from "./modules/features/summaryRoutes";

// const router = express.Router();
const routeHandler = express();

routeHandler.use('/user', userRouter);
routeHandler.use('/summary', summaryRouter);

export { routeHandler };