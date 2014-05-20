var express = require('express'),
	app = express(),				//express.createServer is deprecated. so use 'http' to create a server
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));
	
server.listen(8000);

userObj = {};   //object - key value pair. Username - key and socket is value

app.get('/',function(req, res) {
	res.sendfile('/index.html');
});

io.sockets.on('connection', function(socket){

	function sendUserList(){
		io.sockets.emit('user list',Object.keys(userObj));   //send the keys of object userObj i.e. sending usernames 
	}

	socket.on('new user', function(data, callback) {
	data=data.trim();
	//if(usernames.indexOf(data) != -1){
	if(data in userObj){
			callback(false);
	} else{
		callback(true);
		socket.username = data;
		userObj[socket.username] = socket;  //pushing socket value keeping username as the key.	
		sendUserList(); 
		io.sockets.emit('new message',{'message': socket.username+' has joined newly','username': '**info**'});
		}
	});

	socket.on('send message', function(data,callback) {
		msg = data.trim();
		keyword = msg.split(" ")[0];

		if(keyword === '/chat' || keyword === '/c') {
			privateUser = msg.split(" ")[1];

			if(privateUser !== socket.username) {
				if(privateUser in userObj) {
					console.log('private message');
					privateMsg = msg.substring(keyword.length+privateUser.length+1).trim();
					if( privateMsg.length > 0 ) {
						userObj[privateUser].emit('new private message',{'message': privateMsg,'username': socket.username,'ownMessage': 'false'});  //sending message to the private user
						socket.emit('new private message',{'message': privateMsg,'username': privateUser,'ownMessage': 'true'});	//sending message to the owner of the message, for marking whom he/she has sent the message
					}
					else {
						console.log('message not presemt');
						callback('Error! Enter a message to send.');
					}
				}
				else {
					console.log('user not presemt');
					callback('Error! User Not present.');
				}
			}
			else {
				console.log('Error! Cannot send private message to oneself');
				callback('Error! Cannot send private message to oneself');
			}
		}
		else if(keyword === '/help' || keyword === '/h'){
			socket.emit('new message',{'message': 'For sending private message use <b>/chat username message</b> or <b>/c username message</b>','username': '**system**'});  
		}
		else {
			io.sockets.emit('new message',{'message': data,'username': socket.username});   //send to everyone including the same client
			/*socket.broadcast.emit('new message',data);*/ //send to everyone excluding the same client
		}
	});

	socket.on('disconnect', function(data) {
		if(!socket.username) return;
		delete userObj[socket.username];
		sendUserList();
		io.sockets.emit('new message',{'message': socket.username+' disconnected from room','username': '**info**'});
	});


});
