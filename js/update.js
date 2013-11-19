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

//Tracks the points and intersects under mouse every frame
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
		if(objects.cursorObject !== undefined){
			objects.cursorObject.position = intersects[0].point;
			objects.cursorObject.lookAt(intersects[0].object.position);
		}
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
			PlaceselectionScreenSelectedUnit(intersects[0].point, intersects[0].object.name);
		}

		//If an unit has been selected in game situation
		else if(selectedUnit !== undefined){
			MoveUnit(selectedUnit, intersects[0].point, intersects[0].object.name);
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
function PlaceselectionScreenSelectedUnit(intersectPt, clickedObject){

	if(ownPlanet == 1 && clickedObject != "planet1"){
		return;
	}
	else if(ownPlanet == 2 && clickedObject != "planet2"){
		return;
	}

	var pos = new THREE.Vector3();

	if(ownPlanet == 1){
		pos.subVectors(intersectPt, objects.waterPlanet.position);
		pos.multiplyScalar(0.1); //Prevents unit being half inside planet....
		pos.addVectors(pos, intersectPt);
		selectionScreenSelectedUnit.position = pos;
		selectionScreenSelectedUnit.lookAt(objects.waterPlanet.position);
	}
	else if(ownPlanet == 2){
		pos.subVectors(intersectPt, objects.sandPlanet.position);
		pos.multiplyScalar(0.1); //Prevents unit being half inside planet....
		pos.addVectors(pos, intersectPt);
		selectionScreenSelectedUnit.position = pos;
		selectionScreenSelectedUnit.lookAt(objects.sandPlanet.position);		
	}

	selectionScreenSelectedUnit.name = "unit";

	objects.units.push(selectionScreenSelectedUnit);
	scene.add(selectionScreenSelectedUnit);

	selectionScreenSelectedUnit = undefined;

	objects.cursorObject = objects.temp;

	$("#selectscreen").show();
}

//Moves given unit to arg position
function MoveUnit(unit, position, clickedObject){
	//TODO: smooth movement going to be ass to implement yay
	//TODO: collision boxes between units (just simple distance calc over objects.units...)

	var pos = new THREE.Vector3();
	if(ownPlanet == 1 && clickedObject == "planet1"){
		pos.subVectors(position, objects.waterPlanet.position).multiplyScalar(0.1);
		pos.addVectors(pos, position);
		unit.position = pos;
		unit.lookAt(objects.waterPlanet.position);
	}
	else if(ownPlanet == 2 && clickedObject == "planet2"){
		pos.subVectors(position, objects.sandPlanet.position).multiplyScalar(0.1);
		pos.addVectors(pos, position);
		unit.position = pos;
		unit.lookAt(objects.sandPlanet.position);
	}
}