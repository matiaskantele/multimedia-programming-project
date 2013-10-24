var cameraMovementVector = new THREE.Vector3(0,0,0);
var planetToFollowPos = new THREE.Vector3(0,0,0);

// Update is called once per frame
function update(){

	//Update shader variables
	UpdateShaders();

	// Trackball controls
	controls.update();

	//Colors the point under cursor
	TrackPointUnderMouse();

	// Prevent camera moving relative to skybox
	skyBox.position.copy( camera.position );
}

function UpdateShaders(){

	// Time for shader
	var delta = clock.getDelta();
	waterUniforms.time.value += delta;
	sandUniforms.time.value += delta;
}

// Draws a red sprite under cursor
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

// Creates a icosahedron under the cursor (used to demo point selection)
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

/*
//////////////////
// INPUT EVENTS //
//////////////////
*/

// Note! These should be handled by hammer js events, e.g. "OnTap"
// Unsolved mystery: Do these events get processed before update() loop or after?

var mouse = new THREE.Vector2();

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