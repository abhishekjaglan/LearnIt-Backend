// import axios from "axios";
// import * as cheerio from "cheerio";

// async function scrapeSite(keyword) {
//     const url = `https://www.google.com/search?q=${keyword}&tbm=isch`;
//     const { data } = await axios.get(url);
//     const $ = cheerio.load(data);
//     return $;
// }

// const keyword = "coffee";

// const spans = []

// scrapeSite(keyword).then(result => {
//     result('span').each((_idx, el) => {
//         const span = result(el).text();
//         spans.push(span);
//     });
//     console.log(spans);
// }).catch(err => {
//     console.error(err)
// })

import puppeteer from "puppeteer";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import fs from 'fs';
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function autoScroll(page) {
    const initialHeight = await page.evaluate(() => document.body.scrollHeight);
    let newHeight = initialHeight;
    while (true) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        setTimeout(() => { }, 500);
        newHeight = await page.evaluate(() => document.body.scrollHeight);
        if (newHeight === initialHeight) break;
        initialHeight = newHeight;
    }
}

async function clickPagination(page) {
    const nextButton = await page.$("a.page"); // Adjust selector
    if (nextButton) {
        await nextButton.click();
        await page.waitForTimeout(2000); // Wait for load
        await clickPagination(page); // Recurse
    }
}

async function renderPage(url) {
    const browser = await puppeteer.launch({
        headless: true, // Set to false for non-headless mode (optional)
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common args for stability
    });

    const page = await browser.newPage();

    // Set a realistic User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Disable automation signals to avoid detection
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false
        });
    });

    await page.goto(url, {
        waitUntil: 'networkidle0' // no network request made for 500ms
    });

    console.log("starting autoscroll");
    await autoScroll(page);
    console.log("autoscroll completed");
    console.log('pagination');
    await clickPagination(page);
    console.log('end pagination')

    return { page, browser };
}

// async function summarizeWithLLM(content) {
//     const openai = new OpenAI({
//         apiKey: "",
//     });

//     console.log('Sending request to summarize');
//     let reponse;
//     try {
//         reponse = await openai.chat.completions.create({
//             model: "text-embedding-3-large",
//             store: true,
//             messages: [
//                 { "role": "user", "content": `Summarize the following content in 5 point: ${content}` },
//             ],
//         });

//         console.log('Request sent successfully');

//     } catch (error) {
//         console.error(error)
//         throw new Error('Error sending request to OPENAI');
//     }

//     return reponse.choices[0].message.content;
// }

async function summarizeWithLLM(content) {
    console.log('Sending request to summarize');
    let response;
    try {
        const genAI = new GoogleGenerativeAI("api_key");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview" });

        const prompt = `Summarize the following content in 5-10 points optimally, effcientyly and keeping context intact: ${content}`;

        response = await model.generateContent(prompt);

    } catch (error) {
        console.error(error)
        throw new Error('Error sending request to OPENAI');
    }

    return response.response.text();
}

async function extractMainContent(page) {
    // gets the full html after our headless browser has stopped rendering and page contains all the info
    const html = await page.content();

    // Creating a DOM object specifically for Readability.js
    console.log("Making new dom");
    const doc = new JSDOM(html, { url: page.url() });
    console.log("Using readability.js heuristic aproach to find main data from the created DOM")
    const reader = new Readability(doc.window.document); // Readabiliy's heuristic appproach finds the main content using the text density and type of tags
    console.log("Parsing the retrieved main data")
    const content = reader.parse();

    if (content && content.textContent) {
        return content.textContent; // Plain text of the main content
    }

    return null;
}

async function fallBackExtractText(page) {
    const allText = await page.evaluate(() => document.body.innerText); // Getting all the text data from browser context
    return allText;
}

async function scrapeText(url) {
    console.log("Initiating Puppeteer to render the whole url provided")
    const { page, browser } = await renderPage(url);
    console.log("Puppeteer initiated");
    console.log("Extracting main content");
    let textContent = await extractMainContent(page);
    console.log("Extracting complete");

    if (!textContent) {
        console.warn('Readability.js failed due to unconventinal page structure, using fallback mechanism')
        textContent = await fallBackExtractText(page);
    }

    console.log("Closing browser")
    await browser.close();
    return textContent;
}

async function writeDataToFile(content) {
    fs.writeFileSync('./data.txt', content);
    console.log("File written")
}

async function writeSummaryDataToFile(content) {
    fs.writeFileSync('./dataSummaryGemini.txt', content);
    console.log("File written")
}

const url = 'http://quotes.toscrape.com/';
const textContent = await scrapeText(url);
await writeDataToFile(textContent);
const summaryData = await summarizeWithLLM(textContent);
if (!summaryData) {
    console.error('Error with data received');
    process.exit(1);
}
await writeSummaryDataToFile(summaryData);

console.log('DONE');