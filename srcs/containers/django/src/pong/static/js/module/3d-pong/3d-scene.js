import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { Environment } from './assets/Environment.js';
import { Camera } from './assets/Camera.js';

function initScene()
{
	
	return ({scene, camera, renderer, hit, controls});
}

export { initScene };