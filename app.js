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

	socket.on('new user', function(data, callback) {
	data=data.trim();
	if(usernames.indexOf(data) != -1){
			callback(false);
	} else{
		callback(true);
		socket.username = data;
		usernames.push(socket.username);	
		io.sockets.emit('user list',usernames); 
		io.sockets.emit('new message',{'message': socket.username+' has joined newly','username': '**info**'});
		}
	});

	socket.on('send message', function(data) {
		io.sockets.emit('new message',{'message': data,'username': socket.username});   //send to everyone including the same client
		/*socket.broadcast.emit('new message',data);*/ //send to everyone excluding the same client
	});

	socket.on('disconnect', function(data) {
		if(!socket.username) return;
		usernames.splice(usernames.indexOf(socket.username),1);
		io.sockets.emit('user list',usernames); 
		io.sockets.emit('new message',{'message': socket.username+' disconnected from room','username': '**info**'});
	});


});
