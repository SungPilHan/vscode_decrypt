/*
 * 1DS JS SDK Core, 3.2.2
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
import { __extendsFn as __extends } from "@microsoft/applicationinsights-shims";
/**
 * AppInsightsCore.ts
 * @author Abhilash Panwar (abpanwar) Hector Hernandez (hectorh)
 * @copyright Microsoft 2018
 */
import { AppInsightsCore as InternalCore, doPerf, arrForEach, dumpObj, DiagnosticLogger } from "@microsoft/applicationinsights-core-js";
import { isLatency, FullVersionString, getTime } from "./Utils";
import dynamicProto from "@microsoft/dynamicproto-js";
var PropVersion = "version";
var properties = "properties";
var AppInsightsCore = /** @class */ (function (_super) {
    __extends(AppInsightsCore, _super);
    function AppInsightsCore() {
        var _this = _super.call(this) || this;
        _this.pluginVersionStringArr = [];
        _this.pluginVersionString = "";
        dynamicProto(AppInsightsCore, _this, function (_self, _base) {
            if (!_self.logger || !_self.logger.queue) {
                // The AI Base can inject a No-Op logger so if not defined or the No-Op, change to use a default logger so initialization errors
                // are not dropped on the floor if one is not already defined
                _self.logger = new DiagnosticLogger({ loggingLevelConsole: 1 /* CRITICAL */ });
            }
            _self.initialize = function (config, extensions, logger, notificationManager) {
                doPerf(_self, function () { return "AppInsightsCore.initialize"; }, function () {
                    // Add default collector url
                    if (config) {
                        if (!config.endpointUrl) {
                            config.endpointUrl = "https://browser.events.data.microsoft.com/OneCollector/1.0/";
                        }
                        var propertyStorageOverride = config.propertyStorageOverride;
                        // Validate property storage override
                        if (propertyStorageOverride && (!propertyStorageOverride.getProperty || !propertyStorageOverride.setProperty)) {
                            throw new Error("Invalid property storage override passed.");
                        }
                        if (config.channels) {
                            arrForEach(config.channels, function (channels) {
                                if (channels) {
                                    arrForEach(channels, function (channel) {
                                        if (channel.identifier && channel.version) {
                                            var ver = channel.identifier + "=" + channel.version;
                                            _self.pluginVersionStringArr.push(ver);
                                        }
                                    });
                                }
                            });
                        }
                    }
                    _self.getWParam = function () {
                        return typeof document !== "undefined" ? 0 : -1;
                    };
                    if (extensions) {
                        arrForEach(extensions, function (ext) {
                            if (ext && ext.identifier && ext.version) {
                                var ver = ext.identifier + "=" + ext.version;
                                _self.pluginVersionStringArr.push(ver);
                            }
                        });
                    }
                    _self.pluginVersionString = _self.pluginVersionStringArr.join(";");
                    try {
                        _base.initialize(config, extensions, logger, notificationManager);
                        _self.pollInternalLogs("InternalLog");
                    }
                    catch (e) {
                        var logger_1 = _self.logger;
                        var message = dumpObj(e);
                        if (message.indexOf("channels") !== -1) {
                            // Add some additional context to the underlying reported error
                            message += "\n - Channels must be provided through config.channels only!";
                        }
                        logger_1.throwInternal(1 /* CRITICAL */, 514 /* FailedToInitializeSDK */, "SDK Initialization Failed - no telemetry will be sent: " + message);
                    }
                }, function () { return ({ config: config, extensions: extensions, logger: logger, notificationManager: notificationManager }); });
            };
            _self.track = function (item) {
                doPerf(_self, function () { return "AppInsightsCore.track"; }, function () {
                    var telemetryItem = item;
                    if (telemetryItem) {
                        telemetryItem.timings = telemetryItem.timings || {};
                        telemetryItem.timings.trackStart = getTime();
                        if (!isLatency(telemetryItem.latency)) {
                            telemetryItem.latency = 1 /* Normal */;
                        }
                        var itemExt = telemetryItem.ext = telemetryItem.ext || {};
                        itemExt.sdk = itemExt.sdk || {};
                        itemExt.sdk.ver = FullVersionString;
                        var baseData = telemetryItem.baseData = telemetryItem.baseData || {};
                        if (!baseData[properties]) {
                            baseData[properties] = {};
                        }
                        var itemProperties = baseData[properties];
                        if (!itemProperties[PropVersion]) {
                            itemProperties[PropVersion] = "";
                        }
                        if (_self.pluginVersionString !== "") {
                            itemProperties[PropVersion] = _self.pluginVersionString;
                        }
                    }
                    _base.track(telemetryItem);
                }, function () { return ({ item: item }); }, !(item.sync));
            };
        });
        return _this;
    }
// Removed Stub for AppInsightsCore.prototype.initialize.
// Removed Stub for AppInsightsCore.prototype.track.
    return AppInsightsCore;
}(InternalCore));
export default AppInsightsCore;//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/1ds-core-js/dist-esm/src/AppInsightsCore.js.map