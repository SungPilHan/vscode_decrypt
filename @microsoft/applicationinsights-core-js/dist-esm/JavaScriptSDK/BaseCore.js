/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


"use strict";
import { __spreadArrayFn as __spreadArray } from "@microsoft/applicationinsights-shims";
import { objCreateFn } from "@microsoft/applicationinsights-shims";
import dynamicProto from "@microsoft/dynamicproto-js";
import { createProcessTelemetryContext, createProcessTelemetryUnloadContext, createProcessTelemetryUpdateContext, createTelemetryProxyChain } from "./ProcessTelemetryContext";
import { initializePlugins, sortPlugins, _getPluginState } from "./TelemetryHelpers";
import { getGblPerfMgr, PerfManager } from "./PerfManager";
import { createCookieMgr } from "./CookieMgr";
import { arrForEach, isNullOrUndefined, getSetValue, setValue, isNotTruthy, isFunction, objExtend, objFreeze, proxyFunctionAs, proxyFunctions, throwError, toISOString, arrIndexOf } from "./HelperFuncs";
import { strExtensionConfig, strIKey } from "./Constants";
import { DiagnosticLogger, _InternalLogMessage, _throwInternal, _warnToConsole } from "./DiagnosticLogger";
import { getDebugListener } from "./DbgExtensionUtils";
import { ChannelControllerPriority, createChannelControllerPlugin, createChannelQueues } from "./ChannelController";
import { TelemetryInitializerPlugin } from "./TelemetryInitializerPlugin";
import { createUniqueNamespace } from "./DataCacheHelper";
import { createUnloadHandlerContainer } from "./UnloadHandlerContainer";
import { strAddNotificationListener, strDisabled, strEventsDiscarded, strEventsSendRequest, strEventsSent, strRemoveNotificationListener, strTeardown } from "./InternalConstants";
var strValidationError = "Plugins must provide initialize method";
var strNotificationManager = "_notificationManager";
var strSdkUnloadingError = "SDK is still unloading...";
var strSdkNotInitialized = "SDK is not initialized";
// const strPluginUnloadFailed = "Failed to unload plugin";
var defaultInitConfig = {
    // Have the Diagnostic Logger default to log critical errors to the console
    loggingLevelConsole: 1 /* CRITICAL */
};
/**
 * Helper to create the default performance manager
 * @param core
 * @param notificationMgr
 */
