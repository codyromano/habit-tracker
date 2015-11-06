var config = require('./config'),
    app = require('./app'),
    crypto = require('crypto'),
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
  if (typeof id !== 'string') {
    throw new Error('Must provide a string to getNamespace.' +
      ' Received: ' + (typeof id));
  }
  if (!namespaces[id]) {
    namespaces[id] = io.of('/' + getNamespaceHash(id));
  }
  return namespaces[id];
}

function getNamespaceHash(id) {
  return crypto.createHash('sha512').update(id + 
    config.SOCKET_SALT).digest('hex');
}

module.exports = {
  io: io,
  getNamespace: getNamespace,
  getNamespaceHash: getNamespaceHash,
  startServer: startServer
};
