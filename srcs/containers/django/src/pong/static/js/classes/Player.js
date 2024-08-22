import { AI } from './AI.js';

class Player {
	constructor(name) {
		this.name = name;
		this.ai = null;
		this.online_role = null;
		this.oponent = null;

		this.stats = {
			wins: 0,
			losses: 0,
		};
	}

	setAI(game) {
		this.ai = new AI(game);
	}

	isAI() {
		return this.ai !== null;
	}
}

export { Player };