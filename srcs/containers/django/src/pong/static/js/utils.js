
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const abs = x => {
	return x < 0 ? -x : x;
}

const min = (a, b) => {
	return a < b ? a : b;
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function textToDiv(text, divID) {
	const div = document.getElementById(divID);
	if (!div) {
		console.error(`Div: ${divID} not found`);
		return;
	}
	div.textContent = text;
}

function HTMLToDiv(html, divID) {
	const div = document.getElementById(divID);
	if (!div) {
		console.error(`Div: ${divID} not found`);
		return;
	}
	div.innerHTML = html;
}

function displayDiv(div) {
	const element = document.getElementById(div);
	if (element) {
		element.style.display = 'block';
	}
}

function notDisplayDiv(div) {
	const element = document.getElementById(div);
	if (element) {
		element.style.display = 'none';
	}
}

function waitForEnter(game) {
	return new Promise((resolve) => {
		textToDiv('Press ENTER to start...', 'enter');
		function onKeyDown(event) {
			if (event.key === 'Enter') {
				document.removeEventListener('keydown', onKeyDown);
				document.removeEventListener('touchstart', onTouchStart);
				notDisplayDiv('enter');
				resolve();
			}
		}

		function onTouchStart(event) {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('touchstart', onTouchStart);
			notDisplayDiv('enter');
			resolve();
		}
		console.log('game.mode:', game.mode);
		if ( game.mode === 'vsOnline') {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('touchstart', onTouchStart);
			notDisplayDiv('enter');
			resolve();
		}
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('touchstart', onTouchStart);
	});
}

function countdown(seconds, audio) {
	return new Promise(resolve => {
		HTMLToDiv(``, 'announcement-l1');
		HTMLToDiv(``, 'announcement-mid');
		HTMLToDiv(``, 'announcement-l2');
		textToDiv(seconds, 'announcement-l1');
		audio.playSound(audio.count);
		const interval = setInterval(() => {
			seconds -= 1;
			textToDiv(seconds, 'announcement-l1');
			if (seconds > 0) {
				audio.playSound(audio.count);
			} else {
				audio.playSound(audio.start);
				clearInterval(interval);
				resolve();
			}
		}, 900);
	});
}
function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

export { getRandomInt, abs, min, textToDiv, delay, HTMLToDiv, countdown, waitForEnter, displayDiv, notDisplayDiv, getCookie };