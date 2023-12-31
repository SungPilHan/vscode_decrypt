/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


"use strict";
import dynamicProto from "@microsoft/dynamicproto-js";
import { createProcessTelemetryContext, createProcessTelemetryUnloadContext, createProcessTelemetryUpdateContext } from "./ProcessTelemetryContext";
import { arrForEach, isArray, isFunction, isNullOrUndefined, proxyFunctionAs, setValue } from "./HelperFuncs";
import { strExtensionConfig } from "./Constants";
import { createUnloadHandlerContainer } from "./UnloadHandlerContainer";
import { strDoTeardown, strIsInitialized, strSetNextPlugin } from "./InternalConstants";
var strGetPlugin = "getPlugin";
/**
 * BaseTelemetryPlugin provides a basic implementation of the ITelemetryPlugin interface so that plugins
 * can avoid implementation the same set of boiler plate code as well as provide a base
 * implementation so that new default implementations can be added without breaking all plugins.
 */
var BaseTelemetryPlugin = /** @class */ (function () {
    function BaseTelemetryPlugin() {
        var _self = this; // Setting _self here as it's used outside of the dynamicProto as well
        // NOTE!: DON'T set default values here, instead set them in the _initDefaults() function as it is also called during teardown()
        var _isinitialized;
        var _rootCtx; // Used as the root context, holding the current config and initialized core
        var _nextPlugin; // Used for backward compatibility where plugins don't call the main pipeline
        var _unloadHandlerContainer;
        var _hooks;
        _initDefaults();
        dynamicProto(BaseTelemetryPlugin, _self, function (_self) {
            _self.initialize = function (config, core, extensions, pluginChain) {
                _setDefaults(config, core, pluginChain);
                _isinitialized = true;
            };
            _self.teardown = function (unloadCtx, unloadState) {
                // If this plugin has already been torn down (not operational) or is not initialized (core is not set)
                // or the core being used for unload was not the same core used for initialization.
                var core = _self.core;
                if (!core || (unloadCtx && core !== unloadCtx.core())) {
                    // Do Nothing as either the plugin is not initialized or was not initialized by the current core
                    return;
                }
                var result;
                var unloadDone = false;
                var theUnloadCtx = unloadCtx || createProcessTelemetryUnloadContext(null, core, _nextPlugin && _nextPlugin[strGetPlugin] ? _nextPlugin[strGetPlugin]() : _nextPlugin);
                var theUnloadState = unloadState || {
                    reason: 0 /* ManualTeardown */,
                    isAsync: false
                };
                function _unloadCallback() {
                    if (!unloadDone) {
                        unloadDone = true;
                        _unloadHandlerContainer.run(theUnloadCtx, unloadState);
                        // Remove all instrumentation hooks
                        arrForEach(_hooks, function (fn) {
                            fn.rm();
                        });
                        _hooks = [];
                        if (result === true) {
                            theUnloadCtx.processNext(theUnloadState);
                        }
                        _initDefaults();
                    }
                }
                if (!_self[strDoTeardown] || _self[strDoTeardown](theUnloadCtx, theUnloadState, _unloadCallback) !== true) {
                    _unloadCallback();
                }
                else {
                    // Tell the caller that we will be calling processNext()
                    result = true;
                }
                return result;
            };
            _self.update = function (updateCtx, updateState) {
                // If this plugin has already been torn down (not operational) or is not initialized (core is not set)
                // or the core being used for unload was not the same core used for initialization.
                var core = _self.core;
                if (!core || (updateCtx && core !== updateCtx.core())) {
                    // Do Nothing
                    return;
                }
                var result;
                var updateDone = false;
                var theUpdateCtx = updateCtx || createProcessTelemetryUpdateContext(null, core, _nextPlugin && _nextPlugin[strGetPlugin] ? _nextPlugin[strGetPlugin]() : _nextPlugin);
                var theUpdateState = updateState || {
                    reason: 0 /* Unknown */
                };
                function _updateCallback() {
                    if (!updateDone) {
                        updateDone = true;
                        _setDefaults(theUpdateCtx.getCfg(), theUpdateCtx.core(), theUpdateCtx.getNext());
                    }
                }
                if (!_self._doUpdate || _self._doUpdate(theUpdateCtx, theUpdateState, _updateCallback) !== true) {
                    _updateCallback();
                }
                else {
                    result = true;
                }
                return result;
            };
            _self._addHook = function (hooks) {
                if (hooks) {
                    if (isArray(hooks)) {
                        _hooks = _hooks.concat(hooks);
                    }
                    else {
                        _hooks.push(hooks);
                    }
                }
            };
            proxyFunctionAs(_self, "_addUnloadCb", function () { return _unloadHandlerContainer; }, "add");
        });
        // These are added after the dynamicProto so that are not moved to the prototype
        _self.diagLog = function (itemCtx) {
            return _getTelCtx(itemCtx).diagLog();
        };
        _self[strIsInitialized] = function () {
            return _isinitialized;
        };
        _self.setInitialized = function (isInitialized) {
            _isinitialized = isInitialized;
        };
        // _self.getNextPlugin = () => DO NOT IMPLEMENT
        // Sub-classes of this base class *should* not be relying on this value and instead
        // should use processNext() function. If you require access to the plugin use the
        // IProcessTelemetryContext.getNext().getPlugin() while in the pipeline, Note getNext() may return null.
        _self[strSetNextPlugin] = function (next) {
            _nextPlugin = next;
        };
        _self.processNext = function (env, itemCtx) {
            if (itemCtx) {
                // Normal core execution sequence
                itemCtx.processNext(env);
            }
            else if (_nextPlugin && isFunction(_nextPlugin.processTelemetry)) {
                // Looks like backward compatibility or out of band processing. And as it looks
                // like a ITelemetryPlugin or ITelemetryPluginChain, just call processTelemetry
                _nextPlugin.processTelemetry(env, null);
            }
        };
        _self._getTelCtx = _getTelCtx;
        function _getTelCtx(currentCtx) {
            if (currentCtx === void 0) { currentCtx = null; }
            var itemCtx = currentCtx;
            if (!itemCtx) {
                var rootCtx = _rootCtx || createProcessTelemetryContext(null, {}, _self.core);
                // tslint:disable-next-line: prefer-conditional-expression
                if (_nextPlugin && _nextPlugin[strGetPlugin]) {
                    // Looks like a chain object
                    itemCtx = rootCtx.createNew(null, _nextPlugin[strGetPlugin]);
                }
                else {
                    itemCtx = rootCtx.createNew(null, _nextPlugin);
                }
            }
            return itemCtx;
        }
        function _setDefaults(config, core, pluginChain) {
            if (config) {
                // Make sure the extensionConfig exists
                setValue(config, strExtensionConfig, [], null, isNullOrUndefined);
            }
            if (!pluginChain && core) {
                // Get the first plugin from the core
                pluginChain = core.getProcessTelContext().getNext();
            }
            var nextPlugin = _nextPlugin;
            if (_nextPlugin && _nextPlugin[strGetPlugin]) {
                // If it looks like a proxy/chain then get the plugin
                nextPlugin = _nextPlugin[strGetPlugin]();
            }
            // Support legacy plugins where core was defined as a property
            _self.core = core;
            _rootCtx = createProcessTelemetryContext(pluginChain, config, core, nextPlugin);
        }
        function _initDefaults() {
            _isinitialized = false;
            _self.core = null;
            _rootCtx = null;
            _nextPlugin = null;
            _hooks = [];
            _unloadHandlerContainer = createUnloadHandlerContainer();
        }
    }
// Removed Stub for BaseTelemetryPlugin.prototype.initialize.
// Removed Stub for BaseTelemetryPlugin.prototype.teardown.
// Removed Stub for BaseTelemetryPlugin.prototype.update.
// Removed Stub for BaseTelemetryPlugin.prototype._addUnloadCb.
// Removed Stub for BaseTelemetryPlugin.prototype._addHook.
    return BaseTelemetryPlugin;
}());
export { BaseTelemetryPlugin };//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/BaseTelemetryPlugin.js.map