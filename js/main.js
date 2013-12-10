var connectionBroker = undefined;
var connection = undefined; //Connection to opponent
var serverInfo = {hostname: 'lair.dy.fi', port: 7500};//{hostname: 'lair.dy.fi', port: 7500};
var playerName = "";

var turnCounter = 1;
var gameOver = false;
var selfLost = false; var opponentLost = false;

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

		SendData(connection, ["PlanetIndex" , ownPlanetIndex]);

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

		case "You Win":
			console.log("Got winning message");
			turnInProgress = false;
			selfReady = true; opponentReady = false;
			gameOver = true;
			opponentLost = true;
			$("#statustext").html("Game over.\nYou won!");

			//Check if game is a draw
			checkDraw();
			break;

		case "Move":
			// And so on
			break;
		case "TurnFinished":
			console.log("Opponent finished turn!");

			opponentReady = true;

			$.each(data[1], function(idx, obj){
				RegisterEnemyMissile(
					ListVec3(obj[0]),
					ListVec3(obj[1]),
					ListVec3(obj[2])
					);
			});

			if(selfReady && opponentReady){
				console.log("Both finished, ending turn!");
				finishTurn();
			}
			break;

		case "OpponentName":
			console.log("Connected to " + data[1]);
			break;

		case "UnitPlacementFinished":
			console.log("Got unit placement finished message: " + data);
			opponentReady = true;

			if(opponentReady && selfReady){

				//Begin turn...
				beginTurn();
			}

			break;

		//Define the planet you are assigned
		case "PlanetIndex":

			console.log("Assigning planets, own idx: " + ownPlanetIndex + " Opponent idx: " + data[1]);
			ownPlanet = 1; //1 = water, 2 = sand
			if(ownPlanetIndex > data[1]){
				ownPlanet = 2;
			}

			if(ownPlanet == 1){
				planetToFollowPos = objects.waterPlanet.position;
			}
			else{
				planetToFollowPos = objects.sandPlanet.position;
			}

			break;

		default:
			// Unknown command
			console.log("Unknown command: " + data);
	}
}

//Show the screen for unit selection
function ShowUnitSelection(){

	$("#statustext").html("Place your units");

	var cssfile = {rel:'stylesheet',type:'text/css',href:'css/main.css'};

	//Actual div
	var $selectscreen = $("<div id='selectscreen' />", cssfile).css({
		'bottom': (Math.max(0, (($(window).height()- 300)/ 2))-100) + "px",
		'left': Math.max(0, (($(window).width() - 600)/ 2))      + "px"
	});

	//Insert into DOM
	$("#container").after($selectscreen);

	//Selectionbox text
	var $selectscreentext = $("<span id='selectscreentext' />",cssfile).html('Select your unit<br />Remaining money: '+money);

	//Dummy div for <span> centering
	var $dummydiv = $("<div id='dummy' />").css({'text-align':'center'})
	$selectscreen.append($dummydiv);
	$dummydiv.append($selectscreentext);

	//Button for an unit
	var $unit1btn = $("<div class='unitbtn' />",cssfile).css({
		'background' : 'url(img/dummybox.png)',
		'background-size' : 'contain'
	}).on('click', function(){
		if(money - parseInt($unit1cost.html()) < 0) return; //Should show error "not enough money blabla"
		money -= parseInt($unit1cost.html());
		addDummyUnit();
		$("#selectscreen").fadeOut('fast');
		$selectscreentext.html('Select your unit<br />Remaining money: '+money);
	});

	//Cost text for unit 1
	var $unit1cost = $("<span class='unitcost' />", cssfile).css({
		'left':'50px',
    	'top':'20px'
	}).html('200');

	//Insert
	$selectscreen.append($unit1btn);
	$unit1btn.after($unit1cost);

	//Button to finish unit placement
	$finishbtn = $("<div id='finishselection' />", cssfile).html('Finish unit selection').on('click', function(){
		$("#selectscreen").hide();

		selfReady = true;
		SendData(connection, ["UnitPlacementFinished"]);
		disableControls = true;

		$("#statustext").html("Waiting for opponent to finish");

		if(selfReady && opponentReady){

			//Begin turn
			beginTurn();
		}
	});

	$selectscreen.append($finishbtn);

}

