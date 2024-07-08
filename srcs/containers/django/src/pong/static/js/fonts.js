const loadFont = async () => {
	const font = new FontFace('Bitfont', 'url(../fonts/bit9x9.ttf)');
	await font.load();
	document.fonts.add(font);
	return font.family;
};

const renderText = async () => {
	const fontFamily = await loadFont();

	ctx.font = `48px ${fontFamily}`;
	ctx.fillStyle = 'black';
	ctx.fillText('Hello, world!', 50, 100);
};

renderText();