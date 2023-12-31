// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ObjAssign, ObjClass, ObjCreate, ObjDefineProperty, ObjHasOwnProperty, ObjProto, strDefault, strShimFunction, strShimHasOwnProperty, strShimPrototype } from "./Constants";
import { getGlobal, objCreateFn, throwTypeError } from "./Helpers";
// Most of these functions have been directly shamelessly "lifted" from the https://github.com/@microsoft/tslib and
// modified to be ES3 compatible and applying several minification and tree-shaking techniques so that Application Insights
// can successfully use TypeScript "importHelpers" which imports tslib during compilation but it will use these at runtime
// Which is also why all of the functions have not been included as Application Insights currently doesn't use or require
// them.
export var SymbolObj = (getGlobal() || {})["Symbol"];
export var ReflectObj = (getGlobal() || {})["Reflect"];
export var __hasSymbol = !!SymbolObj;
export var __hasReflect = !!ReflectObj;
var strDecorate = "decorate";
var strMetadata = "metadata";
var strGetOwnPropertySymbols = "getOwnPropertySymbols";
var strIterator = "iterator";
export var __objAssignFnImpl = function (t) {
    // tslint:disable-next-line: ban-comma-operator
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) {
            if (ObjProto[strShimHasOwnProperty].call(s, p)) {
                t[p] = s[p];
            }
        }
    }
    return t;
};
export var __assignFn = ObjAssign || __objAssignFnImpl;
// tslint:disable-next-line: only-arrow-functions
var extendStaticsFn = function (d, b) {
    extendStaticsFn = ObjClass["setPrototypeOf"] ||
        // tslint:disable-next-line: only-arrow-functions
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        // tslint:disable-next-line: only-arrow-functions
        function (d, b) {
            for (var p in b) {
                if (b[strShimHasOwnProperty](p)) {
                    d[p] = b[p];
                }
            }
        };
    return extendStaticsFn(d, b);
};
export function __extendsFn(d, b) {
    if (typeof b !== strShimFunction && b !== null) {
        throwTypeError("Class extends value " + String(b) + " is not a constructor or null");
    }
    extendStaticsFn(d, b);
    function __() { this.constructor = d; }
    // tslint:disable-next-line: ban-comma-operator
    d[strShimPrototype] = b === null ? objCreateFn(b) : (__[strShimPrototype] = b[strShimPrototype], new __());
}
export function __restFn(s, e) {
    var t = {};
    for (var k in s) {
        if (ObjHasOwnProperty.call(s, k) && e.indexOf(k) < 0) {
            t[k] = s[k];
        }
    }
    if (s != null && typeof ObjClass[strGetOwnPropertySymbols] === strShimFunction) {
        for (var i = 0, p = ObjClass[strGetOwnPropertySymbols](s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && ObjProto["propertyIsEnumerable"].call(s, p[i])) {
                t[p[i]] = s[p[i]];
            }
        }
    }
    return t;
}
export function __decorateFn(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = ObjClass["getOwnPropertyDescriptor"](target, key) : desc, d;
    if (__hasReflect && typeof ReflectObj[strDecorate] === strShimFunction) {
        r = ReflectObj[strDecorate](decorators, target, key, desc);
    }
    else {
        for (var i = decorators.length - 1; i >= 0; i--) {
            // eslint-disable-next-line no-cond-assign
            if (d = decorators[i]) {
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            }
        }
    }
    // tslint:disable-next-line:ban-comma-operator
    return c > 3 && r && ObjDefineProperty(target, key, r), r;
}
export function __paramFn(paramIndex, decorator) {
    return function (target, key) {
        decorator(target, key, paramIndex);
    };
}
export function __metadataFn(metadataKey, metadataValue) {
    if (__hasReflect && ReflectObj[strMetadata] === strShimFunction) {
        return ReflectObj[strMetadata](metadataKey, metadataValue);
    }
}
export function __exportStarFn(m, o) {
    for (var p in m) {
        if (p !== strDefault && !ObjHasOwnProperty.call(o, p)) {
            __createBindingFn(o, m, p);
        }
    }
}
export function __createBindingFn(o, m, k, k2) {
    if (k2 === undefined) {
        k2 = k;
    }
    if (ObjCreate) {
        ObjDefineProperty(o, k2, {
            enumerable: true,
            get: function () {
                return m[k];
            }
        });
    }
    else {
        o[k2] = m[k];
    }
}
export function __valuesFn(o) {
    var s = typeof SymbolObj === strShimFunction && SymbolObj[strIterator], m = s && o[s], i = 0;
    if (m) {
        return m.call(o);
    }
    if (o && typeof o.length === "number") {
        return {
            next: function () {
                if (o && i >= o.length) {
                    o = void 0;
                }
                return { value: o && o[i++], done: !o };
            }
        };
    }
    throwTypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
export function __readFn(o, n) {
    var m = typeof SymbolObj === strShimFunction && o[SymbolObj[strIterator]];
    if (!m) {
        return o;
    }
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
            ar.push(r.value);
        }
    }
    catch (error) {
        e = {
            error: error
        };
    }
    finally {
        try {
            // tslint:disable-next-line:no-conditional-assignment
            if (r && !r.done && (m = i["return"])) {
                m.call(i);
            }
        }
        finally {
            if (e) {
                // eslint-disable-next-line no-unsafe-finally
                throw e.error;
            }
        }
    }
    return ar;
}
/** @deprecated */
export function __spreadArraysFn() {
    var theArgs = arguments;
    // Calculate new total size
    for (var s = 0, i = 0, il = theArgs.length; i < il; i++) {
        s += theArgs[i].length;
    }
    // Create new full array
    for (var r = Array(s), k = 0, i = 0; i < il; i++) {
        for (var a = theArgs[i], j = 0, jl = a.length; j < jl; j++, k++) {
            r[k] = a[j];
        }
    }
    return r;
}
export function __spreadArrayFn(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
        to[j] = from[i];
    }
    return to;
}
export function __makeTemplateObjectFn(cooked, raw) {
    if (ObjDefineProperty) {
        ObjDefineProperty(cooked, "raw", { value: raw });
    }
    else {
        cooked.raw = raw;
    }
    return cooked;
}
export function __importStarFn(mod) {
    if (mod && mod.__esModule) {
        return mod;
    }
    var result = {};
    if (mod != null) {
        for (var k in mod) {
            if (k !== strDefault && Object.prototype.hasOwnProperty.call(mod, k)) {
                __createBindingFn(result, mod, k);
            }
        }
    }
    // Set default module
    if (ObjCreate) {
        ObjDefineProperty(result, strDefault, { enumerable: true, value: mod });
    }
    else {
        result[strDefault] = mod;
    }
    return result;
}
export function __importDefaultFn(mod) {
    return (mod && mod.__esModule) ? mod : { strDefault: mod };
}//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-shims/dist-esm/TsLibShims.js.map