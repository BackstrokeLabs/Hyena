net = require('net')

var sockets = [];   // array of sockets that connect to this server

var server = net.Server(function(socket) {
	sockets.push(socket);

	socket.on('data', function(data) {
		for(var i = 0; i < sockets.length; i++) {
			if(socket!=sockets[i]) {		//wont print message onto the screen of who types a message; skips
				sockets[i].write(data);
			}
		}
	});

	socket.on('end', function(){
		var tmp = sockets.indexOf(socket);
		sockets.splice(tmp, 1); //splice - removes element from array - here remove 1 element starting from tmp(starts from 0)
	});

});

server.listen(8001);

console.log('server started');