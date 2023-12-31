/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


"use strict";
import { safeGetLogger, _throwInternal } from "./DiagnosticLogger";
import { arrForEach, isArray, isFunction, isNullOrUndefined, isObject, isUndefined, objExtend, objForEachKey, objFreeze, objKeys, proxyFunctions } from "./HelperFuncs";
import { doPerf } from "./PerfManager";
import { dumpObj } from "./EnvUtils";
import { strCore, strDisabled, strEmpty, strIsInitialized, strTeardown, strUpdate } from "./InternalConstants";
import { _getPluginState } from "./TelemetryHelpers";
var strTelemetryPluginChain = "TelemetryPluginChain";
var strHasRunFlags = "_hasRun";
var strGetTelCtx = "_getTelCtx";
var _chainId = 0;
function _getNextProxyStart(proxy, core, startAt) {
    while (proxy) {
        if (proxy.getPlugin() === startAt) {
            return proxy;
        }
        proxy = proxy.getNext();
    }
    // This wasn't found in the existing chain so create an isolated one with just this plugin
    return createTelemetryProxyChain([startAt], core.config || {}, core);
}
/**
 * @ignore
 * @param telemetryChain
 * @param config
 * @param core
 * @param startAt - Identifies the next plugin to execute, if null there is no "next" plugin and if undefined it should assume the start of the chain
 * @returns
 */
function _createInternalContext(telemetryChain, config, core, startAt) {
    // We have a special case where we want to start execution from this specific plugin
    // or we simply reuse the existing telemetry plugin chain (normal execution case)
    var _nextProxy = null; // By Default set as no next plugin
    var _onComplete = [];
    if (startAt !== null) {
        // There is no next element (null) vs not defined (undefined) so use the full chain
        _nextProxy = startAt ? _getNextProxyStart(telemetryChain, core, startAt) : telemetryChain;
    }
    var context = {
        _next: _moveNext,
        ctx: {
            core: function () {
                return core;
            },
            diagLog: function () {
                return safeGetLogger(core, config);
            },
            getCfg: function () {
                return config;
            },
            getExtCfg: _getExtCfg,
            getConfig: _getConfig,
            hasNext: function () {
                return !!_nextProxy;
            },
            getNext: function () {
                return _nextProxy;
            },
            setNext: function (nextPlugin) {
                _nextProxy = nextPlugin;
            },
            iterate: _iterateChain,
            onComplete: _addOnComplete
        }
    };
    function _addOnComplete(onComplete, that) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (onComplete) {
            _onComplete.push({
                func: onComplete,
                self: !isUndefined(that) ? that : context.ctx,
                args: args
            });
        }
    }
    function _moveNext() {
        var nextProxy = _nextProxy;
        // Automatically move to the next plugin
        _nextProxy = nextProxy ? nextProxy.getNext() : null;
        if (!nextProxy) {
            var onComplete = _onComplete;
            if (onComplete && onComplete.length > 0) {
                arrForEach(onComplete, function (completeDetails) {
                    try {
                        completeDetails.func.call(completeDetails.self, completeDetails.args);
                    }
                    catch (e) {
                        _throwInternal(core.logger, 2 /* WARNING */, 73 /* PluginException */, "Unexpected Exception during onComplete - " + dumpObj(e));
                    }
                });
                _onComplete = [];
            }
        }
        return nextProxy;
    }
    function _getExtCfg(identifier, defaultValue, mergeDefault) {
        if (defaultValue === void 0) { defaultValue = {}; }
        if (mergeDefault === void 0) { mergeDefault = 0 /* None */; }
        var theConfig;
        if (config) {
            var extConfig = config.extensionConfig;
            if (extConfig && identifier) {
                theConfig = extConfig[identifier];
            }
        }
        if (!theConfig) {
            // Just use the defaults
            theConfig = defaultValue;
        }
        else if (isObject(defaultValue)) {
            if (mergeDefault !== 0 /* None */) {
                // Merge the defaults and configured values
                var newConfig_1 = objExtend(true, defaultValue, theConfig);
                if (config && mergeDefault === 2 /* MergeDefaultFromRootOrDefault */) {
                    // Enumerate over the defaultValues and if not already populated attempt to
                    // find a value from the root config
                    objForEachKey(defaultValue, function (field) {
                        // for each unspecified field, set the default value
                        if (isNullOrUndefined(newConfig_1[field])) {
                            var cfgValue = config[field];
                            if (!isNullOrUndefined(cfgValue)) {
                                newConfig_1[field] = cfgValue;
                            }
                        }
                    });
                }
                theConfig = newConfig_1;
            }
        }
        return theConfig;
    }
    function _getConfig(identifier, field, defaultValue) {
        if (defaultValue === void 0) { defaultValue = false; }
        var theValue;
        var extConfig = _getExtCfg(identifier, null);
        if (extConfig && !isNullOrUndefined(extConfig[field])) {
            theValue = extConfig[field];
        }
        else if (config && !isNullOrUndefined(config[field])) {
            theValue = config[field];
        }
        return !isNullOrUndefined(theValue) ? theValue : defaultValue;
    }
    function _iterateChain(cb) {
        // Keep processing until we reach the end of the chain
        var nextPlugin;
        while (!!(nextPlugin = context._next())) {
            var plugin = nextPlugin.getPlugin();
            if (plugin) {
                // callback with the current on
                cb(plugin);
            }
        }
    }
    return context;
}
/**
 * Creates a new Telemetry Item context with the current config, core and plugin execution chain
 * @param plugins - The plugin instances that will be executed
 * @param config - The current config
 * @param core - The current core instance
 * @param startAt - Identifies the next plugin to execute, if null there is no "next" plugin and if undefined it should assume the start of the chain
 */
