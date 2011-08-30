var app = require('http').createServer(handler), 
	io = require('socket.io').listen(app), 
	fs = require('fs')

app.listen(8080);

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
	console.log("connections: "+socket.namespace.manager.server.connections);
	//console.log("-----------------length: "+io.sockets.clients().length+" / "+socket.id);
	
	socket.emit('connect',{connections: io.sockets.clients().length});
	
	socket.on('setName', function (name) {
	    socket.set('nickname', name, function () {
	      //socket.emit('ready');
	    });
	});
	
	socket.on('move', function (data) {
		socket.get('nickname', function (err, name) {
			socket.broadcast.emit('move', { draw: data,nickname:name,socketID:socket.id });
		});	  
	});

	socket.on('down', function (data) {
		socket.get('nickname', function (err, name) {
			socket.broadcast.emit('down', { draw: data,nickname:name,socketID:socket.id });
		});
	});
	
	socket.on('mouseup', function (data) {
		socket.get('nickname', function (err, name) {
			socket.broadcast.emit('mouseup', { draw: data,nickname:name,socketID:socket.id });
		});
	});
	
	socket.on('erase', function (data) {
		socket.get('nickname', function (err, name) {
			socket.broadcast.emit('erase', { connections: socket.namespace.manager.server.connections,nickname:name,socketID:socket.id });
		});
	});	
});


//to install
//npm install socket.io
//http://socket.io/#how-to-use

