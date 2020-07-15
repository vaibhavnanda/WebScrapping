let request = require("request");
let xlsx = require("xlsx");
let path = require("path");
// let url = "https://www.espncricinfo.com/series/8039/scorecard/656495/australia-vs-new-zealand-final-icc-cricket-world-cup-2014-15";
let fs = require("fs");
let cheerio = require("cheerio");
function matchHandler(url) {

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
    let venuElem = $(".desc.text-truncate");
    let venue = venuElem.text().trim();
    let rsElem = $(".summary span");
    let result = rsElem.text().trim();
    let bothInnings = $(".card.content-block.match-scorecard-table .Collapsible");

    for (let i = 0; i < bothInnings.length; i++) {
        let teamNameElem = $(bothInnings[i]).find("h5");
        let teamName = teamNameElem.text().split("Innings");
        teamName = teamName[0].trim();
        let AllRows = $(bothInnings[i]).find(".table.batsman tbody tr");
        for (let j = 0; j < AllRows.length; j++) {
            let allcols = $(AllRows[j]).find("td");
            let isPlayer = $(allcols[0]).hasClass("batsman-cell");
            if (isPlayer) {
                let pName = $(allcols[0]).text().trim();
                let runs = $(allcols[2]).text().trim();
                let balls = $(allcols[3]).text().trim();
                let sixes = $(allcols[5]).text().trim();
                let fours = $(allcols[6]).text().trim();
                let sr = $(allcols[7]).text().trim();
                processPlayer(teamName, pName, result, venue, runs, balls, sixes, fours, sr);
            }
        }
    }
}
function excelReader(filePath, name) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    // workbook 
    let wt = xlsx.readFile(filePath);
    let excelData = wt.Sheets[name];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

function excelWriter(filePath, json, name) {
    var newWB = xlsx.utils.book_new();
    var newWS = xlsx.utils.json_to_sheet(json)
    xlsx.utils.book_append_sheet(newWB, newWS, name)
    xlsx.writeFile(newWB, filePath);
}
function processPlayer(team, name, result, venue, runs, balls, sixes, fours, sr) {
    let obj = {
        runs, balls, sixes, fours, sr, team, result, venue
    };
    let teamPath = team;
    if (!fs.existsSync(teamPath)) {
        fs.mkdirSync(teamPath);
    }
    let playerFile = path.join(teamPath, name) + '.xlsx';
    let fileData = excelReader(playerFile, name);
    let json = fileData;
    if (fileData == null) {
        json = [];
    }
    json.push(obj);

    excelWriter(playerFile, json, name);

}


module.exports.expfn = matchHandler;