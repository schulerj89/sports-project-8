const createBrowserless = require('browserless');
const cheerio = require('cheerio');

const MLBDATA = {
    getHRLeaders: async () => {
        const url = 'https://www.espn.com/mlb/stats/player/_/view/batting';
        const html = await getHTML(url);
        const players = getPlayers(html, 'table tbody tr', 'table th', 'table + div table thead th', 'table + div table tbody tr', 'td');

        return players;
    }
}

async function getHTML(url) {
    // First, create a browserless factory 
    // that it will keep a singleton process running
    const browserlessFactory = createBrowserless()

    // After that, you can create as many browser context
    // as you need. The browser contexts won't share cookies/cache 
    // with other browser contexts.
    const browserless = await browserlessFactory.createContext()

    let html = await browserless.html(url);
    
    // After your task is done, destroy your browser context
    await browserless.destroyContext()

    // At the end, gracefully shutdown the browser process
    await browserlessFactory.close()

    return html;
}

function getPlayers(html, domAthletesQuery, domAthletesHeadQuery, domDataHeadQuery, domDataQuery, domDataSubQuery) {
    let dom = cheerio.load(html);
    let domAthleteElements = dom(domAthletesQuery);
    let domAthleteHeadElements = dom(domAthletesHeadQuery)
    let domDataElements = dom(domDataQuery);
    let domHeadDataElements = dom(domDataHeadQuery);
    let players = [];
    let playerHeaders = [];
    let playerData = {};
    let dataHeaders = [];

    // Get the headers from the first part of the table
    if(domAthletesHeadQuery != '') {
        for(let j = 0; j < domAthleteHeadElements.length; j++) {
            playerHeaders.push(domAthleteHeadElements.eq(j).text());
        }
        console.log(playerHeaders);
    }

    // set the headers from the table
    if(domDataHeadQuery != '') {
        for(let j = 0; j < domHeadDataElements.length; j++) {
            dataHeaders.push(domHeadDataElements.eq(j).text());
        }
        console.log(dataHeaders);
    }

    // loop through all the athletes
    for(let i = 0; i < domAthleteElements.length; i++) {
        let player = {};
        playerData = {};
        let elements = domDataElements.eq(i);

        // get data elements from first part of the table (rank, name)
        for(let j = 0; j < domAthleteElements.eq(i).find('td').length; j++) {
            console.log(domAthleteElements.eq(i).find('td').eq(j).text());
            playerData[playerHeaders[j]] = domAthleteElements.eq(i).find('td').eq(j).text();
        }

        if(domDataSubQuery != '') {
            for(let j = 0; j < elements.find(domDataSubQuery).length; j++) {
                playerData[dataHeaders[j]] = elements.find(domDataSubQuery).eq(j).text()
            }
        }

        players.push(playerData);
    }

    return players;
}

module.exports = {
    MLBDATA: MLBDATA
}