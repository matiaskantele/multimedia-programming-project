var connectionBroker = undefined;
var connection = undefined; //Connection to opponent
var serverInfo = {hostname: '82.130.14.29', port: 7500};
var playerName = "";

function RegisterToServer() {

	// Register to server using info above. Timeouts/errors if server is not running.
	// Server is off by default, ask Kura2 in IRC if you need it
	connectionBroker = new Peer({host: serverInfo.hostname, port: serverInfo.port}, {'iceServers':[{'url':'stun:stun.l.google.com:19302'}]});

	connectionBroker.on('error', function(error){
		$('#myId').css({'text-shadow':'0 0 0.1em #C44D58, 0 0 0.1em #C44D58, 0 0 0.1em #C44D58','color':'#C44D58'});
		$('#myId').text("No connection to connection broker");
	});
	// This is run after we've successfully connected to server and recieved an ID
	connectionBroker.on('open', function(id) {
		$('#myId').css({'text-shadow':'0 0 0.1em #C7F464, 0 0 0.1em #C7F464, 0 0 0.1em #C7F464','color':'#C7F464'});
		$('#myId').text("ID: " + id);
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
		$('#welcomeScreen').fadeOut('slow', function(){});

		// Exchange player names
		playerName = $("#playerName").val();
		if(playerName === ""){
			playerName = "Unnamed";
		}
		SendData(connection, ["OpponentName", playerName]);

		//Show unit selection screen
		ShowUnitSelection();
	});

	// When remote peer connection is closed
	conn.on('close', function() {
		connection = undefined;
		alert('Disconnected from opponent!');
		$('#welcomeScreen').fadeIn('slow', function(){});
	});

	// When we recieve data from remote peer
  	conn.on('data', function(data) {
  		ReceiveData(data);
	});

  	// Peer connection errors e.g. timeouts
	conn.on('error', function(err) {
		console.log("ERROR!!!");
		console.log(err.message);
	});
}

// Game mechanics should use this function for sending data
function SendData(conn, data) {
	conn.send(data);
}

// Define game mechanics to use when receiving data
function ReceiveData(data){

	// Data must be an array
	if(!(data instanceof Array)){
		console.log("Received invalid format data: "+data);
		return;
	}

	// Received data format: ["command", value], note that value can be another array, dict etc...
	switch(data[0]){

		case "Fire":
			// Some game stuff
			break;

		case "Move":
			// And so on
			break;

		case "OpponentName":
			console.log("Connected to " + data[1]);
			break;

		default:
			// Unknown command
			console.log("Unknown command: " + data);
	}
}

//Show the screen for unit selection
//Oh god why didn't I put the css in the css file
function ShowUnitSelection(){

	//Actual div
	var $selectscreen = $("<div id='selectscreen' />").css({
		'color':'rgb(240,140,30)',
		'z-index':2,
		'width':'600px',
		'height':'300px',
		'position':'absolute',
		'top': (Math.max(0, (($(window).height()- 300)/ 2))-100) + "px",
		'left': Math.max(0, (($(window).width() - 600)/ 2))      + "px",
		'border':'5px solid rgba(0,0,0,0.5)',
		'background-color':'rgba(200,200,200,0.5)'
	});

	//Insert into DOM
	$("#container").after($selectscreen);

	//Selectionbox text
	var $selectscreentext = $("<span id='selectscreentext' />").css({
		'color':'black',
		'text-shadow': '0px 0px 10px white, 0px 0px 10px white, 0px 0px 10px white, 0px 0px 10px white, 0px 0px 10px white',
		'font-size':'200%',
		'position':'relative',
		'z-index':3,
		'top':'10px',
		'margin':'0px auto'
	}).html('Select your unit<br />Remaining money: '+money);

	//Dummy div for <span> centering
	var $dummydiv = $("<div id='dummy' />").css({'text-align':'center'})
	$selectscreen.append($dummydiv);
	$dummydiv.append($selectscreentext);

	//Button for an unit
	var $unit1btn = $("<div id='unit1btn' />").css({
		'z-index':3,
		'position':'relative',
		'width':'100px',
		'height':'100px',
		'left':'50px',
		'top':'20px',
		'border':'5px solid green',
		'background': 'url(img/dummybox.png)',
		'background-size':'contain'
	}).on('click', function(){
		addDummyUnit();
		$("#selectscreen").fadeOut('fast');
	});

	//Cost text for unit 1
	var $unit1cost = $("<span id='unit1cost' />").css({
		'z-index':3,
		'position':'relative',
		'left':'50px',
		'top':'20px',
		'font-size':'120%',
		'color':'red'
	}).html('200');

	//Append btn
	$selectscreen.append($unit1btn);

	//Cost text
	$unit1btn.after($unit1cost);

	//Button to finish unit placement
	var $finishbtn = $("<div id='unit1btn' />").css({
		'z-index':3,
		'position':'absolute',
		'width':'200px',
		'height':'80px',
		'left':'100%',
		'top':'30%',
		'background-color':'rgba(255,100,100,0.8)',
		'color':'black',
		'font-size':'120%'
	}).html('Finish unit selection').on('click', function(){
		$("#selectscreen").hide();
		//.. Send other player message about finishing unit placement etc...
	});

	$selectscreen.append($finishbtn);
}

// This function is run after whole DOM has been loaded
$(document).ready(function() {

	//ShowUnitSelection(); //Here for debugging purposes

	// Bind functions to html elements
	RegisterToServer();

	$('#connect').on('click', function() {
		ConnectToOpponent();
	});

	startGame();
});