import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeSite(keyword) {
    const url = `https://www.google.com/search?q=${keyword}&tbm=isch`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    return $;
}

const keyword = "coffee";

const spans = []

scrapeSite(keyword).then(result => {
    result('span').each((_idx, el) => {
        const span = result(el).text();
        spans.push(span);
    });
    console.log(spans);
}).catch(err => {
    console.error(err)
})