export function createProcessTelemetryContext(telemetryChain, config, core, startAt) {
    var internalContext = _createInternalContext(telemetryChain, config, core, startAt);
    var context = internalContext.ctx;
    function _processNext(env) {
        var nextPlugin = internalContext._next();
        // Run the next plugin which will call "processNext()"
        nextPlugin && nextPlugin.processTelemetry(env, context);
        return !nextPlugin;
    }
    function _createNew(plugins, startAt) {
        if (plugins === void 0) { plugins = null; }
        if (isArray(plugins)) {
            plugins = createTelemetryProxyChain(plugins, config, core, startAt);
        }
        return createProcessTelemetryContext(plugins || context.getNext(), config, core, startAt);
    }
    context.processNext = _processNext;
    context.createNew = _createNew;
    return context;
}
/**
 * Creates a new Telemetry Item context with the current config, core and plugin execution chain for handling the unloading of the chain
 * @param plugins - The plugin instances that will be executed
 * @param config - The current config
 * @param core - The current core instance
 * @param startAt - Identifies the next plugin to execute, if null there is no "next" plugin and if undefined it should assume the start of the chain
 */
export function createProcessTelemetryUnloadContext(telemetryChain, core, startAt) {
    var config = core.config || {};
    var internalContext = _createInternalContext(telemetryChain, config, core, startAt);
    var context = internalContext.ctx;
    function _processNext(unloadState) {
        var nextPlugin = internalContext._next();
        nextPlugin && nextPlugin.unload(context, unloadState);
        return !nextPlugin;
    }
    function _createNew(plugins, startAt) {
        if (plugins === void 0) { plugins = null; }
        if (isArray(plugins)) {
            plugins = createTelemetryProxyChain(plugins, config, core, startAt);
        }
        return createProcessTelemetryUnloadContext(plugins || context.getNext(), core, startAt);
    }
    context.processNext = _processNext;
    context.createNew = _createNew;
    return context;
}
/**
 * Creates a new Telemetry Item context with the current config, core and plugin execution chain for updating the configuration
 * @param plugins - The plugin instances that will be executed
 * @param config - The current config
 * @param core - The current core instance
 * @param startAt - Identifies the next plugin to execute, if null there is no "next" plugin and if undefined it should assume the start of the chain
 */
export function createProcessTelemetryUpdateContext(telemetryChain, core, startAt) {
    var config = core.config || {};
    var internalContext = _createInternalContext(telemetryChain, config, core, startAt);
    var context = internalContext.ctx;
    function _processNext(updateState) {
        return context.iterate(function (plugin) {
            if (isFunction(plugin.update)) {
                plugin.update(context, updateState);
            }
        });
    }
    function _createNew(plugins, startAt) {
        if (plugins === void 0) { plugins = null; }
        if (isArray(plugins)) {
            plugins = createTelemetryProxyChain(plugins, config, core, startAt);
        }
        return createProcessTelemetryUpdateContext(plugins || context.getNext(), core, startAt);
    }
    context.processNext = _processNext;
    context.createNew = _createNew;
    return context;
}
/**
 * Creates an execution chain from the array of plugins
 * @param plugins - The array of plugins that will be executed in this order
 * @param defItemCtx - The default execution context to use when no telemetry context is passed to processTelemetry(), this
 * should be for legacy plugins only. Currently, only used for passing the current core instance and to provide better error
 * reporting (hasRun) when errors occur.
 */
