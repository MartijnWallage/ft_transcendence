import * as THREE from '../three-lib/three.module.js';

class Audio {
	constructor(camera) {
		this.listener = new THREE.AudioListener();
		camera.camera.add(this.listener);
		this.hit = this.addSound('./static/audio/hit.wav', false);
		this.main = this.addSound('./static/audio/main.mp3', true);
		this.ping = this.addSound('./static/audio/ping.mp3', false);
		this.pong = this.addSound('./static/audio/pong.mp3', false);
		this.start = this.addSound('./static/audio/start.mp3', false);
		this.chimes = this.addSound('./static/audio/chimes.mp3', false);
		this.woosh_1 = this.addSound('./static/audio/woosh_1.mp3', false);
		this.woosh_2 = this.addSound('./static/audio/woosh_2.mp3', false);
		this.select_1 = this.addSound('./static/audio/select_1.mp3', false);
		this.select_2 = this.addSound('./static/audio/select_2.mp3', false);
	}

	playSound(sound) {
		if (sound.isPlaying) {
			sound.stop();
		}
		sound.play();
	}

	addSound(file_path, loop){
		const sound = new THREE.Audio(this.listener);
		const audioLoader = new THREE.AudioLoader();
		audioLoader.load(file_path, function(buffer) {
			sound.setBuffer(buffer);
			sound.setLoop(loop);
			sound.setVolume(1.0);
		});
		return sound;
	}
}

export { Audio };