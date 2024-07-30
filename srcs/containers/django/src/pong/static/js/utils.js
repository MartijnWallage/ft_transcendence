
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const abs = x => {
	return x < 0 ? -x : x;
}

const min = (a, b) => {
	return a < b ? a : b;
}

function textToDiv(text, divID) {
	var div = document.getElementById(divID);
	if (!div) {
		console.error(`Div: ${divID} not found`);
		return;
	}
	div.textContent = text;
}

function HTMLToDiv(html, divID) {
	var div = document.getElementById(divID);
	if (!div) {
		console.error(`Div: ${divID} not found`);
		return;
	}
	div.innerHTML = html;
}

function waitForEnter(enter) {
	return new Promise((resolve) => {
		function onKeyDown(event) {
			if (event.key === 'Enter') {
				document.removeEventListener('keydown', onKeyDown);
				enter.style.display = 'none';
				resolve();
			}
		}
		document.addEventListener('keydown', onKeyDown);
	});
}

function countdown(seconds, announcement) {
	return new Promise(resolve => {
		announcement.innerHTML = seconds;
		const interval = setInterval(() => {
			announcement.innerHTML = seconds;
			seconds -= 1;
			if (seconds < 0) {
				clearInterval(interval);
				resolve();
			}
		}, 600);
	});
}

function displayWinMessage(message) {
	textToDiv(message, 'announcement');
	var menu = document.getElementById('menu');
	menu.style.display = 'block';
	menu.style.opacity = 1;
	const btn = document.getElementById('js-next-game-btn');
	btn.style.display = 'block';
	return new Promise((resolve) => {
		function onClick(event) {
			btn.removeEventListener('click', onClick);
			btn.style.display = 'none';
			resolve(event); 
		}
		document.addEventListener('click', onClick);
	});
}

export { getRandomInt, abs, min, textToDiv, HTMLToDiv, countdown, waitForEnter, displayWinMessage };