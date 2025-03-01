import { NextFunction, Request, Response } from "express";
import { scrapeText, summarizeWithLLM } from "../../shared/utils/libFunctions";

export class SummarizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SummarizationError';
    }

}

// POST: /api/summary/
const textSummary = async(req: Request, res: Response, next: NextFunction) => {

    try {
        if(!req.body.url){
            console.error('URL not found in summarization request, aborting request');
            throw new SummarizationError("URL NOT FOUND")
        }
    
        const { url } = req.body;
        let textContent:string | null = null

        try {
            textContent = await scrapeText(url);

            if (!textContent) {
                console.error("No text content scraped from URL");
                throw new SummarizationError("abc")
            }
        } catch (error) {
            console.error("Error in scraping text function");
            throw new SummarizationError('Error in scraping text function')
        }

        let summaryData
        try {
            summaryData = await summarizeWithLLM(textContent);
        } catch (error) {
            console.error("Error in summarizing function")
            throw new SummarizationError("Error with summarize with llm function")
        }
    
        res.status(200).json({
            message: "Done",
            data: summaryData
        })
    } catch (error) {
        next(error);
    }
}

export { textSummary };