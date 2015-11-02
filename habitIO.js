var app = require('./main'),
    http = require('http').Server(app),
    io = require('socket.io')(http);

function startServer() {
  return http.listen(app.get('port'), function() {
    console.log('Socket.io HTTP server listening on %s', app.get('port'));
  });
}

module.exports = {
  io: io,
  startServer: startServer
};
