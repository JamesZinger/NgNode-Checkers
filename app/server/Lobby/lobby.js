var fs = require('fs');
var cl_template = require('./client.js');
var game_template = require('./../Game/checkers.js');
var Clients = [];
var Games = [];
var NamedClients = [];
var SciNames;
var io;

fs.readFile(__dirname + '/scientist-names.json','utf8', function(err, data)
{
	if (err)
	{
		console.Error("Cannot load JSON file for scientist-names");
		return;
	}
	SciNames = JSON.parse(data);
});

exports.init = function(ioContext)
{
	io = ioContext;
};

function request(socket, data)
{
	if ( 'undefined' == typeof socket )
	{
		return;
	}

	var res = null;
	if ( 'undefined' == typeof data || 'undefined' == typeof data.cmd )
	{
		res = {
			approved: false,
			data: "Error invaild request",
			id: data.id
		};
	}

	else
	{
		var clientContext = Clients[socket.id];
		if (clientContext.isPlaying)
			return;

		switch ( data.cmd )
		{
			//Create Game
			case 'C':
				res = createGame(clientContext, data.id);
				break;

			//Leave Game
			case 'L':
				res = leaveGame(clientContext, data.id);
				break;

			//Join Game
			case 'J':
				res = joinGame(clientContext, data.data, data.id);
				break;

			//Set Ready
			case 'R':
				res = setReady(clientContext, data.id);
				break;

			//Set Wait
			case 'W':
				res = setWait(clientContext, data.id);
				break;

			//Set Name
			case 'N':
				res = setName(clientContext, data.data, data.id);
				break;

			case 'I':
				res = lobbyInit(clientContext, data.id);
			break;

			default:
				res = {
					approved: false,
					data: "Error cannot determine command",
					id: data.id
				};
				break;
		}
	}
	socket.emit(res);
}

// Helper for adding clients to the lobby.
// Should be done on connect
exports.AddClient = function(socket)
{
	Clients[socket.id] = new cl_template.CreateClient(socket);

	socket.on('lobby', function(data)
	{
		request(socket, data);
	});

	socket.on('disconnect', function()
	{
		onDisconnect(socket);
	});
};


exports.GetClients = function()
{
	return Clients;
};

function createGame(clientContext, reqId)
{
	//Check if the player is already in a game
	if (clientContext.isInGame === true)
	{
		return {
			approved: false,
			data: "Cannot create a game if you are in a game"

		};
	}

	//Check if the play has a name 
	if('undefined' == typeof clientContext.name || clientContext.name === null)
	{
		return {
			approved: false,
			data: "Cannot create a game. client name is invaild",
			id: reqId
		};
	}

	var game = game_template.CreateGame(clientContext);

	Games[game.gameName] = game;

	pushGameCreated(game);
	pushPlayerUpdate(clientContext);

	return {
		approved: true,
		id: reqId
	};
}

function leaveGame(clientContext, reqId)
{
	if(clientContext.isInGame === false)
	{
		return{
			approved: false,
			data: "Cannot leave a game if you are not in a game",
			id: reqId
		};
	}

	if ('undefined' == typeof clientContext.name || clientContext.name === null)
	{
		return {
			approved: false,
			data: "Cannot leave game. client name is invaild",
			id: reqId
		};
	}
	
	var gameContext;

	//Leave the game
	for (var i = 0; i < Games.length; i++)
	{
		if (Games[i].id === clientContext.gameId)
		{
			gameContext = Games[i];
		}
	}

	var isGameDeleted = gameContext.leaveGame(clientContext);
	if (isGameDeleted)
	{
		pushGameClosed(game);
		delete Games[game.gameName];
	}
	else
	{
		pushGameUpdated(game);
	}
	

	pushPlayerUpdate(clientContext);
	return{
		approved: true,
		id: reqId
	};
}

function joinGame(clientContext, data, reqId)
{
	if (clientContext.isInGame === true)
	{
		return {
			approved: false,
			data: "Cannot join a game if you are in a game",
			id: reqId
		};
	}

	if ('undefined' == typeof clientContext.name || clientContext.name === null)
	{
		return{
			approved: false,
			data: "Cannot join a game if you do not have a name",
			id: reqId
		};
	}

	var gameId = NamedClients[data].gameId;

	if (gameId === -1)
		return{
			approved: false,
			data: "Player is not in a game",
			id: reqId
		};

	var gameContext;

	//Leave the game
	for (var i = 0; i < Games.length; i++)
	{
		if (Games[i].id === gameId)
		{
			gameContext = Games[i];
		}
	}

	if (gameContext.joinGame(clientContext) === true)
	{
		clientContext.isInGame = true;
		clientContext.gameId = gameId;

		pushGameUpdated(gameContext);

		return {
			approved: true,
			id: reqId
		};
	}
	else
		return{
			approved: false,
			data: "Game is either full or dosent exist anymore",
			id: reqId
		};
}

function setReady(clientContext, reqId)
{
	if (clientContext.isInGame === false)
	{
		return{
			approved: false,
			data: "Cannot ready whne you are not in a game",
			id: reqId
		};
	}

	if ('undefined' == typeof clientContext.name || clientContext.name === null)
	{
		return {
			approved: false,
			data: "Cannot ready if you do not have a name",
			id: reqId
		};
	}

	if (clientContext.isReady === true)
	{
		return {
			approved: false,
			data: "Cannot ready if you are already ready",
			id: reqId
		};
	}

	clientContext.isReady = true;

	var gameContext;

	//Leave the game
	for (var i = 0; i < Games.length; i++)
	{
		if (Games[i].id === clientContext.gameId)
		{
			gameContext = Games[i];
		}
	}

	pushGameUpdated(gameContext);

	return {
		approved: true,
		id: reqId
	};
}

