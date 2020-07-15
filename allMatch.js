let cheerio = require("cheerio");
let fs = require("fs");
let request = require("request");
let matchFile = require("./match.js");
// let url = "https://www.espncricinfo.com/scores/series/8039/season/2015/icc-cricket-world-cup?view=results";
function allMatchHandler(url) {

    request(url, cb);
}
function cb(err, header, body) {

    if (err == null && header.statusCode == 200) {
        console.log("recieved Response");
        parseHtml(body);
    } else if (header.statusCode == 404) {
        console.log("Page Not found");
    } else {
        console.log(err);
        console.log(header);
    }
}
function parseHtml(body) {
    let $ = cheerio.load(body);
    let allMatches = $(".col-md-8.col-16");
	
    for (let i = 0; i < allMatches.length; i++) {
        let allAnchors = $(allMatches[i]).find(".match-cta-container a");
        let scorecardA = allAnchors[0];
        let link = $(scorecardA).attr("href");
        let cLInk = "https://www.espncricinfo.com/" + link;
        matchFile.expfn(cLInk);

    }
}
module.exports.allMatchHandler = allMatchHandler;