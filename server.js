//npm install socket.io
//npm install express
//npm install gzippo

var app = require('express').createServer(), 
	io = require('socket.io').listen(app), 
	fs = require('fs'),
	gzippo = require('gzippo');
	
app.use(gzippo.staticGzip(__dirname + '/static'));

var users = [];

if(process.argv[2] == "local" || process.argv[2] == "localhost"){
	//FOR LOCALHOST
	app.listen(8080);
}else if(process.argv[2] == "cloud9"){
	//FOR CLOUD9 USE
	app.listen(process.env.C9_PORT, "0.0.0.0");
}else{
	//FOR dotcloud
	app.listen(8080);
}

//console.log("*****************"+process.argv[2]);

io.sockets.on('connection', function (socket) {	
	//console.log("connections: "+socket.namespace.manager.server.connections+" / "+io.sockets.clients().length);
	//console.log("-----------------length: "+io.sockets.clients().length+" / "+socket.id);
	
	socket.broadcast.emit('connect',{connections: users.length});
	
	socket.on('connect',function(data){
		socket.broadcast.emit('connect', {connections: users.length});
		
	});
	
	socket.on('connection',function(data){
		//socket.broadcast.emit('connect', {connections: users.length});
		
	});
    
    socket.on('disconnect', function () {
        socket.broadcast.emit('disconnect', {connections: users.length});
    });
	
	socket.on('setName', function (name) {		
	    socket.set('nickname', name, function () {
			users.push(name);
			socket.broadcast.emit('connect', {nickname:name,connections: users.length});
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
			socket.broadcast.emit('erase', { nickname:name,socketID:socket.id });
		});
	});
    
    socket.on('sendMsg', function (data) {
        socket.get('nickname', function (err, name) {
            socket.broadcast.emit('sendMsg', { draw: data,nickname:name,socketID:socket.id });
        });
    });
});



