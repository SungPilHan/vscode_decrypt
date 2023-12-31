/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


import { _throwInternal } from "./DiagnosticLogger";
import { dumpObj } from "./EnvUtils";
import { arrForEach } from "./HelperFuncs";
export function createUnloadHandlerContainer() {
    var handlers = [];
    function _addHandler(handler) {
        if (handler) {
            handlers.push(handler);
        }
    }
    function _runHandlers(unloadCtx, unloadState) {
        arrForEach(handlers, function (handler) {
            try {
                handler(unloadCtx, unloadState);
            }
            catch (e) {
                _throwInternal(unloadCtx.diagLog(), 2 /* WARNING */, 73 /* PluginException */, "Unexpected error calling unload handler - " + dumpObj(e));
            }
        });
        handlers = [];
    }
    return {
        add: _addHandler,
        run: _runHandlers
    };
}//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/UnloadHandlerContainer.js.map