"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProcessTree = exports.getProcessCpuUsage = exports.getProcessList = exports.filterProcessList = exports.buildProcessTree = exports.ProcessDataFlag = void 0;
const util_1 = require("util");
const native = require('../build/Release/windows_process_tree.node');
var ProcessDataFlag;
(function (ProcessDataFlag) {
    ProcessDataFlag[ProcessDataFlag["None"] = 0] = "None";
    ProcessDataFlag[ProcessDataFlag["Memory"] = 1] = "Memory";
    ProcessDataFlag[ProcessDataFlag["CommandLine"] = 2] = "CommandLine";
})(ProcessDataFlag = exports.ProcessDataFlag || (exports.ProcessDataFlag = {}));
// requestInProgress is used for any function that uses CreateToolhelp32Snapshot, as multiple calls
// to this cannot be done at the same time.
let requestInProgress = false;
const globalRequestQueue = [];
const MAX_FILTER_DEPTH = 10;
/**
 * Construct tree of process infos and their children, returning the requested "root" node.
 * This is performed in a single iteration pass and allows reasonably efficient traversal.
 *
 * @param rootPid the pid of the "root" process to search for
 * @param processList the list of `IProcessInfo`s
 * @returns the `IProcessInfoNode` representing the root and all of its connected children
 */
function buildRawTree(rootPid, processList) {
    var _a, _b;
    var _c, _d;
    let root;
    // Map of pid to the array of immediate children.
    // Each array is shared by reference, such that:
    // forall n. Object.is(n.children, childrenOf[n.info.pid])
    const childrenOf = {};
    // Iterate over processList (once).
    // Add each process to children of its parent pid.
    // Note the process corresponding to `rootPid` when we see it.
    for (const info of processList) {
        const myChildren = ((_a = childrenOf[_c = info.pid]) !== null && _a !== void 0 ? _a : (childrenOf[_c] = []));
        const mySiblings = ((_b = childrenOf[_d = info.ppid]) !== null && _b !== void 0 ? _b : (childrenOf[_d] = []));
        const node = { info, children: myChildren };
        mySiblings.push(node);
        if (root === undefined && info.pid === rootPid) {
            root = node;
        }
    }
    return root;
}
/**
 * Filters a list of processes to rootPid and its descendents and creates a tree
 * @param rootPid The process to use as the root
 * @param processList The list of processes
 * @param maxDepth The maximum depth to search
 */
function buildProcessTree(rootPid, processList, maxDepth = MAX_FILTER_DEPTH) {
    const root = buildRawTree(rootPid, processList);
    if (root === undefined) {
        return undefined;
    }
    // This differs from the "raw" tree somewhat trivially.
    // • the properties are inlined/splatted
    // • the 'ppid' field is omitted
    // • the depth of the tree is limited by `maxDepth`
    const buildNode = ({ info: { pid, name, memory, commandLine }, children }, depth) => ({
        pid,
        name,
        memory,
        commandLine,
        children: depth > 0 ? children.map(c => buildNode(c, depth - 1)) : [],
    });
    return buildNode(root, maxDepth);
}
exports.buildProcessTree = buildProcessTree;
/**
 * Filters processList to contain the process with rootPid and all of its descendants
 * @param rootPid The root pid
 * @param processList The list of all processes
 * @param maxDepth The maximum depth to search
 */
