/*
 * 1DS JS SDK POST plugin, 3.2.2
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
/**
* ClockSkewManager.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2018
*/
import dynamicProto from "@microsoft/dynamicproto-js";
/**
* Class to manage clock skew correction.
*/
var ClockSkewManager = /** @class */ (function () {
    function ClockSkewManager() {
        var _allowRequestSending = true;
        var _shouldAddClockSkewHeaders = true;
        var _isFirstRequest = true;
        var _clockSkewHeaderValue = "use-collector-delta";
        var _clockSkewSet = false;
        dynamicProto(ClockSkewManager, this, function (_self) {
            /**
             * Determine if requests can be sent.
             * @returns True if requests can be sent, false otherwise.
             */
            _self.allowRequestSending = function () {
                return _allowRequestSending;
            };
            /**
             * Tells the ClockSkewManager that it should assume that the first request has now been sent,
             * If this method had not yet been called AND the clock Skew had not been set this will set
             * allowRequestSending to false until setClockSet() is called.
             */
            _self.firstRequestSent = function () {
                if (_isFirstRequest) {
                    _isFirstRequest = false;
                    if (!_clockSkewSet) {
                        // Block sending until we get the first clock Skew
                        _allowRequestSending = false;
                    }
                }
            };
            /**
             * Determine if clock skew headers should be added to the request.
             * @returns True if clock skew headers should be added, false otherwise.
             */
            _self.shouldAddClockSkewHeaders = function () {
                return _shouldAddClockSkewHeaders;
            };
            /**
             * Gets the clock skew header value.
             * @returns The clock skew header value.
             */
            _self.getClockSkewHeaderValue = function () {
                return _clockSkewHeaderValue;
            };
            /**
             * Sets the clock skew header value. Once clock skew is set this method
             * is no-op.
             * @param timeDeltaInMillis - Time delta to be saved as the clock skew header value.
             */
            _self.setClockSkew = function (timeDeltaInMillis) {
                if (!_clockSkewSet) {
                    if (timeDeltaInMillis) {
                        _clockSkewHeaderValue = timeDeltaInMillis;
                        _shouldAddClockSkewHeaders = true;
                        _clockSkewSet = true;
                    }
                    else {
                        _shouldAddClockSkewHeaders = false;
                    }
                    // Unblock sending
                    _allowRequestSending = true;
                }
            };
        });
    }
// Removed Stub for ClockSkewManager.prototype.allowRequestSending.
// Removed Stub for ClockSkewManager.prototype.firstRequestSent.
// Removed Stub for ClockSkewManager.prototype.shouldAddClockSkewHeaders.
// Removed Stub for ClockSkewManager.prototype.getClockSkewHeaderValue.
// Removed Stub for ClockSkewManager.prototype.setClockSkew.
    return ClockSkewManager;
}());
export default ClockSkewManager;//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/1ds-post-js/dist-esm/src/ClockSkewManager.js.map