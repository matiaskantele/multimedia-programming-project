var container;
var camera, controls, scene, renderer;
var pickingData = [], pickingTexture, pickingScene;
var objects = [];
var highlightBox;
var clock = new THREE.Clock();

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3( 10, 10, 10 );

var skyBox;
var waterPlanet;
var sandPlanet;
var raycaster = new THREE.Raycaster();
var projector = new THREE.Projector();
var cursorParticle;

function startGame(){
	init();
	animate();
}

// Functions in scene.js
function init() {

	addCamera();
	setupRenderer();
	setupControls();

	// Scene
	scene = new THREE.Scene();

	addLights();
	addSkybox();
	addPlanets();
	addCursorparticle();
	addStarfield();

	window.addEventListener( 'resize', onWindowResize, false );
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {

	// Trackball controls
	controls.update();

	// Time for shader
	var delta = clock.getDelta();
	waterUniforms.time.value += delta;
	sandUniforms.time.value += delta;

	//Colors the face currently under mouse
	TrackPointUnderMouse();

	// Hacky way of preventing camera moving relative to skybox
	skyBox.position.copy( camera.position );
	
	renderer.render( scene, camera );

}

var cameraMovementVector = new THREE.Vector3(0,0,0);
var planetToFollowPos = new THREE.Vector3(0,0,0);

function TrackPointUnderMouse(){
	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());

	var intersects = raycaster.intersectObjects(objects, true);

	cameraMovementVector.subVectors(planetToFollowPos , controls.target).multiplyScalar(0.1);

	if(intersects.length > 0){
		cursorParticle.position = intersects[0].point;
	}
	controls.object.position.add(cameraMovementVector);
	controls.target.add(cameraMovementVector);
}

function CreateParticle(){

	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects(objects, true);

	if(intersects.length > 0){
		var wat = new THREE.IcosahedronGeometry( 50, 1 );
		var wat2 = new THREE.MeshPhongMaterial({color: 0xffffff}); 
		var itemzz = new THREE.Mesh( wat, wat2);

		itemzz.position = intersects[ 0 ].point;
		scene.add( itemzz );
	}
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// Note! This should be handled by hammer js events, e.g. "OnTap"
// This current implementation triggers even when dragging so it's not viable!
function onMouseDown(e){
	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects(objects, true);

	if(intersects.length > 0){
		planetToFollowPos = intersects[0].object.position;
	}
}

function onMouseMove( e ) {
	e.preventDefault();
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}