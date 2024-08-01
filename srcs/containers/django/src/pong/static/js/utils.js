
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
				document.removeEventListener('touchstart', onTouchStart);
				enter.style.display = 'none';
				resolve();
			}
		}

		function onTouchStart(event) {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('touchstart', onTouchStart);
			enter.style.display = 'none';
			resolve();
		}

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('touchstart', onTouchStart);
	});
}

function countdown(seconds) {
	return new Promise(resolve => {
		textToDiv(seconds, 'announcement-l1');
		const interval = setInterval(() => {
			textToDiv(seconds, 'announcement-l1');
			seconds -= 1;
			if (seconds < 0) {
				clearInterval(interval);
				resolve();
			}
		}, 600);
	});
}

export { getRandomInt, abs, min, textToDiv, HTMLToDiv, countdown, waitForEnter };