"use strict";
/**
 * Copyright (c) 2020, Microsoft Corporation (MIT License).
 */
Object.defineProperty(exports, "__esModule", { value: true });
var worker_threads_1 = require("worker_threads");
var net_1 = require("net");
var conout_1 = require("../shared/conout");
var conoutPipeName = worker_threads_1.workerData.conoutPipeName;
var conoutSocket = new net_1.Socket();
conoutSocket.setEncoding('utf8');
conoutSocket.connect(conoutPipeName, function () {
    var server = net_1.createServer(function (workerSocket) {
        conoutSocket.pipe(workerSocket);
    });
    server.listen(conout_1.getWorkerPipeName(conoutPipeName));
    if (!worker_threads_1.parentPort) {
        throw new Error('worker_threads parentPort is null');
    }
    worker_threads_1.parentPort.postMessage(1 /* READY */);
});//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/node-pty/lib/worker/conoutSocketWorker.js.map