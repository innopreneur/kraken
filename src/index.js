require('dotenv').config()
const { runParallel } = require('./kaggle/cluster');

runParallel();


//FIXME - scroll and get links in scraper.js