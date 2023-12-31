/*!
 * Microsoft Application Insights JavaScript SDK - Shim functions, 2.0.1
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.Microsoft = global.Microsoft || {}, global.Microsoft.ApplicationInsights = global.Microsoft.ApplicationInsights || {}, global.Microsoft.ApplicationInsights.Shims = {})));
})(this, (function (exports) { 'use strict';

    var strShimFunction = "function";
    var strShimObject = "object";
    var strShimUndefined = "undefined";
    var strShimPrototype = "prototype";
    var strShimHasOwnProperty = "hasOwnProperty";
    var strDefault = "default";
    var ObjClass = Object;
    var ObjProto = ObjClass[strShimPrototype];
    var ObjAssign = ObjClass["assign"];
    var ObjCreate = ObjClass["create"];
    var ObjDefineProperty = ObjClass["defineProperty"];
    var ObjHasOwnProperty = ObjProto[strShimHasOwnProperty];

    var _cachedGlobal = null;
    /**
     * Returns the current global scope object, for a normal web page this will be the current
     * window, for a Web Worker this will be current worker global scope via "self". The internal
     * implementation returns the first available instance object in the following order
     * - globalThis (New standard)
     * - self (Will return the current window instance for supported browsers)
     * - window (fallback for older browser implementations)
     * - global (NodeJS standard)
     * - <null> (When all else fails)
     * While the return type is a Window for the normal case, not all environments will support all
     * of the properties or functions.
     */
    function getGlobal(useCached) {
        if (useCached === void 0) { useCached = true; }
        if (!_cachedGlobal || !useCached) {
            if (typeof globalThis !== strShimUndefined && globalThis) {
                _cachedGlobal = globalThis;
            }
            if (typeof self !== strShimUndefined && self) {
                _cachedGlobal = self;
            }
            if (typeof window !== strShimUndefined && window) {
                _cachedGlobal = window;
            }
            if (typeof global !== strShimUndefined && global) {
                _cachedGlobal = global;
            }
        }
        return _cachedGlobal;
    }
    function throwTypeError(message) {
        throw new TypeError(message);
    }
    /**
     * Creates an object that has the specified prototype, and that optionally contains specified properties. This helper exists to avoid adding a polyfil
     * for older browsers that do not define Object.create eg. ES3 only, IE8 just in case any page checks for presence/absence of the prototype implementation.
     * Note: For consistency this will not use the Object.create implementation if it exists as this would cause a testing requirement to test with and without the implementations
     * @param obj Object to use as a prototype. May be null
     */
    function objCreateFn(obj) {
        var func = ObjCreate;
        // Use build in Object.create
        if (func) {
            // Use Object create method if it exists
            return func(obj);
        }
        if (obj == null) {
            return {};
        }
        var type = typeof obj;
        if (type !== strShimObject && type !== strShimFunction) {
            throwTypeError("Object prototype may only be an Object:" + obj);
        }
        function tmpFunc() { }
        tmpFunc[strShimPrototype] = obj;
        return new tmpFunc();
    }

    // Most of these functions have been directly shamelessly "lifted" from the https://github.com/@microsoft/tslib and
    // modified to be ES3 compatible and applying several minification and tree-shaking techniques so that Application Insights
    // can successfully use TypeScript "importHelpers" which imports tslib during compilation but it will use these at runtime
    // Which is also why all of the functions have not been included as Application Insights currently doesn't use or require
    // them.
    var SymbolObj = (getGlobal() || {})["Symbol"];
    var ReflectObj = (getGlobal() || {})["Reflect"];
    var __hasReflect = !!ReflectObj;
    var strDecorate = "decorate";
    var strMetadata = "metadata";
    var strGetOwnPropertySymbols = "getOwnPropertySymbols";
    var strIterator = "iterator";
    var __objAssignFnImpl = function (t) {
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
    var __assignFn = ObjAssign || __objAssignFnImpl;
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
    function __extendsFn(d, b) {
        if (typeof b !== strShimFunction && b !== null) {
            throwTypeError("Class extends value " + String(b) + " is not a constructor or null");
        }
        extendStaticsFn(d, b);
        function __() { this.constructor = d; }
        // tslint:disable-next-line: ban-comma-operator
        d[strShimPrototype] = b === null ? objCreateFn(b) : (__[strShimPrototype] = b[strShimPrototype], new __());
    }
    function __restFn(s, e) {
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
    function __decorateFn(decorators, target, key, desc) {
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
    function __paramFn(paramIndex, decorator) {
        return function (target, key) {
            decorator(target, key, paramIndex);
        };
    }
    function __metadataFn(metadataKey, metadataValue) {
        if (__hasReflect && ReflectObj[strMetadata] === strShimFunction) {
            return ReflectObj[strMetadata](metadataKey, metadataValue);
        }
    }
    function __exportStarFn(m, o) {
        for (var p in m) {
            if (p !== strDefault && !ObjHasOwnProperty.call(o, p)) {
                __createBindingFn(o, m, p);
            }
        }
    }
    function __createBindingFn(o, m, k, k2) {
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
    function __valuesFn(o) {
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
    function __readFn(o, n) {
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
    function __spreadArraysFn() {
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
    function __spreadArrayFn(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
            to[j] = from[i];
        }
        return to;
    }
    function __makeTemplateObjectFn(cooked, raw) {
        if (ObjDefineProperty) {
            ObjDefineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    function __importStarFn(mod) {
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
    function __importDefaultFn(mod) {
        return (mod && mod.__esModule) ? mod : { strDefault: mod };
    }

    function __exposeGlobalTsLib() {
        var globalObj = getGlobal() || {};
        // tslint:disable: only-arrow-functions
        (function (root, assignFn, extendsFn, createBindingFn) {
            // Assign the globally scoped versions of the functions -- used when consuming individual ts files
            // If check is to support NativeScript where these are marked as readonly
            if (!root.__assign) {
                root.__assign = ObjAssign || assignFn;
            }
            if (!root.__extends) {
                root.__extends = extendsFn;
            }
            if (!root.__createBinding) {
                root.__createBinding = createBindingFn;
            }
        })(globalObj, __assignFn, __extendsFn, __createBindingFn);
        // Assign local variables that will be used for embedded scenarios, if check is to support NativeScript where these are marked as readonly
        if (!__assign) {
            __assign = globalObj.__assign;
        }
        if (!__extends) {
            __extends = globalObj.__extends;
        }
        if (!__createBinding) {
            __createBinding = globalObj.__createBinding;
        }
    }

    exports.ObjAssign = ObjAssign;
    exports.ObjClass = ObjClass;
    exports.ObjCreate = ObjCreate;
    exports.ObjDefineProperty = ObjDefineProperty;
    exports.ObjHasOwnProperty = ObjHasOwnProperty;
    exports.ObjProto = ObjProto;
    exports.__assignFn = __assignFn;
    exports.__createBindingFn = __createBindingFn;
    exports.__decorateFn = __decorateFn;
    exports.__exportStarFn = __exportStarFn;
    exports.__exposeGlobalTsLib = __exposeGlobalTsLib;
    exports.__extendsFn = __extendsFn;
    exports.__importDefaultFn = __importDefaultFn;
    exports.__importStarFn = __importStarFn;
    exports.__makeTemplateObjectFn = __makeTemplateObjectFn;
    exports.__metadataFn = __metadataFn;
    exports.__paramFn = __paramFn;
    exports.__readFn = __readFn;
    exports.__restFn = __restFn;
    exports.__spreadArrayFn = __spreadArrayFn;
    exports.__spreadArraysFn = __spreadArraysFn;
    exports.__valuesFn = __valuesFn;
    exports.getGlobal = getGlobal;
    exports.objCreateFn = objCreateFn;
    exports.strDefault = strDefault;
    exports.strShimFunction = strShimFunction;
    exports.strShimHasOwnProperty = strShimHasOwnProperty;
    exports.strShimObject = strShimObject;
    exports.strShimPrototype = strShimPrototype;
    exports.strShimUndefined = strShimUndefined;
    exports.throwTypeError = throwTypeError;

    (function(obj, prop, descriptor) { /* ai_es3_polyfil defineProperty */ var func = Object["defineProperty"]; if (func) { try { return func(obj, prop, descriptor); } catch(e) { /* IE8 defines defineProperty, but will throw */ } } if (descriptor && typeof descriptor.value !== undefined) { obj[prop] = descriptor.value; } return obj; })(exports, '__esModule', { value: true });

}));
