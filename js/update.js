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

	//Camera pivot point follows planetToFollowPos
	cameraMovementVector.subVectors(planetToFollowPos , controls.target).multiplyScalar(0.1);
	controls.object.position.add(cameraMovementVector);
	controls.target.add(cameraMovementVector);

	// Prevent camera moving relative to skybox
	objects.skyBox.position.copy( camera.position );
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

	//Check intersections among units and planets
	var intersects = raycaster.intersectObjects(
		objects.units.concat([objects.sandPlanet, objects.waterPlanet]),
		true);

	if(intersects.length > 0){
		objects.cursorParticle.position = intersects[0].point;
	}
}

// Creates a icosahedron under the cursor (used to demo point selection)
function CreateParticle(){

	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects([objects.sandPlanet, objects.waterPlanet], true);

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
var selectedUnit = undefined; //Unit that has been selected in game situation

// This current implementation triggers even when dragging so it's not viable!
function onMouseDown(e){

	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());

	//Check intersect between units and planets
	var intersects = raycaster.intersectObjects(
		objects.units.concat([objects.sandPlanet, objects.waterPlanet]),
		true);

	if(intersects.length > 0){

		//If an unit has been selected in unit selection screen
		if(selectionScreenSelectedUnit !== undefined){
			var pos = new THREE.Vector3();
			pos.subVectors(intersects[0].point, objects.waterPlanet.position);
			pos.multiplyScalar(0.1); //Prevents unit being half inside planet....
			pos.addVectors(pos, intersects[0].point);
			PlaceselectionScreenSelectedUnit(pos);
		}

		//If an unit has been selected in game situation
		else if(selectedUnit !== undefined){
			MoveUnit(selectedUnit, intersects[0].point);
			selectedUnit = undefined;
		}

		//About to select unit
		else if(intersects[0].object.name == "unit"){
			selectedUnit = intersects[0].object;
		}

		//Clicking on another planet
		else if(intersects[0].object.name.substr(0, 6) == "planet"){
			planetToFollowPos = intersects[0].object.position;
		}
	}
}

function onMouseMove( e ) {
	e.preventDefault();
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

//Places the object that was selected in unit selection to arg position
function PlaceselectionScreenSelectedUnit(pos){

	selectionScreenSelectedUnit.position = pos;
	selectionScreenSelectedUnit.lookAt(objects.waterPlanet.position);
	selectionScreenSelectedUnit.name = "unit";

	objects.units.push(selectionScreenSelectedUnit);
	scene.add(selectionScreenSelectedUnit);

	selectionScreenSelectedUnit = undefined;

	$("#selectscreen").show();
}

function MoveUnit(unit, position){
	//TODO, smooth movement going to be ass to implement yay
	console.log("MOVE");
	console.log(unit);
	console.log(position);
}