
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
				if (enter) {
					enter.style.display = 'none';
				} else {
					console.error('Enter element is null');
				}
				resolve();
			}
		}

		function onTouchStart(event) {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('touchstart', onTouchStart);
			if (enter) {
				enter.style.display = 'none';
			} else {
				console.error('Enter element is null');
			}
			resolve();
		}

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('touchstart', onTouchStart);

	});
}

function countdown(seconds, audio) {
    return new Promise(resolve => {
        textToDiv(seconds, 'announcement-l1');
        const interval = setInterval(() => {
            textToDiv(seconds, 'announcement-l1');
            seconds -= 1;
            if (seconds < 0) {
                if (audio) {
                    if (typeof audio.playSound === 'function') {
                        audio.playSound(audio.start);
                    } else {
                        console.error('audio.playSound is not a function');
                    }
                } else {
                    console.error('audio is not defined');
                }
                clearInterval(interval);
                resolve();
            }
        }, 600);
    });
}


export { getRandomInt, abs, min, textToDiv, delay, HTMLToDiv, countdown, waitForEnter };