const express = require('express');
const { MLBDATA } = require('../espn/data');
const home = express();

home.get('/', async (req, res) => {
    await MLBDATA.getHRLeaders();
    res.render('home/index');
})

module.exports = home;