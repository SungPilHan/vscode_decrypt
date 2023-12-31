/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


import { strShimFunction, strShimPrototype } from "@microsoft/applicationinsights-shims";
import { hasOwnProperty, _getObjProto } from "./HelperFuncs";
import { getGlobalInst } from "./EnvUtils";
var aiInstrumentHooks = "_aiHooks";
var cbNames = [
    "req", "rsp", "hkErr", "fnErr"
];
/** @ignore */
function _arrLoop(arr, fn) {
    if (arr) {
        for (var lp = 0; lp < arr.length; lp++) {
            if (fn(arr[lp], lp)) {
                break;
            }
        }
    }
}
/** @ignore */
function _doCallbacks(hooks, callDetails, cbArgs, hookCtx, type) {
    if (type >= 0 /* Request */ && type <= 2 /* HookError */) {
        _arrLoop(hooks, function (hook, idx) {
            var cbks = hook.cbks;
            var cb = cbks[cbNames[type]];
            if (cb) {
                // Set the specific hook context implementation using a lazy creation pattern
                callDetails.ctx = function () {
                    var ctx = hookCtx[idx] = (hookCtx[idx] || {});
                    return ctx;
                };
                try {
                    cb.apply(callDetails.inst, cbArgs);
                }
                catch (err) {
                    var orgEx = callDetails.err;
                    try {
                        // Report Hook error via the callback
                        var hookErrorCb = cbks[cbNames[2 /* HookError */]];
                        if (hookErrorCb) {
                            callDetails.err = err;
                            hookErrorCb.apply(callDetails.inst, cbArgs);
                        }
                    }
                    catch (e) {
                        // Not much we can do here -- swallowing the exception to avoid crashing the hosting app
                    }
                    finally {
                        // restore the original exception (if any)
                        callDetails.err = orgEx;
                    }
                }
            }
        });
    }
}
/** @ignore */
function _createFunctionHook(aiHook) {
    // Define a temporary method that queues-up a the real method call
    return function () {
        var funcThis = this;
        // Capture the original arguments passed to the method
        var orgArgs = arguments;
        var hooks = aiHook.h;
        var funcArgs = {
            name: aiHook.n,
            inst: funcThis,
            ctx: null,
            set: _replaceArg
        };
        var hookCtx = [];
        var cbArgs = _createArgs([funcArgs], orgArgs);
        funcArgs.evt = getGlobalInst("event");
        function _createArgs(target, theArgs) {
            _arrLoop(theArgs, function (arg) {
                target.push(arg);
            });
            return target;
        }
        function _replaceArg(idx, value) {
            orgArgs = _createArgs([], orgArgs);
            orgArgs[idx] = value;
            cbArgs = _createArgs([funcArgs], orgArgs);
        }
        // Call the pre-request hooks
        _doCallbacks(hooks, funcArgs, cbArgs, hookCtx, 0 /* Request */);
        // Call the original function was called
        var theFunc = aiHook.f;
        if (theFunc) {
            try {
                funcArgs.rslt = theFunc.apply(funcThis, orgArgs);
            }
            catch (err) {
                // Report the request callback
                funcArgs.err = err;
                _doCallbacks(hooks, funcArgs, cbArgs, hookCtx, 3 /* FunctionError */);
                // rethrow the original exception so anyone listening for it can catch the exception
                throw err;
            }
        }
        // Call the post-request hooks
        _doCallbacks(hooks, funcArgs, cbArgs, hookCtx, 1 /* Response */);
        return funcArgs.rslt;
    };
}
/** @ignore */
function _getOwner(target, name, checkPrototype) {
    var owner = null;
    if (target) {
        if (hasOwnProperty(target, name)) {
            owner = target;
        }
        else if (checkPrototype) {
            owner = _getOwner(_getObjProto(target), name, false);
        }
    }
    return owner;
}
/**
 * Intercept the named prototype functions for the target class / object
 * @param target - The target object
 * @param funcName - The function name
 * @param callbacks - The callbacks to configure and call whenever the function is called
 */
