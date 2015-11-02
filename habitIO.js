var app = require('./app'),
    http = require('http').Server(app),
    io = require('socket.io')(http);

var serverStarted = false;

function startServer() {
  if (serverStarted) { return false; }

  http.listen(app.get('port'), function() {
    console.log('Socket.io HTTP server listening on %s', app.get('port'));
  });

  serverStarted = true;
  return true;
}

module.exports = {
  io: io,
  startServer: startServer
};
