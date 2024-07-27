class Settings {
	constructor() {
		this.evaluation = true;
		this.difficulty = 1;
		this.sound = true;
		this.scoreToWin = 6;
		this.ballSpeed = 0.2;
		this.paddleSpeed = 0.18;
	}
}

document.addEventListener('DOMContentLoaded', function() {
	const volumeSlider = document.getElementById('volume-slider');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
	
    volumeSlider.addEventListener('input', function() {
        console.log(`Volume: ${volumeSlider.value}`);
        // Add code to handle volume change
    });
	
    darkModeToggle.addEventListener('change', function() {
		if (darkModeToggle.checked) {
			console.log('Dark Mode Enabled');
            // Add code to enable dark mode
        } else {
			console.log('Dark Mode Disabled');
            // Add code to disable dark mode
        }
    });
});

export { Settings };