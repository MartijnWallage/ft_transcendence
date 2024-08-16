import { AI } from './AI.js';

class Player {
	constructor(name, isRemote = false, displayName = name, role = name) {
		this.name = name;
		this.ai = null;
		this.isRemote = isRemote;
		this.displayName = displayName;
		this.role = role;

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
