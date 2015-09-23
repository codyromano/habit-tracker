// Web server 
var express = require('express'); 
var app = express();

// Utilities of parsing / getting system paths
var path = require('path');
var rootDir = path.dirname(require.main.filename);

// Designate 'public' as a static directory
app.use(express.static('public'));

// Treat '/' as equivalent to 'public/index.html'
app.get('/', function(req, res) {
  res.sendFile(rootDir + '/public/index.html');
});

app.listen(process.env.PORT);
