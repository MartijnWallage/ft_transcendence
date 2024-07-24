const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const abs = x => {
    return x < 0 ? -x : x;
}

const min = (a, b) => {
    return a < b ? a : b;
}

export { getRandomInt, abs, min };