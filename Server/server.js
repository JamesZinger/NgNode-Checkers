var app	= require('http').createServer(handler); 
var	io	= require('socket.io').listen(app); 
var	fs	= require('fs');
var test = require('socket.io');

var input	=	require('./input.js');
var lobby	=	require('./Lobby/lobby.js');
var game	=	require('./Game/checkers.js');

app.listen( 3000 );

function handler (req, res)
{
	fs.readFile(__dirname + '/../Client/index.html',
		function (err, data)
	{
		if (err)
		{
			res.writeHead( 500 );
			return res.end('Error loading index.html');
		}

		res.writeHead( 200 );
		res.end(data);

	});
}

io.sockets.on('connection', function(socket)
{
	console.log("Lobby: " + lobby);
	//input.SetupEvents(socket, game, lobby);

	lobby.AddClient(socket);

	//socket.emit('news', { hello: 'world' });
	//socket.on('my other event', function(data)
	//{
	//	console.log(data);
	//});
});