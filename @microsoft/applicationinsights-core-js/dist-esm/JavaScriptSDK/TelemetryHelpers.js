/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


"use strict";
import { arrForEach, isFunction } from "./HelperFuncs";
import { strCore, strDoTeardown, strIsInitialized, strPriority, strProcessTelemetry, strSetNextPlugin, strTeardown } from "./InternalConstants";
import { createElmNodeData } from "./DataCacheHelper";
var strDoUnload = "_doUnload";
var pluginStateData = createElmNodeData("plugin");
export function _getPluginState(plugin) {
    return pluginStateData.get(plugin, "state", {}, true);
}
/**
 * Initialize the queue of plugins
 * @param plugins - The array of plugins to initialize and setting of the next plugin
 * @param config The current config for the instance
 * @param core THe current core instance
 * @param extensions The extensions
 */
export function initializePlugins(processContext, extensions) {
    // Set the next plugin and identified the uninitialized plugins
    var initPlugins = [];
    var lastPlugin = null;
    var proxy = processContext.getNext();
    var pluginState;
    while (proxy) {
        var thePlugin = proxy.getPlugin();
        if (thePlugin) {
            if (lastPlugin &&
                isFunction(lastPlugin[strSetNextPlugin]) &&
                isFunction(thePlugin[strProcessTelemetry])) {
                // Set this plugin as the next for the previous one
                lastPlugin[strSetNextPlugin](thePlugin);
            }
            var isInitialized = false;
            if (isFunction(thePlugin[strIsInitialized])) {
                isInitialized = thePlugin[strIsInitialized]();
            }
            else {
                pluginState = _getPluginState(thePlugin);
                isInitialized = pluginState[strIsInitialized];
            }
            if (!isInitialized) {
                initPlugins.push(thePlugin);
            }
            lastPlugin = thePlugin;
            proxy = proxy.getNext();
        }
    }
    // Now initialize the plugins
    arrForEach(initPlugins, function (thePlugin) {
        var core = processContext.core();
        thePlugin.initialize(processContext.getCfg(), core, extensions, processContext.getNext());
        pluginState = _getPluginState(thePlugin);
        // Only add the core to the state if the plugin didn't set it (doesn't extent from BaseTelemetryPlugin)
        if (!thePlugin[strCore] && !pluginState[strCore]) {
            pluginState[strCore] = core;
        }
        pluginState[strIsInitialized] = true;
        delete pluginState[strTeardown];
    });
}
export function sortPlugins(plugins) {
    // Sort by priority
    return plugins.sort(function (extA, extB) {
        var result = 0;
        var bHasProcess = isFunction(extB[strProcessTelemetry]);
        if (isFunction(extA[strProcessTelemetry])) {
            result = bHasProcess ? extA[strPriority] - extB[strPriority] : 1;
        }
        else if (bHasProcess) {
            result = -1;
        }
        return result;
    });
    // sort complete
}
/**
 * Teardown / Unload helper to perform teardown/unloading operations for the provided components synchronously or asynchronously, this will call any
 * _doTeardown() or _doUnload() functions on the provided components to allow them to finish removal.
 * @param components - The components you want to unload
 * @param unloadCtx - This is the context that should be used during unloading.
 * @param unloadState - The details / state of the unload process, it holds details like whether it should be unloaded synchronously or asynchronously and the reason for the unload.
 * @param asyncCallback - An optional callback that the plugin must call if it returns true to inform the caller that it has completed any async unload/teardown operations.
 * @returns boolean - true if the plugin has or will call asyncCallback, this allows the plugin to perform any asynchronous operations.
 */
export function unloadComponents(components, unloadCtx, unloadState, asyncCallback) {
    var idx = 0;
    function _doUnload() {
        while (idx < components.length) {
            var component = components[idx++];
            if (component) {
                var func = component[strDoUnload] || component[strDoTeardown];
                if (isFunction(func)) {
                    if (func.call(component, unloadCtx, unloadState, _doUnload) === true) {
                        return true;
                    }
                }
            }
        }
    }
    return _doUnload();
}//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/TelemetryHelpers.js.map