var fs = require('fs');

var pathToConfig = './appConfig.json';
var config = fs.readFileSync(pathToConfig, 'utf8');
config = JSON.parse(config);
config.env = (process.env.NODE_ENV=='dev') ? 'dev' : 'production';

module.exports = config;