export function createTelemetryProxyChain(plugins, config, core, startAt) {
    var firstProxy = null;
    var add = startAt ? false : true;
    if (isArray(plugins) && plugins.length > 0) {
        // Create the proxies and wire up the next plugin chain
        var lastProxy_1 = null;
        arrForEach(plugins, function (thePlugin) {
            if (!add && startAt === thePlugin) {
                add = true;
            }
            if (add && thePlugin && isFunction(thePlugin.processTelemetry)) {
                // Only add plugins that are processors
                var newProxy = createTelemetryPluginProxy(thePlugin, config, core);
                if (!firstProxy) {
                    firstProxy = newProxy;
                }
                if (lastProxy_1) {
                    // Set this new proxy as the next for the previous one
                    lastProxy_1._setNext(newProxy);
                }
                lastProxy_1 = newProxy;
            }
        });
    }
    if (startAt && !firstProxy) {
        // Special case where the "startAt" was not in the original list of plugins
        return createTelemetryProxyChain([startAt], config, core);
    }
    return firstProxy;
}
/**
 * Create the processing telemetry proxy instance, the proxy is used to abstract the current plugin to allow monitoring and
 * execution plugins while passing around the dynamic execution state (IProcessTelemetryContext), the proxy instance no longer
 * contains any execution state and can be reused between requests (this was not the case for 2.7.2 and earlier with the
 * TelemetryPluginChain class).
 * @param plugin - The plugin instance to proxy
 * @param config - The default execution context to use when no telemetry context is passed to processTelemetry(), this
 * should be for legacy plugins only. Currently, only used for passing the current core instance and to provide better error
 * reporting (hasRun) when errors occur.
 * @returns
 */
