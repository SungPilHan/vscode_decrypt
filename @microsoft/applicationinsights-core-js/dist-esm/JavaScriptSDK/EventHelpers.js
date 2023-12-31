/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


import { createElmNodeData, createUniqueNamespace } from "./DataCacheHelper";
import { getDocument, getWindow } from "./EnvUtils";
import { arrForEach, arrIndexOf, isArray, objForEachKey, objKeys } from "./HelperFuncs";
// Added to help with minfication
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
            // We may only have the namespace and not an eventName
            eventName = (eventName || "") + theNamespace_1;
        }
    }
    var parsedEvent = (eventNamespace.exec(eventName || "") || []);
    return {
        type: parsedEvent[1],
        ns: ((parsedEvent[2] || "").replace(rRemoveEmptyNs, ".").replace(rRemoveTrailingEmptyNs, "").split(".").sort()).join(".")
    };
}
/**
 * Get all of the registered events on the target object, this is primarily used for testing cleanup but may also be used by
 * applications to remove their own events
 * @param target - The EventTarget that has registered events
 * @param eventName - [Optional] The name of the event to return the registered handlers and full name (with namespaces)
 * @param evtNamespace - [Optional] Additional namespace(s) to append to the event listeners so they can be uniquely identified and removed based on this namespace,
 * if the eventName also includes a namespace the namespace(s) are merged into a single namespace
 */
export function __getRegisteredEvents(target, eventName, evtNamespace) {
    var theEvents = [];
    var eventCache = elmNodeData.get(target, strEvents, {}, false);
    var evtName = _getEvtNamespace(eventName, evtNamespace);
    objForEachKey(eventCache, function (evtType, registeredEvents) {
        arrForEach(registeredEvents, function (value) {
            if (!evtName.type || evtName.type === value.evtName.type) {
                if (!evtName.ns || evtName.ns === evtName.ns) {
                    theEvents.push({
                        name: value.evtName.type + (value.evtName.ns ? "." + value.evtName.ns : ""),
                        handler: value.handler
                    });
                }
            }
        });
    });
    return theEvents;
}
// Exported for internal unit testing only
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
            // all browsers except IE before version 9
            obj[strAddEventHelper](evtName.type, handlerRef, useCapture);
            result = true;
        }
        else if (obj[strAttachEvent]) {
            // IE before version 9
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
                    // Remove the registered event
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
        // Cleanup
        if (objKeys(eventCache).length === 0) {
            elmNodeData.kill(target, strEvents);
        }
    }
}
export function mergeEvtNamespace(theNamespace, namespaces) {
    var newNamespaces;
    if (namespaces) {
        if (isArray(namespaces)) {
            newNamespaces = [theNamespace].concat(namespaces);
        }
        else {
            newNamespaces = [theNamespace, namespaces];
        }
        // resort the namespaces so they are always in order
        newNamespaces = (_getEvtNamespace("xx", newNamespaces).ns).split(".");
    }
    else {
        newNamespaces = theNamespace;
    }
    return newNamespaces;
}
/**
 * Binds the specified function to an event, so that the function gets called whenever the event fires on the object
 * @param obj Object to add the event too.
 * @param eventName String that specifies any of the standard DHTML Events without "on" prefix, if may also include an optional (dot "." prefixed)
 * namespaces "click" "click.mynamespace" in addition to specific namespaces.
 * @param handlerRef Pointer that specifies the function to call when event fires
 * @param evtNamespace - [Optional] Additional namespace(s) to append to the event listeners so they can be uniquely identified and removed based on this namespace,
 * if the eventName also includes a namespace the namespace(s) are merged into a single namespace
 * @param useCapture [Optional] Defaults to false
 * @returns True if the function was bound successfully to the event, otherwise false
 */
