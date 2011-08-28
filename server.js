var app = require('http').createServer(handler), 
	io = require('socket.io').listen(app), 
	fs = require('fs')

app.listen(80);



function handler (req, res) {
  fs.readFile(__dirname + '/client.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading client.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  
  socket.on('news', function (data) {
    socket.broadcast.emit('news', { hello: data });
  });
});


//to install
//npm install socket.io
//http://socket.io/#how-to-use

