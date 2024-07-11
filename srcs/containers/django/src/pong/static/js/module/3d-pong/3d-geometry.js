import * as THREE from './three.module.js';
import { paddleConf, ballConf} from './3d-pong-conf.js';

function addBall(scene) {
  const ball_geometry = new THREE.SphereGeometry(ballConf.radius, 9, 9);
  const ball_material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  const ball = new THREE.Mesh(ball_geometry, ball_material);
  ball.position.set(0 ,0.7 ,0);
  scene.add(ball);
  ball.dx = 0.05;
  ball.dz = 0;
  return ball;
}

function addPaddle(scene, distanceFromCenter) {
  const geometry = new THREE.BoxGeometry(paddleConf.width, paddleConf.height, paddleConf.depth);
  const material = new THREE.MeshBasicMaterial({ color: 0xc1d1db });
  const paddle = new THREE.Mesh(geometry, material);
  paddle.position.set(distanceFromCenter ,0.6 ,0);
  scene.add(paddle);
  return paddle;
}

function addField(scene){
  const field_geometry = new THREE.BoxGeometry(16, 0.5, 12);
  const field_material = new THREE.MeshBasicMaterial({ color: 0x0a1826 });
  const field = new THREE.Mesh(field_geometry, field_material);
  scene.add(field);
  return field;
}

function addNet(scene){
  const net_geometry = new THREE.BoxGeometry(0.3, 0.51, 11.8);
  const net_material = new THREE.MeshBasicMaterial({ color: 0xc1d1db });
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