export function eventOn(target, eventName, handlerRef, evtNamespace, useCapture) {
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
            // Just Ignore any error so that we don't break any execution path
        }
    }
    return result;
}
/**
 * Removes an event handler for the specified event
 * @param Object to remove the event from
 * @param eventName {string} - The name of the event, with optional namespaces or just the namespaces,
 * such as "click", "click.mynamespace" or ".mynamespace"
 * @param handlerRef {any} - The callback function that needs to be removed from the given event, when using a
 * namespace (with or without a qualifying event) this may be null to remove all previously attached event handlers
 * otherwise this will only remove events with this specific handler.
 * @param evtNamespace - [Optional] Additional namespace(s) to append to the event listeners so they can be uniquely identified and removed based on this namespace,
 * if the eventName also includes a namespace the namespace(s) are merged into a single namespace
 * @param useCapture [Optional] Defaults to false
 */
export function eventOff(target, eventName, handlerRef, evtNamespace, useCapture) {
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
                // fallback to try and remove as requested
                _doDetach(target, evtName_1, handlerRef, useCapture);
            }
        }
        catch (e) {
            // Just Ignore any error so that we don't break any execution path
        }
    }
}
/**
 * Binds the specified function to an event, so that the function gets called whenever the event fires on the object
 * @param obj Object to add the event too.
 * @param eventNameWithoutOn String that specifies any of the standard DHTML Events without "on" prefix and optional (dot "." prefixed) namespaces "click" "click.mynamespace".
 * @param handlerRef Pointer that specifies the function to call when event fires
 * @param useCapture [Optional] Defaults to false
 * @returns True if the function was bound successfully to the event, otherwise false
 */
export function attachEvent(obj, eventNameWithoutOn, handlerRef, useCapture) {
    if (useCapture === void 0) { useCapture = false; }
    return eventOn(obj, eventNameWithoutOn, handlerRef, null, useCapture);
}
/**
 * Removes an event handler for the specified event
 * @param Object to remove the event from
 * @param eventNameWithoutOn {string} - The name of the event, with optional namespaces or just the namespaces,
 * such as "click", "click.mynamespace" or ".mynamespace"
 * @param handlerRef {any} - The callback function that needs to be removed from the given event, when using a
 * namespace (with or without a qualifying event) this may be null to remove all previously attached event handlers
 * otherwise this will only remove events with this specific handler.
 * @param useCapture [Optional] Defaults to false
 */
export function detachEvent(obj, eventNameWithoutOn, handlerRef, useCapture) {
    if (useCapture === void 0) { useCapture = false; }
    eventOff(obj, eventNameWithoutOn, handlerRef, null, useCapture);
}
/**
 * Trys to add an event handler for the specified event to the window, body and document
 * @param eventName {string} - The name of the event
 * @param callback {any} - The callback function that needs to be executed for the given event
 * @param evtNamespace - [Optional] Namespace(s) to append to the event listeners so they can be uniquely identified and removed based on this namespace.
 * @return {boolean} - true if the handler was successfully added
 */
