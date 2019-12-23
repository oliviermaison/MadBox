document.addEventListener('DOMContentLoaded', function () { exoMadBox.init(); });

var exoMadBox = ( function () {

	var accelerate = 0;
	var accelerateX = 0;
	var renderer, camera;
	var rectMesh, rectScene, rotateAnimation;
	var ballMesh, ballScene, gravityAnimation;
	var clicked = false;

	var initElements = function () {

		initRender();
		initRect();
		initBall();
		rectAnimation();
		onClickEvent();

	};

	var onClickEvent = function () {

		document.addEventListener('click', function () {

			if (!clicked) {

				stopRotation();
				ballAnimation();
				clicked = true;

			}

		});

	};

	var initRender = function () {

		camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.z = 5;
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(new THREE.Color( 0x000000 ), 1);
		document.documentElement.appendChild(renderer.domElement);

	};

	var initRect = function () {

		rectScene = new THREE.Scene();
		var geometry = new THREE.BoxGeometry(1.5, 0.1, 0.1);
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		rectMesh = new THREE.Mesh(geometry, material);
		rectScene.add(rectMesh);
		rectMesh.position.y -= 0.8;
		renderer.render(rectScene, camera);

	};

	var initBall = function () {

		ballScene = new THREE.Scene();
		var geometry = new THREE.CircleGeometry( 0.1, 100 );
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		ballMesh = new THREE.Mesh(geometry, material);
		ballScene.add(ballMesh);
		ballMesh.position.y += 1;
		renderer.render(ballScene, camera);

	};

	var rectAnimation = function () {

		rotateAnimation = requestAnimationFrame(rectAnimation);
		rectMesh.rotation.z -= 0.02;
		renderer.render(ballScene, camera);
		renderer.autoClear = false;
		renderer.render(rectScene, camera);

	};

	var ballAnimation = function () {

		gravityAnimation = requestAnimationFrame(ballAnimation);
		var rebound = 0.02 + accelerate;
		ballMesh.position.y -= 0.02 + accelerate;
		
		if ( accelerateX > 0 ) {
		
			accelerateX -= 0.0002;
			if ( accelerateX < 0 ) accelerateX = 0;
			
		} else if ( accelerateX < 0 ) {
		
			accelerateX += 0.0002;
			if ( accelerateX > 0 ) accelerateX = 0;
			
		}
		
		ballMesh.position.x += accelerateX;
		accelerate += 0.002;
		renderer.render(ballScene, camera);
		renderer.autoClear = false;
		renderer.render(rectScene, camera);

		var collision = collisionTest();
		
		if ( collision ) {
		
			ballMesh.position.y += rebound;
			accelerate *= -1;
			
		}

		checkIfBallIsOut();

	};



	var collisionTest = function () {

		var normal = new THREE.Vector3(0, -1, 0);
		var raycaster = new THREE.Raycaster(ballMesh.position, normal);
		var check = raycaster.intersectObjects([rectMesh]);

		if (!check.length) return false;

		var normal = new THREE.Vector3(check[0].face.normal.x, check[0].face.normal.y, check[0].face.normal.z);
		var axis = new THREE.Vector3(0, 0, 1);
		var angle = rectMesh.rotation.z;
		
		normal.applyAxisAngle(axis, angle);
		
		var orientation = normal.y > 0 ? -1 : 1;
		
		if ( normal.y > 0 ) normal.applyAxisAngle(axis, Math.PI);

		var raycaster = new THREE.Raycaster(ballMesh.position, normal);
		var check = raycaster.intersectObjects([rectMesh]);
		
		if ( check.length > 0 ) {

			if ( check[0].distance < ballMesh.geometry.parameters.radius ) {

				accelerateX = Math.abs(accelerate) * Math.cos(rectMesh.rotation.z%Math.PI + Math.PI) * orientation;
				return true;

			}
		}

		return false;

	};

	var checkIfBallIsOut = function () {

		camera.updateMatrix();
		camera.updateMatrixWorld();
		var frustum = new THREE.Frustum();
		frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));

		if ( !frustum.containsPoint(ballMesh.position) ) reStart();

	};

	var reStart = function () {

		stopBallAnimation();
		document.documentElement.removeChild(renderer.domElement);
		accelerate = 0;
		accelerateX = 0;
		renderer = '';
		camera = '';
		rectMesh = '';
		rectScene = '';
		rotateAnimation = '';
		ballMesh = '';
		ballScene = '';
		gravityAnimation = '';

		initElements();
		clicked = false;

	};

	var stopRotation = function () { cancelAnimationFrame( rotateAnimation ); };

	var stopBallAnimation = function () { cancelAnimationFrame( gravityAnimation ); };

	return { init : initElements };

})();
