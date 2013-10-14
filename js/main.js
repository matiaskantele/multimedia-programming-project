//Initialize vars here to make them global
var peer = undefined;
var connection = undefined; //Connection to another peer, should be made an array in future for possible multiple connections
var serverInfo = {hostname: '82.130.14.29', port: 7500};

function HandleReceivedData(conn, data){
	//Game related data receiving goes here
	$("#dataChannelRecieve").val(data);
	console.log(data);
}

function SendData(conn, data){
	//Game mechanics should use this function for sending data
	conn.send(data);
}

function SetConnectionEvents(conn){
	
	//When connection is established
	conn.on('open', function(){
		connection = conn;
		$("#ConnectToPeer").text("Connect to Peer");
		alert('Connection established!');
	});

	//When remote peer connection is closed
	conn.on('close', function(){
		connection = undefined;
		alert('Disconnected from peer!');
	});

	//When we recieve data from remote peer
	conn.on('data', function(data){
		HandleReceivedData(conn, data);
	});

	conn.on('error', function(err){
		$("#ConnectToPeer").text("Connect to Peer");
		console.log("ERROR!!!");
		console.log(err.message);
	});
}

function RegisterToServer(){

	//Register to server using info above. Timeouts/errors if server is not running.
	//Server is off by default, ask Kura2 in IRC if you need it
	peer = new Peer({host: serverInfo.hostname, port: serverInfo.port}, {'iceServers':[{'url':'stun:stun.l.google.com:19302'}]});

	//Error handling
	peer.on('error', function(error){
		alert(error.message);
	});

	//This is run after we've successfully connected to server and recieved an ID
	peer.on('open', function(id) {
		$("#OwnID").text("Own ID: "+id);
	});

	//Set up connection if someone connects to us
	peer.on('connection', function(conn) {
		SetConnectionEvents(conn);
	});
}

//Creates a connection to a given peer id
function ConnectToPeer(peerId){

	//Error checking
	if(peer === undefined){
		//Shouldn't be needed to test as this should be done on page load
		alert("Not connected to server");
		return false;
	}

	//Get peer ID to connect to from input box text if there's text
	if(peerId === undefined){
		if($("#dataChannelSend").val() === ""){
			alert("No peer ID specified");
			return false;
		}
		peerId = $("#dataChannelSend").val();
		$("#dataChannelSend").val(""); //Empty after taking the ID
	}

	//Actual connection
	var conn = peer.connect(peerId);

	$("#ConnectToPeer").text("Connecting...");

	//Set up connection when we connect to someone
	SetConnectionEvents(conn);
}

//This function is run after whole DOM has been loaded
$(document).ready(function() {

	//Bind functions to html elements
	RegisterToServer();

	$("#ConnectToPeer").on('click', function(){
		ConnectToPeer();
	});

	$("#Send").on('click', function(){
		//Get data from textbox (later on game functionality should use the SendData function)
		var data = $("#dataChannelSend").val();
		
		if(connection === undefined){
			alert("not connected to a peer");
		}
		else if(data === undefined || data === ""){
			alert("nothing to send!");
		}

		//Actual send data
		var k = $("#dataChannelSend").val();
		SendData(connection, k);
		$("#dataChannelSend").val(""); //clear textbox
	});

	RunGame();
});