export function InstrumentProto(target, funcName, callbacks) {
    if (target) {
        return InstrumentFunc(target[strShimPrototype], funcName, callbacks, false);
    }
    return null;
}
/**
 * Intercept the named prototype functions for the target class / object
 * @param target - The target object
 * @param funcNames - The function names to intercept and call
 * @param callbacks - The callbacks to configure and call whenever the function is called
 */
export function InstrumentProtos(target, funcNames, callbacks) {
    if (target) {
        return InstrumentFuncs(target[strShimPrototype], funcNames, callbacks, false);
    }
    return null;
}
function _createInstrumentHook(owner, funcName, fn, callbacks) {
    var aiHook = fn && fn[aiInstrumentHooks];
    if (!aiHook) {
        // Only hook the function once
        aiHook = {
            i: 0,
            n: funcName,
            f: fn,
            h: []
        };
        // Override (hook) the original function
        var newFunc = _createFunctionHook(aiHook);
        newFunc[aiInstrumentHooks] = aiHook; // Tag and store the function hooks
        owner[funcName] = newFunc;
    }
    var theHook = {
        // tslint:disable:object-literal-shorthand
        id: aiHook.i,
        cbks: callbacks,
        rm: function () {
            // DO NOT Use () => { shorthand for the function as the this gets replaced
            // with the outer this and not the this for theHook instance.
            var id = this.id;
            _arrLoop(aiHook.h, function (hook, idx) {
                if (hook.id === id) {
                    aiHook.h.splice(idx, 1);
                    return 1;
                }
            });
        }
        // tslint:enable:object-literal-shorthand
    };
    aiHook.i++;
    aiHook.h.push(theHook);
    return theHook;
}
/**
 * Intercept the named prototype functions for the target class / object
 * @param target - The target object
 * @param funcName - The function name
 * @param callbacks - The callbacks to configure and call whenever the function is called
 * @param checkPrototype - If the function doesn't exist on the target should it attempt to hook the prototype function
 */
export function InstrumentFunc(target, funcName, callbacks, checkPrototype) {
    if (checkPrototype === void 0) { checkPrototype = true; }
    if (target && funcName && callbacks) {
        var owner = _getOwner(target, funcName, checkPrototype);
        if (owner) {
            var fn = owner[funcName];
            if (typeof fn === strShimFunction) {
                return _createInstrumentHook(owner, funcName, fn, callbacks);
            }
        }
    }
    return null;
}
/**
 * Intercept the named functions for the target class / object
 * @param target - The target object
 * @param funcNames - The function names to intercept and call
 * @param callbacks - The callbacks to configure and call whenever the function is called
 * @param checkPrototype - If the function doesn't exist on the target should it attempt to hook the prototype function
 */
export function InstrumentFuncs(target, funcNames, callbacks, checkPrototype) {
    if (checkPrototype === void 0) { checkPrototype = true; }
    var hooks = null;
    _arrLoop(funcNames, function (funcName) {
        var hook = InstrumentFunc(target, funcName, callbacks, checkPrototype);
        if (hook) {
            if (!hooks) {
                hooks = [];
            }
            hooks.push(hook);
        }
    });
    return hooks;
}
/**
 * Add an instrumentation hook to the provided named "event" for the target class / object, this doesn't check whether the
 * named "event" is in fact a function and just assigns the instrumentation hook to the target[evtName]
 * @param target - The target object
 * @param evtName - The name of the event
 * @param callbacks - The callbacks to configure and call whenever the function is called
 * @param checkPrototype - If the function doesn't exist on the target should it attempt to hook the prototype function
 */
export function InstrumentEvent(target, evtName, callbacks, checkPrototype) {
    if (target && evtName && callbacks) {
        var owner = _getOwner(target, evtName, checkPrototype) || target;
        if (owner) {
            return _createInstrumentHook(owner, evtName, owner[evtName], callbacks);
        }
    }
    return null;
}//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/InstrumentHooks.js.map