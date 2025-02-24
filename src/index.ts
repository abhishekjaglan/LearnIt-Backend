import express, { NextFunction, Request, Response } from "express";
import "dotenv/config"
import { routeHandler } from "./routes/routeHandler";
import { SummarizationError } from "./controller/summaryController";
import config from "./config/config";

const app = express();
const PORT = config.PORT;

// standard parser middleware
app.use(express.json());
app.use(express.urlencoded());

// TODO: authentication & authorization (No JWT, ccokies etc)
app.use('/api', routeHandler);
// TODO: error and exception handler (Single or Route/Function Specific)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {

    if (err instanceof SummarizationError) {
        res.status(500).json({ error: "Failed to summarize text" });
    }
});

app.listen(PORT, (error) => {
    if(error){
        console.error('Error starting the server');
    }
    console.log(`Server running on port ${PORT}`)
})