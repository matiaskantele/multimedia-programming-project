var money = 1000;
var ownPlanetIndex = Math.random(); //If this is higher than opponent index, then you get planet 2
var ownPlanet = 1; //1 = water, 2 = sand
var particleRED; //Red particle loaded here for preloading purposes

var enemyUnitPositions = [];

// Initial function to start the game
function startGame() {

	//Load shaders
	$("#waterVertex").load("shader/waterVertex.glsl", function(){
	$("#waterFragment").load("shader/waterFragment.glsl", function(){
	$("#sandVertex").load("shader/sandVertex.glsl", function(){
	$("#sandFragment").load("shader/sandFragment.glsl", function(){
		init();
		run();
	});
	});
	});
	});
}

// Initialize scene
function init() {

	scene = new THREE.Scene();

	addCamera();
	setupRenderer();
	setupControls();
	addLights();
	addSkybox();
	addPlanets();
	addStarfield();
	loadMissile();

	//Preload particle texture
	particleRED = THREE.ImageUtils.loadTexture( 'img/smokeparticleRED.png');
}

// Game main loop
function run() {

	// WebGL internal loop
	requestAnimationFrame(run);

	// Update is called once per frame
	update();

	// Renders the image
	renderer.render(scene, camera);
}

// Handle game aspect ratio/resolution when resizing window
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}