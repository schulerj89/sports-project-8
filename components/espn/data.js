const createBrowserless = require('browserless');
const cheerio = require('cheerio');

const MLBDATA = {
    getHRLeaders: async () => {
        // const url = 'https://www.espn.com/mlb/stats/player/_/view/batting';
        const url = 'https://www.espn.com/mlb/stats/player/_/view/batting/table/batting/sort/homeRuns/dir/desc';
        const html = await getHTML(url);
        const players = getPlayers(html, '.Table--fixed tbody tr', 'table th', '.Table__Scroller table tbody tr', 'td');

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

function getPlayers(html, domAthletesQuery, domAthletesHeadQuery, domDataQuery, domDataSubQuery) {
    let dom = cheerio.load(html);
    let domAthleteElements = dom(domAthletesQuery);
    let domAthleteHeadElements = dom(domAthletesHeadQuery)
    let domDataElements = dom(domDataQuery);
    let players = [];
    let playerHeaders = [];
    let playerData = [];

    // Get the headers from the first part of the table
    if(domAthletesHeadQuery != '') {
        for(let j = 0; j < domAthleteHeadElements.length; j++) {
            playerHeaders.push(domAthleteHeadElements.eq(j).text());
        }
    }

    // loop through all the athletes
    for(let i = 0; i < domAthleteElements.length; i++) {
        playerData = [];
        let elements = domDataElements.eq(i);

        // get data elements from first part of the table (rank, name)
        for(let j = 0; j < domAthleteElements.eq(i).find('td').length; j++) {
            // playerData[playerHeaders[j]] = domAthleteElements.eq(i).find('td').eq(j).text();
            if(domAthleteElements.eq(i).find('td').eq(j).find('div a').length == 0) {
                playerData.push(domAthleteElements.eq(i).find('td').eq(j).text());
            } else {
                playerData.push(domAthleteElements.eq(i).find('td').eq(j).find('div a').text()); // handle getting names and not the team name
            }            
        }

        // get data elements form the rest of the table
        if(domDataSubQuery != '') {
            for(let j = 0; j < elements.find(domDataSubQuery).length; j++) {
                playerData.push(elements.find(domDataSubQuery).eq(j).text());
            }
        }

        players.push({data: playerData});
    }

    return {headers: playerHeaders, data: players};
}

module.exports = {
    MLBDATA: MLBDATA
}