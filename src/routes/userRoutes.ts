import express from "express";
import { userSample } from "../controller/userController";

const userRouter = express.Router();

userRouter.route('/').get(userSample);

export { userRouter };