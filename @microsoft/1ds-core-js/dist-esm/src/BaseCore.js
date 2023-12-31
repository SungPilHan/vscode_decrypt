/*
 * 1DS JS SDK Core, 3.2.2
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
import { __extendsFn as __extends } from "@microsoft/applicationinsights-shims";
/**
 * BaseCore.ts
 * Base Core is a subset of 1DS Web SDK Core. The purpose of Base Core is to generate a smaller bundle size while providing essential features of Core. Features that are not included in Base Core are:
 * 1. Internal logging
 * 2. Sending notifications on telemetry sent/discarded
 * @author Abhilash Panwar (abpanwar) Hector Hernandez (hectorh)
 * @copyright Microsoft 2018
 */
import dynamicProto from "@microsoft/dynamicproto-js";
import { BaseCore as InternalCore, dumpObj, _throwInternal } from "@microsoft/applicationinsights-core-js";
import { FullVersionString, isDocumentObjectAvailable } from "./Utils";
var BaseCore = /** @class */ (function (_super) {
    __extends(BaseCore, _super);
    function BaseCore() {
        var _this = _super.call(this) || this;
        dynamicProto(BaseCore, _this, function (_self, _base) {
            _self.initialize = function (config, extensions, logger, notificationManager) {
                if (config && !config.endpointUrl) {
                    config.endpointUrl = "https://browser.events.data.microsoft.com/OneCollector/1.0/";
                }
                _self.getWParam = function () {
                    return isDocumentObjectAvailable ? 0 : -1;
                };
                try {
                    _base.initialize(config, extensions, logger, notificationManager);
                }
                catch (e) {
                    _throwInternal(_self.logger, 1 /* CRITICAL */, 514 /* FailedToInitializeSDK */, "Initialization Failed: " + dumpObj(e) + "\n - Note: Channels must be provided through config.channels only");
                }
            };
            _self.track = function (item) {
                var telemetryItem = item;
                if (telemetryItem) {
                    var ext = telemetryItem.ext = telemetryItem.ext || {};
                    ext.sdk = ext.sdk || {};
                    ext.sdk.ver = FullVersionString;
                }
                _base.track(telemetryItem);
            };
        });
        return _this;
    }
// Removed Stub for BaseCore.prototype.initialize.
// Removed Stub for BaseCore.prototype.track.
    return BaseCore;
}(InternalCore));
export default BaseCore;//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/1ds-core-js/dist-esm/src/BaseCore.js.map