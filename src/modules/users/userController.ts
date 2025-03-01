import { Request, Response } from "express";

const userSample = (req: Request, res: Response) => {
    console.log('Inside get api/user/');
    res.status(200).json({
        messge: "Okay"
    });
}

export { userSample };