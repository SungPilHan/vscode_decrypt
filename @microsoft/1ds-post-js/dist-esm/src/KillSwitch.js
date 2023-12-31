/*
 * 1DS JS SDK POST plugin, 3.2.2
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
/**
* KillSwitch.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2018
*/
import dynamicProto from "@microsoft/dynamicproto-js";
import { arrForEach, strTrim, dateNow } from "@microsoft/1ds-core-js";
var SecToMsMultiplier = 1000;
/**
* Class to stop certain tenants sending events.
*/
var KillSwitch = /** @class */ (function () {
    function KillSwitch() {
        var _killedTokenDictionary = {};
        function _normalizeTenants(values) {
            var result = [];
            if (values) {
                arrForEach(values, function (value) {
                    result.push(strTrim(value));
                });
            }
            return result;
        }
        dynamicProto(KillSwitch, this, function (_self) {
            _self.setKillSwitchTenants = function (killTokens, killDuration) {
                if (killTokens && killDuration) {
                    try {
                        var killedTokens = _normalizeTenants(killTokens.split(","));
                        if (killDuration === "this-request-only") {
                            return killedTokens;
                        }
                        var durationMs = parseInt(killDuration, 10) * SecToMsMultiplier;
                        for (var i = 0; i < killedTokens.length; ++i) {
                            _killedTokenDictionary[killedTokens[i]] = dateNow() + durationMs;
                        }
                    }
                    catch (ex) {
                        return [];
                    }
                }
                return [];
            };
            _self.isTenantKilled = function (tenantToken) {
                var killDictionary = _killedTokenDictionary;
                var name = strTrim(tenantToken);
                if (killDictionary[name] !== undefined && killDictionary[name] > dateNow()) {
                    return true;
                }
                delete killDictionary[name];
                return false;
            };
        });
    }
// Removed Stub for KillSwitch.prototype.setKillSwitchTenants.
// Removed Stub for KillSwitch.prototype.isTenantKilled.
    return KillSwitch;
}());
export default KillSwitch;//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/1ds-post-js/dist-esm/src/KillSwitch.js.map