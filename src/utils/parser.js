export const stripCantillation = (text) => {
    return (text ?? '')
        .replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3\u05C6]/g, '')
        .replace(/[/\\׃]/g, '')   // strip prefix slash, backslash, sof pasuq
        .trim()
}