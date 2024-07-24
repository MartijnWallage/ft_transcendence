import * as THREE from './three.module.js';
import { paddleConf, ballConf} from './3d-pong-conf.js';

function addBall(scene) {

	const geometry = new THREE.SphereGeometry(ballConf.radius);
	const material = new THREE.MeshStandardMaterial({
		color: 0xc70000,
		roughness: 0.4,
		metalness: 0.8,
		flatShading: true
	});
	const ball = new THREE.Mesh(geometry, material);
	ball.position.set(0 ,0.7 ,0);
	scene.add(ball);
	ball.dx = 0;
	ball.dz = 0;
	ball.serve = 1;
	return ball;
}

function addPaddle(scene, distanceFromCenter) {
	const geometry = new THREE.BoxGeometry(paddleConf.width, paddleConf.height, paddleConf.depth);
	const material = new THREE.MeshStandardMaterial({
		color: 0xc1d1db,
		roughness: 0.5,
		metalness: 0.5
	});
	const paddle = new THREE.Mesh(geometry, material);
	paddle.position.set(distanceFromCenter ,(paddleConf.height / 2) + 0.5 ,0);
	scene.add(paddle);
	return paddle;
}

function addField(scene){
	const field_geometry = new THREE.BoxGeometry(16, 0.5, 12);
	const field_material = new THREE.MeshStandardMaterial({
		color: 0x0a1826,
		roughness: 0.5,
		metalness: 0.5
	});
	const field = new THREE.Mesh(field_geometry, field_material);
	scene.add(field);
	return field;
}

function addNet(scene){
	const net_geometry = new THREE.BoxGeometry(0.3, 0.51, 11.8);
	const net_material = new THREE.MeshStandardMaterial({
		color: 0xc1d1db,
		roughness: 0.5,
		metalness: 0.5
	});
	const net = new THREE.Mesh(net_geometry, net_material);
	scene.add(net);
}

function addGeometry(scene){
	const paddle_p1 = addPaddle(scene, -7);
	const paddle_p2 = addPaddle(scene, 7);
	const ball = addBall(scene, );
	const field = addField(scene, );
	addNet(scene);
	return ({paddle_p1, paddle_p2, ball, field});

}

export {addGeometry};