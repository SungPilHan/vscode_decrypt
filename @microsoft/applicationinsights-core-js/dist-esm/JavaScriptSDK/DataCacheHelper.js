/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


import { ObjDefineProperty } from "@microsoft/applicationinsights-shims";
import { normalizeJsName } from "./HelperFuncs";
import { newId } from "./RandomHelper";
var _objDefineProperty = ObjDefineProperty;
var version = "2.8.3";
var instanceName = "." + newId(6);
var _dataUid = 0;
function _createAccessor(target, prop, value) {
    if (_objDefineProperty) {
        try {
            _objDefineProperty(target, prop, {
                value: value,
                enumerable: false,
                configurable: true
            });
            return true;
        }
        catch (e) {
            // IE8 Defines a defineProperty on Object but it's only supported for DOM elements so it will throw
            // We will just ignore this here.
        }
    }
    return false;
}
// Accepts only:
//  - Node
//    - Node.ELEMENT_NODE
//    - Node.DOCUMENT_NODE
//  - Object
//    - Any
function _canAcceptData(target) {
    return target.nodeType === 1 || target.nodeType === 9 || !(+target.nodeType);
}
function _getCache(data, target) {
    var theCache = target[data.id];
    if (!theCache) {
        theCache = {};
        try {
            if (_canAcceptData(target)) {
                if (!_createAccessor(target, data.id, theCache)) {
                    // Environment doesn't support accessor, so just use direct assignment
                    target[data.id] = theCache;
                }
            }
        }
        catch (e) {
            // Not all environments allow extending all objects, so just ignore the cache in those cases
        }
    }
    return theCache;
}
export function createUniqueNamespace(name, includeVersion) {
    if (includeVersion === void 0) { includeVersion = false; }
    return normalizeJsName(name + (_dataUid++) + (includeVersion ? "." + version : "") + instanceName);
}
export function createElmNodeData(name) {
    var data = {
        id: createUniqueNamespace("_aiData-" + (name || "") + "." + version),
        accept: function (target) {
            return _canAcceptData(target);
        },
        get: function (target, name, defValue, addDefault) {
            var theCache = target[data.id];
            if (!theCache) {
                if (addDefault) {
                    // Side effect is adds the cache
                    theCache = _getCache(data, target);
                    theCache[normalizeJsName(name)] = defValue;
                }
                return defValue;
            }
            return theCache[normalizeJsName(name)];
        },
        kill: function (target, name) {
            if (target && target[name]) {
                try {
                    delete target[name];
                }
                catch (e) {
                    // Just cleaning up, so if this fails -- ignore
                }
            }
        }
    };
    return data;
}//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/DataCacheHelper.js.map