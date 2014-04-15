var fs  = require('fs');

var PIECE_MAP;

fs.readFile(__dirname + '/piece-locations.json','utf8', function(err, data)
{
	if (err)
	{
		console.Error("Cannot load JSON file for piece locations");
		return;
	}
	pieceMap = JSON.parse(data);
});

function Checkers(game)
{
	if ('undefined' == typeof game)
		return;

	var self = this;

	this.board = new Board();
	this.game = game;

	this.players = [];

	this.currentTurn = 0;

	this.init = function()
	{
		for (var i = 0; i < self.game.players.length; i++)
		{
			var client = self.game.players[i];

			self.players[client.cl_socket] = new Player(client, i);
			
			client.cl_socket.on('game', function(data)
			{
				self.request(client.cl_socket, data);
			});
		}
	};

	this.request = function(socket, data)
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
				data: "Error invaild request"
			};
		}

		else
		{
			switch(data.cmd)
			{
			case 'M':
				res = movePieceRequest(self.players[socket], data, self.board);
				break;

			default:
				res = {
					approved: false,
					data: "command \"" + data.cmd + "\" unrecognized."
				};
				break;
			}
		}

		socket.emit(res);
	};

	this.movePieceRequest = function(player, data, board)
	{
		if ('undefined' == typeof data)
			return;

		if ('undefined' == typeof player)
			return {
				approved: false,
				data: "player object is undefined",
				id: data.id
			};

		var firstchar = data.piece.substring(0,1);
		var index = data.piece.substring(1,2);
		var piece;

		if (firstchar === 'B')
		{
			if (self.currentTurn !== 0)
			{
				return {
					approved: false,
					data: "cannot move when not on your turn",
					id: data.id
				};
			}
			piece = self.board.pieces[0][index];
		}
		else if (firstchar === 'R')
		{
			if (self.currentTurn !== 1)
			{
				return {
					approved: false,
					data: "cannot move when not on your turn",
					id: data.id
				};
			}
			piece = self.board.pieces[1][index];
		}
		var ret = piece.move(data.x, data.y, self, data);
		self.update();
		return ret;
	};

	this.update = function()
	{

	};

	this.pushPieceMoved = function(piece)
	{

	};

	this.pushPieceKilled = function(piece)
	{

	};

	this.pushKingedPiece = function(piece)
	{

	};

	this.pushTurnSwitched = function()
	{

	};

	this.pushGameOver = function()
	{

	};
}

function Piece(teamNumber, tile, id)
{
	if ('undefined' == typeof teamNumber || 'undefined' == typeof tile || 'undefined' == typeof id)
		return;

	var self		= this;
	this.x			= tile.x;
	this.y			= tile.y;
	tile.hasPiece	= true;
	this.isKing		= false;
	this.teamNumber	= teamNumber;
	this.id			= id;

	tile.movePieceOn(this);

	this.kill = function(checkers)
	{
		checkers.pushPieceKilled(self);
	};

	this.king = function(checkers)
	{
		checkers.pushKingedPiece(self);
	};

	this.move = function(x, y, checkers, data)
	{
		var tile = checkers.board.tiles[x][y];

		//Check if the tile is moveable
		if (tile.isMoveable === false)
			return {
				approved: false,
				data: "Cannot move to an immoveable tile",
				id: data.id
			};

		// if the piece is a king this check is different
		if (self.isKing === false)
		{
			//Check the direction of movement and amount of movement
			if (teamNumber === 0)
				if ((y - self.y) !== -1)
					return {
						approved: false,
						data: "Cannot move to that location",
						id: data.id
					};
				

			else if (teamNumber === 1)
				if ((y - self.y !== 1))
					return {
							approved: false,
							data: "Cannot move to that location",
							id: data.id
					};
		}

		// If the piece is a king
		else
		{
			var deltaX = Math.abs(x - self.x);
			var deltaY = Math.abs(y - self.y);

			if (deltaX !== 1 || deltaY !== 1)
				return {
					approved: false,
					data: "cannot move to that location",
					id: data.id
				};
		}

		//Check if the tile is occupied
		if (tile.hasPiece === true)
		{
			if (tile.pieceTeam === self.teamNumber)
				return {
					approved: false,
					data: "Cannot move over a friendly piece",
					id: data.id
				};


		}

		tile.movePieceOn(self);
		checkers.pushPieceMoved(piece);
	};
}

function Tile(x, y)
{
	if ('undefined' == typeof x || 'undefined' == typeof y)
		return;

	var self = this;

	this.x			= x;
	this.y			= y;
	this.hasPiece	= false;
	this.pieceId	= -1;
	this.pieceTeam	= -1;
	this.isMoveable	= false;

	tile.movePieceOff = function()
	{
		self.hasPiece	= false;
		self.pieceId	= -1;
		self.pieceTeam	= -1;
	};

	tile.movePieceOn = function(piece)
	{
		if (self.isMoveable === false)
			return false;

		self.hasPiece	= true;
		self.pieceId	= piece.id;
		self.pieceTeam	= piece.teamNumber;

		return true;
	};
}

function Board()
{
	var self = this;

	this.pieces	= new Array(2);
	this.tiles	= new Array(8);

	for (var i = 0; i < tiles.length; i++)
	{
		tiles[i] = new Array(8);
		var isRowEven = (i % 2 === 0);
		for (var j = 0; j < tiles[i].length; j++)
		{
			isColEven = (j % 2 === 0);

			tiles[i][j] = new tile(i,j);

			var xor = (isRowEven ^ isColEven) === 1;
			if (xor)
				tiles[i][j].isMoveable = false;
			else
				tiles[i][j].isMoveable = true;

		}
	}

	for (i = 0; i < pieces.length; i++)
	{
		pieces[i] = new Array(12);

		for (var k = 0; k < pieces[k].length; k++)
		{
			var loc = PIECE_MAP[i][k];
			pieces[i][k] = new Piece(i,tiles[loc.x][loc.y]);
		}
	}
}

function Player(client, teamNumber)
{
	if ('undefined' == typeof client || 'undefined' == typeof teamNumber)
		return;

	this.teamNumber = teamNumber;
	this.client = client;
}

exports.CreateGame = function( game )
{
	var checkers = new Checkers(game);
	return checkers;
};