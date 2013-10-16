var connectionBroker = undefined;
var connection = undefined; //Connection to opponent
var serverInfo = {hostname: '82.130.14.29', port: 7500};
var playerName = "";

function RegisterToServer() {

	// Register to server using info above. Timeouts/errors if server is not running.
	// Server is off by default, ask Kura2 in IRC if you need it
	connectionBroker = new Peer({host: serverInfo.hostname, port: serverInfo.port}, {'iceServers':[{'url':'stun:stun.l.google.com:19302'}]});

	connectionBroker.on('error', function(error){
		$('#myId').css('color', '#C44D58');
		$('#myId').css('text-shadow', '0 0 0.1em #C44D58, 0 0 0.1em #C44D58, 0 0 0.1em #C44D58');
		$('#myId').text("No connection to connection broker");
	});
	// This is run after we've successfully connected to server and recieved an ID
	connectionBroker.on('open', function(id) {
		$('#myId').css('color', '#C7F464');
		$('#myId').css('text-shadow', '0 0 0.1em #C7F464, 0 0 0.1em #C7F464, 0 0 0.1em #C7F464');
		$('#myId').text("ID: " + id);
		console.log("Connected to brokering server");
	});

	// Set up connection if someone connects to us
	connectionBroker.on('connection', function(conn) {
		SetConnectionEvents(conn);
	});
}

// Creates a connection to a given opponents ID
function ConnectToOpponent(opponentId) {

	// Error checking
	if(connectionBroker === undefined) {
		// Shouldn't be needed to test as this should be done on page load
		alert("Not connected to server");
		return false;
	}

	// Get opponents ID to connect to from input field if there's text
	if(opponentId === undefined) {
		if($("#connectTo").val() === ""){
			alert("No opponent ID specified");
			return false;
		}
		opponentId = $("#connectTo").val();
	}

	// Actual connection
	var conn = connectionBroker.connect(opponentId);

	// Set up connection when we connect to someone
	SetConnectionEvents(conn);
}

function SetConnectionEvents(conn) {
	
	// When connection is established
	conn.on('open', function() {
		connection = conn;
		$('#welcomeScreen').css('display', 'none');
		// Exchange player names
		playerName = $("#playerName").val();
		SendData(connection, "Opponent for this match: " + playerName);
	});

	// When remote peer connection is closed
	conn.on('close', function() {
		connection = undefined;
		alert('Disconnected from opponent!');
	});

	// When we recieve data from remote peer
  	conn.on('data', function(data) {
   		console.log(data);
	});

	conn.on('error', function(err) {
		console.log("ERROR!!!");
		console.log(err.message);
	});
}

// Game mechanics should use this function for sending data
function SendData(conn, data) {
	conn.send(data);
}

// This function is run after whole DOM has been loaded
$(document).ready(function() {

	// Bind functions to html elements
	RegisterToServer();

	$('#connect').on('click', function() {
		ConnectToOpponent();
		// Check that the connection was made
		if(connection === undefined) {
			alert("Connection to opponent failed");
		}
	});

	RunGame();
});