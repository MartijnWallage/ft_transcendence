
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
        this.game.updateScene(this.fieldLength, this.fieldWidth);
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
        const scoreToWin = document.getElementById('scoreToWin').value;
        const ballSpeed = document.getElementById('ballSpeed').value / 20;
        const paddleSpeed = document.getElementById('paddleSpeed').value / 20;
        const fieldWidth = document.getElementById('fieldWidth').value;
        const fieldLength = document.getElementById('fieldLength').value;
        const aiLevel = document.getElementById('aiLevel').value;

        this.scoreToWin = scoreToWin;
        this.ballSpeed = ballSpeed;
        this.paddleSpeed = paddleSpeed;
        this.fieldWidth = fieldWidth;
        this.fieldLength = fieldLength;
        this.aiLevel = aiLevel === 'easy' ? 1 : aiLevel === 'medium' ? 2 : 3;
        
		this.game.updateScene(this.fieldLength, this.fieldWidth);
		loadPage('game_mode');
	}
}

export { Settings }