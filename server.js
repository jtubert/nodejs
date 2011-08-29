var app = require('http').createServer(handler), 
	io = require('socket.io').listen(app), 
	fs = require('fs')

app.listen(80);

var users={};



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
	
	if(!users[socket.id]){
		users[socket.id] = socket;
		//console.log("-----------------length: "+io.sockets.clients().length+" / "+socket.id);
	}
	
	socket.on('nickname', function (name) {
	    socket.set('nickname', name, function () {
	      //socket.emit('ready');
	    });
	});
	
	var nickname;
	
	socket.get('nickname', function (err, name) {
		nickname = name;
	});
	
  
	socket.on('move', function (data) {
	  socket.broadcast.emit('move', { draw: data,nickname:nickname });
	});

	socket.on('down', function (data) {
	  socket.broadcast.emit('down', { draw: data,nickname:nickname });
	});

	socket.on('erase', function (data) {
		socket.broadcast.emit('erase', { draw: data,nickname:nickname });
	});	
	
});


//to install
//npm install socket.io
//http://socket.io/#how-to-use

