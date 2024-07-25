import * as THREE from '../THREE-utils/three.module.js';

class Audio {
	constructor(camera) {
	this.listener = new THREE.AudioListener();
	camera.cam.add(this.listener);
	this.hit = this.addSound('./static/audio/hit.wav');
	}

	playSound(sound) {
		if (sound.isPlaying) {
			sound.stop();
		}
		sound.play();
	}

	addSound(file_path){
		const sound = new THREE.Audio(this.listener);
		const audioLoader = new THREE.AudioLoader();
		audioLoader.load(file_path, function(buffer) {
			sound.setBuffer(buffer);
			sound.setLoop(false);
			sound.setVolume(1.0);
		});
		return sound;
	}
}

export { Audio };