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

	UnitPositions();

	//Camera pivot point follows planetToFollowPos
	cameraMovementVector.subVectors(planetToFollowPos , controls.target).multiplyScalar(0.1);
	controls.object.position.add(cameraMovementVector);
	controls.target.add(cameraMovementVector);

	// Prevent camera moving relative to skybox
	objects.skyBox.position.copy( camera.position );
}

//Updates unit positions
//Spherically interpolates between target point and current position, since we're not using trigonometry shit's expensive as hell
function UnitPositions(){
	$.each(objects.units, function(idx, obj){
		if(!obj.targetPosition) return true;

		var vectorDelta = new THREE.Vector3(obj.targetPosition.x, obj.targetPosition.y, obj.targetPosition.z);
		vectorDelta.sub(obj.position);

		//Interpolate only if we're more than 10 points away from target
		if(vectorDelta.length() > 1.0){
			//MATH
			var r = obj.homePlanet.geometry.radius;
			vectorDelta.multiplyScalar(0.1);

			obj.position.add(vectorDelta);

			vectorDelta.subVectors(obj.position, obj.homePlanet.position);
			
			vectorDelta.normalize();
			vectorDelta.multiplyScalar(r*1.1);

			var finalPoint = new THREE.Vector3();
			finalPoint.addVectors(obj.homePlanet.position, vectorDelta);
			obj.lookAt(finalPoint);

			obj.position = finalPoint;
		}
	});
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
		selectionScreenSelectedUnit.homePlanet = objects.waterPlanet;
	}
	else if(ownPlanet == 2){
		pos.subVectors(intersectPt, objects.sandPlanet.position);
		pos.multiplyScalar(0.1); //Prevents unit being half inside planet....
		pos.addVectors(pos, intersectPt);
		selectionScreenSelectedUnit.position = pos;
		selectionScreenSelectedUnit.lookAt(objects.sandPlanet.position);
		selectionScreenSelectedUnit.homePlanet = objects.sandPlanet;		
	}

	selectionScreenSelectedUnit.name = "unit";

	objects.units.push(selectionScreenSelectedUnit);
	scene.add(selectionScreenSelectedUnit);

	selectionScreenSelectedUnit = undefined;

	objects.cursorObject = undefined;

	//Mouseup doesn't get triggered if we show selectscreen right away
	//#TODO# fix this fucking ugly hack
	setTimeout(function(){
		$("#selectscreen").show();
	}, 500);

	
}

//Sets the target position for a given unit to arg position
function MoveUnit(unit, position, clickedObject){
	//minor fix: collision boxes between units (just simple distance calc over objects.units...) (prevent moving inside other unit)

	var pos = new THREE.Vector3();
	if(ownPlanet == 1 && clickedObject == "planet1"){
		pos.subVectors(position, objects.waterPlanet.position).multiplyScalar(0.1);
		pos.addVectors(pos, position);
		unit.targetPosition = pos;
		unit.lookAt(pos);
	}
	else if(ownPlanet == 2 && clickedObject == "planet2"){
		pos.subVectors(position, objects.sandPlanet.position).multiplyScalar(0.1);
		pos.addVectors(pos, position);
		unit.targetPosition = pos;
		unit.lookAt(pos);
	}
}