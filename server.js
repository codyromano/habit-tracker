// Web server 
var express = require('express'); 
var app = express();

app.set('port', process.env.PORT || 3000);

// Utilities of parsing / getting system paths
var path = require('path');
var rootDir = path.dirname(require.main.filename);

// Designate 'public' as a static directory
app.use(express.static('public'));

// Treat '/' as equivalent to 'public/index.html'
app.get('/', function(req, res) {
  res.sendFile(rootDir + '/public/index.html');
});

app.listen(app.get('port'));

console.log('Listening on port %s', app.get('port'));
