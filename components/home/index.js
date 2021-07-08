const console = require('console');
const express = require('express');
const { MLBDATA } = require('../espn/data');
const home = express();

home.get('/', async (req, res) => {
    let mlbdata = await MLBDATA.getHRLeaders();
    res.render('home/index', {
        headers: mlbdata.headers,
        players: mlbdata.data
    });
})

module.exports = home;