function filterProcessList(rootPid, processList, maxDepth = MAX_FILTER_DEPTH) {
    const root = buildRawTree(rootPid, processList);
    if (root === undefined) {
        return undefined;
    }
    if (maxDepth < 0) {
        return [];
    }
    function buildList({ info, children }, depth, accum) {
        accum.push(info);
        if (depth > 0) {
            children.forEach(c => buildList(c, depth - 1, accum));
        }
        return accum;
    }
    return buildList(root, maxDepth, []);
}
exports.filterProcessList = filterProcessList;
function getRawProcessList(callback, flags) {
    const queue = globalRequestQueue;
    queue.push(callback);
    // Only make a new request if there is not currently a request in progress.
    // This prevents too many requests from being made, there is also a crash that
    // can occur when performing multiple calls to CreateToolhelp32Snapshot at
    // once.
    if (!requestInProgress) {
        requestInProgress = true;
        native.getProcessList((processList) => {
            // It is possible and valid for one callback to cause another to be added to the queue.
            // To avoid orphaning those callbacks, we repeat the draining until the queue is empty.
            // We use "queue.splice(0)" to atomically clear the queue, returning the batch to process.
            // If any of those also made requests, we repeat until the callback chain completes.
            //
            // An alternative would be to splice the queue once and immediately reset requestInProgress
            // before invoking callbacks: `CreateToolhelp32Snapshot` has safely completed at this point.
            // However, that would circumvent the "too many requests" rate-limiting (?) concern above.
            while (queue.length) {
                queue.splice(0).forEach(cb => cb(processList));
            }
            requestInProgress = false;
        }, flags || 0);
    }
}
/**
 * Returns a list of processes containing the rootPid process and all of its descendants
 * @param rootPid The pid of the process of interest
 * @param callback The callback to use with the returned set of processes
 * @param flags The flags for what process data should be included
 */
function getProcessList(rootPid, callback, flags) {
    getRawProcessList(procs => callback(filterProcessList(rootPid, procs)), flags);
}
exports.getProcessList = getProcessList;
(function (getProcessList) {
    // tslint:disable-next-line:variable-name
    getProcessList.__promisify__ = (rootPid, flags) => new Promise((resolve, reject) => {
        const callback = (processList) => processList
            ? resolve(processList)
            : reject(new Error(`Could not find PID ${rootPid}`));
        getProcessList(rootPid, callback, flags);
    });
})(getProcessList = exports.getProcessList || (exports.getProcessList = {}));
/**
 * Returns the list of processes annotated with cpu usage information
 * @param processList The list of processes
 * @param callback The callback to use with the returned list of processes
 */
function getProcessCpuUsage(processList, callback) {
    native.getProcessCpuUsage(processList, callback);
}
exports.getProcessCpuUsage = getProcessCpuUsage;
(function (getProcessCpuUsage) {
    // tslint:disable-next-line:variable-name
    getProcessCpuUsage.__promisify__ = (processList) => new Promise((resolve, reject) => {
        // NOTE: Currently this callback is *never* called with `undefined`, unlike the other functions which do PID lookups.
        // The handling here is just for consistency and future-proofing.
        const callback = (cpuInfos) => cpuInfos
            ? resolve(cpuInfos)
            : reject(new Error('Failed to collect CPU info'));
        getProcessCpuUsage(processList, callback);
    });
})(getProcessCpuUsage = exports.getProcessCpuUsage || (exports.getProcessCpuUsage = {}));
/**
 * Returns a tree of processes with rootPid as the root
 * @param rootPid The pid of the process that will be the root of the tree
 * @param callback The callback to use with the returned list of processes
 * @param flags Flags indicating what process data should be written on each node
 */
function getProcessTree(rootPid, callback, flags) {
    getRawProcessList(procs => callback(buildProcessTree(rootPid, procs)), flags);
}
exports.getProcessTree = getProcessTree;
(function (getProcessTree) {
    // tslint:disable-next-line:variable-name
    getProcessTree.__promisify__ = (rootPid, flags) => new Promise((resolve, reject) => {
        const callback = (tree) => tree
            ? resolve(tree)
            : reject(new Error(`Could not find PID ${rootPid}`));
        getProcessTree(rootPid, callback, flags);
    });
})(getProcessTree = exports.getProcessTree || (exports.getProcessTree = {}));
// Since symbol properties can't be declared via namespace merging, we just define __promisify__ that way and
// and manually set the "modern" promisify symbol: https://github.com/microsoft/TypeScript/issues/36813
[getProcessTree, getProcessList, getProcessCpuUsage].forEach(func => Object.defineProperty(func, util_1.promisify.custom, { enumerable: false, value: func.__promisify__ }));//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@vscode/windows-process-tree/lib/index.js.map