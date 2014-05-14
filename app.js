var express = require('express'),
	app = express(),				//express.createServer is deprecated. so use 'http' to create a server
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));
	
server.listen(8000);

usernames = [];

app.get('/',function(req, res) {
	res.sendfile('/index.html');
});

io.sockets.on('connection', function(socket){

	socket.on('send message', function(data) {
		io.sockets.emit('new message',data);   //send to everyone including the same client
		/*socket.broadcast.emit('new message',data);*/ //send to everyone excluding the same client
	});

	socket.on('new user', function(data, callback) {
		if(usernames.indexof(data) != -1){
				callback(false);
		} else{
			callback(true);
			socket.username = data.trim();
			usernames.push(socket.username);	
			io.sockets.emit('user list',usernames); 
		}
		
		
	});
});
