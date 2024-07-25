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

export { getRandomInt, abs, min, textToDiv, HTMLToDiv };