
class Settings {
    // Defaults
    #ballSpeed = 0.2;
    #paddleSpeed = 0.15;
    #fieldWidth = 12;
    #fieldLength = 16;
    #aiLevel = 2;
    #scoreToWin = 6;

    constructor(game) {
        this.game = game;

        // Initialize with defaults
        this.init();
    }
    
    init() {        
        this.scoreToWin = this.#scoreToWin;
        this.ballSpeed = this.#ballSpeed;
        this.paddleSpeed = this.#paddleSpeed;
        this.fieldWidth = this.#fieldWidth;
        this.fieldLength = this.#fieldLength;
        this.aiLevel = this.#aiLevel;
    }

	// Functions to reset settings to default values
    reset() {
        this.init();
        this.game.updateScene(fieldLength, fieldWidth);
    }
    
	updateMenu() {
        document.getElementById('scoreToWin').value = this.scoreToWin;
		document.getElementById('ballSpeed').value = this.ballSpeed * 20;
		document.getElementById('paddleSpeed').value = this.paddleSpeed * 20;
		document.getElementById('fieldWidth').value = this.fieldWidth;
		document.getElementById('fieldLength').value = this.fieldLength;
		document.getElementById('aiLevel').value = this.aiLevel == 1 ? 'easy' : this.aiLevel == 2 ? 'medium' : 'hard'; 
	}
    
    resetMenu() {
        this.init();
        this.updateMenu();
    }

	save() {
        this.scoreToWin = document.getElementById('scoreToWin').value;
		this.ballSpeed = document.getElementById('ballSpeed').value / 20;
		this.paddleSpeed = document.getElementById('paddleSpeed').value / 20;
		this.fieldWidth = document.getElementById('fieldWidth').value;
		this.fieldLength = document.getElementById('fieldLength').value;
		this.game.updateScene(fieldLength, fieldWidth);
		const aiLevel = document.getElementById('aiLevel').value;
		this.aiLevel = aiLevel === 'easy' ? 1 : aiLevel === 'medium' ? 2 : 3;

		loadPage('game_mode');
	}
}

export { Settings }