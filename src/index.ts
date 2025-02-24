import express from "express";
import "dotenv/config"
import { routeHandler } from "./routes/routeHandler";

const app = express();
const PORT = process.env.PORT;

// standard parser middleware
app.use(express.json());
app.use(express.urlencoded());

// TODO: authentication & authorization (No JWT, ccokies etc)
app.use('/api', routeHandler);
// TODO: error and exception handler (Single or Route/Function Specific)

app.listen(PORT, (error) => {
    if(error){
        console.error('Error starting the server');
    }
    console.log(`Server running on port ${PORT}`)
})