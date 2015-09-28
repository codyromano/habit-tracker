var express      =  require('express'),
    fs           =  require('fs'),
    path         =  require('path'),
    AWS          =  require('aws-sdk'),
    bodyParser   =  require('body-parser'),
    _            =  require('underscore'),
    Habit        =  require('./habit');

var habit        =  new Habit();

// General config including params needed by AWS
var config = fs.readFileSync('./appConfig.json', 'utf8');
config = JSON.parse(config);

// AWS and DynamoDB configuration
AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION
});
var db = new AWS.DynamoDB({region: config.AWS_REGION});

// Configure express server
var app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var rootDir = path.dirname(require.main.filename);

// Designate 'public' as a static directory
app.use(express.static('public'));

// Treat '/' as equivalent to 'public/index.html'
app.get('/', function(req, res) {
  res.sendFile(rootDir + '/public/index.html');
});

app.post('/api/habits/', habit.saveAll.bind(undefined, config, db));

app.listen(app.get('port'));
console.log('Listening on port %s', app.get('port'));