function setWait(clientContext, reqId)
{
	if (clientContext.isInGame === false)
	{
		return {
			approved: false,
			data: "Must be in a game to be waiting",
			id: reqId
		};
	}

	if ('undefined' == typeof clientContext.name || clientContext.name === null)
	{
		return {
			approved: false,
			data: "Cannot wait if you do not have a name",
			id: reqId
		};
	}


	if (clientContext.isReady === false)
	{
		return {
			approved: false,
			data: "Cannot wait if you are already waiting",
			id: reqId
		};
	}

	clientContext.isReady = false;

	var gameContext;

	//Leave the game
	for (var i = 0; i < Games.length; i++)
	{
		if (Games[i].id === clientContext.gameId)
		{
			gameContext = Games[i];
		}
	}

	pushGameUpdated(gameContext);

	return {
		approved: true,
		id: reqId
	};
}

function setName(clientContext, data, reqId)
{
	if (clientContext.isInGame === true)
	{
		return {
			approved: false,
			data: "Cannot change your name if you are in a game",
			id: reqId
		};
	}

	var isPlayerCreated = false;

	if (clientContext.name !== "")
	{
		if ('undefined' != typeof NamedClients[clientContext.name])
			delete NamedClients[clientContext.name];

	}
	else
	{
		isPlayerCreated = true;
	}

	//Change the name
	if (data === '')
	{

		var name;
		do 
		{
			var potentialName = SciNames[Math.floor(Math.random()*SciNames.length)];
			
			if ('undefined' == typeof NamedClients[potentialName])
			{
				name = potentialName;
				break;
			}

		} while (true);

		clientContext.name = name;
		NamedClients[name] = clientContext;
		
		if(isPlayerCreated)
			pushPlayerCreated(clientContext);
		else
			pushPlayerUpdate(clientContext);

		return{
			approved: true,
			data: name,
			id: reqId
		};
	}

	else
	{

		if ('undefined' != NamedClients[data])
		{
			return {
				approved:false,
				data: "Name is already taken",
				id: reqId
			};
		}

		clientContext.name = data;
		NamedClients[data] = clientContext;

		if (isPlayerCreated)
			pushPlayerCreated(clientContext);
		else
			pushPlayerUpdate(clientContext);

		return {
			approved: true,
			data: data,
			id: reqId
		};
	}
}

function lobbyInit(clientContext, reqId)
{
	if (clientContext.isInGame === true)
	{
		return {
			approved: false,
			data: "something very bad happened to the client state. contact help fast",
			id: reqId
		};
	}

	if ('undefined' == typeof clientContext.name || clientContext.name === null)
	{
		return {
			approved: false,
			data: "get the lobby if you do not have a name",
			id: reqId
		};
	}
	var ret = {};
	ret.players = [];

	for (var i = 0; i < NamedClients.length; i++)
	{
		var player = {};
		player.name = NamedClients[i].name;
		player.state = (NamedClients[i].isInGame ? 'Playing' : 'Available');
		ret.players.push(player);
	}

	ret.games = [];

	for (i = 0; i < Games.length; i++)
	{
		var game = {};
		game.players = [];
		for (var j = 0; j < Games[i].players.length; j++) 
		{
			var gamePlayer = {};
			gamePlayer.name = Games[i].players[j].name;
			gamePlayer.ready = Games[i].players[j].isReady;
			game.players.push(gamePlayer);
		}
		ret.Games.push(game);
	}


	ret.id = reqId;
	clientContext.isInitalized = true;
	return ret;
}

function onDisconnect(socket)
{
	var client = Clients[socket.id];
	pushPlayerDisconnect(client);
	var name = client.name;

	delete Clients[socket.id];
	delete NamedClients[name];
}

function pushPlayerCreated(clientContext)
{

	var req = {
		cmd: "PC",
		data: {
			name: clientContext.name,
			state: (clientContext.isInGame ? 'Playing' : 'Available')
		}
	};

	sendPushRequestToAllBut(req, clientContext);
}

function pushPlayerDisconnect(clientContext)
{
	var req = {
		cmd: 'PR',
		data: clientContext.name
	};

	sendPushRequestToAllBut(req, clientContext);
}

function pushPlayerUpdate(clientContext)
{
	var req = {
		cmd: 'PU',
		data: {
			name: clientContext.name,
			state: (clientContext.isInGame ? 'Playing' : 'Available')
		}
	};

	sendPushRequestToAllBut(req, clientContext);
}

function pushGameCreated(gameContext)
{

	var game = {};
	game.players = [];
	
	for (var i = 0; i < gameContext.players.length; i++) 
	{
		var player = {
			name: gameContext.players[i].name,
			ready: gameContext.isReady
		};
		game.players.push(player);
	}

	var req = {
		cmd: 'GC',
		data: game
	};

	sendPushRequestToAllBut(req, gameContext.players[0]);
}

function pushGameClosed(gameContext)
{
	var req = {
		cmd: 'GR',
		data: gameContext.gameName
	};

	sendPushRequestToAllBut(req, gameContext.players[0]);
}

function pushGameUpdated(gameContext)
{
	var game = {};
	game.players = [];
	
	for (var i = 0; i < gameContext.players.length; i++) 
	{
		var player = {
			name: gameContext.players[i].name,
			ready: gameContext.isReady
		};
		game.players.push(player);
	}

	var req = {
		cmd: 'GU',
		data: game
	};
}

function sendPushRequestToAllBut(req, clientContext)
{
	for (var i = 0; i < NamedClients.length; i++)
	{
		if (NamedClients[i] == clientContext)
			continue;

		NamedClients[i].cl_socket.emit('lobby', req);
	}
}