/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


import { getGlobalInst } from "./EnvUtils";
var listenerFuncs = ["eventsSent", "eventsDiscarded", "eventsSendRequest", "perfEvent"];
var _aiNamespace = null;
var _debugListener;
function _listenerProxyFunc(name, config) {
    return function () {
        var args = arguments;
        var dbgExt = getDebugExt(config);
        if (dbgExt) {
            var listener = dbgExt.listener;
            if (listener && listener[name]) {
                listener[name].apply(listener, args);
            }
        }
    };
}
function _getExtensionNamespace() {
    // Cache the lookup of the global namespace object
    var target = getGlobalInst("Microsoft");
    if (target) {
        _aiNamespace = target["ApplicationInsights"];
    }
    return _aiNamespace;
}
export function getDebugExt(config) {
    var ns = _aiNamespace;
    if (!ns && config.disableDbgExt !== true) {
        ns = _aiNamespace || _getExtensionNamespace();
    }
    return ns ? ns["ChromeDbgExt"] : null;
}
export function getDebugListener(config) {
    if (!_debugListener) {
        _debugListener = {};
        for (var lp = 0; lp < listenerFuncs.length; lp++) {
            _debugListener[listenerFuncs[lp]] = _listenerProxyFunc(listenerFuncs[lp], config);
        }
    }
    return _debugListener;
}//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/DbgExtensionUtils.js.map