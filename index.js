const PORT = 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const res = require("express/lib/response");

const app = express();
const headlines = [];
const sources = [
  {
    name: "BusinessStandard",
    address:
      "https://www.business-standard.com/category/international-news-economy-1160102.htm",
    url: "https://www.business-standard.com",
  },
  {
    name: "TheEconomicTimes",
    address: "https://economictimes.indiatimes.com/topic/global-economy",
    url: "https://economictimes.indiatimes.com",
  },
  {
    name: "TheHindu",
    address: "https://www.thehindu.com/business/Economy/",
    url: "",
  },
];
sources.forEach((elements) => {
  axios.get(elements.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html); //jQuery based so using $ as variable name following convention
    const allHeadings = $("a:contains(econom)", html);
    //have to use keyword 'function' to use 'this' keyword. '()=>' doesnt work
    allHeadings.each(function () {
      const title = $(this).text(); //getting the text in the 'a' tags
      const url = $(this).attr("href"); //getting the links
      headlines.push({
        publication: elements.name,
        title,
        url: elements.url + url,
      });
    });
  });
});

app.get("/firstPage", (req, resp) => {
  resp.json(headlines);
});
//the callback should be async to allow axios to fetch data and then go to next line.
app.get("/:newsPaperId", async (req, res) => {
  const newsPaperId = req.params.newsPaperId;
  const newsPaper = sources.filter((item) => item.name == newsPaperId)[0];
  const newsPaperAdrs = newsPaper.address;
  const specificHeadlines = [];
  console.log(typeof newsPaper);
  // await keyword wait until axios.get method is completed
  axios
    .get(newsPaperAdrs)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const headingsOnly = $("a:contains(econom)", html);
      // console.log(headingsOnly);
      headingsOnly.each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");
        specificHeadlines.push({
          publication: newsPaperId,
          title,
          url: newsPaper.url + url,
        });
      });
      res.json(specificHeadlines);
    })
    .catch((err) => console.log(err));
});
app.listen(PORT);
