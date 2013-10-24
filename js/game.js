// Initial function to start the game
function startGame(){
	init();
	run();
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
	requestAnimationFrame( run );

	// Update is called once per frame
	update();

	// Renders the image
	renderer.render( scene, camera );
}

// Handle game aspect ratio/resolution when resizing window
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}