/* global require:false,
	exports:false,
	console:false */
'use strict';
// What is Unique about a client

var client_id_counter = 1;

function client()
{
	var cl_id = -1;
	var name = "";
	var cl_socket;
	var isInGame = false;
}

exports.CreateClient = function(socket)
{
	var cl = client();
	console.log("Client: " + cl);
	cl.cl_socket = socket;
	cl.cl_id = client_id_counter;
	client_id_counter++;
	return cl;
};