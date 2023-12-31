/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */
// 
// 
import { __extendsFn as __extends } from "@microsoft/applicationinsights-shims";
import dynamicProto from "@microsoft/dynamicproto-js";
import { BaseTelemetryPlugin } from "./BaseTelemetryPlugin";
import { _throwInternal } from "./DiagnosticLogger";
import { dumpObj } from "./EnvUtils";
import { arrForEach, getExceptionName } from "./HelperFuncs";
import { strDoTeardown } from "./InternalConstants";
var TelemetryInitializerPlugin = /** @class */ (function (_super) {
    __extends(TelemetryInitializerPlugin, _super);
    function TelemetryInitializerPlugin() {
        var _this = _super.call(this) || this;
        _this.identifier = "TelemetryInitializerPlugin";
        _this.priority = 199;
        // NOTE!: DON'T set default values here, instead set them in the _initDefaults() function as it is also called during teardown()
        var _id;
        var _initializers;
        _initDefaults();
        dynamicProto(TelemetryInitializerPlugin, _this, function (_self, _base) {
            _self.addTelemetryInitializer = function (telemetryInitializer) {
                var theInitializer = {
                    id: _id++,
                    fn: telemetryInitializer
                };
                _initializers.push(theInitializer);
                var handler = {
                    remove: function () {
                        arrForEach(_initializers, function (initializer, idx) {
                            if (initializer.id === theInitializer.id) {
                                _initializers.splice(idx, 1);
                                return -1;
                            }
                        });
                    }
                };
                return handler;
            };
            _self.processTelemetry = function (item, itemCtx) {
                var doNotSendItem = false;
                var telemetryInitializersCount = _initializers.length;
                for (var i = 0; i < telemetryInitializersCount; ++i) {
                    var telemetryInitializer = _initializers[i];
                    if (telemetryInitializer) {
                        try {
                            if (telemetryInitializer.fn.apply(null, [item]) === false) {
                                doNotSendItem = true;
                                break;
                            }
                        }
                        catch (e) {
                            // log error but dont stop executing rest of the telemetry initializers
                            // doNotSendItem = true;
                            _throwInternal(itemCtx.diagLog(), 1 /* CRITICAL */, 64 /* TelemetryInitializerFailed */, "One of telemetry initializers failed, telemetry item will not be sent: " + getExceptionName(e), { exception: dumpObj(e) }, true);
                        }
                    }
                }
                if (!doNotSendItem) {
                    _self.processNext(item, itemCtx);
                }
            };
            _self[strDoTeardown] = function () {
                _initDefaults();
            };
        });
        function _initDefaults() {
            _id = 0;
            _initializers = [];
        }
        return _this;
    }
// Removed Stub for TelemetryInitializerPlugin.prototype.addTelemetryInitializer.
// Removed Stub for TelemetryInitializerPlugin.prototype.processTelemetry.
    return TelemetryInitializerPlugin;
}(BaseTelemetryPlugin));
export { TelemetryInitializerPlugin };//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/TelemetryInitializerPlugin.js.map