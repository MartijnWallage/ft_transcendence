import * as THREE from './three.module.js';
// import { OrbitControls } from './OrbitControls.js';
const container = document.getElementById('threejs-container');

// Scene, Camera, Renderer with Antialiasing
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable antialiasing
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xc1d1db); // Set background color
container.appendChild(renderer.domElement);
// const controls = new OrbitControls(camera, app);

// field
function add_field(){
  const field_geometry = new THREE.BoxGeometry(16, 0.5, 12);
  const field_material = new THREE.MeshBasicMaterial({ color: 0x0a1826 });
  const field = new THREE.Mesh(field_geometry, field_material);
  scene.add(field);
  return field;
}

// Nett
const nett_geometry = new THREE.BoxGeometry(0.3, 0.51, 11.8);
const nett_material = new THREE.MeshBasicMaterial({ color: 0xc1d1db });
const nett = new THREE.Mesh(nett_geometry, nett_material);
scene.add(nett);

function add_ball() {
  const ball_geometry = new THREE.SphereGeometry(0.4, 12, 12);
  const ball_material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const ball = new THREE.Mesh(ball_geometry, ball_material);
  ball.position.set(0 ,0.7 ,0);
  scene.add(ball);
  return ball;
}

function add_paddle(x) {
  const geometry = new THREE.BoxGeometry(0.3, 1, 2);
  const material = new THREE.MeshBasicMaterial({ color: 0xc1d1db });
  const paddle = new THREE.Mesh(geometry, material);
  paddle.position.set(x ,0.6 ,0);
  scene.add(paddle);
  return paddle;
}

const paddle_p1 = add_paddle(-7)
const paddle_p2 = add_paddle(7);
const ball = add_ball();
const field = add_field();
ball.dx = 0.1;

function init()
{
  camera.position.z = 10;
  camera.position.y = 10;
  camera.rotateX(-0.85);
} init();

function animate_ball(){
  ball.position.x += ball.dx;
}

function movePaddles(){
  if (keys["w"]) {
		paddle_p1.position.z -= 0.2;
	}
	else if (keys["s"]) {
		paddle_p1.position.z += 0.2;
	}
  if (keys["ArrowUp"]) {
		paddle_p2.position.z -= 0.2;
	}
	else if (keys["ArrowDown"]) {
		paddle_p2.position.z += 0.2;
	}
}

function checkCollisionPaddle(paddle){
  if (ball.position.x < paddle.position.x + paddle.geometry.parameters.width/2 &&
    ball.position.x > paddle.position.x - paddle.geometry.parameters.width/2 &&
    ball.position.z < paddle.position.z + paddle.geometry.parameters.depth/2 &&
    ball.position.z > paddle.position.z - paddle.geometry.parameters.depth/2){
    ball.dx *= -1.03;
  }
}

// function checkCollisionBorder(){
//   if (ball.position.x < field.position.x - field.geometry.parameters.width/2 &&
//     ball.position.x > field.position.x + field.geometry.parameters.width/2 &&
//     ball.position.z < field.position.z + field.geometry.parameters.depth/2 &&
//     ball.position.z > field.position.z - field.geometry.parameters.depth/2){
//     ball.dx *= -1.03;
//   }
// }

function update(){
  checkCollisionPaddle(paddle_p1);
  checkCollisionPaddle(paddle_p2);
  // checkCollisionBorder()
  animate_ball();
  movePaddles();
}

function animate() {
  requestAnimationFrame(animate);
  // controls.update();
  update();
  renderer.render(scene, camera);
} animate();

document.addEventListener("keydown", (event) => { 
	keys[event.key] = true; 
});

document.addEventListener("keyup", (event) => {
	keys[event.key] = false;
});