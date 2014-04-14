var checkers_template = require('./checkers.js');

var game_id_counter = 1;

function Game(client)
{
	this.id       = game_id_counter;
	this.gameName = name;
	this.players  = [];
	var self      = this;

	players.push(client);

	game_id_counter++;

	this.leaveGame = function(client)
	{
		if ('undefined' == typeof client)
			return;

		var index = players.indexOf(client);
		self.players.splice(index,1);
		
		if (players.length === 0)
			return true;
		else 
			return false;
	};

	this.joinGame = function(client)
	{
		if ('undefined' == typeof client)
			return;

		if(self.players.length === 1)
		{
			self.players.push(client);
			return true;
		}
		else
		{
			return false;
		}
	};

	this.onGameStart = function ()
	{
		checkers_template.CreateGame(self);
		for (var i = 0; i < self.players.length; i++) {
			self.players[i].isPlaying = true;
		}
	};

	this.onGameEnded = function ()
	{
		for (var i = 0; i < self.players.length; i++) {
			self.players[i].isPlaying = false;
		}
	};

}

exports.CreateGame = function(client)
{
	var game = new Game(client);
	return game;
};