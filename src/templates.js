const emojis = {
    'lol': String.fromCodePoint(128516),
    'righthand': String.fromCodePoint(128073)
}

const templates = {
    'default':  (settings) => `
        I'm a virtuous traveler from ${settings.cityA} to ${settings.cityB}.
        ${emojis.righthand} I'm so virtuous.
        ${emojis.righthand} Planes are bad.
        ${emojis.righthand} Burgaud should be ashame of working at AA.
        `
}

export default templates;