export function addEventHandler(eventName, callback, evtNamespace) {
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
/**
 * Trys to remove event handler(s) for the specified event/namespace to the window, body and document
 * @param eventName {string} - The name of the event, with optional namespaces or just the namespaces,
 * such as "click", "click.mynamespace" or ".mynamespace"
 * @param callback {any} - - The callback function that needs to be removed from the given event, when using a
 * namespace (with or without a qualifying event) this may be null to remove all previously attached event handlers
 * otherwise this will only remove events with this specific handler.
 * @param evtNamespace - [Optional] Namespace(s) to append to the event listeners so they can be uniquely identified and removed based on this namespace.
 */
export function removeEventHandler(eventName, callback, evtNamespace) {
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
/**
 * Bind the listener to the array of events
 * @param events An string array of event names to bind the listener to
 * @param listener The event callback to call when the event is triggered
 * @param excludeEvents - [Optional] An array of events that should not be hooked (if possible), unless no other events can be.
 * @param evtNamespace - [Optional] Namespace(s) to append to the event listeners so they can be uniquely identified and removed based on this namespace.
 * @returns true - when at least one of the events was registered otherwise false
 */
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
/**
 * Bind the listener to the array of events
 * @param events An string array of event names to bind the listener to
 * @param listener The event callback to call when the event is triggered
 * @param excludeEvents - [Optional] An array of events that should not be hooked (if possible), unless no other events can be.
 * @param evtNamespace - [Optional] Namespace(s) to append to the event listeners so they can be uniquely identified and removed based on this namespace.
 * @returns true - when at least one of the events was registered otherwise false
 */
export function addEventListeners(events, listener, excludeEvents, evtNamespace) {
    var added = false;
    if (listener && events && isArray(events)) {
        added = _addEventListeners(events, listener, excludeEvents, evtNamespace);
        if (!added && excludeEvents && excludeEvents.length > 0) {
            // Failed to add any listeners and we excluded some, so just attempt to add the excluded events
            added = _addEventListeners(events, listener, null, evtNamespace);
        }
    }
    return added;
}
/**
 * Remove the listener from the array of events
 * @param events An string array of event names to bind the listener to
 * @param listener The event callback to call when the event is triggered
 * @param evtNamespace - [Optional] Namespace(s) to append to the event listeners so they can be uniquely identified and removed based on this namespace.
 */
export function removeEventListeners(events, listener, evtNamespace) {
    if (events && isArray(events)) {
        arrForEach(events, function (name) {
            if (name) {
                removeEventHandler(name, listener, evtNamespace);
            }
        });
    }
}
/**
 * Listen to the 'beforeunload', 'unload' and 'pagehide' events which indicates a page unload is occurring,
 * this does NOT listen to the 'visibilitychange' event as while it does indicate that the page is being hidden
 * it does not *necessarily* mean that the page is being completely unloaded, it can mean that the user is
 * just navigating to a different Tab and may come back (without unloading the page). As such you may also
 * need to listen to the 'addPageHideEventListener' and 'addPageShowEventListener' events.
 * @param listener - The event callback to call when a page unload event is triggered
 * @param excludeEvents - [Optional] An array of events that should not be hooked, unless no other events can be.
 * @param evtNamespace - [Optional] Namespace(s) to append to the event listeners so they can be uniquely identified and removed based on this namespace.
 * @returns true - when at least one of the events was registered otherwise false
 */
export function addPageUnloadEventListener(listener, excludeEvents, evtNamespace) {
    // Hook the unload event for the document, window and body to ensure that the client events are flushed to the server
    // As just hooking the window does not always fire (on chrome) for page navigation's.
    return addEventListeners([strBeforeUnload, strUnload, strPageHide], listener, excludeEvents, evtNamespace);
}
/**
 * Remove any matching 'beforeunload', 'unload' and 'pagehide' events that may have been added via addEventListener,
 * addEventListeners, addPageUnloadEventListener or addPageHideEventListener.
 * @param listener - The specific event callback to to be removed
 * @param evtNamespace - [Optional] Namespace(s) uniquely identified and removed based on this namespace.
 * @returns true - when at least one of the events was registered otherwise false
 */
export function removePageUnloadEventListener(listener, evtNamespace) {
    removeEventListeners([strBeforeUnload, strUnload, strPageHide], listener, evtNamespace);
}
/**
 * Listen to the pagehide and visibility changing to 'hidden' events, because the 'visibilitychange' uses
 * an internal proxy to detect the visibility state you SHOULD use a unique namespace when if you plan to call
 * removePageShowEventListener as the remove ignores the listener argument for the 'visibilitychange' event.
 * @param listener - The event callback to call when a page hide event is triggered
 * @param excludeEvents - [Optional] An array of events that should not be hooked (if possible), unless no other events can be.
 * @param evtNamespace - [Optional] A Namespace to append to the event listeners so they can be uniquely identified and removed
 * based on this namespace. This call also adds an additional unique "pageshow" namespace to the events
 * so that only the matching "removePageHideEventListener" can remove these events.
 * Suggestion: pass as true if you are also calling addPageUnloadEventListener as that also hooks pagehide
 * @returns true - when at least one of the events was registered otherwise false
 */
export function addPageHideEventListener(listener, excludeEvents, evtNamespace) {
    function _handlePageVisibility(evt) {
        var doc = getDocument();
        if (listener && doc && doc.visibilityState === "hidden") {
            listener(evt);
        }
    }
    // add the unique page show namespace to any provided namespace so we can only remove the ones added by "pagehide"
    var newNamespaces = mergeEvtNamespace(strPageHideNamespace, evtNamespace);
    var pageUnloadAdded = _addEventListeners([strPageHide], listener, excludeEvents, newNamespaces);
    if (!excludeEvents || arrIndexOf(excludeEvents, strVisibilityChangeEvt) === -1) {
        pageUnloadAdded = _addEventListeners([strVisibilityChangeEvt], _handlePageVisibility, excludeEvents, newNamespaces) || pageUnloadAdded;
    }
    if (!pageUnloadAdded && excludeEvents) {
        // Failed to add any listeners and we where requested to exclude some, so just call again without excluding anything
        pageUnloadAdded = addPageHideEventListener(listener, null, evtNamespace);
    }
    return pageUnloadAdded;
}
/**
 * Removes the pageHide event listeners added by addPageHideEventListener, because the 'visibilitychange' uses
 * an internal proxy to detect the visibility state you SHOULD use a unique namespace when calling addPageHideEventListener
 * as the remove ignores the listener argument for the 'visibilitychange' event.
 * @param listener - The specific listener to remove for the 'pageshow' event only (ignored for 'visibilitychange')
 * @param evtNamespace - The unique namespace used when calling addPageShowEventListener
 */
export function removePageHideEventListener(listener, evtNamespace) {
    // add the unique page show namespace to any provided namespace so we only remove the ones added by "pagehide"
    var newNamespaces = mergeEvtNamespace(strPageHideNamespace, evtNamespace);
    removeEventListeners([strPageHide], listener, newNamespaces);
    removeEventListeners([strVisibilityChangeEvt], null, newNamespaces);
}
/**
 * Listen to the pageshow and visibility changing to 'visible' events, because the 'visibilitychange' uses
 * an internal proxy to detect the visibility state you SHOULD use a unique namespace when if you plan to call
 * removePageShowEventListener as the remove ignores the listener argument for the 'visibilitychange' event.
 * @param listener - The event callback to call when a page is show event is triggered
 * @param excludeEvents - [Optional] An array of events that should not be hooked (if possible), unless no other events can be.
 * @param evtNamespace - [Optional/Recommended] A Namespace to append to the event listeners so they can be uniquely
 * identified and removed based on this namespace. This call also adds an additional unique "pageshow" namespace to the events
 * so that only the matching "removePageShowEventListener" can remove these events.
 * @returns true - when at least one of the events was registered otherwise false
 */
export function addPageShowEventListener(listener, excludeEvents, evtNamespace) {
    function _handlePageVisibility(evt) {
        var doc = getDocument();
        if (listener && doc && doc.visibilityState === "visible") {
            listener(evt);
        }
    }
    // add the unique page show namespace to any provided namespace so we can only remove the ones added by "pageshow"
    var newNamespaces = mergeEvtNamespace(strPageShowNamespace, evtNamespace);
    var pageShowAdded = _addEventListeners([strPageShow], listener, excludeEvents, newNamespaces);
    pageShowAdded = _addEventListeners([strVisibilityChangeEvt], _handlePageVisibility, excludeEvents, newNamespaces) || pageShowAdded;
    if (!pageShowAdded && excludeEvents) {
        // Failed to add any listeners and we where requested to exclude some, so just call again without excluding anything
        pageShowAdded = addPageShowEventListener(listener, null, evtNamespace);
    }
    return pageShowAdded;
}
/**
 * Removes the pageShow event listeners added by addPageShowEventListener, because the 'visibilitychange' uses
 * an internal proxy to detect the visibility state you SHOULD use a unique namespace when calling addPageShowEventListener
 * as the remove ignores the listener argument for the 'visibilitychange' event.
 * @param listener - The specific listener to remove for the 'pageshow' event only (ignored for 'visibilitychange')
 * @param evtNamespace - The unique namespace used when calling addPageShowEventListener
 */
export function removePageShowEventListener(listener, evtNamespace) {
    // add the unique page show namespace to any provided namespace so we only remove the ones added by "pageshow"
    var newNamespaces = mergeEvtNamespace(strPageShowNamespace, evtNamespace);
    removeEventListeners([strPageShow], listener, newNamespaces);
    removeEventListeners([strVisibilityChangeEvt], null, newNamespaces);
}//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/EventHelpers.js.map