/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


import { objForEachKey, deepFreeze } from "../JavaScriptSDK/HelperFuncs";
/**
 * Create an enum style object which has both the key => value and value => key mappings
 * @param values - The values to populate on the new object
 * @returns
 */
export function createEnumStyle(values) {
    var enumClass = {};
    objForEachKey(values, function (field, value) {
        enumClass[field] = value;
        enumClass[value] = field;
    });
    return deepFreeze(enumClass);
}
/**
 * Create a 2 index map that maps an enum's key as both the key and value, X["key"] => "key" and X[0] => "keyof 0".
 * @param values - The values to populate on the new object
 * @returns
 */
export function createEnumMap(values) {
    var mapClass = {};
    objForEachKey(values, function (field, value) {
        mapClass[field] = field;
        mapClass[value] = field;
    });
    return deepFreeze(mapClass);
}
/**
 * Create a 2 index map that maps an enum's key and value to the defined map value, X["key"] => mapValue and X[0] => mapValue.
 * Generic values
 * - E = the const enum type (typeof eRequestHeaders);
 * - V = Identifies the valid values for the keys, this should include both the enum numeric and string key of the type. The
 * resulting "Value" of each entry identifies the valid values withing the assignments.
 * @param values - The values to populate on the new object
 * @returns
 */
export function createValueMap(values) {
    var mapClass = {};
    objForEachKey(values, function (field, value) {
        mapClass[field] = value[1];
        mapClass[value[0]] = value[1];
    });
    return deepFreeze(mapClass);
}//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK.Enums/EnumHelperFuncs.js.map