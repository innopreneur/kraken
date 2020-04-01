require('dotenv').config()
const { runParallel } = require('./nyc/cluster');
runParallel();


//FIXME - scroll and get links in scraper.js