"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const agent_1 = __importDefault(require("./agent"));
function createSocksProxyAgent(opts) {
    return new agent_1.default(opts);
}
(function (createSocksProxyAgent) {
    createSocksProxyAgent.SocksProxyAgent = agent_1.default;
    createSocksProxyAgent.prototype = agent_1.default.prototype;
})(createSocksProxyAgent || (createSocksProxyAgent = {}));
module.exports = createSocksProxyAgent;//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/socks-proxy-agent/dist/index.js.map