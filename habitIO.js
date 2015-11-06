var app = require('./app'),
    http = require('http').Server(app),
    io = require('socket.io')(http);

var namespaces = {};
var port = 8081;
var serverStarted = false;

function startServer() {
  if (serverStarted) { return false; }

  http.listen(port, function() {
    console.log('Socket.io HTTP server listening on %s', port);
  });

  serverStarted = true;
  return true;
}

function getNamespace(id) {
  if (!namespaces[id]) {
    namespaces[id] = io.of('/' + id);
  }
  return namespaces[id];
}

module.exports = {
  io: io,
  getNamespace: getNamespace,
  startServer: startServer
};
