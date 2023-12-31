/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */

// 
import { arrForEach, isArray, objFreeze, throwError } from "./HelperFuncs";
import { strPause, strProcessNext, strResume, strTeardown } from "./InternalConstants";
import { createProcessTelemetryContext, createTelemetryProxyChain } from "./ProcessTelemetryContext";
import { initializePlugins } from "./TelemetryHelpers";
export var ChannelControllerPriority = 500;
var ChannelValidationMessage = "Channel has invalid priority - ";
function _addChannelQueue(channelQueue, queue, config, core) {
    if (queue && isArray(queue) && queue.length > 0) {
        queue = queue.sort(function (a, b) {
            return a.priority - b.priority;
        });
        arrForEach(queue, function (queueItem) {
            if (queueItem.priority < ChannelControllerPriority) {
                throwError(ChannelValidationMessage + queueItem.identifier);
            }
        });
        channelQueue.push({
            queue: objFreeze(queue),
            chain: createTelemetryProxyChain(queue, config, core)
        });
    }
}
export function createChannelControllerPlugin(channelQueue, core) {
    var _a;
    function _getTelCtx() {
        return createProcessTelemetryContext(null, core.config, core, null);
    }
    function _processChannelQueue(theChannels, itemCtx, processFn, onComplete) {
        var waiting = theChannels ? (theChannels.length + 1) : 1;
        function _runChainOnComplete() {
            waiting--;
            if (waiting === 0) {
                onComplete && onComplete();
                onComplete = null;
            }
        }
        if (waiting > 0) {
            arrForEach(theChannels, function (channels) {
                // pass on to first item in queue
                if (channels && channels.queue.length > 0) {
                    var channelChain = channels.chain;
                    var chainCtx = itemCtx.createNew(channelChain);
                    chainCtx.onComplete(_runChainOnComplete);
                    // Cause this chain to start processing
                    processFn(chainCtx);
                }
                else {
                    waiting--;
                }
            });
        }
        _runChainOnComplete();
    }
    function _doUpdate(updateCtx, updateState) {
        var theUpdateState = updateState || {
            reason: 0 /* Unknown */
        };
        _processChannelQueue(channelQueue, updateCtx, function (chainCtx) {
            chainCtx[strProcessNext](theUpdateState);
        }, function () {
            updateCtx[strProcessNext](theUpdateState);
        });
        return true;
    }
    function _doTeardown(unloadCtx, unloadState) {
        var theUnloadState = unloadState || {
            reason: 0 /* ManualTeardown */,
            isAsync: false
        };
        _processChannelQueue(channelQueue, unloadCtx, function (chainCtx) {
            chainCtx[strProcessNext](theUnloadState);
        }, function () {
            unloadCtx[strProcessNext](theUnloadState);
            isInitialized = false;
        });
        return true;
    }
    function _getChannel(pluginIdentifier) {
        var thePlugin = null;
        if (channelQueue && channelQueue.length > 0) {
            arrForEach(channelQueue, function (channels) {
                // pass on to first item in queue
                if (channels && channels.queue.length > 0) {
                    arrForEach(channels.queue, function (ext) {
                        if (ext.identifier === pluginIdentifier) {
                            thePlugin = ext;
                            // Cause arrForEach to stop iterating
                            return -1;
                        }
                    });
                    if (thePlugin) {
                        // Cause arrForEach to stop iterating
                        return -1;
                    }
                }
            });
        }
        return thePlugin;
    }
    var isInitialized = false;
    var channelController = (_a = {
            identifier: "ChannelControllerPlugin",
            priority: ChannelControllerPriority,
            initialize: function (config, core, extensions, pluginChain) {
                isInitialized = true;
                arrForEach(channelQueue, function (channels) {
                    if (channels && channels.queue.length > 0) {
                        initializePlugins(createProcessTelemetryContext(channels.chain, config, core), extensions);
                    }
                });
            },
            isInitialized: function () {
                return isInitialized;
            },
            processTelemetry: function (item, itemCtx) {
                _processChannelQueue(channelQueue, itemCtx || _getTelCtx(), function (chainCtx) {
                    chainCtx[strProcessNext](item);
                }, function () {
                    itemCtx[strProcessNext](item);
                });
            },
            update: _doUpdate
        },
        _a[strPause] = function () {
            _processChannelQueue(channelQueue, _getTelCtx(), function (chainCtx) {
                chainCtx.iterate(function (plugin) {
                    plugin[strPause] && plugin[strPause]();
                });
            }, null);
        },
        _a[strResume] = function () {
            _processChannelQueue(channelQueue, _getTelCtx(), function (chainCtx) {
                chainCtx.iterate(function (plugin) {
                    plugin[strResume] && plugin[strResume]();
                });
            }, null);
        },
        _a[strTeardown] = _doTeardown,
        _a.getChannel = _getChannel,
        _a.flush = function (isAsync, callBack, sendReason, cbTimeout) {
            // Setting waiting to one so that we don't call the callBack until we finish iterating
            var waiting = 1;
            var doneIterating = false;
            var cbTimer = null;
            cbTimeout = cbTimeout || 5000;
            function doCallback() {
                waiting--;
                if (doneIterating && waiting === 0) {
                    if (cbTimer) {
                        clearTimeout(cbTimer);
                        cbTimer = null;
                    }
                    callBack && callBack(doneIterating);
                    callBack = null;
                }
            }
            _processChannelQueue(channelQueue, _getTelCtx(), function (chainCtx) {
                chainCtx.iterate(function (plugin) {
                    if (plugin.flush) {
                        waiting++;
                        var handled_1 = false;
                        // Not all channels will call this callback for every scenario
                        if (!plugin.flush(isAsync, function () {
                            handled_1 = true;
                            doCallback();
                        }, sendReason)) {
                            if (!handled_1) {
                                // If any channel doesn't return true and it didn't call the callback, then we should assume that the callback
                                // will never be called, so use a timeout to allow the channel(s) some time to "finish" before triggering any
                                // followup function (such as unloading)
                                if (isAsync && cbTimer == null) {
                                    cbTimer = setTimeout(function () {
                                        cbTimer = null;
                                        doCallback();
                                    }, cbTimeout);
                                }
                                else {
                                    doCallback();
                                }
                            }
                        }
                    }
                });
            }, function () {
                doneIterating = true;
                doCallback();
            });
            return true;
        },
        _a._setQueue = function (queue) {
            channelQueue = queue;
        },
        _a);
    return channelController;
}
export function createChannelQueues(channels, extensions, config, core) {
    var channelQueue = [];
    if (channels) {
        // Add and sort the configuration channel queues
        arrForEach(channels, function (queue) { return _addChannelQueue(channelQueue, queue, config, core); });
    }
    if (extensions) {
        // Create a new channel queue for any extensions with a priority > the ChannelControllerPriority
        var extensionQueue_1 = [];
        arrForEach(extensions, function (plugin) {
            if (plugin.priority > ChannelControllerPriority) {
                extensionQueue_1.push(plugin);
            }
        });
        _addChannelQueue(channelQueue, extensionQueue_1, config, core);
    }
    return channelQueue;
}//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/ChannelController.js.map