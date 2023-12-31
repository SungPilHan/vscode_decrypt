/*!
 * 1DS JS SDK POST plugin, 3.2.2
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
(function (exports) {
    'use strict';

    var strShimFunction = "function";
    var strShimObject = "object";
    var strShimUndefined = "undefined";
    var strShimPrototype = "prototype";
    var strShimHasOwnProperty = "hasOwnProperty";
    var ObjClass = Object;
    var ObjProto = ObjClass[strShimPrototype];
    var ObjAssign = ObjClass["assign"];
    var ObjCreate = ObjClass["create"];
    var ObjDefineProperty = ObjClass["defineProperty"];
    var ObjHasOwnProperty = ObjProto[strShimHasOwnProperty];

    var _cachedGlobal = null;
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
    function objCreateFn(obj) {
        var func = ObjCreate;
        if (func) {
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

    (getGlobal() || {})["Symbol"];
    (getGlobal() || {})["Reflect"];
    var extendStaticsFn = function (d, b) {
        extendStaticsFn = ObjClass["setPrototypeOf"] ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
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
        d[strShimPrototype] = b === null ? objCreateFn(b) : (__[strShimPrototype] = b[strShimPrototype], new __());
    }

    /*!
     * Microsoft Dynamic Proto Utility, 1.1.6
     * Copyright (c) Microsoft and contributors. All rights reserved.
     */
    var Constructor = 'constructor';
    var Prototype = 'prototype';
    var strFunction = 'function';
    var DynInstFuncTable = '_dynInstFuncs';
    var DynProxyTag = '_isDynProxy';
    var DynClassName = '_dynClass';
    var DynClassNamePrefix = '_dynCls$';
    var DynInstChkTag = '_dynInstChk';
    var DynAllowInstChkTag = DynInstChkTag;
    var DynProtoDefaultOptions = '_dfOpts';
    var UnknownValue = '_unknown_';
    var str__Proto$1 = "__proto__";
    var DynProtoBaseProto = "_dyn" + str__Proto$1;
    var DynProtoCurrent = "_dynInstProto";
    var strUseBaseInst = 'useBaseInst';
    var strSetInstFuncs = 'setInstFuncs';
    var Obj = Object;
    var _objGetPrototypeOf$1 = Obj["getPrototypeOf"];
    var _objGetOwnProps = Obj["getOwnPropertyNames"];
    var _dynamicNames = 0;
    function _hasOwnProperty(obj, prop) {
        return obj && Obj[Prototype].hasOwnProperty.call(obj, prop);
    }
    function _isObjectOrArrayPrototype(target) {
        return target && (target === Obj[Prototype] || target === Array[Prototype]);
    }
    function _isObjectArrayOrFunctionPrototype(target) {
        return _isObjectOrArrayPrototype(target) || target === Function[Prototype];
    }
    function _getObjProto$1(target) {
        var newProto;
        if (target) {
            if (_objGetPrototypeOf$1) {
                return _objGetPrototypeOf$1(target);
            }
            var curProto = target[str__Proto$1] || target[Prototype] || (target[Constructor] ? target[Constructor][Prototype] : null);
            newProto = target[DynProtoBaseProto] || curProto;
            if (!_hasOwnProperty(target, DynProtoBaseProto)) {
                delete target[DynProtoCurrent];
                newProto = target[DynProtoBaseProto] = target[DynProtoCurrent] || target[DynProtoBaseProto];
                target[DynProtoCurrent] = curProto;
            }
        }
        return newProto;
    }
    function _forEachProp(target, func) {
        var props = [];
        if (_objGetOwnProps) {
            props = _objGetOwnProps(target);
        }
        else {
            for (var name_1 in target) {
                if (typeof name_1 === "string" && _hasOwnProperty(target, name_1)) {
                    props.push(name_1);
                }
            }
        }
        if (props && props.length > 0) {
            for (var lp = 0; lp < props.length; lp++) {
                func(props[lp]);
            }
        }
    }
    function _isDynamicCandidate(target, funcName, skipOwn) {
        return (funcName !== Constructor && typeof target[funcName] === strFunction && (skipOwn || _hasOwnProperty(target, funcName)));
    }
    function _throwTypeError(message) {
        throw new TypeError("DynamicProto: " + message);
    }
    function _getInstanceFuncs(thisTarget) {
        var instFuncs = {};
        _forEachProp(thisTarget, function (name) {
            if (!instFuncs[name] && _isDynamicCandidate(thisTarget, name, false)) {
                instFuncs[name] = thisTarget[name];
            }
        });
        return instFuncs;
    }
    function _hasVisited(values, value) {
        for (var lp = values.length - 1; lp >= 0; lp--) {
            if (values[lp] === value) {
                return true;
            }
        }
        return false;
    }
    function _getBaseFuncs(classProto, thisTarget, instFuncs, useBaseInst) {
        function _instFuncProxy(target, funcHost, funcName) {
            var theFunc = funcHost[funcName];
            if (theFunc[DynProxyTag] && useBaseInst) {
                var instFuncTable = target[DynInstFuncTable] || {};
                if (instFuncTable[DynAllowInstChkTag] !== false) {
                    theFunc = (instFuncTable[funcHost[DynClassName]] || {})[funcName] || theFunc;
                }
            }
            return function () {
                return theFunc.apply(target, arguments);
            };
        }
        var baseFuncs = {};
        _forEachProp(instFuncs, function (name) {
            baseFuncs[name] = _instFuncProxy(thisTarget, instFuncs, name);
        });
        var baseProto = _getObjProto$1(classProto);
        var visited = [];
        while (baseProto && !_isObjectArrayOrFunctionPrototype(baseProto) && !_hasVisited(visited, baseProto)) {
            _forEachProp(baseProto, function (name) {
                if (!baseFuncs[name] && _isDynamicCandidate(baseProto, name, !_objGetPrototypeOf$1)) {
                    baseFuncs[name] = _instFuncProxy(thisTarget, baseProto, name);
                }
            });
            visited.push(baseProto);
            baseProto = _getObjProto$1(baseProto);
        }
        return baseFuncs;
    }
    function _getInstFunc(target, funcName, proto, currentDynProtoProxy) {
        var instFunc = null;
        if (target && _hasOwnProperty(proto, DynClassName)) {
            var instFuncTable = target[DynInstFuncTable] || {};
            instFunc = (instFuncTable[proto[DynClassName]] || {})[funcName];
            if (!instFunc) {
                _throwTypeError("Missing [" + funcName + "] " + strFunction);
            }
            if (!instFunc[DynInstChkTag] && instFuncTable[DynAllowInstChkTag] !== false) {
                var canAddInst = !_hasOwnProperty(target, funcName);
                var objProto = _getObjProto$1(target);
                var visited = [];
                while (canAddInst && objProto && !_isObjectArrayOrFunctionPrototype(objProto) && !_hasVisited(visited, objProto)) {
                    var protoFunc = objProto[funcName];
                    if (protoFunc) {
                        canAddInst = (protoFunc === currentDynProtoProxy);
                        break;
                    }
                    visited.push(objProto);
                    objProto = _getObjProto$1(objProto);
                }
                try {
                    if (canAddInst) {
                        target[funcName] = instFunc;
                    }
                    instFunc[DynInstChkTag] = 1;
                }
                catch (e) {
                    instFuncTable[DynAllowInstChkTag] = false;
                }
            }
        }
        return instFunc;
    }
    function _getProtoFunc(funcName, proto, currentDynProtoProxy) {
        var protoFunc = proto[funcName];
        if (protoFunc === currentDynProtoProxy) {
            protoFunc = _getObjProto$1(proto)[funcName];
        }
        if (typeof protoFunc !== strFunction) {
            _throwTypeError("[" + funcName + "] is not a " + strFunction);
        }
        return protoFunc;
    }
    function _populatePrototype(proto, className, target, baseInstFuncs, setInstanceFunc) {
        function _createDynamicPrototype(proto, funcName) {
            var dynProtoProxy = function () {
                var instFunc = _getInstFunc(this, funcName, proto, dynProtoProxy) || _getProtoFunc(funcName, proto, dynProtoProxy);
                return instFunc.apply(this, arguments);
            };
            dynProtoProxy[DynProxyTag] = 1;
            return dynProtoProxy;
        }
        if (!_isObjectOrArrayPrototype(proto)) {
            var instFuncTable = target[DynInstFuncTable] = target[DynInstFuncTable] || {};
            var instFuncs_1 = instFuncTable[className] = (instFuncTable[className] || {});
            if (instFuncTable[DynAllowInstChkTag] !== false) {
                instFuncTable[DynAllowInstChkTag] = !!setInstanceFunc;
            }
            _forEachProp(target, function (name) {
                if (_isDynamicCandidate(target, name, false) && target[name] !== baseInstFuncs[name]) {
                    instFuncs_1[name] = target[name];
                    delete target[name];
                    if (!_hasOwnProperty(proto, name) || (proto[name] && !proto[name][DynProxyTag])) {
                        proto[name] = _createDynamicPrototype(proto, name);
                    }
                }
            });
        }
    }
    function _checkPrototype(classProto, thisTarget) {
        if (_objGetPrototypeOf$1) {
            var visited = [];
            var thisProto = _getObjProto$1(thisTarget);
            while (thisProto && !_isObjectArrayOrFunctionPrototype(thisProto) && !_hasVisited(visited, thisProto)) {
                if (thisProto === classProto) {
                    return true;
                }
                visited.push(thisProto);
                thisProto = _getObjProto$1(thisProto);
            }
            return false;
        }
        return true;
    }
    function _getObjName(target, unknownValue) {
        if (_hasOwnProperty(target, Prototype)) {
            return target.name || unknownValue || UnknownValue;
        }
        return (((target || {})[Constructor]) || {}).name || unknownValue || UnknownValue;
    }
    function dynamicProto(theClass, target, delegateFunc, options) {
        if (!_hasOwnProperty(theClass, Prototype)) {
            _throwTypeError("theClass is an invalid class definition.");
        }
        var classProto = theClass[Prototype];
        if (!_checkPrototype(classProto, target)) {
            _throwTypeError("[" + _getObjName(theClass) + "] is not in class hierarchy of [" + _getObjName(target) + "]");
        }
        var className = null;
        if (_hasOwnProperty(classProto, DynClassName)) {
            className = classProto[DynClassName];
        }
        else {
            className = DynClassNamePrefix + _getObjName(theClass, "_") + "$" + _dynamicNames;
            _dynamicNames++;
            classProto[DynClassName] = className;
        }
        var perfOptions = dynamicProto[DynProtoDefaultOptions];
        var useBaseInst = !!perfOptions[strUseBaseInst];
        if (useBaseInst && options && options[strUseBaseInst] !== undefined) {
            useBaseInst = !!options[strUseBaseInst];
        }
        var instFuncs = _getInstanceFuncs(target);
        var baseFuncs = _getBaseFuncs(classProto, target, instFuncs, useBaseInst);
        delegateFunc(target, baseFuncs);
        var setInstanceFunc = !!_objGetPrototypeOf$1 && !!perfOptions[strSetInstFuncs];
        if (setInstanceFunc && options) {
            setInstanceFunc = !!options[strSetInstFuncs];
        }
        _populatePrototype(classProto, className, target, instFuncs, setInstanceFunc !== false);
    }
    var perfDefaults = {
        setInstFuncs: true,
        useBaseInst: true
    };
    dynamicProto[DynProtoDefaultOptions] = perfDefaults;

    var strEmpty = "";
    var strSetNextPlugin = "setNextPlugin";
    var strIsInitialized = "isInitialized";
    var strTeardown = "teardown";
    var strCore = "core";
    var strUpdate = "update";
    var strDisabled = "disabled";
    var strDoTeardown = "_doTeardown";

    var cStrStartsWith = "startsWith";
    var strIndexOf = "indexOf";
    var cStrTrim = "trim";
    var strToString = "toString";
    var str__Proto = "__proto__";
    var strConstructor = "constructor";
    var _objDefineProperty$1 = ObjDefineProperty;
    var _objFreeze = ObjClass.freeze;
    var _objKeys = ObjClass.keys;
    var StringProto = String[strShimPrototype];
    var _strTrim = StringProto[cStrTrim];
    var _strStartsWith = StringProto[cStrStartsWith];
    var _isArray = Array.isArray;
    var _objToString = ObjProto[strToString];
    var _fnToString = ObjHasOwnProperty[strToString];
    var _objFunctionString = _fnToString.call(ObjClass);
    var rCamelCase = /-([a-z])/g;
    var rNormalizeInvalid = /([^\w\d_$])/g;
    var rLeadingNumeric = /^(\d+[\w\d_$])/;
    var _objGetPrototypeOf = Object["getPrototypeOf"];
    function _getObjProto(target) {
        if (target) {
            if (_objGetPrototypeOf) {
                return _objGetPrototypeOf(target);
            }
            var newProto = target[str__Proto] || target[strShimPrototype] || target[strConstructor];
            if (newProto) {
                return newProto;
            }
        }
        return null;
    }
    function isUndefined(value) {
        return value === undefined || typeof value === strShimUndefined;
    }
    function isNullOrUndefined(value) {
        return (value === null || isUndefined(value));
    }
    function hasOwnProperty(obj, prop) {
        return !!(obj && ObjHasOwnProperty.call(obj, prop));
    }
    function isObject(value) {
        return !!(value && typeof value === strShimObject);
    }
    function isFunction(value) {
        return !!(value && typeof value === strShimFunction);
    }
    function normalizeJsName(name) {
        var value = name;
        if (value && isString(value)) {
            value = value.replace(rCamelCase, function (_all, letter) {
                return letter.toUpperCase();
            });
            value = value.replace(rNormalizeInvalid, "_");
            value = value.replace(rLeadingNumeric, function (_all, match) {
                return "_" + match;
            });
        }
        return value;
    }
    function objForEachKey(target, callbackfn) {
        if (target) {
            for (var prop in target) {
                if (ObjHasOwnProperty.call(target, prop)) {
                    callbackfn.call(target, prop, target[prop]);
                }
            }
        }
    }
    function strStartsWith(value, checkValue) {
        var result = false;
        if (value && checkValue && !(result = value === checkValue)) {
            result = _strStartsWith ? value[cStrStartsWith](checkValue) : _strStartsWithPoly(value, checkValue);
        }
        return result;
    }
    function _strStartsWithPoly(value, checkValue) {
        var result = false;
        var chkLen = checkValue ? checkValue.length : 0;
        if (value && chkLen && value.length >= chkLen && !(result = value === checkValue)) {
            for (var lp = 0; lp < chkLen; lp++) {
                if (value[lp] !== checkValue[lp]) {
                    return false;
                }
            }
            result = true;
        }
        return result;
    }
    function strContains(value, search) {
        if (value && search) {
            return value.indexOf(search) !== -1;
        }
        return false;
    }
    var isArray = _isArray || _isArrayPoly;
    function _isArrayPoly(obj) {
        return !!(obj && _objToString.call(obj) === "[object Array]");
    }
    function isString(value) {
        return typeof value === "string";
    }
    function isNumber(value) {
        return typeof value === "number";
    }
    function isBoolean(value) {
        return typeof value === "boolean";
    }
    function isPlainObject(value) {
        var result = false;
        if (value && typeof value === "object") {
            var proto = _objGetPrototypeOf ? _objGetPrototypeOf(value) : _getObjProto(value);
            if (!proto) {
                result = true;
            }
            else {
                if (proto[strConstructor] && ObjHasOwnProperty.call(proto, strConstructor)) {
                    proto = proto[strConstructor];
                }
                result = typeof proto === strShimFunction && _fnToString.call(proto) === _objFunctionString;
            }
        }
        return result;
    }
    function arrForEach(arr, callbackfn, thisArg) {
        var len = arr.length;
        try {
            for (var idx = 0; idx < len; idx++) {
                if (idx in arr) {
                    if (callbackfn.call(thisArg || arr, arr[idx], idx, arr) === -1) {
                        break;
                    }
                }
            }
        }
        catch (e) {
        }
    }
    function arrIndexOf(arr, searchElement, fromIndex) {
        if (arr) {
            if (arr[strIndexOf]) {
                return arr[strIndexOf](searchElement, fromIndex);
            }
            var len = arr.length;
            var from = fromIndex || 0;
            try {
                for (var lp = Math.max(from >= 0 ? from : len - Math.abs(from), 0); lp < len; lp++) {
                    if (lp in arr && arr[lp] === searchElement) {
                        return lp;
                    }
                }
            }
            catch (e) {
            }
        }
        return -1;
    }
    function strTrim(str) {
        if (str) {
            str = (_strTrim && str[cStrTrim]) ? str[cStrTrim]() : (str.replace ? str.replace(/^\s+|\s+$/g, "") : str);
        }
        return str;
    }
    var _objKeysHasDontEnumBug = !({ toString: null }).propertyIsEnumerable("toString");
    var _objKeysDontEnums = [
        "toString",
        "toLocaleString",
        "valueOf",
        "hasOwnProperty",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "constructor"
    ];
    function objKeys(obj) {
        var objType = typeof obj;
        if (objType !== strShimFunction && (objType !== strShimObject || obj === null)) {
            throwTypeError("objKeys called on non-object");
        }
        if (!_objKeysHasDontEnumBug && _objKeys) {
            return _objKeys(obj);
        }
        var result = [];
        for (var prop in obj) {
            if (obj && ObjHasOwnProperty.call(obj, prop)) {
                result.push(prop);
            }
        }
        if (_objKeysHasDontEnumBug) {
            var dontEnumsLength = _objKeysDontEnums.length;
            for (var lp = 0; lp < dontEnumsLength; lp++) {
                if (obj && ObjHasOwnProperty.call(obj, _objKeysDontEnums[lp])) {
                    result.push(_objKeysDontEnums[lp]);
                }
            }
        }
        return result;
    }
    function objDefineAccessors(target, prop, getProp, setProp) {
        if (_objDefineProperty$1) {
            try {
                var descriptor = {
                    enumerable: true,
                    configurable: true
                };
                if (getProp) {
                    descriptor.get = getProp;
                }
                if (setProp) {
                    descriptor.set = setProp;
                }
                _objDefineProperty$1(target, prop, descriptor);
                return true;
            }
            catch (e) {
            }
        }
        return false;
    }
    function _doNothing(value) {
        return value;
    }
    function deepFreeze(obj) {
        if (_objFreeze) {
            objForEachKey(obj, function (name, value) {
                if (isArray(value) || isObject(value)) {
                    _objFreeze(value);
                }
            });
        }
        return objFreeze(obj);
    }
    var objFreeze = _objFreeze || _doNothing;
    function dateNow() {
        var dt = Date;
        return dt.now ? dt.now() : new dt().getTime();
    }
    function setValue(target, field, value, valChk, srcChk) {
        var theValue = value;
        if (target) {
            theValue = target[field];
            if (theValue !== value && (!srcChk || srcChk(theValue)) && (!valChk || valChk(value))) {
                theValue = value;
                target[field] = theValue;
            }
        }
        return theValue;
    }
    function _createProxyFunction(source, funcName) {
        var srcFunc = null;
        var src = null;
        if (isFunction(source)) {
            srcFunc = source;
        }
        else {
            src = source;
        }
        return function () {
            var originalArguments = arguments;
            if (srcFunc) {
                src = srcFunc();
            }
            if (src) {
                return src[funcName].apply(src, originalArguments);
            }
        };
    }
    function proxyFunctionAs(target, name, source, theFunc, overwriteTarget) {
        if (target && name && source) {
            if (overwriteTarget !== false || isUndefined(target[name])) {
                target[name] = _createProxyFunction(source, theFunc);
            }
        }
    }
    function optimizeObject(theObject) {
        if (theObject && ObjAssign) {
            theObject = ObjClass(ObjAssign({}, theObject));
        }
        return theObject;
    }
    function objExtend(obj1, obj2, obj3, obj4, obj5, obj6) {
        var theArgs = arguments;
        var extended = theArgs[0] || {};
        var argLen = theArgs.length;
        var deep = false;
        var idx = 1;
        if (argLen > 0 && isBoolean(extended)) {
            deep = extended;
            extended = theArgs[idx] || {};
            idx++;
        }
        if (!isObject(extended)) {
            extended = {};
        }
        for (; idx < argLen; idx++) {
            var arg = theArgs[idx];
            var isArgArray = isArray(arg);
            var isArgObj = isObject(arg);
            for (var prop in arg) {
                var propOk = (isArgArray && (prop in arg)) || (isArgObj && (ObjHasOwnProperty.call(arg, prop)));
                if (!propOk) {
                    continue;
                }
                var newValue = arg[prop];
                var isNewArray = void 0;
                if (deep && newValue && ((isNewArray = isArray(newValue)) || isPlainObject(newValue))) {
                    var clone = extended[prop];
                    if (isNewArray) {
                        if (!isArray(clone)) {
                            clone = [];
                        }
                    }
                    else if (!isPlainObject(clone)) {
                        clone = {};
                    }
                    newValue = objExtend(deep, clone, newValue);
                }
                if (newValue !== undefined) {
                    extended[prop] = newValue;
                }
            }
        }
        return extended;
    }

    function createEnumStyle(values) {
        var enumClass = {};
        objForEachKey(values, function (field, value) {
            enumClass[field] = value;
            enumClass[value] = field;
        });
        return deepFreeze(enumClass);
    }

    var EventsDiscardedReason = createEnumStyle({
        Unknown: 0 ,
        NonRetryableStatus: 1 ,
        InvalidEvent: 2 ,
        SizeLimitExceeded: 3 ,
        KillSwitch: 4 ,
        QueueFull: 5
    });

    var strWindow = "window";
    var strDocument = "document";
    var strNavigator = "navigator";
    var strLocation = "location";
    var strConsole = "console";
    var strPerformance = "performance";
    var strJSON = "JSON";
    var strCrypto = "crypto";
    var strMsCrypto = "msCrypto";
    var strReactNative = "ReactNative";
    var strMsie = "msie";
    var strTrident = "trident/";
    var strXMLHttpRequest = "XMLHttpRequest";
    var _isTrident = null;
    var _navUserAgentCheck = null;
    var _enableMocks = false;
    var _useXDomainRequest = null;
    var _beaconsSupported = null;
    function _hasProperty(theClass, property) {
        var supported = false;
        if (theClass) {
            try {
                supported = property in theClass;
                if (!supported) {
                    var proto = theClass[strShimPrototype];
                    if (proto) {
                        supported = property in proto;
                    }
                }
            }
            catch (e) {
            }
            if (!supported) {
                try {
                    var tmp = new theClass();
                    supported = !isUndefined(tmp[property]);
                }
                catch (e) {
                }
            }
        }
        return supported;
    }
    function getGlobalInst(name) {
        var gbl = getGlobal();
        if (gbl && gbl[name]) {
            return gbl[name];
        }
        if (name === strWindow && hasWindow()) {
            return window;
        }
        return null;
    }
    function hasWindow() {
        return Boolean(typeof window === strShimObject && window);
    }
    function getWindow() {
        if (hasWindow()) {
            return window;
        }
        return getGlobalInst(strWindow);
    }
    function hasDocument() {
        return Boolean(typeof document === strShimObject && document);
    }
    function getDocument() {
        if (hasDocument()) {
            return document;
        }
        return getGlobalInst(strDocument);
    }
    function hasNavigator() {
        return Boolean(typeof navigator === strShimObject && navigator);
    }
    function getNavigator() {
        if (hasNavigator()) {
            return navigator;
        }
        return getGlobalInst(strNavigator);
    }
    function getLocation(checkForMock) {
        if (checkForMock && _enableMocks) {
            var mockLocation = getGlobalInst("__mockLocation");
            if (mockLocation) {
                return mockLocation;
            }
        }
        if (typeof location === strShimObject && location) {
            return location;
        }
        return getGlobalInst(strLocation);
    }
    function getConsole() {
        if (typeof console !== strShimUndefined) {
            return console;
        }
        return getGlobalInst(strConsole);
    }
    function getPerformance() {
        return getGlobalInst(strPerformance);
    }
    function hasJSON() {
        return Boolean((typeof JSON === strShimObject && JSON) || getGlobalInst(strJSON) !== null);
    }
    function getJSON() {
        if (hasJSON()) {
            return JSON || getGlobalInst(strJSON);
        }
        return null;
    }
    function getCrypto() {
        return getGlobalInst(strCrypto);
    }
    function getMsCrypto() {
        return getGlobalInst(strMsCrypto);
    }
    function isReactNative() {
        var nav = getNavigator();
        if (nav && nav.product) {
            return nav.product === strReactNative;
        }
        return false;
    }
    function isIE() {
        var nav = getNavigator();
        if (nav && (nav.userAgent !== _navUserAgentCheck || _isTrident === null)) {
            _navUserAgentCheck = nav.userAgent;
            var userAgent = (_navUserAgentCheck || strEmpty).toLowerCase();
            _isTrident = (strContains(userAgent, strMsie) || strContains(userAgent, strTrident));
        }
        return _isTrident;
    }
    function dumpObj(object) {
        var objectTypeDump = Object[strShimPrototype].toString.call(object);
        var propertyValueDump = strEmpty;
        if (objectTypeDump === "[object Error]") {
            propertyValueDump = "{ stack: '" + object.stack + "', message: '" + object.message + "', name: '" + object.name + "'";
        }
        else if (hasJSON()) {
            propertyValueDump = getJSON().stringify(object);
        }
        return objectTypeDump + propertyValueDump;
    }
    function isBeaconsSupported() {
        if (_beaconsSupported === null) {
            _beaconsSupported = hasNavigator() && Boolean(getNavigator().sendBeacon);
        }
        return _beaconsSupported;
    }
    function isFetchSupported(withKeepAlive) {
        var isSupported = false;
        try {
            isSupported = !!getGlobalInst("fetch");
            var request = getGlobalInst("Request");
            if (isSupported && withKeepAlive && request) {
                isSupported = _hasProperty(request, "keepalive");
            }
        }
        catch (e) {
        }
        return isSupported;
    }
    function useXDomainRequest() {
        if (_useXDomainRequest === null) {
            _useXDomainRequest = (typeof XDomainRequest !== strShimUndefined);
            if (_useXDomainRequest && isXhrSupported()) {
                _useXDomainRequest = _useXDomainRequest && !_hasProperty(getGlobalInst(strXMLHttpRequest), "withCredentials");
            }
        }
        return _useXDomainRequest;
    }
    function isXhrSupported() {
        var isSupported = false;
        try {
            var xmlHttpRequest = getGlobalInst(strXMLHttpRequest);
            isSupported = !!xmlHttpRequest;
        }
        catch (e) {
        }
        return isSupported;
    }

    var _aiNamespace = null;
    function _getExtensionNamespace() {
        var target = getGlobalInst("Microsoft");
        if (target) {
            _aiNamespace = target["ApplicationInsights"];
        }
        return _aiNamespace;
    }
    function getDebugExt(config) {
        var ns = _aiNamespace;
        if (!ns && config.disableDbgExt !== true) {
            ns = _aiNamespace || _getExtensionNamespace();
        }
        return ns ? ns["ChromeDbgExt"] : null;
    }

    var AiNonUserActionablePrefix = "AI (Internal): ";
    var AiUserActionablePrefix = "AI: ";
    var AIInternalMessagePrefix = "AITR_";
    var strErrorToConsole = "errorToConsole";
    var strWarnToConsole = "warnToConsole";
    function _sanitizeDiagnosticText(text) {
        if (text) {
            return "\"" + text.replace(/\"/g, strEmpty) + "\"";
        }
        return strEmpty;
    }
    function _logToConsole(func, message) {
        var theConsole = getConsole();
        if (!!theConsole) {
            var logFunc = "log";
            if (theConsole[func]) {
                logFunc = func;
            }
            if (isFunction(theConsole[logFunc])) {
                theConsole[logFunc](message);
            }
        }
    }
    var _InternalLogMessage = /** @class */ (function () {
        function _InternalLogMessage(msgId, msg, isUserAct, properties) {
            if (isUserAct === void 0) { isUserAct = false; }
            var _self = this;
            _self.messageId = msgId;
            _self.message =
                (isUserAct ? AiUserActionablePrefix : AiNonUserActionablePrefix) +
                    msgId;
            var strProps = strEmpty;
            if (hasJSON()) {
                strProps = getJSON().stringify(properties);
            }
            var diagnosticText = (msg ? " message:" + _sanitizeDiagnosticText(msg) : strEmpty) +
                (properties ? " props:" + _sanitizeDiagnosticText(strProps) : strEmpty);
            _self.message += diagnosticText;
        }
        _InternalLogMessage.dataType = "MessageData";
        return _InternalLogMessage;
    }());
    function safeGetLogger(core, config) {
        return (core || {}).logger || new DiagnosticLogger(config);
    }
    var DiagnosticLogger = /** @class */ (function () {
        function DiagnosticLogger(config) {
            this.identifier = "DiagnosticLogger";
            this.queue = [];
            var _messageCount = 0;
            var _messageLogged = {};
            dynamicProto(DiagnosticLogger, this, function (_self) {
                if (isNullOrUndefined(config)) {
                    config = {};
                }
                _self.consoleLoggingLevel = function () { return _getConfigValue("loggingLevelConsole", 0); };
                _self.telemetryLoggingLevel = function () { return _getConfigValue("loggingLevelTelemetry", 1); };
                _self.maxInternalMessageLimit = function () { return _getConfigValue("maxMessageLimit", 25); };
                _self.enableDebugExceptions = function () { return _getConfigValue("enableDebugExceptions", false); };
                _self.throwInternal = function (severity, msgId, msg, properties, isUserAct) {
                    if (isUserAct === void 0) { isUserAct = false; }
                    var message = new _InternalLogMessage(msgId, msg, isUserAct, properties);
                    if (_self.enableDebugExceptions()) {
                        throw dumpObj(message);
                    }
                    else {
                        var logFunc = severity === 1  ? strErrorToConsole : strWarnToConsole;
                        if (!isUndefined(message.message)) {
                            var logLevel = _self.consoleLoggingLevel();
                            if (isUserAct) {
                                var messageKey = +message.messageId;
                                if (!_messageLogged[messageKey] && logLevel >= severity) {
                                    _self[logFunc](message.message);
                                    _messageLogged[messageKey] = true;
                                }
                            }
                            else {
                                if (logLevel >= severity) {
                                    _self[logFunc](message.message);
                                }
                            }
                            _self.logInternalMessage(severity, message);
                        }
                        else {
                            _debugExtMsg("throw" + (severity === 1  ? "Critical" : "Warning"), message);
                        }
                    }
                };
                _self.warnToConsole = function (message) {
                    _logToConsole("warn", message);
                    _debugExtMsg("warning", message);
                };
                _self.errorToConsole = function (message) {
                    _logToConsole("error", message);
                    _debugExtMsg("error", message);
                };
                _self.resetInternalMessageCount = function () {
                    _messageCount = 0;
                    _messageLogged = {};
                };
                _self.logInternalMessage = function (severity, message) {
                    if (_areInternalMessagesThrottled()) {
                        return;
                    }
                    var logMessage = true;
                    var messageKey = AIInternalMessagePrefix + message.messageId;
                    if (_messageLogged[messageKey]) {
                        logMessage = false;
                    }
                    else {
                        _messageLogged[messageKey] = true;
                    }
                    if (logMessage) {
                        if (severity <= _self.telemetryLoggingLevel()) {
                            _self.queue.push(message);
                            _messageCount++;
                            _debugExtMsg((severity === 1  ? "error" : "warn"), message);
                        }
                        if (_messageCount === _self.maxInternalMessageLimit()) {
                            var throttleLimitMessage = "Internal events throttle limit per PageView reached for this app.";
                            var throttleMessage = new _InternalLogMessage(23 , throttleLimitMessage, false);
                            _self.queue.push(throttleMessage);
                            if (severity === 1 ) {
                                _self.errorToConsole(throttleLimitMessage);
                            }
                            else {
                                _self.warnToConsole(throttleLimitMessage);
                            }
                        }
                    }
                };
                function _getConfigValue(name, defValue) {
                    var value = config[name];
                    if (!isNullOrUndefined(value)) {
                        return value;
                    }
                    return defValue;
                }
                function _areInternalMessagesThrottled() {
                    return _messageCount >= _self.maxInternalMessageLimit();
                }
                function _debugExtMsg(name, data) {
                    var dbgExt = getDebugExt(config);
                    if (dbgExt && dbgExt.diagLog) {
                        dbgExt.diagLog(name, data);
                    }
                }
            });
        }
        return DiagnosticLogger;
    }());
    function _throwInternal(logger, severity, msgId, msg, properties, isUserAct) {
        if (isUserAct === void 0) { isUserAct = false; }
        (logger || new DiagnosticLogger()).throwInternal(severity, msgId, msg, properties, isUserAct);
    }

    var strExecutionContextKey = "ctx";
    var PerfEvent = /** @class */ (function () {
        function PerfEvent(name, payloadDetails, isAsync) {
            var _self = this;
            var accessorDefined = false;
            _self.start = dateNow();
            _self.name = name;
            _self.isAsync = isAsync;
            _self.isChildEvt = function () { return false; };
            if (isFunction(payloadDetails)) {
                var theDetails_1;
                accessorDefined = objDefineAccessors(_self, "payload", function () {
                    if (!theDetails_1 && isFunction(payloadDetails)) {
                        theDetails_1 = payloadDetails();
                        payloadDetails = null;
                    }
                    return theDetails_1;
                });
            }
            _self.getCtx = function (key) {
                if (key) {
                    if (key === PerfEvent.ParentContextKey || key === PerfEvent.ChildrenContextKey) {
                        return _self[key];
                    }
                    return (_self[strExecutionContextKey] || {})[key];
                }
                return null;
            };
            _self.setCtx = function (key, value) {
                if (key) {
                    if (key === PerfEvent.ParentContextKey) {
                        if (!_self[key]) {
                            _self.isChildEvt = function () { return true; };
                        }
                        _self[key] = value;
                    }
                    else if (key === PerfEvent.ChildrenContextKey) {
                        _self[key] = value;
                    }
                    else {
                        var ctx = _self[strExecutionContextKey] = _self[strExecutionContextKey] || {};
                        ctx[key] = value;
                    }
                }
            };
            _self.complete = function () {
                var childTime = 0;
                var childEvts = _self.getCtx(PerfEvent.ChildrenContextKey);
                if (isArray(childEvts)) {
                    for (var lp = 0; lp < childEvts.length; lp++) {
                        var childEvt = childEvts[lp];
                        if (childEvt) {
                            childTime += childEvt.time;
                        }
                    }
                }
                _self.time = dateNow() - _self.start;
                _self.exTime = _self.time - childTime;
                _self.complete = function () { };
                if (!accessorDefined && isFunction(payloadDetails)) {
                    _self.payload = payloadDetails();
                }
            };
        }
        PerfEvent.ParentContextKey = "parent";
        PerfEvent.ChildrenContextKey = "childEvts";
        return PerfEvent;
    }());
    var doPerfActiveKey = "CoreUtils.doPerf";
    function doPerf(mgrSource, getSource, func, details, isAsync) {
        if (mgrSource) {
            var perfMgr = mgrSource;
            if (isFunction(perfMgr["getPerfMgr"])) {
                perfMgr = perfMgr["getPerfMgr"]();
            }
            if (perfMgr) {
                var perfEvt = void 0;
                var currentActive = perfMgr.getCtx(doPerfActiveKey);
                try {
                    perfEvt = perfMgr.create(getSource(), details, isAsync);
                    if (perfEvt) {
                        if (currentActive && perfEvt.setCtx) {
                            perfEvt.setCtx(PerfEvent.ParentContextKey, currentActive);
                            if (currentActive.getCtx && currentActive.setCtx) {
                                var children = currentActive.getCtx(PerfEvent.ChildrenContextKey);
                                if (!children) {
                                    children = [];
                                    currentActive.setCtx(PerfEvent.ChildrenContextKey, children);
                                }
                                children.push(perfEvt);
                            }
                        }
                        perfMgr.setCtx(doPerfActiveKey, perfEvt);
                        return func(perfEvt);
                    }
                }
                catch (ex) {
                    if (perfEvt && perfEvt.setCtx) {
                        perfEvt.setCtx("exception", ex);
                    }
                }
                finally {
                    if (perfEvt) {
                        perfMgr.fire(perfEvt);
                    }
                    perfMgr.setCtx(doPerfActiveKey, currentActive);
                }
            }
        }
        return func();
    }

    var UInt32Mask = 0x100000000;
    var MaxUInt32 = 0xffffffff;
    var _mwcSeeded = false;
    var _mwcW = 123456789;
    var _mwcZ = 987654321;
    function _mwcSeed(seedValue) {
        if (seedValue < 0) {
            seedValue >>>= 0;
        }
        _mwcW = (123456789 + seedValue) & MaxUInt32;
        _mwcZ = (987654321 - seedValue) & MaxUInt32;
        _mwcSeeded = true;
    }
    function _autoSeedMwc() {
        try {
            var now = dateNow() & 0x7fffffff;
            _mwcSeed(((Math.random() * UInt32Mask) ^ now) + now);
        }
        catch (e) {
        }
    }
    function random32(signed) {
        var value = 0;
        var c = getCrypto() || getMsCrypto();
        if (c && c.getRandomValues) {
            value = c.getRandomValues(new Uint32Array(1))[0] & MaxUInt32;
        }
        if (value === 0 && isIE()) {
            if (!_mwcSeeded) {
                _autoSeedMwc();
            }
            value = mwcRandom32() & MaxUInt32;
        }
        if (value === 0) {
            value = Math.floor((UInt32Mask * Math.random()) | 0);
        }
        if (!signed) {
            value >>>= 0;
        }
        return value;
    }
    function mwcRandom32(signed) {
        _mwcZ = (36969 * (_mwcZ & 0xFFFF) + (_mwcZ >> 16)) & MaxUInt32;
        _mwcW = (18000 * (_mwcW & 0xFFFF) + (_mwcW >> 16)) & MaxUInt32;
        var value = (((_mwcZ << 16) + (_mwcW & 0xFFFF)) >>> 0) & MaxUInt32 | 0;
        if (!signed) {
            value >>>= 0;
        }
        return value;
    }
    function newId(maxLength) {
        if (maxLength === void 0) { maxLength = 22; }
        var base64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var number = random32() >>> 0;
        var chars = 0;
        var result = strEmpty;
        while (result.length < maxLength) {
            chars++;
            result += base64chars.charAt(number & 0x3F);
            number >>>= 6;
            if (chars === 5) {
                number = (((random32() << 2) & 0xFFFFFFFF) | (number & 0x03)) >>> 0;
                chars = 0;
            }
        }
        return result;
    }

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
            }
        }
        return false;
    }
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
                        target[data.id] = theCache;
                    }
                }
            }
            catch (e) {
            }
        }
        return theCache;
    }
    function createUniqueNamespace(name, includeVersion) {
        if (includeVersion === void 0) { includeVersion = false; }
        return normalizeJsName(name + (_dataUid++) + (includeVersion ? "." + version : "") + instanceName);
    }
    function createElmNodeData(name) {
        var data = {
            id: createUniqueNamespace("_aiData-" + (name || "") + "." + version),
            accept: function (target) {
                return _canAcceptData(target);
            },
            get: function (target, name, defValue, addDefault) {
                var theCache = target[data.id];
                if (!theCache) {
                    if (addDefault) {
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
                    }
                }
            }
        };
        return data;
    }

    var pluginStateData = createElmNodeData("plugin");
    function _getPluginState(plugin) {
        return pluginStateData.get(plugin, "state", {}, true);
    }

    var strTelemetryPluginChain = "TelemetryPluginChain";
    var strHasRunFlags = "_hasRun";
    var strGetTelCtx = "_getTelCtx";
    var _chainId = 0;
    function _getNextProxyStart(proxy, core, startAt) {
        while (proxy) {
            if (proxy.getPlugin() === startAt) {
                return proxy;
            }
            proxy = proxy.getNext();
        }
        return createTelemetryProxyChain([startAt], core.config || {}, core);
    }
    function _createInternalContext(telemetryChain, config, core, startAt) {
        var _nextProxy = null;
        var _onComplete = [];
        if (startAt !== null) {
            _nextProxy = startAt ? _getNextProxyStart(telemetryChain, core, startAt) : telemetryChain;
        }
        var context = {
            _next: _moveNext,
            ctx: {
                core: function () {
                    return core;
                },
                diagLog: function () {
                    return safeGetLogger(core, config);
                },
                getCfg: function () {
                    return config;
                },
                getExtCfg: _getExtCfg,
                getConfig: _getConfig,
                hasNext: function () {
                    return !!_nextProxy;
                },
                getNext: function () {
                    return _nextProxy;
                },
                setNext: function (nextPlugin) {
                    _nextProxy = nextPlugin;
                },
                iterate: _iterateChain,
                onComplete: _addOnComplete
            }
        };
        function _addOnComplete(onComplete, that) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (onComplete) {
                _onComplete.push({
                    func: onComplete,
                    self: !isUndefined(that) ? that : context.ctx,
                    args: args
                });
            }
        }
        function _moveNext() {
            var nextProxy = _nextProxy;
            _nextProxy = nextProxy ? nextProxy.getNext() : null;
            if (!nextProxy) {
                var onComplete = _onComplete;
                if (onComplete && onComplete.length > 0) {
                    arrForEach(onComplete, function (completeDetails) {
                        try {
                            completeDetails.func.call(completeDetails.self, completeDetails.args);
                        }
                        catch (e) {
                            _throwInternal(core.logger, 2 , 73 , "Unexpected Exception during onComplete - " + dumpObj(e));
                        }
                    });
                    _onComplete = [];
                }
            }
            return nextProxy;
        }
        function _getExtCfg(identifier, defaultValue, mergeDefault) {
            if (defaultValue === void 0) { defaultValue = {}; }
            if (mergeDefault === void 0) { mergeDefault = 0 ; }
            var theConfig;
            if (config) {
                var extConfig = config.extensionConfig;
                if (extConfig && identifier) {
                    theConfig = extConfig[identifier];
                }
            }
            if (!theConfig) {
                theConfig = defaultValue;
            }
            else if (isObject(defaultValue)) {
                if (mergeDefault !== 0 ) {
                    var newConfig_1 = objExtend(true, defaultValue, theConfig);
                    if (config && mergeDefault === 2 ) {
                        objForEachKey(defaultValue, function (field) {
                            if (isNullOrUndefined(newConfig_1[field])) {
                                var cfgValue = config[field];
                                if (!isNullOrUndefined(cfgValue)) {
                                    newConfig_1[field] = cfgValue;
                                }
                            }
                        });
                    }
                    theConfig = newConfig_1;
                }
            }
            return theConfig;
        }
        function _getConfig(identifier, field, defaultValue) {
            if (defaultValue === void 0) { defaultValue = false; }
            var theValue;
            var extConfig = _getExtCfg(identifier, null);
            if (extConfig && !isNullOrUndefined(extConfig[field])) {
                theValue = extConfig[field];
            }
            else if (config && !isNullOrUndefined(config[field])) {
                theValue = config[field];
            }
            return !isNullOrUndefined(theValue) ? theValue : defaultValue;
        }
        function _iterateChain(cb) {
            var nextPlugin;
            while (!!(nextPlugin = context._next())) {
                var plugin = nextPlugin.getPlugin();
                if (plugin) {
                    cb(plugin);
                }
            }
        }
        return context;
    }
    function createProcessTelemetryContext(telemetryChain, config, core, startAt) {
        var internalContext = _createInternalContext(telemetryChain, config, core, startAt);
        var context = internalContext.ctx;
        function _processNext(env) {
            var nextPlugin = internalContext._next();
            nextPlugin && nextPlugin.processTelemetry(env, context);
            return !nextPlugin;
        }
        function _createNew(plugins, startAt) {
            if (plugins === void 0) { plugins = null; }
            if (isArray(plugins)) {
                plugins = createTelemetryProxyChain(plugins, config, core, startAt);
            }
            return createProcessTelemetryContext(plugins || context.getNext(), config, core, startAt);
        }
        context.processNext = _processNext;
        context.createNew = _createNew;
        return context;
    }
    function createProcessTelemetryUnloadContext(telemetryChain, core, startAt) {
        var config = core.config || {};
        var internalContext = _createInternalContext(telemetryChain, config, core, startAt);
        var context = internalContext.ctx;
        function _processNext(unloadState) {
            var nextPlugin = internalContext._next();
            nextPlugin && nextPlugin.unload(context, unloadState);
            return !nextPlugin;
        }
        function _createNew(plugins, startAt) {
            if (plugins === void 0) { plugins = null; }
            if (isArray(plugins)) {
                plugins = createTelemetryProxyChain(plugins, config, core, startAt);
            }
            return createProcessTelemetryUnloadContext(plugins || context.getNext(), core, startAt);
        }
        context.processNext = _processNext;
        context.createNew = _createNew;
        return context;
    }
    function createProcessTelemetryUpdateContext(telemetryChain, core, startAt) {
        var config = core.config || {};
        var internalContext = _createInternalContext(telemetryChain, config, core, startAt);
        var context = internalContext.ctx;
        function _processNext(updateState) {
            return context.iterate(function (plugin) {
                if (isFunction(plugin.update)) {
                    plugin.update(context, updateState);
                }
            });
        }
        function _createNew(plugins, startAt) {
            if (plugins === void 0) { plugins = null; }
            if (isArray(plugins)) {
                plugins = createTelemetryProxyChain(plugins, config, core, startAt);
            }
            return createProcessTelemetryUpdateContext(plugins || context.getNext(), core, startAt);
        }
        context.processNext = _processNext;
        context.createNew = _createNew;
        return context;
    }
    function createTelemetryProxyChain(plugins, config, core, startAt) {
        var firstProxy = null;
        var add = startAt ? false : true;
        if (isArray(plugins) && plugins.length > 0) {
            var lastProxy_1 = null;
            arrForEach(plugins, function (thePlugin) {
                if (!add && startAt === thePlugin) {
                    add = true;
                }
                if (add && thePlugin && isFunction(thePlugin.processTelemetry)) {
                    var newProxy = createTelemetryPluginProxy(thePlugin, config, core);
                    if (!firstProxy) {
                        firstProxy = newProxy;
                    }
                    if (lastProxy_1) {
                        lastProxy_1._setNext(newProxy);
                    }
                    lastProxy_1 = newProxy;
                }
            });
        }
        if (startAt && !firstProxy) {
            return createTelemetryProxyChain([startAt], config, core);
        }
        return firstProxy;
    }
    function createTelemetryPluginProxy(plugin, config, core) {
        var nextProxy = null;
        var hasProcessTelemetry = isFunction(plugin.processTelemetry);
        var hasSetNext = isFunction(plugin.setNextPlugin);
        var chainId;
        if (plugin) {
            chainId = plugin.identifier + "-" + plugin.priority + "-" + _chainId++;
        }
        else {
            chainId = "Unknown-0-" + _chainId++;
        }
        var proxyChain = {
            getPlugin: function () {
                return plugin;
            },
            getNext: function () {
                return nextProxy;
            },
            processTelemetry: _processTelemetry,
            unload: _unloadPlugin,
            update: _updatePlugin,
            _id: chainId,
            _setNext: function (nextPlugin) {
                nextProxy = nextPlugin;
            }
        };
        function _getTelCtx() {
            var itemCtx;
            if (plugin && isFunction(plugin[strGetTelCtx])) {
                itemCtx = plugin[strGetTelCtx]();
            }
            if (!itemCtx) {
                itemCtx = createProcessTelemetryContext(proxyChain, config, core);
            }
            return itemCtx;
        }
        function _processChain(itemCtx, processPluginFn, name, details, isAsync) {
            var hasRun = false;
            var identifier = plugin ? plugin.identifier : strTelemetryPluginChain;
            var hasRunContext = itemCtx[strHasRunFlags];
            if (!hasRunContext) {
                hasRunContext = itemCtx[strHasRunFlags] = {};
            }
            itemCtx.setNext(nextProxy);
            if (plugin) {
                doPerf(itemCtx[strCore](), function () { return identifier + ":" + name; }, function () {
                    hasRunContext[chainId] = true;
                    try {
                        var nextId = nextProxy ? nextProxy._id : strEmpty;
                        if (nextId) {
                            hasRunContext[nextId] = false;
                        }
                        hasRun = processPluginFn(itemCtx);
                    }
                    catch (error) {
                        var hasNextRun = nextProxy ? hasRunContext[nextProxy._id] : true;
                        if (hasNextRun) {
                            hasRun = true;
                        }
                        if (!nextProxy || !hasNextRun) {
                            _throwInternal(itemCtx.diagLog(), 1 , 73 , "Plugin [" + identifier + "] failed during " + name + " - " + dumpObj(error) + ", run flags: " + dumpObj(hasRunContext));
                        }
                    }
                }, details, isAsync);
            }
            return hasRun;
        }
        function _processTelemetry(env, itemCtx) {
            itemCtx = itemCtx || _getTelCtx();
            function _callProcessTelemetry(itemCtx) {
                if (!plugin || !hasProcessTelemetry) {
                    return false;
                }
                var pluginState = _getPluginState(plugin);
                if (pluginState.teardown || pluginState[strDisabled]) {
                    return false;
                }
                if (hasSetNext) {
                    plugin.setNextPlugin(nextProxy);
                }
                plugin.processTelemetry(env, itemCtx);
                return true;
            }
            if (!_processChain(itemCtx, _callProcessTelemetry, "processTelemetry", function () { return ({ item: env }); }, !(env.sync))) {
                itemCtx.processNext(env);
            }
        }
        function _unloadPlugin(unloadCtx, unloadState) {
            function _callTeardown() {
                var hasRun = false;
                if (plugin) {
                    var pluginState = _getPluginState(plugin);
                    var pluginCore = plugin[strCore] || pluginState.core;
                    if (plugin && (!pluginCore || pluginCore === unloadCtx[strCore]()) && !pluginState[strTeardown]) {
                        pluginState[strCore] = null;
                        pluginState[strTeardown] = true;
                        pluginState[strIsInitialized] = false;
                        if (plugin[strTeardown] && plugin[strTeardown](unloadCtx, unloadState) === true) {
                            hasRun = true;
                        }
                    }
                }
                return hasRun;
            }
            if (!_processChain(unloadCtx, _callTeardown, "unload", function () { }, unloadState.isAsync)) {
                unloadCtx.processNext(unloadState);
            }
        }
        function _updatePlugin(updateCtx, updateState) {
            function _callUpdate() {
                var hasRun = false;
                if (plugin) {
                    var pluginState = _getPluginState(plugin);
                    var pluginCore = plugin[strCore] || pluginState.core;
                    if (plugin && (!pluginCore || pluginCore === updateCtx[strCore]()) && !pluginState[strTeardown]) {
                        if (plugin[strUpdate] && plugin[strUpdate](updateCtx, updateState) === true) {
                            hasRun = true;
                        }
                    }
                }
                return hasRun;
            }
            if (!_processChain(updateCtx, _callUpdate, "update", function () { }, false)) {
                updateCtx.processNext(updateState);
            }
        }
        return objFreeze(proxyChain);
    }

    var strExtensionConfig = "extensionConfig";

    function createUnloadHandlerContainer() {
        var handlers = [];
        function _addHandler(handler) {
            if (handler) {
                handlers.push(handler);
            }
        }
        function _runHandlers(unloadCtx, unloadState) {
            arrForEach(handlers, function (handler) {
                try {
                    handler(unloadCtx, unloadState);
                }
                catch (e) {
                    _throwInternal(unloadCtx.diagLog(), 2 , 73 , "Unexpected error calling unload handler - " + dumpObj(e));
                }
            });
            handlers = [];
        }
        return {
            add: _addHandler,
            run: _runHandlers
        };
    }

    var strGetPlugin = "getPlugin";
    var BaseTelemetryPlugin = /** @class */ (function () {
        function BaseTelemetryPlugin() {
            var _self = this;
            var _isinitialized;
            var _rootCtx;
            var _nextPlugin;
            var _unloadHandlerContainer;
            var _hooks;
            _initDefaults();
            dynamicProto(BaseTelemetryPlugin, _self, function (_self) {
                _self.initialize = function (config, core, extensions, pluginChain) {
                    _setDefaults(config, core, pluginChain);
                    _isinitialized = true;
                };
                _self.teardown = function (unloadCtx, unloadState) {
                    var core = _self.core;
                    if (!core || (unloadCtx && core !== unloadCtx.core())) {
                        return;
                    }
                    var result;
                    var unloadDone = false;
                    var theUnloadCtx = unloadCtx || createProcessTelemetryUnloadContext(null, core, _nextPlugin && _nextPlugin[strGetPlugin] ? _nextPlugin[strGetPlugin]() : _nextPlugin);
                    var theUnloadState = unloadState || {
                        reason: 0 ,
                        isAsync: false
                    };
                    function _unloadCallback() {
                        if (!unloadDone) {
                            unloadDone = true;
                            _unloadHandlerContainer.run(theUnloadCtx, unloadState);
                            arrForEach(_hooks, function (fn) {
                                fn.rm();
                            });
                            _hooks = [];
                            if (result === true) {
                                theUnloadCtx.processNext(theUnloadState);
                            }
                            _initDefaults();
                        }
                    }
                    if (!_self[strDoTeardown] || _self[strDoTeardown](theUnloadCtx, theUnloadState, _unloadCallback) !== true) {
                        _unloadCallback();
                    }
                    else {
                        result = true;
                    }
                    return result;
                };
                _self.update = function (updateCtx, updateState) {
                    var core = _self.core;
                    if (!core || (updateCtx && core !== updateCtx.core())) {
                        return;
                    }
                    var result;
                    var updateDone = false;
                    var theUpdateCtx = updateCtx || createProcessTelemetryUpdateContext(null, core, _nextPlugin && _nextPlugin[strGetPlugin] ? _nextPlugin[strGetPlugin]() : _nextPlugin);
                    var theUpdateState = updateState || {
                        reason: 0
                    };
                    function _updateCallback() {
                        if (!updateDone) {
                            updateDone = true;
                            _setDefaults(theUpdateCtx.getCfg(), theUpdateCtx.core(), theUpdateCtx.getNext());
                        }
                    }
                    if (!_self._doUpdate || _self._doUpdate(theUpdateCtx, theUpdateState, _updateCallback) !== true) {
                        _updateCallback();
                    }
                    else {
                        result = true;
                    }
                    return result;
                };
                _self._addHook = function (hooks) {
                    if (hooks) {
                        if (isArray(hooks)) {
                            _hooks = _hooks.concat(hooks);
                        }
                        else {
                            _hooks.push(hooks);
                        }
                    }
                };
                proxyFunctionAs(_self, "_addUnloadCb", function () { return _unloadHandlerContainer; }, "add");
            });
            _self.diagLog = function (itemCtx) {
                return _getTelCtx(itemCtx).diagLog();
            };
            _self[strIsInitialized] = function () {
                return _isinitialized;
            };
            _self.setInitialized = function (isInitialized) {
                _isinitialized = isInitialized;
            };
            _self[strSetNextPlugin] = function (next) {
                _nextPlugin = next;
            };
            _self.processNext = function (env, itemCtx) {
                if (itemCtx) {
                    itemCtx.processNext(env);
                }
                else if (_nextPlugin && isFunction(_nextPlugin.processTelemetry)) {
                    _nextPlugin.processTelemetry(env, null);
                }
            };
            _self._getTelCtx = _getTelCtx;
            function _getTelCtx(currentCtx) {
                if (currentCtx === void 0) { currentCtx = null; }
                var itemCtx = currentCtx;
                if (!itemCtx) {
                    var rootCtx = _rootCtx || createProcessTelemetryContext(null, {}, _self.core);
                    if (_nextPlugin && _nextPlugin[strGetPlugin]) {
                        itemCtx = rootCtx.createNew(null, _nextPlugin[strGetPlugin]);
                    }
                    else {
                        itemCtx = rootCtx.createNew(null, _nextPlugin);
                    }
                }
                return itemCtx;
            }
            function _setDefaults(config, core, pluginChain) {
                if (config) {
                    setValue(config, strExtensionConfig, [], null, isNullOrUndefined);
                }
                if (!pluginChain && core) {
                    pluginChain = core.getProcessTelContext().getNext();
                }
                var nextPlugin = _nextPlugin;
                if (_nextPlugin && _nextPlugin[strGetPlugin]) {
                    nextPlugin = _nextPlugin[strGetPlugin]();
                }
                _self.core = core;
                _rootCtx = createProcessTelemetryContext(pluginChain, config, core, nextPlugin);
            }
            function _initDefaults() {
                _isinitialized = false;
                _self.core = null;
                _rootCtx = null;
                _nextPlugin = null;
                _hooks = [];
                _unloadHandlerContainer = createUnloadHandlerContainer();
            }
        }
        return BaseTelemetryPlugin;
    }());

    var strOnPrefix = "on";
    var strAttachEvent = "attachEvent";
    var strAddEventHelper = "addEventListener";
    var strDetachEvent = "detachEvent";
    var strRemoveEventListener = "removeEventListener";
    var strEvents = "events";
    var strVisibilityChangeEvt = "visibilitychange";
    var strPageHide = "pagehide";
    var strPageShow = "pageshow";
    var strUnload = "unload";
    var strBeforeUnload = "beforeunload";
    var strPageHideNamespace = createUniqueNamespace("aiEvtPageHide");
    var strPageShowNamespace = createUniqueNamespace("aiEvtPageShow");
    var rRemoveEmptyNs = /\.[\.]+/g;
    var rRemoveTrailingEmptyNs = /[\.]+$/;
    var _guid = 1;
    var elmNodeData = createElmNodeData("events");
    var eventNamespace = /^([^.]*)(?:\.(.+)|)/;
    function _normalizeNamespace(name) {
        if (name && name.replace) {
            return name.replace(/^\s*\.*|\.*\s*$/g, "");
        }
        return name;
    }
    function _getEvtNamespace(eventName, evtNamespace) {
        if (evtNamespace) {
            var theNamespace_1 = "";
            if (isArray(evtNamespace)) {
                theNamespace_1 = "";
                arrForEach(evtNamespace, function (name) {
                    name = _normalizeNamespace(name);
                    if (name) {
                        if (name[0] !== ".") {
                            name = "." + name;
                        }
                        theNamespace_1 += name;
                    }
                });
            }
            else {
                theNamespace_1 = _normalizeNamespace(evtNamespace);
            }
            if (theNamespace_1) {
                if (theNamespace_1[0] !== ".") {
                    theNamespace_1 = "." + theNamespace_1;
                }
                eventName = (eventName || "") + theNamespace_1;
            }
        }
        var parsedEvent = (eventNamespace.exec(eventName || "") || []);
        return {
            type: parsedEvent[1],
            ns: ((parsedEvent[2] || "").replace(rRemoveEmptyNs, ".").replace(rRemoveTrailingEmptyNs, "").split(".").sort()).join(".")
        };
    }
    function _getRegisteredEvents(target, evtName, addDefault) {
        if (addDefault === void 0) { addDefault = true; }
        var aiEvts = elmNodeData.get(target, strEvents, {}, addDefault);
        var registeredEvents = aiEvts[evtName];
        if (!registeredEvents) {
            registeredEvents = aiEvts[evtName] = [];
        }
        return registeredEvents;
    }
    function _doDetach(obj, evtName, handlerRef, useCapture) {
        if (obj && evtName && evtName.type) {
            if (obj[strRemoveEventListener]) {
                obj[strRemoveEventListener](evtName.type, handlerRef, useCapture);
            }
            else if (obj[strDetachEvent]) {
                obj[strDetachEvent](strOnPrefix + evtName.type, handlerRef);
            }
        }
    }
    function _doAttach(obj, evtName, handlerRef, useCapture) {
        var result = false;
        if (obj && evtName && evtName.type && handlerRef) {
            if (obj[strAddEventHelper]) {
                obj[strAddEventHelper](evtName.type, handlerRef, useCapture);
                result = true;
            }
            else if (obj[strAttachEvent]) {
                obj[strAttachEvent](strOnPrefix + evtName.type, handlerRef);
                result = true;
            }
        }
        return result;
    }
    function _doUnregister(target, events, evtName, unRegFn) {
        var idx = events.length;
        while (idx--) {
            var theEvent = events[idx];
            if (theEvent) {
                if (!evtName.ns || evtName.ns === theEvent.evtName.ns) {
                    if (!unRegFn || unRegFn(theEvent)) {
                        _doDetach(target, theEvent.evtName, theEvent.handler, theEvent.capture);
                        events.splice(idx, 1);
                    }
                }
            }
        }
    }
    function _unregisterEvents(target, evtName, unRegFn) {
        if (evtName.type) {
            _doUnregister(target, _getRegisteredEvents(target, evtName.type), evtName, unRegFn);
        }
        else {
            var eventCache = elmNodeData.get(target, strEvents, {});
            objForEachKey(eventCache, function (evtType, events) {
                _doUnregister(target, events, evtName, unRegFn);
            });
            if (objKeys(eventCache).length === 0) {
                elmNodeData.kill(target, strEvents);
            }
        }
    }
    function mergeEvtNamespace(theNamespace, namespaces) {
        var newNamespaces;
        if (namespaces) {
            if (isArray(namespaces)) {
                newNamespaces = [theNamespace].concat(namespaces);
            }
            else {
                newNamespaces = [theNamespace, namespaces];
            }
            newNamespaces = (_getEvtNamespace("xx", newNamespaces).ns).split(".");
        }
        else {
            newNamespaces = theNamespace;
        }
        return newNamespaces;
    }
    function eventOn(target, eventName, handlerRef, evtNamespace, useCapture) {
        if (useCapture === void 0) { useCapture = false; }
        var result = false;
        if (target) {
            try {
                var evtName = _getEvtNamespace(eventName, evtNamespace);
                result = _doAttach(target, evtName, handlerRef, useCapture);
                if (result && elmNodeData.accept(target)) {
                    var registeredEvent = {
                        guid: _guid++,
                        evtName: evtName,
                        handler: handlerRef,
                        capture: useCapture
                    };
                    _getRegisteredEvents(target, evtName.type).push(registeredEvent);
                }
            }
            catch (e) {
            }
        }
        return result;
    }
    function eventOff(target, eventName, handlerRef, evtNamespace, useCapture) {
        if (useCapture === void 0) { useCapture = false; }
        if (target) {
            try {
                var evtName_1 = _getEvtNamespace(eventName, evtNamespace);
                var found_1 = false;
                _unregisterEvents(target, evtName_1, function (regEvent) {
                    if ((evtName_1.ns && !handlerRef) || regEvent.handler === handlerRef) {
                        found_1 = true;
                        return true;
                    }
                    return false;
                });
                if (!found_1) {
                    _doDetach(target, evtName_1, handlerRef, useCapture);
                }
            }
            catch (e) {
            }
        }
    }
    function addEventHandler(eventName, callback, evtNamespace) {
        var result = false;
        var w = getWindow();
        if (w) {
            result = eventOn(w, eventName, callback, evtNamespace);
            result = eventOn(w["body"], eventName, callback, evtNamespace) || result;
        }
        var doc = getDocument();
        if (doc) {
            result = eventOn(doc, eventName, callback, evtNamespace) || result;
        }
        return result;
    }
    function removeEventHandler(eventName, callback, evtNamespace) {
        var w = getWindow();
        if (w) {
            eventOff(w, eventName, callback, evtNamespace);
            eventOff(w["body"], eventName, callback, evtNamespace);
        }
        var doc = getDocument();
        if (doc) {
            eventOff(doc, eventName, callback, evtNamespace);
        }
    }
    function _addEventListeners(events, listener, excludeEvents, evtNamespace) {
        var added = false;
        if (listener && events && events.length > 0) {
            arrForEach(events, function (name) {
                if (name) {
                    if (!excludeEvents || arrIndexOf(excludeEvents, name) === -1) {
                        added = addEventHandler(name, listener, evtNamespace) || added;
                    }
                }
            });
        }
        return added;
    }
    function addEventListeners(events, listener, excludeEvents, evtNamespace) {
        var added = false;
        if (listener && events && isArray(events)) {
            added = _addEventListeners(events, listener, excludeEvents, evtNamespace);
            if (!added && excludeEvents && excludeEvents.length > 0) {
                added = _addEventListeners(events, listener, null, evtNamespace);
            }
        }
        return added;
    }
    function removeEventListeners(events, listener, evtNamespace) {
        if (events && isArray(events)) {
            arrForEach(events, function (name) {
                if (name) {
                    removeEventHandler(name, listener, evtNamespace);
                }
            });
        }
    }
    function addPageUnloadEventListener(listener, excludeEvents, evtNamespace) {
        return addEventListeners([strBeforeUnload, strUnload, strPageHide], listener, excludeEvents, evtNamespace);
    }
    function removePageUnloadEventListener(listener, evtNamespace) {
        removeEventListeners([strBeforeUnload, strUnload, strPageHide], listener, evtNamespace);
    }
    function addPageHideEventListener(listener, excludeEvents, evtNamespace) {
        function _handlePageVisibility(evt) {
            var doc = getDocument();
            if (listener && doc && doc.visibilityState === "hidden") {
                listener(evt);
            }
        }
        var newNamespaces = mergeEvtNamespace(strPageHideNamespace, evtNamespace);
        var pageUnloadAdded = _addEventListeners([strPageHide], listener, excludeEvents, newNamespaces);
        if (!excludeEvents || arrIndexOf(excludeEvents, strVisibilityChangeEvt) === -1) {
            pageUnloadAdded = _addEventListeners([strVisibilityChangeEvt], _handlePageVisibility, excludeEvents, newNamespaces) || pageUnloadAdded;
        }
        if (!pageUnloadAdded && excludeEvents) {
            pageUnloadAdded = addPageHideEventListener(listener, null, evtNamespace);
        }
        return pageUnloadAdded;
    }
    function removePageHideEventListener(listener, evtNamespace) {
        var newNamespaces = mergeEvtNamespace(strPageHideNamespace, evtNamespace);
        removeEventListeners([strPageHide], listener, newNamespaces);
        removeEventListeners([strVisibilityChangeEvt], null, newNamespaces);
    }
    function addPageShowEventListener(listener, excludeEvents, evtNamespace) {
        function _handlePageVisibility(evt) {
            var doc = getDocument();
            if (listener && doc && doc.visibilityState === "visible") {
                listener(evt);
            }
        }
        var newNamespaces = mergeEvtNamespace(strPageShowNamespace, evtNamespace);
        var pageShowAdded = _addEventListeners([strPageShow], listener, excludeEvents, newNamespaces);
        pageShowAdded = _addEventListeners([strVisibilityChangeEvt], _handlePageVisibility, excludeEvents, newNamespaces) || pageShowAdded;
        if (!pageShowAdded && excludeEvents) {
            pageShowAdded = addPageShowEventListener(listener, null, evtNamespace);
        }
        return pageShowAdded;
    }
    function removePageShowEventListener(listener, evtNamespace) {
        var newNamespaces = mergeEvtNamespace(strPageShowNamespace, evtNamespace);
        removeEventListeners([strPageShow], listener, newNamespaces);
        removeEventListeners([strVisibilityChangeEvt], null, newNamespaces);
    }

    function perfNow() {
        var perf = getPerformance();
        if (perf && perf.now) {
            return perf.now();
        }
        return dateNow();
    }

    var _a$1;
    var Version = '3.2.2';
    var FullVersionString = "1DS-Web-JS-" + Version;
    var strDisabledPropertyName = "Microsoft_ApplicationInsights_BypassAjaxInstrumentation";
    var strWithCredentials = "withCredentials";
    var strTimeout = "timeout";
    var _fieldTypeEventPropMap = (_a$1 = {},
        _a$1[0 ] = 0 ,
        _a$1[2 ] = 6 ,
        _a$1[1 ] = 1 ,
        _a$1[3 ] = 7 ,
        _a$1[4096  | 2 ] = 6 ,
        _a$1[4096  | 1 ] = 1 ,
        _a$1[4096  | 3 ] = 7 ,
        _a$1);
    Boolean(getDocument());
    Boolean(getWindow());
    function isValueAssigned(value) {
        return !(value === "" || isNullOrUndefined(value));
    }
    function getTenantId(apiKey) {
        if (apiKey) {
            var indexTenantId = apiKey.indexOf("-");
            if (indexTenantId > -1) {
                return apiKey.substring(0, indexTenantId);
            }
        }
        return "";
    }
    function sanitizeProperty(name, property, stringifyObjects) {
        if ((!property && !isValueAssigned(property)) || typeof name !== "string") {
            return null;
        }
        var propType = typeof property;
        if (propType === "string" || propType === "number" || propType === "boolean" || isArray(property)) {
            property = { value: property };
        }
        else if (propType === "object" && !property.hasOwnProperty("value")) {
            property = { value: stringifyObjects ? JSON.stringify(property) : property };
        }
        else if (isNullOrUndefined(property.value)
            || property.value === "" || (!isString(property.value)
            && !isNumber(property.value) && !isBoolean(property.value)
            && !isArray(property.value))) {
            return null;
        }
        if (isArray(property.value) &&
            !isArrayValid(property.value)) {
            return null;
        }
        if (!isNullOrUndefined(property.kind)) {
            if (isArray(property.value) || !isValueKind(property.kind)) {
                return null;
            }
            property.value = property.value.toString();
        }
        return property;
    }
    function getCommonSchemaMetaData(value, kind, type) {
        var encodedTypeValue = -1;
        if (!isUndefined(value)) {
            if (kind > 0) {
                if (kind === 32) {
                    encodedTypeValue = (1 << 13);
                }
                else if (kind <= 13) {
                    encodedTypeValue = (kind << 5);
                }
            }
            if (isDataType(type)) {
                if (encodedTypeValue === -1) {
                    encodedTypeValue = 0;
                }
                encodedTypeValue |= type;
            }
            else {
                var propType = _fieldTypeEventPropMap[getFieldValueType(value)] || -1;
                if (encodedTypeValue !== -1 && propType !== -1) {
                    encodedTypeValue |= propType;
                }
                else if (propType === 6 ) {
                    encodedTypeValue = propType;
                }
            }
        }
        return encodedTypeValue;
    }
    function extend(obj, obj2, obj3, obj4, obj5) {
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;
        var objProto = Object[strShimPrototype];
        var theArgs = arguments;
        if (objProto.toString.call(theArgs[0]) === "[object Boolean]") {
            deep = theArgs[0];
            i++;
        }
        for (; i < length; i++) {
            var obj = theArgs[i];
            objForEachKey(obj, function (prop, value) {
                if (deep && value && isObject(value)) {
                    if (isArray(value)) {
                        extended[prop] = extended[prop] || [];
                        arrForEach(value, function (arrayValue, arrayIndex) {
                            if (arrayValue && isObject(arrayValue)) {
                                extended[prop][arrayIndex] = extend(true, extended[prop][arrayIndex], arrayValue);
                            }
                            else {
                                extended[prop][arrayIndex] = arrayValue;
                            }
                        });
                    }
                    else {
                        extended[prop] = extend(true, extended[prop], value);
                    }
                }
                else {
                    extended[prop] = value;
                }
            });
        }
        return extended;
    }
    var getTime = perfNow;
    function isValueKind(value) {
        if (value === 0  || ((value > 0  && value <= 13 ) || value === 32 )) {
            return true;
        }
        return false;
    }
    function isDataType(value) {
        if (value >= 0 && value <= 9) {
            return true;
        }
        return false;
    }
    function isArrayValid(value) {
        return value.length > 0;
    }
    function setProcessTelemetryTimings(event, identifier) {
        var evt = event;
        evt.timings = evt.timings || {};
        evt.timings.processTelemetryStart = evt.timings.processTelemetryStart || {};
        evt.timings.processTelemetryStart[identifier] = getTime();
    }
    function getFieldValueType(value) {
        var theType = 0 ;
        if (value !== null && value !== undefined) {
            var objType = typeof value;
            if (objType === "string") {
                theType = 1 ;
            }
            else if (objType === "number") {
                theType = 2 ;
            }
            else if (objType === "boolean") {
                theType = 3 ;
            }
            else if (objType === strShimObject) {
                theType = 4 ;
                if (isArray(value)) {
                    theType = 4096 ;
                    if (value.length > 0) {
                        theType |= getFieldValueType(value[0]);
                    }
                }
                else if (hasOwnProperty(value, "value")) {
                    theType = 8192  | getFieldValueType(value.value);
                }
            }
        }
        return theType;
    }
    function isChromium() {
        return !!getGlobalInst("chrome");
    }
    function openXhr(method, urlString, withCredentials, disabled, isSync, timeout) {
        if (disabled === void 0) { disabled = false; }
        if (isSync === void 0) { isSync = false; }
        function _wrapSetXhrProp(xhr, prop, value) {
            try {
                xhr[prop] = value;
            }
            catch (e) {
            }
        }
        var xhr = new XMLHttpRequest();
        if (disabled) {
            _wrapSetXhrProp(xhr, strDisabledPropertyName, disabled);
        }
        if (withCredentials) {
            _wrapSetXhrProp(xhr, strWithCredentials, withCredentials);
        }
        xhr.open(method, urlString, !isSync);
        if (withCredentials) {
            _wrapSetXhrProp(xhr, strWithCredentials, withCredentials);
        }
        if (!isSync && timeout) {
            _wrapSetXhrProp(xhr, strTimeout, timeout);
        }
        return xhr;
    }

    var RT_PROFILE = "REAL_TIME";
    var NRT_PROFILE = "NEAR_REAL_TIME";
    var BE_PROFILE = "BEST_EFFORT";

    var Method = "POST";
    var DisabledPropertyName = "Microsoft_ApplicationInsights_BypassAjaxInstrumentation";
    var strDropped = "drop";
    var strSending = "send";
    var strRequeue = "requeue";
    var strResponseFail = "rspFail";
    var strOther = "oth";
    var defaultCacheControl = "no-cache, no-store";
    var defaultContentType = "application/x-json-stream";
    var strCacheControl = "cache-control";
    var strContentTypeHeader = "content-type";
    var strKillTokensHeader = "kill-tokens";
    var strKillDurationHeader = "kill-duration";
    var strKillDurationSecondsHeader = "kill-duration-seconds";
    var strTimeDeltaHeader = "time-delta-millis";
    var strClientVersion = "client-version";
    var strClientId = "client-id";
    var strTimeDeltaToApply = "time-delta-to-apply-millis";
    var strUploadTime = "upload-time";
    var strApiKey = "apikey";
    var strMsaDeviceTicket = "AuthMsaDeviceTicket";
    var strAuthXToken = "AuthXToken";
    var strNoResponseBody = "NoResponseBody";
    var strMsfpc = "msfpc";

    function _getEventMsfpc(theEvent) {
        var intWeb = ((theEvent.ext || {})["intweb"]);
        if (intWeb && isValueAssigned(intWeb[strMsfpc])) {
            return intWeb[strMsfpc];
        }
        return null;
    }
    function _getMsfpc(theEvents) {
        var msfpc = null;
        for (var lp = 0; msfpc === null && lp < theEvents.length; lp++) {
            msfpc = _getEventMsfpc(theEvents[lp]);
        }
        return msfpc;
    }
    var EventBatch = /** @class */ (function () {
        function EventBatch(iKey, addEvents) {
            var events = addEvents ? [].concat(addEvents) : [];
            var _self = this;
            var _msfpc = _getMsfpc(events);
            _self.iKey = function () {
                return iKey;
            };
            _self.Msfpc = function () {
                return _msfpc || "";
            };
            _self.count = function () {
                return events.length;
            };
            _self.events = function () {
                return events;
            };
            _self.addEvent = function (theEvent) {
                if (theEvent) {
                    events.push(theEvent);
                    if (!_msfpc) {
                        _msfpc = _getEventMsfpc(theEvent);
                    }
                    return true;
                }
                return false;
            };
            _self.split = function (fromEvent, numEvents) {
                var theEvents;
                if (fromEvent < events.length) {
                    var cnt = events.length - fromEvent;
                    if (!isNullOrUndefined(numEvents)) {
                        cnt = numEvents < cnt ? numEvents : cnt;
                    }
                    theEvents = events.splice(fromEvent, cnt);
                    _msfpc = _getMsfpc(events);
                }
                return new EventBatch(iKey, theEvents);
            };
        }
        EventBatch.create = function (iKey, theEvents) {
            return new EventBatch(iKey, theEvents);
        };
        return EventBatch;
    }());

    var _MAX_STRING_JOINS = 20;
    var RequestSizeLimitBytes = 3984588;
    var BeaconRequestSizeLimitBytes = 65000;
    var MaxRecordSize = 2000000;
    var MaxBeaconRecordSize = Math.min(MaxRecordSize, BeaconRequestSizeLimitBytes);
    var metadata = "metadata";
    var f = "f";
    var rCheckDot = /\./;
    var Serializer = /** @class */ (function () {
        function Serializer(perfManager, valueSanitizer, stringifyObjects, enableCompoundKey) {
            var strData = "data";
            var strBaseData = "baseData";
            var strExt = "ext";
            var _checkForCompoundkey = !!enableCompoundKey;
            var _processSubMetaData = true;
            var _theSanitizer = valueSanitizer;
            var _isReservedCache = {};
            dynamicProto(Serializer, this, function (_self) {
                _self.createPayload = function (retryCnt, isTeardown, isSync, useSendBeacon, sendReason, sendType) {
                    return {
                        apiKeys: [],
                        payloadBlob: "",
                        overflow: null,
                        sizeExceed: [],
                        failedEvts: [],
                        batches: [],
                        numEvents: 0,
                        retryCnt: retryCnt,
                        isTeardown: isTeardown,
                        isSync: isSync,
                        isBeacon: useSendBeacon,
                        sendType: sendType,
                        sendReason: sendReason
                    };
                };
                _self.appendPayload = function (payload, theBatch, maxEventsPerBatch) {
                    var canAddEvents = payload && theBatch && !payload.overflow;
                    if (canAddEvents) {
                        doPerf(perfManager, function () { return "Serializer:appendPayload"; }, function () {
                            var theEvents = theBatch.events();
                            var payloadBlob = payload.payloadBlob;
                            var payloadEvents = payload.numEvents;
                            var eventsAdded = false;
                            var sizeExceeded = [];
                            var failedEvts = [];
                            var isBeaconPayload = payload.isBeacon;
                            var requestMaxSize = isBeaconPayload ? BeaconRequestSizeLimitBytes : RequestSizeLimitBytes;
                            var recordMaxSize = isBeaconPayload ? MaxBeaconRecordSize : MaxRecordSize;
                            var lp = 0;
                            var joinCount = 0;
                            while (lp < theEvents.length) {
                                var theEvent = theEvents[lp];
                                if (theEvent) {
                                    if (payloadEvents >= maxEventsPerBatch) {
                                        payload.overflow = theBatch.split(lp);
                                        break;
                                    }
                                    var eventBlob = _self.getEventBlob(theEvent);
                                    if (eventBlob && eventBlob.length <= recordMaxSize) {
                                        var blobLength = eventBlob.length;
                                        var currentSize = payloadBlob.length;
                                        if (currentSize + blobLength > requestMaxSize) {
                                            payload.overflow = theBatch.split(lp);
                                            break;
                                        }
                                        if (payloadBlob) {
                                            payloadBlob += "\n";
                                        }
                                        payloadBlob += eventBlob;
                                        joinCount++;
                                        if (joinCount > _MAX_STRING_JOINS) {
                                            payloadBlob.substr(0, 1);
                                            joinCount = 0;
                                        }
                                        eventsAdded = true;
                                        payloadEvents++;
                                    }
                                    else {
                                        if (eventBlob) {
                                            sizeExceeded.push(theEvent);
                                        }
                                        else {
                                            failedEvts.push(theEvent);
                                        }
                                        theEvents.splice(lp, 1);
                                        lp--;
                                    }
                                }
                                lp++;
                            }
                            if (sizeExceeded && sizeExceeded.length > 0) {
                                payload.sizeExceed.push(EventBatch.create(theBatch.iKey(), sizeExceeded));
                            }
                            if (failedEvts && failedEvts.length > 0) {
                                payload.failedEvts.push(EventBatch.create(theBatch.iKey(), failedEvts));
                            }
                            if (eventsAdded) {
                                payload.batches.push(theBatch);
                                payload.payloadBlob = payloadBlob;
                                payload.numEvents = payloadEvents;
                                var apiKey = theBatch.iKey();
                                if (arrIndexOf(payload.apiKeys, apiKey) === -1) {
                                    payload.apiKeys.push(apiKey);
                                }
                            }
                        }, function () { return ({ payload: payload, theBatch: { iKey: theBatch.iKey(), evts: theBatch.events() }, max: maxEventsPerBatch }); });
                    }
                    return canAddEvents;
                };
                _self.getEventBlob = function (eventData) {
                    try {
                        return doPerf(perfManager, function () { return "Serializer.getEventBlob"; }, function () {
                            var serializedEvent = {};
                            serializedEvent.name = eventData.name;
                            serializedEvent.time = eventData.time;
                            serializedEvent.ver = eventData.ver;
                            serializedEvent.iKey = "o:" + getTenantId(eventData.iKey);
                            var serializedExt = {};
                            var eventExt = eventData[strExt];
                            if (eventExt) {
                                serializedEvent[strExt] = serializedExt;
                                objForEachKey(eventExt, function (key, value) {
                                    var data = serializedExt[key] = {};
                                    _processPathKeys(value, data, "ext." + key, true, null, null, true);
                                });
                            }
                            var serializedData = serializedEvent[strData] = {};
                            serializedData.baseType = eventData.baseType;
                            var serializedBaseData = serializedData[strBaseData] = {};
                            _processPathKeys(eventData.baseData, serializedBaseData, strBaseData, false, [strBaseData], function (pathKeys, name, value) {
                                _addJSONPropertyMetaData(serializedExt, pathKeys, name, value);
                            }, _processSubMetaData);
                            _processPathKeys(eventData.data, serializedData, strData, false, [], function (pathKeys, name, value) {
                                _addJSONPropertyMetaData(serializedExt, pathKeys, name, value);
                            }, _processSubMetaData);
                            return JSON.stringify(serializedEvent);
                        }, function () { return ({ item: eventData }); });
                    }
                    catch (e) {
                        return null;
                    }
                };
                function _isReservedField(path, name) {
                    var result = _isReservedCache[path];
                    if (result === undefined) {
                        if (path.length >= 7) {
                            result = strStartsWith(path, "ext.metadata") || strStartsWith(path, "ext.web");
                        }
                        _isReservedCache[path] = result;
                    }
                    return result;
                }
                function _processPathKeys(srcObj, target, thePath, checkReserved, metadataPathKeys, metadataCallback, processSubKeys) {
                    objForEachKey(srcObj, function (key, srcValue) {
                        var prop = null;
                        if (srcValue || isValueAssigned(srcValue)) {
                            var path = thePath;
                            var name_1 = key;
                            var theMetaPathKeys = metadataPathKeys;
                            var destObj = target;
                            if (_checkForCompoundkey && !checkReserved && rCheckDot.test(key)) {
                                var subKeys = key.split(".");
                                var keyLen = subKeys.length;
                                if (keyLen > 1) {
                                    if (theMetaPathKeys) {
                                        theMetaPathKeys = theMetaPathKeys.slice();
                                    }
                                    for (var lp = 0; lp < keyLen - 1; lp++) {
                                        var subKey = subKeys[lp];
                                        destObj = destObj[subKey] = destObj[subKey] || {};
                                        path += "." + subKey;
                                        if (theMetaPathKeys) {
                                            theMetaPathKeys.push(subKey);
                                        }
                                    }
                                    name_1 = subKeys[keyLen - 1];
                                }
                            }
                            var isReserved = checkReserved && _isReservedField(path);
                            if (!isReserved && _theSanitizer && _theSanitizer.handleField(path, name_1)) {
                                prop = _theSanitizer.value(path, name_1, srcValue, stringifyObjects);
                            }
                            else {
                                prop = sanitizeProperty(name_1, srcValue, stringifyObjects);
                            }
                            if (prop) {
                                var newValue = prop.value;
                                destObj[name_1] = newValue;
                                if (metadataCallback) {
                                    metadataCallback(theMetaPathKeys, name_1, prop);
                                }
                                if (processSubKeys && typeof newValue === "object" && !isArray(newValue)) {
                                    var newPath = theMetaPathKeys;
                                    if (newPath) {
                                        newPath = newPath.slice();
                                        newPath.push(name_1);
                                    }
                                    _processPathKeys(srcValue, newValue, path + "." + name_1, checkReserved, newPath, metadataCallback, processSubKeys);
                                }
                            }
                        }
                    });
                }
            });
        }
        return Serializer;
    }());
    function _addJSONPropertyMetaData(json, propKeys, name, propertyValue) {
        if (propertyValue && json) {
            var encodedTypeValue = getCommonSchemaMetaData(propertyValue.value, propertyValue.kind, propertyValue.propertyType);
            if (encodedTypeValue > -1) {
                var metaData = json[metadata];
                if (!metaData) {
                    metaData = json[metadata] = { f: {} };
                }
                var metaTarget = metaData[f];
                if (!metaTarget) {
                    metaTarget = metaData[f] = {};
                }
                if (propKeys) {
                    for (var lp = 0; lp < propKeys.length; lp++) {
                        var key = propKeys[lp];
                        if (!metaTarget[key]) {
                            metaTarget[key] = { f: {} };
                        }
                        var newTarget = metaTarget[key][f];
                        if (!newTarget) {
                            newTarget = metaTarget[key][f] = {};
                        }
                        metaTarget = newTarget;
                    }
                }
                metaTarget = metaTarget[name] = {};
                if (isArray(propertyValue.value)) {
                    metaTarget["a"] = {
                        t: encodedTypeValue
                    };
                }
                else {
                    metaTarget["t"] = encodedTypeValue;
                }
            }
        }
    }

    var RandomizationLowerThreshold = 0.8;
    var RandomizationUpperThreshold = 1.2;
    var BaseBackoff = 3000;
    var MaxBackoff = 600000;
    function retryPolicyShouldRetryForStatus(httpStatusCode) {
        return !((httpStatusCode >= 300 && httpStatusCode < 500 && httpStatusCode != 408 && httpStatusCode != 429)
            || (httpStatusCode == 501)
            || (httpStatusCode == 505));
    }
    function retryPolicyGetMillisToBackoffForRetry(retriesSoFar) {
        var waitDuration = 0;
        var minBackoff = BaseBackoff * RandomizationLowerThreshold;
        var maxBackoff = BaseBackoff * RandomizationUpperThreshold;
        var randomBackoff = Math.floor(Math.random() * (maxBackoff - minBackoff)) + minBackoff;
        waitDuration = Math.pow(2, retriesSoFar) * randomBackoff;
        return Math.min(waitDuration, MaxBackoff);
    }

    var SecToMsMultiplier = 1000;
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
        return KillSwitch;
    }());
    var EVTKillSwitch = KillSwitch;

    var ClockSkewManager = /** @class */ (function () {
        function ClockSkewManager() {
            var _allowRequestSending = true;
            var _shouldAddClockSkewHeaders = true;
            var _isFirstRequest = true;
            var _clockSkewHeaderValue = "use-collector-delta";
            var _clockSkewSet = false;
            dynamicProto(ClockSkewManager, this, function (_self) {
                _self.allowRequestSending = function () {
                    return _allowRequestSending;
                };
                _self.firstRequestSent = function () {
                    if (_isFirstRequest) {
                        _isFirstRequest = false;
                        if (!_clockSkewSet) {
                            _allowRequestSending = false;
                        }
                    }
                };
                _self.shouldAddClockSkewHeaders = function () {
                    return _shouldAddClockSkewHeaders;
                };
                _self.getClockSkewHeaderValue = function () {
                    return _clockSkewHeaderValue;
                };
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
                        _allowRequestSending = true;
                    }
                };
            });
        }
        return ClockSkewManager;
    }());
    var EVTClockSkewManager = ClockSkewManager;

    var _a;
    var strSendAttempt = "sendAttempt";
    var _noResponseQs = "&" + strNoResponseBody + "=true";
    var _eventActionMap = (_a = {},
        _a[1 ] = strRequeue,
        _a[100 ] = strRequeue,
        _a[200 ] = "sent",
        _a[8004 ] = strDropped,
        _a[8003 ] = strDropped,
        _a);
    var _collectorQsHeaders = {};
    var _collectorHeaderToQs = {};
    function _addCollectorHeaderQsMapping(qsName, headerName, allowQs) {
        _collectorQsHeaders[qsName] = headerName;
        if (allowQs !== false) {
            _collectorHeaderToQs[headerName] = qsName;
        }
    }
    _addCollectorHeaderQsMapping(strMsaDeviceTicket, strMsaDeviceTicket, false);
    _addCollectorHeaderQsMapping(strClientVersion, strClientVersion);
    _addCollectorHeaderQsMapping(strClientId, "Client-Id");
    _addCollectorHeaderQsMapping(strApiKey, strApiKey);
    _addCollectorHeaderQsMapping(strTimeDeltaToApply, strTimeDeltaToApply);
    _addCollectorHeaderQsMapping(strUploadTime, strUploadTime);
    _addCollectorHeaderQsMapping(strAuthXToken, strAuthXToken);
    function _getResponseText(xhr) {
        try {
            return xhr.responseText;
        }
        catch (e) {
        }
        return "";
    }
    function _hasHeader(headers, header) {
        var hasHeader = false;
        if (headers && header) {
            var keys = objKeys(headers);
            if (keys && keys.length > 0) {
                var lowerHeader = header.toLowerCase();
                for (var lp = 0; lp < keys.length; lp++) {
                    var value = keys[lp];
                    if (value && hasOwnProperty(header, value) &&
                        value.toLowerCase() === lowerHeader) {
                        hasHeader = true;
                        break;
                    }
                }
            }
        }
        return hasHeader;
    }
    function _addRequestDetails(details, name, value, useHeaders) {
        if (name && value && value.length > 0) {
            if (useHeaders && _collectorQsHeaders[name]) {
                details.hdrs[_collectorQsHeaders[name]] = value;
                details.useHdrs = true;
            }
            else {
                details.url += "&" + name + "=" + value;
            }
        }
    }
    var HttpManager = /** @class */ (function () {
        function HttpManager(maxEventsPerBatch, maxConnections, maxRequestRetriesBeforeBackoff, actions, timeoutOverride) {
            this._responseHandlers = [];
            var _urlString = "?cors=true&" + strContentTypeHeader.toLowerCase() + "=" + defaultContentType;
            var _killSwitch = new EVTKillSwitch();
            var _paused = false;
            var _clockSkewManager = new EVTClockSkewManager();
            var _useBeacons = false;
            var _outstandingRequests = 0;
            var _postManager;
            var _sendInterfaces;
            var _core;
            var _customHttpInterface = true;
            var _queryStringParameters = [];
            var _headers = {};
            var _batchQueue = [];
            var _serializer = null;
            var _enableEventTimings = false;
            var _cookieMgr;
            var _isUnloading = false;
            var _useHeaders = false;
            var _xhrTimeout;
            var _disableXhrSync;
            dynamicProto(HttpManager, this, function (_self) {
                var _sendCredentials = true;
                _self.initialize = function (endpointUrl, core, postChannel, httpInterface, channelConfig) {
                    var _a;
                    if (!channelConfig) {
                        channelConfig = {};
                    }
                    _urlString = endpointUrl + _urlString;
                    _useHeaders = !isUndefined(channelConfig.avoidOptions) ? !channelConfig.avoidOptions : true;
                    _core = core;
                    _cookieMgr = core.getCookieMgr();
                    _enableEventTimings = !_core.config.disableEventTimings;
                    var enableCompoundKey = !!_core.config.enableCompoundKey;
                    _postManager = postChannel;
                    var valueSanitizer = channelConfig.valueSanitizer;
                    var stringifyObjects = channelConfig.stringifyObjects;
                    if (!isUndefined(channelConfig.enableCompoundKey)) {
                        enableCompoundKey = !!channelConfig.enableCompoundKey;
                    }
                    _xhrTimeout = channelConfig.xhrTimeout;
                    _disableXhrSync = channelConfig.disableXhrSync;
                    _useBeacons = !isReactNative();
                    _serializer = new Serializer(_core, valueSanitizer, stringifyObjects, enableCompoundKey);
                    var syncHttpInterface = httpInterface;
                    var beaconHttpInterface = channelConfig.alwaysUseXhrOverride ? httpInterface : null;
                    var fetchSyncHttpInterface = channelConfig.alwaysUseXhrOverride ? httpInterface : null;
                    if (!httpInterface) {
                        _customHttpInterface = false;
                        var location_1 = getLocation();
                        if (location_1 && location_1.protocol && location_1.protocol.toLowerCase() === "file:") {
                            _sendCredentials = false;
                        }
                        var theTransports = [];
                        if (isReactNative()) {
                            theTransports = [2 , 1 ];
                        }
                        else {
                            theTransports = [1 , 2 , 3 ];
                        }
                        var configTransports = channelConfig.transports;
                        if (configTransports) {
                            if (isNumber(configTransports)) {
                                theTransports = [configTransports].concat(theTransports);
                            }
                            else if (isArray(configTransports)) {
                                theTransports = configTransports.concat(theTransports);
                            }
                        }
                        httpInterface = _getSenderInterface(theTransports, false);
                        syncHttpInterface = _getSenderInterface(theTransports, true);
                        if (!httpInterface) {
                            _postManager.diagLog().warnToConsole("No available transport to send events");
                        }
                    }
                    _sendInterfaces = (_a = {},
                        _a[0 ] = httpInterface,
                        _a[1 ] = syncHttpInterface || _getSenderInterface([1 , 2 , 3 ], true),
                        _a[2 ] = beaconHttpInterface || _getSenderInterface([3 , 2 ], true) || syncHttpInterface || _getSenderInterface([1 ], true),
                        _a[3 ] = fetchSyncHttpInterface || _getSenderInterface([2 , 3 ], true) || syncHttpInterface || _getSenderInterface([1 ], true),
                        _a);
                };
                function _getSenderInterface(transports, syncSupport) {
                    var transportType = 0 ;
                    var sendPostFunc = null;
                    var lp = 0;
                    while (sendPostFunc == null && lp < transports.length) {
                        transportType = transports[lp];
                        if (transportType === 1 ) {
                            if (useXDomainRequest()) {
                                sendPostFunc = _xdrSendPost;
                            }
                            else if (isXhrSupported()) {
                                sendPostFunc = _xhrSendPost;
                            }
                        }
                        else if (transportType === 2  && isFetchSupported(syncSupport)) {
                            sendPostFunc = _fetchSendPost;
                        }
                        else if (_useBeacons && transportType === 3  && isBeaconsSupported()) {
                            sendPostFunc = _beaconSendPost;
                        }
                        lp++;
                    }
                    if (sendPostFunc) {
                        return {
                            _transport: transportType,
                            _isSync: syncSupport,
                            sendPOST: sendPostFunc
                        };
                    }
                    return null;
                }
                _self["_getDbgPlgTargets"] = function () {
                    return [_sendInterfaces[0 ], _killSwitch, _serializer, _sendInterfaces];
                };
                function _xdrSendPost(payload, oncomplete, sync) {
                    var xdr = new XDomainRequest();
                    xdr.open(Method, payload.urlString);
                    if (payload.timeout) {
                        xdr.timeout = payload.timeout;
                    }
                    xdr.onload = function () {
                        var response = _getResponseText(xdr);
                        _doOnComplete(oncomplete, 200, {}, response);
                        _handleCollectorResponse(response);
                    };
                    xdr.onerror = function () {
                        _doOnComplete(oncomplete, 400, {});
                    };
                    xdr.ontimeout = function () {
                        _doOnComplete(oncomplete, 500, {});
                    };
                    xdr.onprogress = function () { };
                    if (sync) {
                        xdr.send(payload.data);
                    }
                    else {
                        timeoutOverride.set(function () {
                            xdr.send(payload.data);
                        }, 0);
                    }
                }
                function _fetchSendPost(payload, oncomplete, sync) {
                    var _a;
                    var theUrl = payload.urlString;
                    var ignoreResponse = false;
                    var responseHandled = false;
                    var requestInit = (_a = {
                            body: payload.data,
                            method: Method
                        },
                        _a[DisabledPropertyName] = true,
                        _a);
                    if (sync) {
                        requestInit.keepalive = true;
                        if (payload._sendReason === 2 ) {
                            ignoreResponse = true;
                            theUrl += _noResponseQs;
                        }
                    }
                    if (_sendCredentials) {
                        requestInit.credentials = "include";
                    }
                    if (payload.headers && objKeys(payload.headers).length > 0) {
                        requestInit.headers = payload.headers;
                    }
                    fetch(theUrl, requestInit).then(function (response) {
                        var headerMap = {};
                        var responseText = "";
                        if (response.headers) {
                            response.headers.forEach(function (value, name) {
                                headerMap[name] = value;
                            });
                        }
                        if (response.body) {
                            response.text().then(function (text) {
                                responseText = text;
                            });
                        }
                        if (!responseHandled) {
                            responseHandled = true;
                            _doOnComplete(oncomplete, response.status, headerMap, responseText);
                            _handleCollectorResponse(responseText);
                        }
                    })["catch"](function (error) {
                        if (!responseHandled) {
                            responseHandled = true;
                            _doOnComplete(oncomplete, 0, {});
                        }
                    });
                    if (ignoreResponse && !responseHandled) {
                        responseHandled = true;
                        _doOnComplete(oncomplete, 200, {});
                    }
                    if (!responseHandled && payload.timeout > 0) {
                        timeoutOverride.set(function () {
                            if (!responseHandled) {
                                responseHandled = true;
                                _doOnComplete(oncomplete, 500, {});
                            }
                        }, payload.timeout);
                    }
                }
                function _xhrSendPost(payload, oncomplete, sync) {
                    var theUrl = payload.urlString;
                    function _appendHeader(theHeaders, xhr, name) {
                        if (!theHeaders[name] && xhr && xhr.getResponseHeader) {
                            var value = xhr.getResponseHeader(name);
                            if (value) {
                                theHeaders[name] = strTrim(value);
                            }
                        }
                        return theHeaders;
                    }
                    function _getAllResponseHeaders(xhr) {
                        var theHeaders = {};
                        if (!xhr.getAllResponseHeaders) {
                            theHeaders = _appendHeader(theHeaders, xhr, strTimeDeltaHeader);
                            theHeaders = _appendHeader(theHeaders, xhr, strKillDurationHeader);
                            theHeaders = _appendHeader(theHeaders, xhr, strKillDurationSecondsHeader);
                        }
                        else {
                            theHeaders = _convertAllHeadersToMap(xhr.getAllResponseHeaders());
                        }
                        return theHeaders;
                    }
                    function xhrComplete(xhr, responseTxt) {
                        _doOnComplete(oncomplete, xhr.status, _getAllResponseHeaders(xhr), responseTxt);
                    }
                    if (sync && payload.disableXhrSync) {
                        sync = false;
                    }
                    var xhrRequest = openXhr(Method, theUrl, _sendCredentials, true, sync, payload.timeout);
                    objForEachKey(payload.headers, function (name, value) {
                        xhrRequest.setRequestHeader(name, value);
                    });
                    xhrRequest.onload = function () {
                        var response = _getResponseText(xhrRequest);
                        xhrComplete(xhrRequest, response);
                        _handleCollectorResponse(response);
                    };
                    xhrRequest.onerror = function () {
                        xhrComplete(xhrRequest);
                    };
                    xhrRequest.ontimeout = function () {
                        xhrComplete(xhrRequest);
                    };
                    xhrRequest.send(payload.data);
                }
                function _doOnComplete(oncomplete, status, headers, response) {
                    try {
                        oncomplete(status, headers, response);
                    }
                    catch (e) {
                        _throwInternal(_postManager.diagLog(), 2 , 518 , dumpObj(e));
                    }
                }
                function _beaconSendPost(payload, oncomplete, sync) {
                    var internalPayloadData = payload;
                    var status = 200;
                    var thePayload = internalPayloadData._thePayload;
                    var theUrl = payload.urlString + _noResponseQs;
                    try {
                        var nav_1 = getNavigator();
                        if (!nav_1.sendBeacon(theUrl, payload.data)) {
                            if (thePayload) {
                                var droppedBatches_1 = [];
                                arrForEach(thePayload.batches, function (theBatch) {
                                    if (droppedBatches_1 && theBatch && theBatch.count() > 0) {
                                        var theEvents = theBatch.events();
                                        for (var lp = 0; lp < theEvents.length; lp++) {
                                            if (!nav_1.sendBeacon(theUrl, _serializer.getEventBlob(theEvents[lp]))) {
                                                droppedBatches_1.push(theBatch.split(lp));
                                                break;
                                            }
                                        }
                                    }
                                    else {
                                        droppedBatches_1.push(theBatch.split(0));
                                    }
                                });
                                _sendBatchesNotification(droppedBatches_1, 8003 , thePayload.sendType, true);
                            }
                            else {
                                status = 0;
                            }
                        }
                    }
                    catch (ex) {
                        _postManager.diagLog().warnToConsole("Failed to send telemetry using sendBeacon API. Ex:" + dumpObj(ex));
                        status = 0;
                    }
                    finally {
                        _doOnComplete(oncomplete, status, {}, "");
                    }
                }
                function _isBeaconPayload(sendType) {
                    return sendType === 2  || sendType === 3 ;
                }
                function _adjustSendType(sendType) {
                    if (_isUnloading && _isBeaconPayload(sendType)) {
                        sendType = 2 ;
                    }
                    return sendType;
                }
                _self.addQueryStringParameter = function (name, value) {
                    for (var i = 0; i < _queryStringParameters.length; i++) {
                        if (_queryStringParameters[i].name === name) {
                            _queryStringParameters[i].value = value;
                            return;
                        }
                    }
                    _queryStringParameters.push({ name: name, value: value });
                };
                _self.addHeader = function (name, value) {
                    _headers[name] = value;
                };
                _self.canSendRequest = function () {
                    return _hasIdleConnection() && _clockSkewManager.allowRequestSending();
                };
                _self.sendQueuedRequests = function (sendType, sendReason) {
                    if (isUndefined(sendType)) {
                        sendType = 0 ;
                    }
                    if (_isUnloading) {
                        sendType = _adjustSendType(sendType);
                        sendReason = 2 ;
                    }
                    if (_canSendPayload(_batchQueue, sendType, 0)) {
                        _sendBatches(_clearQueue(), 0, false, sendType, sendReason || 0 );
                    }
                };
                _self.isCompletelyIdle = function () {
                    return !_paused && _outstandingRequests === 0 && _batchQueue.length === 0;
                };
                _self.setUnloading = function (value) {
                    _isUnloading = value;
                };
                _self.addBatch = function (theBatch) {
                    if (theBatch && theBatch.count() > 0) {
                        if (_killSwitch.isTenantKilled(theBatch.iKey())) {
                            return false;
                        }
                        _batchQueue.push(theBatch);
                    }
                    return true;
                };
                _self.teardown = function () {
                    if (_batchQueue.length > 0) {
                        _sendBatches(_clearQueue(), 0, true, 2 , 2 );
                    }
                };
                _self.pause = function () {
                    _paused = true;
                };
                _self.resume = function () {
                    _paused = false;
                    _self.sendQueuedRequests(0 , 4 );
                };
                _self.sendSynchronousBatch = function (batch, sendType, sendReason) {
                    if (batch && batch.count() > 0) {
                        if (isNullOrUndefined(sendType)) {
                            sendType = 1 ;
                        }
                        if (_isUnloading) {
                            sendType = _adjustSendType(sendType);
                            sendReason = 2 ;
                        }
                        _sendBatches([batch], 0, false, sendType, sendReason || 0 );
                    }
                };
                function _hasIdleConnection() {
                    return !_paused && _outstandingRequests < maxConnections;
                }
                function _clearQueue() {
                    var theQueue = _batchQueue;
                    _batchQueue = [];
                    return theQueue;
                }
                function _canSendPayload(theBatches, sendType, retryCnt) {
                    var result = false;
                    if (theBatches && theBatches.length > 0 && !_paused && _sendInterfaces[sendType] && _serializer) {
                        result = (sendType !== 0 ) || (_hasIdleConnection() && (retryCnt > 0 || _clockSkewManager.allowRequestSending()));
                    }
                    return result;
                }
                function _createDebugBatches(theBatches) {
                    var values = {};
                    if (theBatches) {
                        arrForEach(theBatches, function (theBatch, idx) {
                            values[idx] = {
                                iKey: theBatch.iKey(),
                                evts: theBatch.events()
                            };
                        });
                    }
                    return values;
                }
                function _sendBatches(theBatches, retryCount, isTeardown, sendType, sendReason) {
                    if (!theBatches || theBatches.length === 0) {
                        return;
                    }
                    if (_paused) {
                        _sendBatchesNotification(theBatches, 1 , sendType);
                        return;
                    }
                    sendType = _adjustSendType(sendType);
                    try {
                        var orgBatches_1 = theBatches;
                        var isSynchronous_1 = sendType !== 0 ;
                        doPerf(_core, function () { return "HttpManager:_sendBatches"; }, function (perfEvt) {
                            if (perfEvt) {
                                theBatches = theBatches.slice(0);
                            }
                            var droppedBatches = [];
                            var thePayload = null;
                            var serializationStart = getTime();
                            var sendInterface = _sendInterfaces[sendType] || (isSynchronous_1 ? _sendInterfaces[1 ] : _sendInterfaces[0 ]);
                            var isBeaconTransport = (_isUnloading || _isBeaconPayload(sendType) || (sendInterface && sendInterface._transport === 3 )) && _canUseSendBeaconApi();
                            while (_canSendPayload(theBatches, sendType, retryCount)) {
                                var theBatch = theBatches.shift();
                                if (theBatch && theBatch.count() > 0) {
                                    if (!_killSwitch.isTenantKilled(theBatch.iKey())) {
                                        thePayload = thePayload || _serializer.createPayload(retryCount, isTeardown, isSynchronous_1, isBeaconTransport, sendReason, sendType);
                                        if (!_serializer.appendPayload(thePayload, theBatch, maxEventsPerBatch)) {
                                            _doPayloadSend(thePayload, serializationStart, getTime(), sendReason);
                                            serializationStart = getTime();
                                            theBatches = [theBatch].concat(theBatches);
                                            thePayload = null;
                                        }
                                        else if (thePayload.overflow !== null) {
                                            theBatches = [thePayload.overflow].concat(theBatches);
                                            thePayload.overflow = null;
                                            _doPayloadSend(thePayload, serializationStart, getTime(), sendReason);
                                            serializationStart = getTime();
                                            thePayload = null;
                                        }
                                    }
                                    else {
                                        droppedBatches.push(theBatch);
                                    }
                                }
                            }
                            if (thePayload) {
                                _doPayloadSend(thePayload, serializationStart, getTime(), sendReason);
                            }
                            if (theBatches.length > 0) {
                                _batchQueue = theBatches.concat(_batchQueue);
                            }
                            _sendBatchesNotification(droppedBatches, 8004 , sendType);
                        }, function () { return ({ batches: _createDebugBatches(orgBatches_1), retryCount: retryCount, isTeardown: isTeardown, isSynchronous: isSynchronous_1, sendReason: sendReason, useSendBeacon: _isBeaconPayload(sendType), sendType: sendType }); }, !isSynchronous_1);
                    }
                    catch (ex) {
                        _throwInternal(_postManager.diagLog(), 2 , 48 , "Unexpected Exception sending batch: " + dumpObj(ex));
                    }
                }
                function _buildRequestDetails(thePayload, useHeaders) {
                    var requestDetails = {
                        url: _urlString,
                        hdrs: {},
                        useHdrs: false
                    };
                    if (!useHeaders) {
                        objForEachKey(_headers, function (name, value) {
                            if (_collectorHeaderToQs[name]) {
                                _addRequestDetails(requestDetails, _collectorHeaderToQs[name], value, false);
                            }
                            else {
                                requestDetails.hdrs[name] = value;
                                requestDetails.useHdrs = true;
                            }
                        });
                    }
                    else {
                        requestDetails.hdrs = extend(requestDetails.hdrs, _headers);
                        requestDetails.useHdrs = (objKeys(requestDetails.hdrs).length > 0);
                    }
                    _addRequestDetails(requestDetails, strClientId, "NO_AUTH", useHeaders);
                    _addRequestDetails(requestDetails, strClientVersion, FullVersionString, useHeaders);
                    var apiQsKeys = "";
                    arrForEach(thePayload.apiKeys, function (apiKey) {
                        if (apiQsKeys.length > 0) {
                            apiQsKeys += ",";
                        }
                        apiQsKeys += apiKey;
                    });
                    _addRequestDetails(requestDetails, strApiKey, apiQsKeys, useHeaders);
                    _addRequestDetails(requestDetails, strUploadTime, dateNow().toString(), useHeaders);
                    var msfpc = _getMsfpc(thePayload);
                    if (isValueAssigned(msfpc)) {
                        requestDetails.url += "&ext.intweb.msfpc=" + msfpc;
                    }
                    if (_clockSkewManager.shouldAddClockSkewHeaders()) {
                        _addRequestDetails(requestDetails, strTimeDeltaToApply, _clockSkewManager.getClockSkewHeaderValue(), useHeaders);
                    }
                    if (_core.getWParam) {
                        var wParam = _core.getWParam();
                        if (wParam >= 0) {
                            requestDetails.url += "&w=" + wParam;
                        }
                    }
                    for (var i = 0; i < _queryStringParameters.length; i++) {
                        requestDetails.url += "&" + _queryStringParameters[i].name + "=" + _queryStringParameters[i].value;
                    }
                    return requestDetails;
                }
                function _canUseSendBeaconApi() {
                    return !_customHttpInterface && _useBeacons && isBeaconsSupported();
                }
                function _setTimingValue(timings, name, value) {
                    timings[name] = timings[name] || {};
                    timings[name][_postManager.identifier] = value;
                }
                function _doPayloadSend(thePayload, serializationStart, serializationCompleted, sendReason) {
                    if (thePayload && thePayload.payloadBlob && thePayload.payloadBlob.length > 0) {
                        var useSendHook_1 = !!_self.sendHook;
                        var sendInterface_1 = _sendInterfaces[thePayload.sendType];
                        if (!_isBeaconPayload(thePayload.sendType) && thePayload.isBeacon && thePayload.sendReason === 2 ) {
                            sendInterface_1 = _sendInterfaces[2 ] || _sendInterfaces[3 ] || sendInterface_1;
                        }
                        var useHeaders_1 = _useHeaders;
                        if (thePayload.isBeacon || sendInterface_1._transport === 3 ) {
                            useHeaders_1 = false;
                        }
                        var requestDetails_1 = _buildRequestDetails(thePayload, useHeaders_1);
                        useHeaders_1 = useHeaders_1 || requestDetails_1.useHdrs;
                        var sendEventStart_1 = getTime();
                        doPerf(_core, function () { return "HttpManager:_doPayloadSend"; }, function () {
                            for (var batchLp = 0; batchLp < thePayload.batches.length; batchLp++) {
                                var theBatch = thePayload.batches[batchLp];
                                var theEvents = theBatch.events();
                                for (var evtLp = 0; evtLp < theEvents.length; evtLp++) {
                                    var telemetryItem = theEvents[evtLp];
                                    if (_enableEventTimings) {
                                        var timings = telemetryItem.timings = telemetryItem.timings || {};
                                        _setTimingValue(timings, "sendEventStart", sendEventStart_1);
                                        _setTimingValue(timings, "serializationStart", serializationStart);
                                        _setTimingValue(timings, "serializationCompleted", serializationCompleted);
                                    }
                                    telemetryItem[strSendAttempt] > 0 ? telemetryItem[strSendAttempt]++ : telemetryItem[strSendAttempt] = 1;
                                }
                            }
                            _sendBatchesNotification(thePayload.batches, (1000  + (sendReason || 0 )), thePayload.sendType, true);
                            var orgPayloadData = {
                                data: thePayload.payloadBlob,
                                urlString: requestDetails_1.url,
                                headers: requestDetails_1.hdrs,
                                _thePayload: thePayload,
                                _sendReason: sendReason,
                                timeout: _xhrTimeout
                            };
                            if (!isUndefined(_disableXhrSync)) {
                                orgPayloadData.disableXhrSync = !!_disableXhrSync;
                            }
                            if (useHeaders_1) {
                                if (!_hasHeader(orgPayloadData.headers, strCacheControl)) {
                                    orgPayloadData.headers[strCacheControl] = defaultCacheControl;
                                }
                                if (!_hasHeader(orgPayloadData.headers, strContentTypeHeader)) {
                                    orgPayloadData.headers[strContentTypeHeader] = defaultContentType;
                                }
                            }
                            var sender = null;
                            if (sendInterface_1) {
                                sender = function (payload) {
                                    _clockSkewManager.firstRequestSent();
                                    var onComplete = function (status, headers) {
                                        _retryRequestIfNeeded(status, headers, thePayload, sendReason);
                                    };
                                    var isSync = thePayload.isTeardown || thePayload.isSync;
                                    try {
                                        sendInterface_1.sendPOST(payload, onComplete, isSync);
                                        if (_self.sendListener) {
                                            _self.sendListener(orgPayloadData, payload, isSync, thePayload.isBeacon);
                                        }
                                    }
                                    catch (ex) {
                                        _postManager.diagLog().warnToConsole("Unexpected exception sending payload. Ex:" + dumpObj(ex));
                                        _doOnComplete(onComplete, 0, {});
                                    }
                                };
                            }
                            doPerf(_core, function () { return "HttpManager:_doPayloadSend.sender"; }, function () {
                                if (sender) {
                                    if (thePayload.sendType === 0 ) {
                                        _outstandingRequests++;
                                    }
                                    if (useSendHook_1 && !thePayload.isBeacon && sendInterface_1._transport !== 3 ) {
                                        var hookData_1 = {
                                            data: orgPayloadData.data,
                                            urlString: orgPayloadData.urlString,
                                            headers: extend({}, orgPayloadData.headers),
                                            timeout: orgPayloadData.timeout,
                                            disableXhrSync: orgPayloadData.disableXhrSync
                                        };
                                        var senderCalled_1 = false;
                                        doPerf(_core, function () { return "HttpManager:_doPayloadSend.sendHook"; }, function () {
                                            try {
                                                _self.sendHook(hookData_1, function (payload) {
                                                    senderCalled_1 = true;
                                                    if (!_customHttpInterface && !payload._thePayload) {
                                                        payload._thePayload = payload._thePayload || orgPayloadData._thePayload;
                                                        payload._sendReason = payload._sendReason || orgPayloadData._sendReason;
                                                    }
                                                    sender(payload);
                                                }, thePayload.isSync || thePayload.isTeardown);
                                            }
                                            catch (ex) {
                                                if (!senderCalled_1) {
                                                    sender(orgPayloadData);
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        sender(orgPayloadData);
                                    }
                                }
                            });
                        }, function () { return ({ thePayload: thePayload, serializationStart: serializationStart, serializationCompleted: serializationCompleted, sendReason: sendReason }); }, thePayload.isSync);
                    }
                    if (thePayload.sizeExceed && thePayload.sizeExceed.length > 0) {
                        _sendBatchesNotification(thePayload.sizeExceed, 8003 , thePayload.sendType);
                    }
                    if (thePayload.failedEvts && thePayload.failedEvts.length > 0) {
                        _sendBatchesNotification(thePayload.failedEvts, 8002 , thePayload.sendType);
                    }
                }
                function _addEventCompletedTimings(theEvents, sendEventCompleted) {
                    if (_enableEventTimings) {
                        arrForEach(theEvents, function (theEvent) {
                            var timings = theEvent.timings = theEvent.timings || {};
                            _setTimingValue(timings, "sendEventCompleted", sendEventCompleted);
                        });
                    }
                }
                function _retryRequestIfNeeded(status, headers, thePayload, sendReason) {
                    var reason = 9000 ;
                    var droppedBatches = null;
                    var isRetrying = false;
                    var backOffTrans = false;
                    try {
                        var shouldRetry = true;
                        if (typeof status !== strShimUndefined) {
                            if (headers) {
                                _clockSkewManager.setClockSkew(headers[strTimeDeltaHeader]);
                                var killDuration = headers[strKillDurationHeader] || headers["kill-duration-seconds"];
                                arrForEach(_killSwitch.setKillSwitchTenants(headers[strKillTokensHeader], killDuration), function (killToken) {
                                    arrForEach(thePayload.batches, function (theBatch) {
                                        if (theBatch.iKey() === killToken) {
                                            droppedBatches = droppedBatches || [];
                                            var removedEvents = theBatch.split(0);
                                            thePayload.numEvents -= removedEvents.count();
                                            droppedBatches.push(removedEvents);
                                        }
                                    });
                                });
                            }
                            if (status == 200 || status == 204) {
                                reason = 200 ;
                                return;
                            }
                            if (!retryPolicyShouldRetryForStatus(status) || thePayload.numEvents <= 0) {
                                shouldRetry = false;
                            }
                            reason = 9000  + (status % 1000);
                        }
                        if (shouldRetry) {
                            reason = 100 ;
                            var retryCount_1 = thePayload.retryCnt;
                            if (thePayload.sendType === 0 ) {
                                if (retryCount_1 < maxRequestRetriesBeforeBackoff) {
                                    isRetrying = true;
                                    _doAction(function () {
                                        if (thePayload.sendType === 0 ) {
                                            _outstandingRequests--;
                                        }
                                        _sendBatches(thePayload.batches, retryCount_1 + 1, thePayload.isTeardown, _isUnloading ? 2  : thePayload.sendType, 5 );
                                    }, _isUnloading, retryPolicyGetMillisToBackoffForRetry(retryCount_1));
                                }
                                else {
                                    backOffTrans = true;
                                    if (_isUnloading) {
                                        reason = 8001 ;
                                    }
                                }
                            }
                        }
                    }
                    finally {
                        if (!isRetrying) {
                            _clockSkewManager.setClockSkew();
                            _handleRequestFinished(thePayload, reason, sendReason, backOffTrans);
                        }
                        _sendBatchesNotification(droppedBatches, 8004 , thePayload.sendType);
                    }
                }
                function _handleRequestFinished(thePayload, batchReason, sendReason, backOffTrans) {
                    try {
                        if (backOffTrans) {
                            _postManager._backOffTransmission();
                        }
                        if (batchReason === 200 ) {
                            if (!backOffTrans && !thePayload.isSync) {
                                _postManager._clearBackOff();
                            }
                            _addCompleteTimings(thePayload.batches);
                        }
                        _sendBatchesNotification(thePayload.batches, batchReason, thePayload.sendType, true);
                    }
                    finally {
                        if (thePayload.sendType === 0 ) {
                            _outstandingRequests--;
                            if (sendReason !== 5 ) {
                                _self.sendQueuedRequests(thePayload.sendType, sendReason);
                            }
                        }
                    }
                }
                function _addCompleteTimings(theBatches) {
                    if (_enableEventTimings) {
                        var sendEventCompleted_1 = getTime();
                        arrForEach(theBatches, function (theBatch) {
                            if (theBatch && theBatch.count() > 0) {
                                _addEventCompletedTimings(theBatch.events(), sendEventCompleted_1);
                            }
                        });
                    }
                }
                function _doAction(cb, isSync, interval) {
                    if (isSync) {
                        cb();
                    }
                    else {
                        timeoutOverride.set(cb, interval);
                    }
                }
                function _convertAllHeadersToMap(headersString) {
                    var headers = {};
                    if (isString(headersString)) {
                        var headersArray = strTrim(headersString).split(/[\r\n]+/);
                        arrForEach(headersArray, function (headerEntry) {
                            if (headerEntry) {
                                var idx = headerEntry.indexOf(": ");
                                if (idx !== -1) {
                                    var header = strTrim(headerEntry.substring(0, idx)).toLowerCase();
                                    var value = strTrim(headerEntry.substring(idx + 1));
                                    headers[header] = value;
                                }
                                else {
                                    headers[strTrim(headerEntry)] = 1;
                                }
                            }
                        });
                    }
                    return headers;
                }
                function _getMsfpc(thePayload) {
                    for (var lp = 0; lp < thePayload.batches.length; lp++) {
                        var msfpc = thePayload.batches[lp].Msfpc();
                        if (msfpc) {
                            return encodeURIComponent(msfpc);
                        }
                    }
                    return "";
                }
                function _handleCollectorResponse(responseText) {
                    var responseHandlers = _self._responseHandlers;
                    try {
                        for (var i = 0; i < responseHandlers.length; i++) {
                            try {
                                responseHandlers[i](responseText);
                            }
                            catch (e) {
                                _throwInternal(_postManager.diagLog(), 1 , 519 , "Response handler failed: " + e);
                            }
                        }
                        if (responseText) {
                            var response = JSON.parse(responseText);
                            if (isValueAssigned(response.webResult) && isValueAssigned(response.webResult[strMsfpc])) {
                                _cookieMgr.set("MSFPC", response.webResult[strMsfpc], 365 * 86400);
                            }
                        }
                    }
                    catch (ex) {
                    }
                }
                function _sendBatchesNotification(theBatches, batchReason, sendType, sendSync) {
                    if (theBatches && theBatches.length > 0 && actions) {
                        var theAction_1 = actions[_getNotificationAction(batchReason)];
                        if (theAction_1) {
                            var isSyncRequest_1 = sendType !== 0 ;
                            doPerf(_core, function () { return "HttpManager:_sendBatchesNotification"; }, function () {
                                _doAction(function () {
                                    try {
                                        theAction_1.call(actions, theBatches, batchReason, isSyncRequest_1, sendType);
                                    }
                                    catch (e) {
                                        _throwInternal(_postManager.diagLog(), 1 , 74 , "send request notification failed: " + e);
                                    }
                                }, sendSync || isSyncRequest_1, 0);
                            }, function () { return ({ batches: _createDebugBatches(theBatches), reason: batchReason, isSync: isSyncRequest_1, sendSync: sendSync, sendType: sendType }); }, !isSyncRequest_1);
                        }
                    }
                }
                function _getNotificationAction(reason) {
                    var action = _eventActionMap[reason];
                    if (!isValueAssigned(action)) {
                        action = strOther;
                        if (reason >= 9000  && reason <= 9999 ) {
                            action = strResponseFail;
                        }
                        else if (reason >= 8000  && reason <= 8999 ) {
                            action = strDropped;
                        }
                        else if (reason >= 1000  && reason <= 1999 ) {
                            action = strSending;
                        }
                    }
                    return action;
                }
            });
        }
        return HttpManager;
    }());

    function defaultSetTimeout(callback, ms) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return setTimeout(callback, ms, args);
    }
    function defaultClearTimeout(timeoutId) {
        clearTimeout(timeoutId);
    }
    function createTimeoutWrapper(argSetTimeout, argClearTimeout) {
        return {
            set: argSetTimeout || defaultSetTimeout,
            clear: argClearTimeout || defaultClearTimeout
        };
    }

    var FlushCheckTimer = 0.250;
    var MaxNumberEventPerBatch = 500;
    var EventsDroppedAtOneTime = 20;
    var MaxSendAttempts = 6;
    var MaxSyncUnloadSendAttempts = 2;
    var MaxBackoffCount = 4;
    var MaxConnections = 2;
    var MaxRequestRetriesBeforeBackoff = 1;
    var strEventsDiscarded = "eventsDiscarded";
    var strOverrideInstrumentationKey = "overrideInstrumentationKey";
    var strMaxEventRetryAttempts = "maxEventRetryAttempts";
    var strMaxUnloadEventRetryAttempts = "maxUnloadEventRetryAttempts";
    var strAddUnloadCb = "addUnloadCb";
    var PostChannel = /** @class */ (function (_super) {
        __extendsFn(PostChannel, _super);
        function PostChannel() {
            var _this = _super.call(this) || this;
            _this.identifier = "PostChannel";
            _this.priority = 1011;
            _this.version = '3.2.2';
            var _config;
            var _isTeardownCalled = false;
            var _flushCallbackQueue = [];
            var _flushCallbackTimerId = null;
            var _paused = false;
            var _immediateQueueSize = 0;
            var _immediateQueueSizeLimit = 500;
            var _queueSize = 0;
            var _queueSizeLimit = 10000;
            var _profiles = {};
            var _currentProfile = RT_PROFILE;
            var _scheduledTimerId = null;
            var _immediateTimerId = null;
            var _currentBackoffCount = 0;
            var _timerCount = 0;
            var _xhrOverride;
            var _httpManager;
            var _batchQueues = {};
            var _autoFlushEventsLimit;
            var _autoFlushBatchLimit;
            var _delayedBatchSendLatency = -1;
            var _delayedBatchReason;
            var _optimizeObject = true;
            var _isPageUnloadTriggered = false;
            var _disableXhrSync = false;
            var _maxEventSendAttempts = MaxSendAttempts;
            var _maxUnloadEventSendAttempts = MaxSyncUnloadSendAttempts;
            var _evtNamespace;
            var _timeoutWrapper;
            dynamicProto(PostChannel, _this, function (_self, _base) {
                _initDefaults();
                _self["_getDbgPlgTargets"] = function () {
                    return [_httpManager];
                };
                _self.initialize = function (coreConfig, core, extensions) {
                    doPerf(core, function () { return "PostChannel:initialize"; }, function () {
                        var extendedCore = core;
                        _base.initialize(coreConfig, core, extensions);
                        try {
                            var hasAddUnloadCb = !!core[strAddUnloadCb];
                            _evtNamespace = mergeEvtNamespace(createUniqueNamespace(_self.identifier), core.evtNamespace && core.evtNamespace());
                            var ctx = _self._getTelCtx();
                            coreConfig.extensionConfig[_self.identifier] = coreConfig.extensionConfig[_self.identifier] || {};
                            _config = ctx.getExtCfg(_self.identifier);
                            _timeoutWrapper = createTimeoutWrapper(_config.setTimeoutOverride, _config.clearTimeoutOverride);
                            _optimizeObject = !_config.disableOptimizeObj && isChromium();
                            _hookWParam(extendedCore);
                            if (_config.eventsLimitInMem > 0) {
                                _queueSizeLimit = _config.eventsLimitInMem;
                            }
                            if (_config.immediateEventLimit > 0) {
                                _immediateQueueSizeLimit = _config.immediateEventLimit;
                            }
                            if (_config.autoFlushEventsLimit > 0) {
                                _autoFlushEventsLimit = _config.autoFlushEventsLimit;
                            }
                            _disableXhrSync = _config.disableXhrSync;
                            if (isNumber(_config[strMaxEventRetryAttempts])) {
                                _maxEventSendAttempts = _config[strMaxEventRetryAttempts];
                            }
                            if (isNumber(_config[strMaxUnloadEventRetryAttempts])) {
                                _maxUnloadEventSendAttempts = _config[strMaxUnloadEventRetryAttempts];
                            }
                            _setAutoLimits();
                            if (_config.httpXHROverride && _config.httpXHROverride.sendPOST) {
                                _xhrOverride = _config.httpXHROverride;
                            }
                            if (isValueAssigned(coreConfig.anonCookieName)) {
                                _httpManager.addQueryStringParameter("anoncknm", coreConfig.anonCookieName);
                            }
                            _httpManager.sendHook = _config.payloadPreprocessor;
                            _httpManager.sendListener = _config.payloadListener;
                            var endpointUrl = _config.overrideEndpointUrl ? _config.overrideEndpointUrl : coreConfig.endpointUrl;
                            _self._notificationManager = coreConfig.extensionConfig.NotificationManager;
                            _httpManager.initialize(endpointUrl, _self.core, _self, _xhrOverride, _config);
                            var excludePageUnloadEvents = coreConfig.disablePageUnloadEvents || [];
                            addPageUnloadEventListener(_handleUnloadEvents, excludePageUnloadEvents, _evtNamespace);
                            addPageHideEventListener(_handleUnloadEvents, excludePageUnloadEvents, _evtNamespace);
                            addPageShowEventListener(_handleShowEvents, coreConfig.disablePageShowEvents, _evtNamespace);
                        }
                        catch (e) {
                            _self.setInitialized(false);
                            throw e;
                        }
                    }, function () { return ({ coreConfig: coreConfig, core: core, extensions: extensions }); });
                };
                _self.processTelemetry = function (ev, itemCtx) {
                    setProcessTelemetryTimings(ev, _self.identifier);
                    itemCtx = _self._getTelCtx(itemCtx);
                    var channelConfig = itemCtx.getExtCfg(_self.identifier);
                    var disableTelemetry = !!_config.disableTelemetry;
                    if (channelConfig) {
                        disableTelemetry = disableTelemetry || !!channelConfig.disableTelemetry;
                    }
                    var event = ev;
                    if (!disableTelemetry && !_isTeardownCalled) {
                        if (_config[strOverrideInstrumentationKey]) {
                            event.iKey = _config[strOverrideInstrumentationKey];
                        }
                        if (channelConfig && channelConfig[strOverrideInstrumentationKey]) {
                            event.iKey = channelConfig[strOverrideInstrumentationKey];
                        }
                        _addEventToQueues(event, true);
                        if (_isPageUnloadTriggered) {
                            _releaseAllQueues(2 , 2 );
                        }
                        else {
                            _scheduleTimer();
                        }
                    }
                    _self.processNext(event, itemCtx);
                };
                _self._doTeardown = function (unloadCtx, unloadState) {
                    _releaseAllQueues(2 , 2 );
                    _isTeardownCalled = true;
                    _httpManager.teardown();
                    removePageUnloadEventListener(null, _evtNamespace);
                    removePageHideEventListener(null, _evtNamespace);
                    removePageShowEventListener(null, _evtNamespace);
                    _initDefaults();
                };
                function _hookWParam(extendedCore) {
                    var existingGetWParamMethod = extendedCore.getWParam;
                    extendedCore.getWParam = function () {
                        var wparam = 0;
                        if (_config.ignoreMc1Ms0CookieProcessing) {
                            wparam = wparam | 2;
                        }
                        return wparam | existingGetWParamMethod();
                    };
                }
                function _handleUnloadEvents(evt) {
                    var theEvt = evt || getWindow().event;
                    if (theEvt.type !== "beforeunload") {
                        _isPageUnloadTriggered = true;
                        _httpManager.setUnloading(_isPageUnloadTriggered);
                    }
                    _releaseAllQueues(2 , 2 );
                }
                function _handleShowEvents(evt) {
                    _isPageUnloadTriggered = false;
                    _httpManager.setUnloading(_isPageUnloadTriggered);
                }
                function _addEventToQueues(event, append) {
                    if (!event.sendAttempt) {
                        event.sendAttempt = 0;
                    }
                    if (!event.latency) {
                        event.latency = 1 ;
                    }
                    if (event.ext && event.ext["trace"]) {
                        delete (event.ext["trace"]);
                    }
                    if (event.ext && event.ext["user"] && event.ext["user"]["id"]) {
                        delete (event.ext["user"]["id"]);
                    }
                    if (_optimizeObject) {
                        event.ext = optimizeObject(event.ext);
                        if (event.baseData) {
                            event.baseData = optimizeObject(event.baseData);
                        }
                        if (event.data) {
                            event.data = optimizeObject(event.data);
                        }
                    }
                    if (event.sync) {
                        if (_currentBackoffCount || _paused) {
                            event.latency = 3 ;
                            event.sync = false;
                        }
                        else {
                            if (_httpManager) {
                                if (_optimizeObject) {
                                    event = optimizeObject(event);
                                }
                                _httpManager.sendSynchronousBatch(EventBatch.create(event.iKey, [event]), event.sync === true ? 1  : event.sync, 3 );
                                return;
                            }
                        }
                    }
                    var evtLatency = event.latency;
                    var queueSize = _queueSize;
                    var queueLimit = _queueSizeLimit;
                    if (evtLatency === 4 ) {
                        queueSize = _immediateQueueSize;
                        queueLimit = _immediateQueueSizeLimit;
                    }
                    var eventDropped = false;
                    if (queueSize < queueLimit) {
                        eventDropped = !_addEventToProperQueue(event, append);
                    }
                    else {
                        var dropLatency = 1 ;
                        var dropNumber = EventsDroppedAtOneTime;
                        if (evtLatency === 4 ) {
                            dropLatency = 4 ;
                            dropNumber = 1;
                        }
                        eventDropped = true;
                        if (_dropEventWithLatencyOrLess(event.iKey, event.latency, dropLatency, dropNumber)) {
                            eventDropped = !_addEventToProperQueue(event, append);
                        }
                    }
                    if (eventDropped) {
                        _notifyEvents(strEventsDiscarded, [event], EventsDiscardedReason.QueueFull);
                    }
                }
                _self.setEventQueueLimits = function (eventLimit, autoFlushLimit) {
                    _queueSizeLimit = eventLimit > 0 ? eventLimit : 10000;
                    _autoFlushEventsLimit = autoFlushLimit > 0 ? autoFlushLimit : 0;
                    _setAutoLimits();
                    var doFlush = _queueSize > eventLimit;
                    if (!doFlush && _autoFlushBatchLimit > 0) {
                        for (var latency = 1 ; !doFlush && latency <= 3 ; latency++) {
                            var batchQueue = _batchQueues[latency];
                            if (batchQueue && batchQueue.batches) {
                                arrForEach(batchQueue.batches, function (theBatch) {
                                    if (theBatch && theBatch.count() >= _autoFlushBatchLimit) {
                                        doFlush = true;
                                    }
                                });
                            }
                        }
                    }
                    _performAutoFlush(true, doFlush);
                };
                _self.pause = function () {
                    _clearScheduledTimer();
                    _paused = true;
                    _httpManager.pause();
                };
                _self.resume = function () {
                    _paused = false;
                    _httpManager.resume();
                    _scheduleTimer();
                };
                _self.addResponseHandler = function (responseHandler) {
                    _httpManager._responseHandlers.push(responseHandler);
                };
                _self._loadTransmitProfiles = function (profiles) {
                    _resetTransmitProfiles();
                    objForEachKey(profiles, function (profileName, profileValue) {
                        var profLen = profileValue.length;
                        if (profLen >= 2) {
                            var directValue = (profLen > 2 ? profileValue[2] : 0);
                            profileValue.splice(0, profLen - 2);
                            if (profileValue[1] < 0) {
                                profileValue[0] = -1;
                            }
                            if (profileValue[1] > 0 && profileValue[0] > 0) {
                                var timerMultiplier = profileValue[0] / profileValue[1];
                                profileValue[0] = Math.ceil(timerMultiplier) * profileValue[1];
                            }
                            if (directValue >= 0 && profileValue[1] >= 0 && directValue > profileValue[1]) {
                                directValue = profileValue[1];
                            }
                            profileValue.push(directValue);
                            _profiles[profileName] = profileValue;
                        }
                    });
                };
                _self.flush = function (async, callback, sendReason) {
                    if (async === void 0) { async = true; }
                    if (!_paused) {
                        _clearScheduledTimer();
                        sendReason = sendReason || 1 ;
                        if (async) {
                            _queueBatches(1 , 0 , sendReason);
                            _resetQueueCounts();
                            if (_flushCallbackTimerId == null) {
                                _flushCallbackTimerId = _createTimer(function () {
                                    _flushImpl(callback, sendReason);
                                }, 0);
                            }
                            else {
                                _flushCallbackQueue.push(callback);
                            }
                        }
                        else {
                            _sendEventsForLatencyAndAbove(1 , 1 , sendReason);
                            if (callback !== null && callback !== undefined) {
                                callback();
                            }
                        }
                    }
                };
                _self.setMsaAuthTicket = function (ticket) {
                    _httpManager.addHeader(strMsaDeviceTicket, ticket);
                };
                _self.hasEvents = _hasEvents;
                _self._setTransmitProfile = function (profileName) {
                    if (_currentProfile !== profileName && _profiles[profileName] !== undefined) {
                        _clearScheduledTimer();
                        _currentProfile = profileName;
                        _scheduleTimer();
                    }
                };
                function _sendEventsForLatencyAndAbove(latency, sendType, sendReason) {
                    var queued = _queueBatches(latency, sendType, sendReason);
                    _httpManager.sendQueuedRequests(sendType, sendReason);
                    return queued;
                }
                function _hasEvents() {
                    return _queueSize > 0;
                }
                function _scheduleTimer() {
                    if (_delayedBatchSendLatency >= 0 && _queueBatches(_delayedBatchSendLatency, 0 , _delayedBatchReason)) {
                        _httpManager.sendQueuedRequests(0 , _delayedBatchReason);
                    }
                    if (_immediateQueueSize > 0 && !_immediateTimerId && !_paused) {
                        var immediateTimeOut = _profiles[_currentProfile][2];
                        if (immediateTimeOut >= 0) {
                            _immediateTimerId = _createTimer(function () {
                                _immediateTimerId = null;
                                _sendEventsForLatencyAndAbove(4 , 0 , 1 );
                                _scheduleTimer();
                            }, immediateTimeOut);
                        }
                    }
                    var timeOut = _profiles[_currentProfile][1];
                    if (!_scheduledTimerId && !_flushCallbackTimerId && timeOut >= 0 && !_paused) {
                        if (_hasEvents()) {
                            _scheduledTimerId = _createTimer(function () {
                                _scheduledTimerId = null;
                                _sendEventsForLatencyAndAbove(_timerCount === 0 ? 3  : 1 , 0 , 1 );
                                _timerCount++;
                                _timerCount %= 2;
                                _scheduleTimer();
                            }, timeOut);
                        }
                        else {
                            _timerCount = 0;
                        }
                    }
                }
                _self._backOffTransmission = function () {
                    if (_currentBackoffCount < MaxBackoffCount) {
                        _currentBackoffCount++;
                        _clearScheduledTimer();
                        _scheduleTimer();
                    }
                };
                _self._clearBackOff = function () {
                    if (_currentBackoffCount) {
                        _currentBackoffCount = 0;
                        _clearScheduledTimer();
                        _scheduleTimer();
                    }
                };
                function _initDefaults() {
                    _config = null;
                    _isTeardownCalled = false;
                    _flushCallbackQueue = [];
                    _flushCallbackTimerId = null;
                    _paused = false;
                    _immediateQueueSize = 0;
                    _immediateQueueSizeLimit = 500;
                    _queueSize = 0;
                    _queueSizeLimit = 10000;
                    _profiles = {};
                    _currentProfile = RT_PROFILE;
                    _scheduledTimerId = null;
                    _immediateTimerId = null;
                    _currentBackoffCount = 0;
                    _timerCount = 0;
                    _xhrOverride = null;
                    _batchQueues = {};
                    _autoFlushEventsLimit = undefined;
                    _autoFlushBatchLimit = 0;
                    _delayedBatchSendLatency = -1;
                    _delayedBatchReason = null;
                    _optimizeObject = true;
                    _isPageUnloadTriggered = false;
                    _disableXhrSync = false;
                    _maxEventSendAttempts = MaxSendAttempts;
                    _maxUnloadEventSendAttempts = MaxSyncUnloadSendAttempts;
                    _evtNamespace = null;
                    _timeoutWrapper = createTimeoutWrapper();
                    _httpManager = new HttpManager(MaxNumberEventPerBatch, MaxConnections, MaxRequestRetriesBeforeBackoff, {
                        requeue: _requeueEvents,
                        send: _sendingEvent,
                        sent: _eventsSentEvent,
                        drop: _eventsDropped,
                        rspFail: _eventsResponseFail,
                        oth: _otherEvent
                    }, _timeoutWrapper);
                    _initializeProfiles();
                    _clearQueues();
                    _setAutoLimits();
                }
                function _createTimer(theTimerFunc, timeOut) {
                    if (timeOut === 0 && _currentBackoffCount) {
                        timeOut = 1;
                    }
                    var timerMultiplier = 1000;
                    if (_currentBackoffCount) {
                        timerMultiplier = retryPolicyGetMillisToBackoffForRetry(_currentBackoffCount - 1);
                    }
                    return _timeoutWrapper.set(theTimerFunc, timeOut * timerMultiplier);
                }
                function _clearScheduledTimer() {
                    if (_scheduledTimerId !== null) {
                        _timeoutWrapper.clear(_scheduledTimerId);
                        _scheduledTimerId = null;
                        _timerCount = 0;
                    }
                }
                function _releaseAllQueues(sendType, sendReason) {
                    _clearScheduledTimer();
                    if (_flushCallbackTimerId) {
                        _timeoutWrapper.clear(_flushCallbackTimerId);
                        _flushCallbackTimerId = null;
                    }
                    if (!_paused) {
                        _sendEventsForLatencyAndAbove(1 , sendType, sendReason);
                    }
                }
                function _clearQueues() {
                    _batchQueues[4 ] = {
                        batches: [],
                        iKeyMap: {}
                    };
                    _batchQueues[3 ] = {
                        batches: [],
                        iKeyMap: {}
                    };
                    _batchQueues[2 ] = {
                        batches: [],
                        iKeyMap: {}
                    };
                    _batchQueues[1 ] = {
                        batches: [],
                        iKeyMap: {}
                    };
                }
                function _getEventBatch(iKey, latency, create) {
                    var batchQueue = _batchQueues[latency];
                    if (!batchQueue) {
                        latency = 1 ;
                        batchQueue = _batchQueues[latency];
                    }
                    var eventBatch = batchQueue.iKeyMap[iKey];
                    if (!eventBatch && create) {
                        eventBatch = EventBatch.create(iKey);
                        batchQueue.batches.push(eventBatch);
                        batchQueue.iKeyMap[iKey] = eventBatch;
                    }
                    return eventBatch;
                }
                function _performAutoFlush(isAsync, doFlush) {
                    if (_httpManager.canSendRequest() && !_currentBackoffCount) {
                        if (_autoFlushEventsLimit > 0 && _queueSize > _autoFlushEventsLimit) {
                            doFlush = true;
                        }
                        if (doFlush && _flushCallbackTimerId == null) {
                            _self.flush(isAsync, null, 20 );
                        }
                    }
                }
                function _addEventToProperQueue(event, append) {
                    if (_optimizeObject) {
                        event = optimizeObject(event);
                    }
                    var latency = event.latency;
                    var eventBatch = _getEventBatch(event.iKey, latency, true);
                    if (eventBatch.addEvent(event)) {
                        if (latency !== 4 ) {
                            _queueSize++;
                            if (append && event.sendAttempt === 0) {
                                _performAutoFlush(!event.sync, _autoFlushBatchLimit > 0 && eventBatch.count() >= _autoFlushBatchLimit);
                            }
                        }
                        else {
                            _immediateQueueSize++;
                        }
                        return true;
                    }
                    return false;
                }
                function _dropEventWithLatencyOrLess(iKey, latency, currentLatency, dropNumber) {
                    while (currentLatency <= latency) {
                        var eventBatch = _getEventBatch(iKey, latency, true);
                        if (eventBatch && eventBatch.count() > 0) {
                            var droppedEvents = eventBatch.split(0, dropNumber);
                            var droppedCount = droppedEvents.count();
                            if (droppedCount > 0) {
                                if (currentLatency === 4 ) {
                                    _immediateQueueSize -= droppedCount;
                                }
                                else {
                                    _queueSize -= droppedCount;
                                }
                                _notifyBatchEvents(strEventsDiscarded, [droppedEvents], EventsDiscardedReason.QueueFull);
                                return true;
                            }
                        }
                        currentLatency++;
                    }
                    _resetQueueCounts();
                    return false;
                }
                function _resetQueueCounts() {
                    var immediateQueue = 0;
                    var normalQueue = 0;
                    var _loop_1 = function (latency) {
                        var batchQueue = _batchQueues[latency];
                        if (batchQueue && batchQueue.batches) {
                            arrForEach(batchQueue.batches, function (theBatch) {
                                if (latency === 4 ) {
                                    immediateQueue += theBatch.count();
                                }
                                else {
                                    normalQueue += theBatch.count();
                                }
                            });
                        }
                    };
                    for (var latency = 1 ; latency <= 4 ; latency++) {
                        _loop_1(latency);
                    }
                    _queueSize = normalQueue;
                    _immediateQueueSize = immediateQueue;
                }
                function _queueBatches(latency, sendType, sendReason) {
                    var eventsQueued = false;
                    var isAsync = sendType === 0 ;
                    if (!isAsync || _httpManager.canSendRequest()) {
                        doPerf(_self.core, function () { return "PostChannel._queueBatches"; }, function () {
                            var droppedEvents = [];
                            var latencyToProcess = 4 ;
                            while (latencyToProcess >= latency) {
                                var batchQueue = _batchQueues[latencyToProcess];
                                if (batchQueue && batchQueue.batches && batchQueue.batches.length > 0) {
                                    arrForEach(batchQueue.batches, function (theBatch) {
                                        if (!_httpManager.addBatch(theBatch)) {
                                            droppedEvents = droppedEvents.concat(theBatch.events());
                                        }
                                        else {
                                            eventsQueued = eventsQueued || (theBatch && theBatch.count() > 0);
                                        }
                                        if (latencyToProcess === 4 ) {
                                            _immediateQueueSize -= theBatch.count();
                                        }
                                        else {
                                            _queueSize -= theBatch.count();
                                        }
                                    });
                                    batchQueue.batches = [];
                                    batchQueue.iKeyMap = {};
                                }
                                latencyToProcess--;
                            }
                            if (droppedEvents.length > 0) {
                                _notifyEvents(strEventsDiscarded, droppedEvents, EventsDiscardedReason.KillSwitch);
                            }
                            if (eventsQueued && _delayedBatchSendLatency >= latency) {
                                _delayedBatchSendLatency = -1;
                                _delayedBatchReason = 0 ;
                            }
                        }, function () { return ({ latency: latency, sendType: sendType, sendReason: sendReason }); }, !isAsync);
                    }
                    else {
                        _delayedBatchSendLatency = _delayedBatchSendLatency >= 0 ? Math.min(_delayedBatchSendLatency, latency) : latency;
                        _delayedBatchReason = Math.max(_delayedBatchReason, sendReason);
                    }
                    return eventsQueued;
                }
                function _flushImpl(callback, sendReason) {
                    _sendEventsForLatencyAndAbove(1 , 0 , sendReason);
                    _waitForIdleManager(function () {
                        if (callback) {
                            callback();
                        }
                        if (_flushCallbackQueue.length > 0) {
                            _flushCallbackTimerId = _createTimer(function () { return _flushImpl(_flushCallbackQueue.shift(), sendReason); }, 0);
                        }
                        else {
                            _flushCallbackTimerId = null;
                            if (_hasEvents()) {
                                _scheduleTimer();
                            }
                        }
                    });
                }
                function _waitForIdleManager(callback) {
                    if (_httpManager.isCompletelyIdle()) {
                        callback();
                    }
                    else {
                        _flushCallbackTimerId = _createTimer(function () {
                            _waitForIdleManager(callback);
                        }, FlushCheckTimer);
                    }
                }
                function _resetTransmitProfiles() {
                    _clearScheduledTimer();
                    _initializeProfiles();
                    _currentProfile = RT_PROFILE;
                    _scheduleTimer();
                }
                function _initializeProfiles() {
                    _profiles = {};
                    _profiles[RT_PROFILE] = [2, 1, 0];
                    _profiles[NRT_PROFILE] = [6, 3, 0];
                    _profiles[BE_PROFILE] = [18, 9, 0];
                }
                function _requeueEvents(batches, reason) {
                    var droppedEvents = [];
                    var maxSendAttempts = _maxEventSendAttempts;
                    if (_isPageUnloadTriggered) {
                        maxSendAttempts = _maxUnloadEventSendAttempts;
                    }
                    arrForEach(batches, function (theBatch) {
                        if (theBatch && theBatch.count() > 0) {
                            arrForEach(theBatch.events(), function (theEvent) {
                                if (theEvent) {
                                    if (theEvent.sync) {
                                        theEvent.latency = 4 ;
                                        theEvent.sync = false;
                                    }
                                    if (theEvent.sendAttempt < maxSendAttempts) {
                                        setProcessTelemetryTimings(theEvent, _self.identifier);
                                        _addEventToQueues(theEvent, false);
                                    }
                                    else {
                                        droppedEvents.push(theEvent);
                                    }
                                }
                            });
                        }
                    });
                    if (droppedEvents.length > 0) {
                        _notifyEvents(strEventsDiscarded, droppedEvents, EventsDiscardedReason.NonRetryableStatus);
                    }
                    if (_isPageUnloadTriggered) {
                        _releaseAllQueues(2 , 2 );
                    }
                }
                function _callNotification(evtName, theArgs) {
                    var manager = (_self._notificationManager || {});
                    var notifyFunc = manager[evtName];
                    if (notifyFunc) {
                        try {
                            notifyFunc.apply(manager, theArgs);
                        }
                        catch (e) {
                            _throwInternal(_self.diagLog(), 1 , 74 , evtName + " notification failed: " + e);
                        }
                    }
                }
                function _notifyEvents(evtName, theEvents) {
                    var extraArgs = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        extraArgs[_i - 2] = arguments[_i];
                    }
                    if (theEvents && theEvents.length > 0) {
                        _callNotification(evtName, [theEvents].concat(extraArgs));
                    }
                }
                function _notifyBatchEvents(evtName, batches) {
                    var extraArgs = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        extraArgs[_i - 2] = arguments[_i];
                    }
                    if (batches && batches.length > 0) {
                        arrForEach(batches, function (theBatch) {
                            if (theBatch && theBatch.count() > 0) {
                                _callNotification(evtName, [theBatch.events()].concat(extraArgs));
                            }
                        });
                    }
                }
                function _sendingEvent(batches, reason, isSyncRequest) {
                    if (batches && batches.length > 0) {
                        _callNotification("eventsSendRequest", [(reason >= 1000  && reason <= 1999  ?
                                reason - 1000  :
                                0 ), isSyncRequest !== true]);
                    }
                }
                function _eventsSentEvent(batches, reason) {
                    _notifyBatchEvents("eventsSent", batches, reason);
                    _scheduleTimer();
                }
                function _eventsDropped(batches, reason) {
                    _notifyBatchEvents(strEventsDiscarded, batches, (reason >= 8000  && reason <= 8999  ?
                        reason - 8000  :
                        EventsDiscardedReason.Unknown));
                }
                function _eventsResponseFail(batches) {
                    _notifyBatchEvents(strEventsDiscarded, batches, EventsDiscardedReason.NonRetryableStatus);
                    _scheduleTimer();
                }
                function _otherEvent(batches, reason) {
                    _notifyBatchEvents(strEventsDiscarded, batches, EventsDiscardedReason.Unknown);
                    _scheduleTimer();
                }
                function _setAutoLimits() {
                    if (!_config || !_config.disableAutoBatchFlushLimit) {
                        _autoFlushBatchLimit = Math.max(MaxNumberEventPerBatch * (MaxConnections + 1), _queueSizeLimit / 6);
                    }
                    else {
                        _autoFlushBatchLimit = 0;
                    }
                }
                objDefineAccessors(_self, "_setTimeoutOverride", function () { return _timeoutWrapper.set; }, function (value) {
                    _timeoutWrapper = createTimeoutWrapper(value, _timeoutWrapper.clear);
                });
                objDefineAccessors(_self, "_clearTimeoutOverride", function () { return _timeoutWrapper.clear; }, function (value) {
                    _timeoutWrapper = createTimeoutWrapper(_timeoutWrapper.set, value);
                });
            });
            return _this;
        }
        return PostChannel;
    }(BaseTelemetryPlugin));
    var PostChannel$1 = PostChannel;

    exports.BE_PROFILE = BE_PROFILE;
    exports.NRT_PROFILE = NRT_PROFILE;
    exports.PostChannel = PostChannel$1;
    exports.RT_PROFILE = RT_PROFILE;

    (function(obj, prop, descriptor) { /* ai_es3_polyfil defineProperty */ var func = Object["defineProperty"]; if (func) { try { return func(obj, prop, descriptor); } catch(e) { /* IE8 defines defineProperty, but will throw */ } } if (descriptor && typeof descriptor.value !== undefined) { obj[prop] = descriptor.value; } return obj; })(exports, '__esModule', { value: true });

})(this.oneDS = this.oneDS || {});//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/1ds-post-js/bundle/ms.post-3.2.2.gbl.js.map
