/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */
import { __extendsFn as __extends } from "@microsoft/applicationinsights-shims";
import { BaseCore } from "./BaseCore";
import { NotificationManager } from "./NotificationManager";
import { doPerf } from "./PerfManager";
import { DiagnosticLogger } from "./DiagnosticLogger";
import dynamicProto from "@microsoft/dynamicproto-js";
import { isNullOrUndefined, throwError } from "./HelperFuncs";
var AppInsightsCore = /** @class */ (function (_super) {
    __extends(AppInsightsCore, _super);
    function AppInsightsCore() {
        var _this = _super.call(this) || this;
        dynamicProto(AppInsightsCore, _this, function (_self, _base) {
            _self.initialize = function (config, extensions, logger, notificationManager) {
                _base.initialize(config, extensions, logger || new DiagnosticLogger(config), notificationManager || new NotificationManager(config));
            };
            _self.track = function (telemetryItem) {
                doPerf(_self.getPerfMgr(), function () { return "AppInsightsCore:track"; }, function () {
                    if (telemetryItem === null) {
                        _notifyInvalidEvent(telemetryItem);
                        // throw error
                        throwError("Invalid telemetry item");
                    }
                    // do basic validation before sending it through the pipeline
                    _validateTelemetryItem(telemetryItem);
                    _base.track(telemetryItem);
                }, function () { return ({ item: telemetryItem }); }, !(telemetryItem.sync));
            };
            function _validateTelemetryItem(telemetryItem) {
                if (isNullOrUndefined(telemetryItem.name)) {
                    _notifyInvalidEvent(telemetryItem);
                    throwError("telemetry name required");
                }
            }
            function _notifyInvalidEvent(telemetryItem) {
                var manager = _self.getNotifyMgr();
                if (manager) {
                    manager.eventsDiscarded([telemetryItem], 2 /* InvalidEvent */);
                }
            }
        });
        return _this;
    }
// Removed Stub for AppInsightsCore.prototype.initialize.
// Removed Stub for AppInsightsCore.prototype.track.
    return AppInsightsCore;
}(BaseCore));
export { AppInsightsCore };//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/AppInsightsCore.js.map