function _createPerfManager(core, notificationMgr) {
    return new PerfManager(notificationMgr);
}
function _validateExtensions(logger, channelPriority, allExtensions) {
    // Concat all available extensions
    var coreExtensions = [];
    // Check if any two extensions have the same priority, then warn to console
    // And extract the local extensions from the
    var extPriorities = {};
    // Extension validation
    arrForEach(allExtensions, function (ext) {
        if (isNullOrUndefined(ext) || isNullOrUndefined(ext.initialize)) {
            throwError(strValidationError);
        }
        var extPriority = ext.priority;
        var identifier = ext.identifier;
        if (ext && extPriority) {
            if (!isNullOrUndefined(extPriorities[extPriority])) {
                _warnToConsole(logger, "Two extensions have same priority #" + extPriority + " - " + extPriorities[extPriority] + ", " + identifier);
            }
            else {
                // set a value
                extPriorities[extPriority] = identifier;
            }
        }
        // Split extensions to core and channelController
        if (!extPriority || extPriority < channelPriority) {
            // Add to core extension that will be managed by BaseCore
            coreExtensions.push(ext);
        }
    });
    return {
        all: allExtensions,
        core: coreExtensions
    };
}
function _isPluginPresent(thePlugin, plugins) {
    var exists = false;
    arrForEach(plugins, function (plugin) {
        if (plugin === thePlugin) {
            exists = true;
            return -1;
        }
    });
    return exists;
}
function _createDummyNotificationManager() {
    var _a;
    return objCreateFn((_a = {},
        _a[strAddNotificationListener] = function (listener) { },
        _a[strRemoveNotificationListener] = function (listener) { },
        _a[strEventsSent] = function (events) { },
        _a[strEventsDiscarded] = function (events, reason) { },
        _a[strEventsSendRequest] = function (sendReason, isAsync) { },
        _a));
}
var BaseCore = /** @class */ (function () {
    function BaseCore() {
        // NOTE!: DON'T set default values here, instead set them in the _initDefaults() function as it is also called during teardown()
        var _isInitialized;
        var _eventQueue;
        var _notificationManager;
        var _perfManager;
        var _cfgPerfManager;
        var _cookieManager;
        var _pluginChain;
        var _configExtensions;
        var _coreExtensions;
        var _channelControl;
        var _channelConfig;
        var _channelQueue;
        var _isUnloading;
        var _telemetryInitializerPlugin;
        var _internalLogsEventName;
        var _evtNamespace;
        var _unloadHandlers;
        var _debugListener;
        /**
         * Internal log poller
         */
        var _internalLogPoller = 0;
        dynamicProto(BaseCore, this, function (_self) {
            // Set the default values (also called during teardown)
            _initDefaults();
            _self.isInitialized = function () { return _isInitialized; };
            _self.initialize = function (config, extensions, logger, notificationManager) {
                if (_isUnloading) {
                    throwError(strSdkUnloadingError);
                }
                // Make sure core is only initialized once
                if (_self.isInitialized()) {
                    throwError("Core should not be initialized more than once");
                }
                if (!config || isNullOrUndefined(config.instrumentationKey)) {
                    throwError("Please provide instrumentation key");
                }
                _notificationManager = notificationManager;
                // For backward compatibility only
                _self[strNotificationManager] = notificationManager;
                _self.config = config || {};
                _initDebugListener(config);
                _initPerfManager(config);
                config.extensions = isNullOrUndefined(config.extensions) ? [] : config.extensions;
                // add notification to the extensions in the config so other plugins can access it
                _initExtConfig(config);
                if (logger) {
                    _self.logger = logger;
                }
                // Extension validation
                _configExtensions = [];
                _configExtensions.push.apply(_configExtensions, __spreadArray(__spreadArray([], extensions, false), config.extensions, false));
                _channelConfig = (config || {}).channels;
                _initPluginChain(config, null);
                if (!_channelQueue || _channelQueue.length === 0) {
                    throwError("No channels available");
                }
                _isInitialized = true;
                _self.releaseQueue();
            };
            _self.getTransmissionControls = function () {
                var controls = [];
                if (_channelQueue) {
                    arrForEach(_channelQueue, function (channels) {
                        controls.push(channels.queue);
                    });
                }
                return objFreeze(controls);
            };
            _self.track = function (telemetryItem) {
                // setup default iKey if not passed in
                setValue(telemetryItem, strIKey, _self.config.instrumentationKey, null, isNotTruthy);
                // add default timestamp if not passed in
                setValue(telemetryItem, "time", toISOString(new Date()), null, isNotTruthy);
                // Common Schema 4.0
                setValue(telemetryItem, "ver", "4.0", null, isNullOrUndefined);
                if (!_isUnloading && _self.isInitialized()) {
                    // Process the telemetry plugin chain
                    _createTelCtx().processNext(telemetryItem);
                }
                else {
                    // Queue events until all extensions are initialized
                    _eventQueue.push(telemetryItem);
                }
            };
            _self.getProcessTelContext = _createTelCtx;
            _self.getNotifyMgr = function () {
                if (!_notificationManager) {
                    // Create Dummy notification manager
                    _notificationManager = _createDummyNotificationManager();
                    // For backward compatibility only
                    _self[strNotificationManager] = _notificationManager;
                }
                return _notificationManager;
            };
            /**
             * Adds a notification listener. The SDK calls methods on the listener when an appropriate notification is raised.
             * The added plugins must raise notifications. If the plugins do not implement the notifications, then no methods will be
             * called.
             * @param {INotificationListener} listener - An INotificationListener object.
             */
            _self[strAddNotificationListener] = function (listener) {
                if (_notificationManager) {
                    _notificationManager[strAddNotificationListener](listener);
                }
            };
            /**
             * Removes all instances of the listener.
             * @param {INotificationListener} listener - INotificationListener to remove.
             */
            _self[strRemoveNotificationListener] = function (listener) {
                if (_notificationManager) {
                    _notificationManager[strRemoveNotificationListener](listener);
                }
            };
            _self.getCookieMgr = function () {
                if (!_cookieManager) {
                    _cookieManager = createCookieMgr(_self.config, _self.logger);
                }
                return _cookieManager;
            };
            _self.setCookieMgr = function (cookieMgr) {
                _cookieManager = cookieMgr;
            };
            _self.getPerfMgr = function () {
                if (!_perfManager && !_cfgPerfManager) {
                    if (_self.config && _self.config.enablePerfMgr && isFunction(_self.config.createPerfMgr)) {
                        _cfgPerfManager = _self.config.createPerfMgr(_self, _self.getNotifyMgr());
                    }
                }
                return _perfManager || _cfgPerfManager || getGblPerfMgr();
            };
            _self.setPerfMgr = function (perfMgr) {
                _perfManager = perfMgr;
            };
            _self.eventCnt = function () {
                return _eventQueue.length;
            };
            _self.releaseQueue = function () {
                if (_isInitialized && _eventQueue.length > 0) {
                    var eventQueue = _eventQueue;
                    _eventQueue = [];
                    arrForEach(eventQueue, function (event) {
                        _createTelCtx().processNext(event);
                    });
                }
            };
            /**
             * Periodically check logger.queue for log messages to be flushed
             */
            _self.pollInternalLogs = function (eventName) {
                _internalLogsEventName = eventName || null;
                var interval = _self.config.diagnosticLogInterval;
                if (!interval || !(interval > 0)) {
                    interval = 10000;
                }
                if (_internalLogPoller) {
                    clearInterval(_internalLogPoller);
                }
                _internalLogPoller = setInterval(function () {
                    _flushInternalLogs();
                }, interval);
                return _internalLogPoller;
            };
            /**
             * Stop polling log messages from logger.queue
             */
            _self.stopPollingInternalLogs = function () {
                if (_internalLogPoller) {
                    clearInterval(_internalLogPoller);
                    _internalLogPoller = 0;
                    _flushInternalLogs();
                }
            };
            // Add addTelemetryInitializer
            proxyFunctions(_self, function () { return _telemetryInitializerPlugin; }, ["addTelemetryInitializer"]);
            _self.unload = function (isAsync, unloadComplete, cbTimeout) {
                if (isAsync === void 0) { isAsync = true; }
                if (!_isInitialized) {
                    // The SDK is not initialized
                    throwError(strSdkNotInitialized);
                }
                // Check if the SDK still unloading so throw
                if (_isUnloading) {
                    // The SDK is already unloading
                    throwError(strSdkUnloadingError);
                }
                var unloadState = {
                    reason: 50 /* SdkUnload */,
                    isAsync: isAsync,
                    flushComplete: false
                };
                var processUnloadCtx = createProcessTelemetryUnloadContext(_getPluginChain(), _self);
                processUnloadCtx.onComplete(function () {
                    _initDefaults();
                    unloadComplete && unloadComplete(unloadState);
                }, _self);
                function _doUnload(flushComplete) {
                    unloadState.flushComplete = flushComplete;
                    _isUnloading = true;
                    // Run all of the unload handlers first (before unloading the plugins)
                    _unloadHandlers.run(processUnloadCtx, unloadState);
                    // Stop polling the internal logs
                    _self.stopPollingInternalLogs();
                    // Start unloading the components, from this point onwards the SDK should be considered to be in an unstable state
                    processUnloadCtx.processNext(unloadState);
                }
                if (!_flushChannels(isAsync, _doUnload, 6 /* SdkUnload */, cbTimeout)) {
                    _doUnload(false);
                }
            };
            _self.getPlugin = _getPlugin;
            _self.addPlugin = function (plugin, replaceExisting, isAsync, addCb) {
                if (!plugin) {
                    addCb && addCb(false);
                    _logOrThrowError(strValidationError);
                    return;
                }
                var existingPlugin = _getPlugin(plugin.identifier);
                if (existingPlugin && !replaceExisting) {
                    addCb && addCb(false);
                    _logOrThrowError("Plugin [" + plugin.identifier + "] is already loaded!");
                    return;
                }
                var updateState = {
                    reason: 16 /* PluginAdded */
                };
                function _addPlugin(removed) {
                    _configExtensions.push(plugin);
                    updateState.added = [plugin];
                    // Re-Initialize the plugin chain
                    _initPluginChain(_self.config, updateState);
                    addCb && addCb(true);
                }
                if (existingPlugin) {
                    var removedPlugins_1 = [existingPlugin.plugin];
                    var unloadState = {
                        reason: 2 /* PluginReplace */,
                        isAsync: !!isAsync
                    };
                    _removePlugins(removedPlugins_1, unloadState, function (removed) {
                        if (!removed) {
                            // Previous plugin was successfully removed or was not installed
                            addCb && addCb(false);
                        }
                        else {
                            updateState.removed = removedPlugins_1;
                            updateState.reason |= 32 /* PluginRemoved */;
                            _addPlugin(true);
                        }
                    });
                }
                else {
                    _addPlugin(false);
                }
            };
            _self.evtNamespace = function () {
                return _evtNamespace;
            };
            _self.flush = _flushChannels;
            // Create the addUnloadCb
            proxyFunctionAs(_self, "addUnloadCb", function () { return _unloadHandlers; }, "add");
            function _initDefaults() {
                _isInitialized = false;
                // Use a default logger so initialization errors are not dropped on the floor with full logging
                _self.config = objExtend(true, {}, defaultInitConfig);
                _self.logger = new DiagnosticLogger(_self.config);
                _self._extensions = [];
                _telemetryInitializerPlugin = new TelemetryInitializerPlugin();
                _eventQueue = [];
                _notificationManager = null;
                _perfManager = null;
                _cfgPerfManager = null;
                _cookieManager = null;
                _pluginChain = null;
                _coreExtensions = null;
                _configExtensions = [];
                _channelControl = null;
                _channelConfig = null;
                _channelQueue = null;
                _isUnloading = false;
                _internalLogsEventName = null;
                _evtNamespace = createUniqueNamespace("AIBaseCore", true);
                _unloadHandlers = createUnloadHandlerContainer();
            }
            function _createTelCtx() {
                return createProcessTelemetryContext(_getPluginChain(), _self.config, _self);
            }
            // Initialize or Re-initialize the plugins
            function _initPluginChain(config, updateState) {
                // Extension validation
                var theExtensions = _validateExtensions(_self.logger, ChannelControllerPriority, _configExtensions);
                _coreExtensions = theExtensions.core;
                _pluginChain = null;
                // Sort the complete set of extensions by priority
                var allExtensions = theExtensions.all;
                // Initialize the Channel Queues and the channel plugins first
                _channelQueue = objFreeze(createChannelQueues(_channelConfig, allExtensions, config, _self));
                if (_channelControl) {
                    // During add / remove of a plugin this may get called again, so don't re-add if already present
                    // But we also want the controller as the last, so remove if already present
                    // And reusing the existing instance, just in case an installed plugin has a reference and
                    // is using it.
                    var idx = arrIndexOf(allExtensions, _channelControl);
                    if (idx !== -1) {
                        allExtensions.splice(idx, 1);
                    }
                    idx = arrIndexOf(_coreExtensions, _channelControl);
                    if (idx !== -1) {
                        _coreExtensions.splice(idx, 1);
                    }
                    _channelControl._setQueue(_channelQueue);
                }
                else {
                    _channelControl = createChannelControllerPlugin(_channelQueue, _self);
                }
                // Add on "channelController" as the last "plugin"
                allExtensions.push(_channelControl);
                _coreExtensions.push(_channelControl);
                // Required to allow plugins to call core.getPlugin() during their own initialization
                _self._extensions = sortPlugins(allExtensions);
                // Initialize the controls
                _channelControl.initialize(config, _self, allExtensions);
                initializePlugins(_createTelCtx(), allExtensions);
                // Now reset the extensions to just those being managed by Basecore
                _self._extensions = objFreeze(sortPlugins(_coreExtensions || [])).slice();
                if (updateState) {
                    _doUpdate(updateState);
                }
            }
            function _getPlugin(pluginIdentifier) {
                var theExt = null;
                var thePlugin = null;
                arrForEach(_self._extensions, function (ext) {
                    if (ext.identifier === pluginIdentifier && ext !== _channelControl && ext !== _telemetryInitializerPlugin) {
                        thePlugin = ext;
                        return -1;
                    }
                });
                if (!thePlugin && _channelControl) {
                    // Check the channel Controller
                    thePlugin = _channelControl.getChannel(pluginIdentifier);
                }
                if (thePlugin) {
                    theExt = {
                        plugin: thePlugin,
                        setEnabled: function (enabled) {
                            _getPluginState(thePlugin)[strDisabled] = !enabled;
                        },
                        isEnabled: function () {
                            var pluginState = _getPluginState(thePlugin);
                            return !pluginState[strTeardown] && !pluginState[strDisabled];
                        },
                        remove: function (isAsync, removeCb) {
                            if (isAsync === void 0) { isAsync = true; }
                            var pluginsToRemove = [thePlugin];
                            var unloadState = {
                                reason: 1 /* PluginUnload */,
                                isAsync: isAsync
                            };
                            _removePlugins(pluginsToRemove, unloadState, function (removed) {
                                if (removed) {
                                    // Re-Initialize the plugin chain
                                    _initPluginChain(_self.config, {
                                        reason: 32 /* PluginRemoved */,
                                        removed: pluginsToRemove
                                    });
                                }
                                removeCb && removeCb(removed);
                            });
                        }
                    };
                }
                return theExt;
            }
            function _getPluginChain() {
                if (!_pluginChain) {
                    // copy the collection of extensions
                    var extensions = (_coreExtensions || []).slice();
                    // During add / remove this may get called again, so don't readd if already present
                    if (arrIndexOf(extensions, _telemetryInitializerPlugin) === -1) {
                        extensions.push(_telemetryInitializerPlugin);
                    }
                    _pluginChain = createTelemetryProxyChain(sortPlugins(extensions), _self.config, _self);
                }
                return _pluginChain;
            }
            function _removePlugins(thePlugins, unloadState, removeComplete) {
                if (thePlugins && thePlugins.length > 0) {
                    var unloadChain = createTelemetryProxyChain(thePlugins, _self.config, _self);
                    var unloadCtx = createProcessTelemetryUnloadContext(unloadChain, _self);
                    unloadCtx.onComplete(function () {
                        var removed = false;
                        // Remove the listed config extensions
                        var newConfigExtensions = [];
                        arrForEach(_configExtensions, function (plugin, idx) {
                            if (!_isPluginPresent(plugin, thePlugins)) {
                                newConfigExtensions.push(plugin);
                            }
                            else {
                                removed = true;
                            }
                        });
                        _configExtensions = newConfigExtensions;
                        // Re-Create the channel config
                        var newChannelConfig = [];
                        if (_channelConfig) {
                            arrForEach(_channelConfig, function (queue, idx) {
                                var newQueue = [];
                                arrForEach(queue, function (channel) {
                                    if (!_isPluginPresent(channel, thePlugins)) {
                                        newQueue.push(channel);
                                    }
                                    else {
                                        removed = true;
                                    }
                                });
                                newChannelConfig.push(newQueue);
                            });
                            _channelConfig = newChannelConfig;
                        }
                        removeComplete && removeComplete(removed);
                    });
                    unloadCtx.processNext(unloadState);
                }
                else {
                    removeComplete(false);
                }
            }
            function _flushInternalLogs() {
                var queue = _self.logger ? _self.logger.queue : [];
                if (queue) {
                    arrForEach(queue, function (logMessage) {
                        var item = {
                            name: _internalLogsEventName ? _internalLogsEventName : "InternalMessageId: " + logMessage.messageId,
                            iKey: _self.config.instrumentationKey,
                            time: toISOString(new Date()),
                            baseType: _InternalLogMessage.dataType,
                            baseData: { message: logMessage.message }
                        };
                        _self.track(item);
                    });
                    queue.length = 0;
                }
            }
            function _flushChannels(isAsync, callBack, sendReason, cbTimeout) {
                if (_channelControl) {
                    return _channelControl.flush(isAsync, callBack, sendReason || 6 /* SdkUnload */, cbTimeout);
                }
                callBack && callBack(false);
                return true;
            }
            function _initDebugListener(config) {
                if (config.disableDbgExt === true && _debugListener) {
                    // Remove any previously loaded debug listener
                    _notificationManager[strRemoveNotificationListener](_debugListener);
                    _debugListener = null;
                }
                if (_notificationManager && !_debugListener && config.disableDbgExt !== true) {
                    _debugListener = getDebugListener(config);
                    _notificationManager[strAddNotificationListener](_debugListener);
                }
            }
            function _initPerfManager(config) {
                if (!config.enablePerfMgr && _cfgPerfManager) {
                    // Remove any existing config based performance manager
                    _cfgPerfManager = null;
                }
                if (config.enablePerfMgr) {
                    // Set the performance manager creation function if not defined
                    setValue(_self.config, "createPerfMgr", _createPerfManager);
                }
            }
            function _initExtConfig(config) {
                var extConfig = getSetValue(config, strExtensionConfig);
                extConfig.NotificationManager = _notificationManager;
            }
            function _doUpdate(updateState) {
                var updateCtx = createProcessTelemetryUpdateContext(_getPluginChain(), _self);
                if (!_self._updateHook || _self._updateHook(updateCtx, updateState) !== true) {
                    updateCtx.processNext(updateState);
                }
            }
            function _logOrThrowError(message) {
                var logger = _self.logger;
                if (logger) {
                    // there should always be a logger
                    _throwInternal(logger, 2 /* WARNING */, 73 /* PluginException */, message);
                }
                else {
                    throwError(message);
                }
            }
        });
    }
// Removed Stub for BaseCore.prototype.initialize.
// Removed Stub for BaseCore.prototype.getTransmissionControls.
// Removed Stub for BaseCore.prototype.track.
// Removed Stub for BaseCore.prototype.getProcessTelContext.
// Removed Stub for BaseCore.prototype.getNotifyMgr.
// Removed Stub for BaseCore.prototype.addNotificationListener.
// Removed Stub for BaseCore.prototype.removeNotificationListener.
// Removed Stub for BaseCore.prototype.getCookieMgr.
// Removed Stub for BaseCore.prototype.setCookieMgr.
// Removed Stub for BaseCore.prototype.getPerfMgr.
// Removed Stub for BaseCore.prototype.setPerfMgr.
// Removed Stub for BaseCore.prototype.eventCnt.
// Removed Stub for BaseCore.prototype.pollInternalLogs.
// Removed Stub for BaseCore.prototype.stopPollingInternalLogs.
// Removed Stub for BaseCore.prototype.addTelemetryInitializer.
// Removed Stub for BaseCore.prototype.unload.
// Removed Stub for BaseCore.prototype.getPlugin.
// Removed Stub for BaseCore.prototype.addPlugin.
// Removed Stub for BaseCore.prototype.evtNamespace.
// Removed Stub for BaseCore.prototype.addUnloadCb.
// Removed Stub for BaseCore.prototype.flush.
// Removed Stub for BaseCore.prototype.releaseQueue.
// Removed Stub for BaseCore.prototype._updateHook.
    return BaseCore;
}());
export { BaseCore };//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/BaseCore.js.map