"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProcessCpuUsage = exports.getProcessList = exports.getProcessTree = exports.ProcessDataFlag = void 0;
const util_1 = require("util");
const wpc = require("./index");
var index_1 = require("./index");
Object.defineProperty(exports, "ProcessDataFlag", { enumerable: true, get: function () { return index_1.ProcessDataFlag; } });
exports.getProcessTree = util_1.promisify(wpc.getProcessTree);
exports.getProcessList = util_1.promisify(wpc.getProcessList);
exports.getProcessCpuUsage = util_1.promisify(wpc.getProcessCpuUsage);//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@vscode/windows-process-tree/lib/promises.js.map