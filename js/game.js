var money = 1000;

// Initial function to start the game
function startGame() {

	var wvReady = false;
	var wfReady = false;
	var svReady = false;
	var sfReady = false;

	var initialize = function() {
		if (wvReady && wfReady && svReady && sfReady) {
			init();
			run();
		}
	}

	$.get("shader/waterVertex.glsl", function(data) {
		$("#waterVertex").text(data);
		wvReady = true;
		initialize();
	});

	$.get("shader/waterFragment.glsl", function(data) {
		$("#waterFragment").text(data);
		wfReady = true;
		initialize();
	});

	$.get("shader/sandVertex.glsl", function(data) {
		$("#sandVertex").text(data);
		svReady = true;
		initialize();
	});

	$.get("shader/sandFragment.glsl", function(data) {
		$("#sandFragment").text(data);
		sfReady = true;
		initialize();
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
	addCursorparticle();
	addStarfield();
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