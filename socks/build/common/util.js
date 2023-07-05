"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleArray = exports.SocksClientError = void 0;
/**
 * Error wrapper for SocksClient
 */
class SocksClientError extends Error {
    constructor(message, options) {
        super(message);
        this.options = options;
    }
}
exports.SocksClientError = SocksClientError;
/**
 * Shuffles a given array.
 * @param array The array to shuffle.
 */
function shuffleArray(array) {
    // tslint:disable-next-line:no-increment-decrement
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
exports.shuffleArray = shuffleArray;//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/socks/build/common/util.js.map