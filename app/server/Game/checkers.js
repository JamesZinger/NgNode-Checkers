var fs  = require('fs');

var PIECE_MAP;

fs.readFile(__dirname + '/piece-locations.json','utf8', function(err, data)
{
	if (err)
	{
		console.Error("Cannot load JSON file for piece locations");
		return;
	}
	PIECE_MAP = JSON.parse(data);
});

function Checkers(game)
{
	if ('undefined' == typeof game)
		return;

	var self			= this;
	this.board			= new Board();
	this.game			= game;
	this.players		= [];
	this.sockmap		= {};
	this.currentTurn	= 0;

	this.init = function()
	{
		var gameState = {};
		gameState.turn = this.currentTurn;

		var board = new Array(8);

		for (var i = 0; i < board.length; i++)
		{
			board[i] = new Array(8);
			for (var k = 0; k < board[i].length; k++)
			{
				board[i][k] = null;
			}
		}

		for (i = 0; i < self.board.pieces.length; i++)
		{
			for (var j = 0; j < self.board.pieces[i].length; j++)
			{
				var piece			= self.board.pieces[i][j];
				var retPiece		= {};
				var pieceIdentifier	= "";

				if		(piece.teamNumber === 0)
				{
					pieceIdentifier = "B" + piece.id;
				}
				else if	(piece.teamNumber === 1)
				{
					pieceIdentifier = "R" + piece.id;
				}

				retPiece.id		= pieceIdentifier;
				retPiece.x		= piece.x;
				retPiece.y		= piece.y;
				retPiece.king	= piece.isKing;

				board[piece.x][piece.y] = retPiece;
			}
		}

		gameState.board = board;

		for (i = 0; i < self.game.players.length; i++)
		{
			var client = self.game.players[i];
			var player = new Player(client, i);
			self.players.push(player);

			self.sockmap[client.cl_socket.id] = player;

			client.cl_socket.on('game', function(data)
			{
				self.request(client.cl_socket, data);
			});

			gameState.playerColour = i;

			ret = {};
			ret.cmd = 'SP';
			ret.data = gameState;

			client.cl_socket.emit('lobby', ret);

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
				res = movePieceRequest(self.sockmap[socket], data, self.board);
				break;

			default:
				res = {
					approved: false,
					data: "command \"" + data.cmd + "\" unrecognized."
				};
				break;
			}
		}

		socket.emit('game', res);
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

	this.switchTurn = function()
	{


		if (currentTurn === 0)
		{
			currentTurn = 1;
		}
		else if (currentTurn === 1)
		{
			currentTurn = 0;
		}

		pushTurnSwitched();
	};

	this.pushPieceMoved = function(piece)
	{
		var pieceIdentifier;

		if (currentTurn === 0)
		{
			pieceIdentifier = "B" + piece.id;
		}
		else
		{
			pieceIdentifier = "R" + piece.id;
		}

		req = {
			cmd: 'P',
			data: {
				piece: pieceIdentifier,
				x: piece.x,
				y: piece.y
			}
		};
	};

	this.pushPieceKilled = function(piece)
	{

		var pieceIdentifier;

		if (currentTurn === 0)
		{
			pieceIdentifier = "B" + piece.id;
		}
		else
		{
			pieceIdentifier = "R" + piece.id;
		}

		req = {
			cmd: 'D',
			data: {
				piece: pieceIdentifier,
			}
		};
	};

	this.pushKingedPiece = function(piece)
	{
		var pieceIdentifier;

		if (currentTurn === 0)
		{
			pieceIdentifier = "B" + piece.id;
		}
		else
		{
			pieceIdentifier = "R" + piece.id;
		}

		req = {
			cmd: 'K',
			data: {
				piece: pieceIdentifier,
			}
		};
	};

	this.pushTurnSwitched = function()
	{
		var player = self.players[currentTurn];
		req = {
			cmd: 'B',
			data: players.client.name
		};

		var reqPlayer;

		if (currentTurn === 0)
		{
			reqPlayer = self.players[1];
		}
		else if (currentTurn === 1)
		{
			reqPlayer = self.players[0];
		}

		self.sendPushRequestToOtherPlayer(req, reqPlayer);
	};

	this.pushGameOver = function(winnerNumber)
	{

		var team;
		if (winnerNumber === 1)
			team = "red";
		else if (winnerNumber === 0)
			team = "black";

		req = {
			cmd: 'GO',
			data: team
		};

		var reqPlayer;

		for (var i = 0; i < self.players.length; i++) 
		{
			self.players[i].client.cl_socket.emit('game', req);
			self.players[i].client.cl_socket.removeAllListeners('game');
		}
		self.game.onGameEnded();
	};

	this.sendPushRequestToOtherPlayer = function(req, player)
	{
		var socket;
		if (currentTurn === 0)
		{
			socket = self.players[1].client.cl_socket;
		}
		else if (currentTurn === 1)
		{
			socket = self.players[0].client.cl_socket;
		}

		socket.emit('game', req);
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

		checkers.board.tiles[self.x][self.y].movePieceOff();
		self.x = -1;
		self.y = -1;

		checkers.pushPieceKilled(self);
	};

	this.king = function(checkers)
	{
		this.isKing = true;
		checkers.pushKingedPiece(self);
	};

	this.move = function(x, y, checkers, data)
	{
		if (x < 0 || x > 7 || y < 0 || y > 7)
		{
			return {
				approved: false,
				data: "Invaild tile corrdinates",
				id: data.id
			};
		}

		var tile = checkers.board.tiles[x][y];

		//Check if the tile is moveable
		if (tile.isMoveable === false)
			return {
				approved: false,
				data: "Cannot move to an immoveable tile",
				id: data.id
			};

		var moveDist	= {};
		moveDist.x		= Math.abs(x - self.x);
		moveDist.y		= Math.abs(y - self.y);
		
		var moveDir		= {};
		moveDr.x		= Math.sign(x - self.x);
		moveDir.y		= Math.sign(y - self.y);

		if (moveDist.x > 2 || moveDist.y > 2)
		{
			return {
				approved: false,
				data: "Cannot move farther that 2 paces in one move",
				id: data.id
			};
		}


		// if the piece is a king this check is different
		if (self.isKing === false)
		{
			var dispY = y - self.y;
			//Check the direction of movement and amount of movement
			if (teamNumber === 0)
				if (dispY > 0)
					return {
						approved: false,
						data: "Cannot move to that location",
						id: data.id
					};
				

			else if (teamNumber === 1)
				if ((dispY < 0))
					return {
							approved: false,
							data: "Cannot move to that location",
							id: data.id
					};
		}

		if (tile.hasPiece === true)
		{
			return {
				approved:false,
				data: "Cannot move onto another piece",
				id: data.id
			};
		}

		//tried to jump a piece
		if (moveDist.x === 2 || moveDist.y === 2)
		{
			var tileCorrd = {};
			tileCorrd.x = x + moveDir.x;
			tileCorrd.y = y + moveDir.y;

			var midTile = checkers.board.tiles[tileCorrd.x][tileCorrd.y];
			if (midTile.hasPiece === false)
			{
				return {
					approved: false,
					data: "Cannot move over a blank tile",
					id: data.id
				};
			}

			if (midTile.pieceTeam === self.teamNumber)
			{
				return{
					approved: false,
					data:"Cannot move over a friendly piece",
					id: data.id
				};
			}

			//check if the piece and move again
			tile.movePieceOn(self);
			checkers.pushPieceMoved(piece);

			if (self.checkIfShouldKing() === true)
			{
				self.king();
			}

			///find the piece killed
			checkers.board.pieces[midTile.pieceTeam][midTile.pieceId].kill(checkers);

			//check if more can be killed
			if (self.isKing === true)
			{

			}
			else if (self.teamNumber === 0)
			{

			}
			else if (self.teamNumber === 1)
			{

			}

		}
		// only moving one and the tile is clear and vaild
		else
		{
			tile.movePieceOn(self);
			checkers.pushPieceMoved(piece);

			if (self.checkIfShouldKing() === true)
			{
				self.king();
			}

			checkers.switchTurn();

			return {
				approved: true,
				data: {
					endTurn: true
				},
				id: data.id
			};
		}
	};

	this.checkIfShouldKing = function()
	{
		if (self.isKing === true)
			return false;

		if (self.teamNumber === 1)
		{
			if (self.y === 0)
				return true;
		}

		else if (self.teamNumber === 0)
		{
			if (self.y === 7)
				return true;
		}

		return false;
	};

	this.samplePossibleMoves = function(checkers)
	{
		var startNum = 0;
		var finalNum = 0;
		if (self.isKing === true)
		{
			startNum = -1;
			finalNum = 1;
		}
		else if (self.teamNumber === 0)
		{
			startNum = -1;
			finalNum = 0;
		}
		else if (self.teamNumber === 1)
		{
			startNum = 1;
			finalNum = 2;
		}

		for (var i = -1; i < 2; i+=2)
		{
			for (var j = startNum; j <= finalNum; j+=2)
			{
				var testCorrd = {};
				testCorrd.x = self.x + i;
				testCorrd.y = self.y + j;

				if (testCorrd.x < 0 || testCorrd.x > 7 || testCorrd.y < 0 || testCorrd.y > 7)
					continue;

				var tile = checkers.board.tiles[testCorrd.x][testCorrd.y];

				if( tile.hasPiece === true && tile.pieceTeam !== self.teamNumber)
				{
					//check the tile far away
					testCorrd2 = {};
					testCorrd2.x = self.x + (i * 2);
					testCorrd2.y = self.y + (j * 2);

					if (testCorrd2.x < 0 || testCorrd2.x > 7 || testCorrd2.y < 0 || testCorrd2.y > 7)
						continue;

					var tile2 = checkers.board.tiles[testCorrd2.x][testCorrd2.y];

					if (tile2.hasPiece === false)
					{
						return true;
					}
				}
			}
		}

		return false;
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

	this.movePieceOff = function()
	{
		self.hasPiece	= false;
		self.pieceId	= -1;
		self.pieceTeam	= -1;
	};

	this.movePieceOn = function(piece)
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

	for (var i = 0; i < this.tiles.length; i++)
	{
		this.tiles[i] = new Array(8);
		var isRowEven = (i % 2 === 0);
		for (var j = 0; j < this.tiles[i].length; j++)
		{
			isColEven = (j % 2 === 0);

			this.tiles[i][j] = new Tile(i,j);

			var xor = (isRowEven ^ isColEven) === 1;
			if (xor)
				this.tiles[i][j].isMoveable = false;
			else
				this.tiles[i][j].isMoveable = true;

		}
	}

	for (i = 0; i < this.pieces.length; i++)
	{
		this.pieces[i] = new Array(12);

		for (var k = 0; k < this.pieces[i].length; k++)
		{
			var loc = PIECE_MAP[i][k];
			this.pieces[i][k] = new Piece(i, this.tiles[loc.x][loc.y], k);
		}
	}
}

function Player(client, teamNumber)
{
	if ('undefined' == typeof client || 'undefined' == typeof teamNumber)
		return;

	this.teamNumber	= teamNumber;
	this.client		= client;
}

exports.CreateGame = function( game )
{
	var checkers = new Checkers(game);
	return checkers;
};