// This function is run after whole DOM has been loaded
$(document).ready(function() {

	//Uncomment these to debug unit selection/placement
	//ShowUnitSelection();
	//$('#welcomeScreen').hide();

	// Bind functions to html elements
	RegisterToServer();

	$('#connect').on('click', function() {
		ConnectToOpponent();
	});

	$("#connectTo").on('keydown', function(e){
		if(e.keyCode == 13) ConnectToOpponent();
	});

	//Add turn finish button
	addTurnFinishButton();

	//Add status text
	addStatusText();

	startGame();
});

//Begin a turn, timer down, show finish turn button
function beginTurn(){
	//$("#statustext").html("Turn " + turnCounter + ". Time left: " + turnTimeleft);
	turnTimer = 0; turnTimeShown = 0;
	turnInProgress = true;
	disableControls = false; //Enable controls
	selfReady = false;
	opponentReady = false;
	$("#finishturn").show();

	//Set turns back to usable
	$.each(objects.units, function(idx, obj){
		obj.turnUsed = false;
	});

	//Remove drawn lines
	$.each(missileLines, function(idx, obj){
		scene.remove(obj);
	});
	missileLines = [];

	console.log("Begin turn");
}

function finishTurn(){
	//Begin animating (eval phase)
	console.log("Finish turn called");
	//turnTimeShown = -1;
	turnInProgress = false;
	disableControls = true;
	turnCounter += 1;
	$("#statustext").html("Evaluating turn.");

	//If no rockets to animate we start new turn immediately
	if(rocketsToAnimate.length == 0){
		beginTurn();
		return;
	}

	//Add all rockets to scene for animation+evaluation
	$.each(rocketsToAnimate, function(idx, obj){
		scene.add(obj.object);
		objects.projectiles.push(obj);
	});
	
	ownMoves = [];
	rocketsToAnimate = [];
}

function newTurn(){
	console.log("New turn called")

	//If all own units got destroyed last turn we lost
	//Draw conclusion not done and untested
	if(objects.units.length == 0){
		SendData(connection, ["You Win"]);
		//alert("YOU LOSE");

		console.log("Sending lose message.")
		selfReady = true; opponentReady = false;
		turnInProgress = false;
		gameOver = true;
		selfLost = true;
		$("#statustext").css('color', 'red');
		$("#statustext").html("Game over.\nYou lost.");

		checkDraw();
		return;
		//Graceful disconnect/restart etc required
	}

	beginTurn();
}

//Turns threejs vec3 to a standard list
function Vec3List(vec){
	return [vec.x, vec.y, vec.z];
}

//Turns a list [x,y,z] to a threejs vec3
function ListVec3(li){
	var to_return = new THREE.Vector3(li[0], li[1], li[2]);
	return to_return;
}

//Adds turn finished button and binds functionality to it
function addTurnFinishButton(){
	var cssfile = {rel:'stylesheet',type:'text/css',href:'css/main.css'};
	$finishbtn = $("<div id='finishturn' />", cssfile)/*.html('Finish turn')*/.on('click', function(){

		if(gameOver) return;

		if(selectedUnit !== undefined){
			selectedUnit.material.color = selectedUnit.tempColor;
			selectedUnit.material.needsUpdate = true;
			selectedUnit = undefined;
		}

		selfReady = true;
		SendData(connection, ["TurnFinished", ownMoves]);

		if(selfReady && opponentReady){
			//Begin turn
			console.log("Finishing turn");
			finishTurn();
		}
	});

	$finishbtn.append(
		$("<span id='finishturntxt' />").html('Finish turn').css({
			'position':'relative',
			'font-size':'120%',
			'top':'20px',
			'color':'#C7F464'
		}));

	$("body").append($finishbtn);
	$finishbtn.hide();
}

//Adds the status text
function addStatusText(){
	var cssfile = {rel:'stylesheet',type:'text/css',href:'css/main.css'};

	var $dummyDiv = $("<div id='statusDummy' />").css({'text-align':'center', 'z-index':'9'});
	var $statusText = $("<span id='statustext' />", cssfile).html('Connect to your opponent');
	$("body").append($dummyDiv);
	$dummyDiv.append($statusText);
}

function checkDraw(){

	setTimeout(function(){
		if(selfLost && opponentLost){
			$("#statustext").html("Game over.\nDraw.");
			$("#statustext").css('color', 'yellow');
		}
	}, 400);
}