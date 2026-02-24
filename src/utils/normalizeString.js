function normalizeString(str) {
    return str.toLowerCase().replace(/\s+/g, '_')
}

export default normalizeString;