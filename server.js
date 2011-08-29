var app = require('http').createServer(handler), 
	io = require('socket.io').listen(app), 
	fs = require('fs')

app.listen(80);



function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
	
  console.log("-----------------length: "+io.sockets.clients().length+" / "+socket.socket.sessionid);
  
  socket.on('move', function (data) {
    socket.broadcast.emit('move', { draw: data });
  });

  socket.on('down', function (data) {
    socket.broadcast.emit('down', { draw: data });
  });

  socket.on('erase', function (data) {
	socket.broadcast.emit('erase', { draw: data });
  });
});


//to install
//npm install socket.io
//http://socket.io/#how-to-use