export function createTelemetryPluginProxy(plugin, config, core) {
    var nextProxy = null;
    var hasProcessTelemetry = isFunction(plugin.processTelemetry);
    var hasSetNext = isFunction(plugin.setNextPlugin);
    var chainId;
    if (plugin) {
        chainId = plugin.identifier + "-" + plugin.priority + "-" + _chainId++;
    }
    else {
        chainId = "Unknown-0-" + _chainId++;
    }
    var proxyChain = {
        getPlugin: function () {
            return plugin;
        },
        getNext: function () {
            return nextProxy;
        },
        processTelemetry: _processTelemetry,
        unload: _unloadPlugin,
        update: _updatePlugin,
        _id: chainId,
        _setNext: function (nextPlugin) {
            nextProxy = nextPlugin;
        }
    };
    function _getTelCtx() {
        var itemCtx;
        // Looks like a plugin didn't pass the (optional) context, so create a new one
        if (plugin && isFunction(plugin[strGetTelCtx])) {
            // This plugin extends from the BaseTelemetryPlugin so lets use it
            itemCtx = plugin[strGetTelCtx]();
        }
        if (!itemCtx) {
            // Create a temporary one
            itemCtx = createProcessTelemetryContext(proxyChain, config, core);
        }
        return itemCtx;
    }
    function _processChain(itemCtx, processPluginFn, name, details, isAsync) {
        var hasRun = false;
        var identifier = plugin ? plugin.identifier : strTelemetryPluginChain;
        var hasRunContext = itemCtx[strHasRunFlags];
        if (!hasRunContext) {
            // Assign and populate
            hasRunContext = itemCtx[strHasRunFlags] = {};
        }
        // Ensure that we keep the context in sync
        itemCtx.setNext(nextProxy);
        if (plugin) {
            doPerf(itemCtx[strCore](), function () { return identifier + ":" + name; }, function () {
                // Mark this component as having run
                hasRunContext[chainId] = true;
                try {
                    // Set a flag on the next plugin so we know if it was attempted to be executed
                    var nextId = nextProxy ? nextProxy._id : strEmpty;
                    if (nextId) {
                        hasRunContext[nextId] = false;
                    }
                    hasRun = processPluginFn(itemCtx);
                }
                catch (error) {
                    var hasNextRun = nextProxy ? hasRunContext[nextProxy._id] : true;
                    if (hasNextRun) {
                        // The next plugin after us has already run so set this one as complete
                        hasRun = true;
                    }
                    if (!nextProxy || !hasNextRun) {
                        // Either we have no next plugin or the current one did not attempt to call the next plugin
                        // Which means the current one is the root of the failure so log/report this failure
                        _throwInternal(itemCtx.diagLog(), 1 /* CRITICAL */, 73 /* PluginException */, "Plugin [" + identifier + "] failed during " + name + " - " + dumpObj(error) + ", run flags: " + dumpObj(hasRunContext));
                    }
                }
            }, details, isAsync);
        }
        return hasRun;
    }
    function _processTelemetry(env, itemCtx) {
        itemCtx = itemCtx || _getTelCtx();
        function _callProcessTelemetry(itemCtx) {
            if (!plugin || !hasProcessTelemetry) {
                return false;
            }
            var pluginState = _getPluginState(plugin);
            if (pluginState.teardown || pluginState[strDisabled]) {
                return false;
            }
            // Ensure that we keep the context in sync (for processNext()), just in case a plugin
            // doesn't calls processTelemetry() instead of itemContext.processNext() or some
            // other form of error occurred
            if (hasSetNext) {
                // Backward compatibility setting the next plugin on the instance
                plugin.setNextPlugin(nextProxy);
            }
            plugin.processTelemetry(env, itemCtx);
            // Process Telemetry is expected to call itemCtx.processNext() or nextPlugin.processTelemetry()
            return true;
        }
        if (!_processChain(itemCtx, _callProcessTelemetry, "processTelemetry", function () { return ({ item: env }); }, !(env.sync))) {
            // The underlying plugin is either not defined, not enabled or does not have a processTelemetry implementation
            // so we still want the next plugin to be executed.
            itemCtx.processNext(env);
        }
    }
    function _unloadPlugin(unloadCtx, unloadState) {
        function _callTeardown() {
            // Setting default of hasRun as false so the proxyProcessFn() is called as teardown() doesn't have to exist or call unloadNext().
            var hasRun = false;
            if (plugin) {
                var pluginState = _getPluginState(plugin);
                var pluginCore = plugin[strCore] || pluginState.core;
                // Only teardown the plugin if it was initialized by the current core (i.e. It's not a shared plugin)
                if (plugin && (!pluginCore || pluginCore === unloadCtx[strCore]()) && !pluginState[strTeardown]) {
                    // Handle plugins that don't extend from the BaseTelemetryPlugin
                    pluginState[strCore] = null;
                    pluginState[strTeardown] = true;
                    pluginState[strIsInitialized] = false;
                    if (plugin[strTeardown] && plugin[strTeardown](unloadCtx, unloadState) === true) {
                        // plugin told us that it was going to (or has) call unloadCtx.processNext()
                        hasRun = true;
                    }
                }
            }
            return hasRun;
        }
        if (!_processChain(unloadCtx, _callTeardown, "unload", function () { }, unloadState.isAsync)) {
            // Only called if we hasRun was not true
            unloadCtx.processNext(unloadState);
        }
    }
    function _updatePlugin(updateCtx, updateState) {
        function _callUpdate() {
            // Setting default of hasRun as false so the proxyProcessFn() is called as teardown() doesn't have to exist or call unloadNext().
            var hasRun = false;
            if (plugin) {
                var pluginState = _getPluginState(plugin);
                var pluginCore = plugin[strCore] || pluginState.core;
                // Only update the plugin if it was initialized by the current core (i.e. It's not a shared plugin)
                if (plugin && (!pluginCore || pluginCore === updateCtx[strCore]()) && !pluginState[strTeardown]) {
                    if (plugin[strUpdate] && plugin[strUpdate](updateCtx, updateState) === true) {
                        // plugin told us that it was going to (or has) call unloadCtx.processNext()
                        hasRun = true;
                    }
                }
            }
            return hasRun;
        }
        if (!_processChain(updateCtx, _callUpdate, "update", function () { }, false)) {
            // Only called if we hasRun was not true
            updateCtx.processNext(updateState);
        }
    }
    return objFreeze(proxyChain);
}
/**
 * This class will be removed!
 * @deprecated use createProcessTelemetryContext() instead
 */
var ProcessTelemetryContext = /** @class */ (function () {
    /**
     * Creates a new Telemetry Item context with the current config, core and plugin execution chain
     * @param plugins - The plugin instances that will be executed
     * @param config - The current config
     * @param core - The current core instance
     */
    function ProcessTelemetryContext(pluginChain, config, core, startAt) {
        var _self = this;
        var context = createProcessTelemetryContext(pluginChain, config, core, startAt);
        // Proxy all functions of the context to this object
        proxyFunctions(_self, context, objKeys(context));
    }
    return ProcessTelemetryContext;
}());
export { ProcessTelemetryContext };//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/ProcessTelemetryContext.js.map