/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var BabaScript, BrowserBabaScript, Reflect, proxyFunc,
	  __hasProp = {}.hasOwnProperty,
	  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	Reflect = __webpack_require__(4);

	BabaScript = __webpack_require__(1);

	proxyFunc = function(target, callback) {
	  return Proxy(target, {
	    get: (function(_this) {
	      return function(target, name, receiver) {
	        var ele;
	        ele = target[name];
	        if (ele != null) {
	          if (Object.prototype.toString.call(ele === '[object Function]')) {
	            return function() {
	              return ele.apply(null, arguments);
	            };
	          }
	          return ele;
	        } else {
	          return function() {
	            return callback(name, arguments);
	          };
	        }
	      };
	    })(this),
	    set: function(target, name, val, receive) {
	      target[name] = val;
	      return target;
	    }
	  });
	};

	window.BabaScript = module.exports = BrowserBabaScript = (function(_super) {
	  __extends(BrowserBabaScript, _super);

	  function BrowserBabaScript(id, option) {
	    BrowserBabaScript.__super__.constructor.call(this, id, option);
	    return proxyFunc(this, (function(_this) {
	      return function(key, args) {
	        return _this.methodMissing(key, args);
	      };
	    })(this));
	  }

	  return BrowserBabaScript;

	})(BabaScript);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var BabaScript, EventEmitter, LindaAdapter, Plugins, Promise, Task,
	  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	  __hasProp = {}.hasOwnProperty,
	  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	LindaAdapter = __webpack_require__(7);

	EventEmitter = __webpack_require__(5).EventEmitter;

	Promise = __webpack_require__(8).Promise;

	Task = __webpack_require__(2);

	Plugins = __webpack_require__(3);

	module.exports = BabaScript = (function(_super) {
	  __extends(BabaScript, _super);

	  BabaScript.address = 'http://babascript-linda.herokuapp.com';

	  function BabaScript(id, options) {
	    this.id = id != null ? id : 'noname';
	    this.options = options != null ? options : {};
	    this.cancel = __bind(this.cancel, this);
	    this.__exec = __bind(this.__exec, this);
	    this.exec = __bind(this.exec, this);
	    this.methodMissing = __bind(this.methodMissing, this);
	    if (this.options.adapter != null) {
	      this.adapter = this.options.adapter;
	    } else {
	      this.adapter = new LindaAdapter(this.address, {
	        port: 80
	      });
	    }
	    this.adapter.attach(this);
	    this.tasks = [];
	    this.plugins = new Plugins();
	    this.data = {};
	    this.on("connect", this.connect);
	  }

	  BabaScript.prototype.connect = function() {
	    this.plugins.connect();
	    return this.next();
	  };

	  BabaScript.prototype.next = function() {
	    var task;
	    if (this.tasks.length > 0) {
	      task = this.tasks.shift();
	      return this.__exec(task);
	    }
	  };

	  BabaScript.prototype.methodMissing = function(key, args) {
	    var callback;
	    if (key === 'inspect') {
	      return __webpack_require__(6).inspect({}, {
	        showHidden: true,
	        depth: 2
	      });
	    }
	    callback = args[args.length - 1];
	    return this.exec(key, args[0], callback);
	  };

	  BabaScript.prototype.exec = function(key, args, callback) {
	    var cid, p, task;
	    task = new Task(this.id, key, args);
	    cid = task.get('cid');
	    this.tasks.push(task);
	    this.next();
	    if (typeof callback !== 'function') {
	      p = new Promise((function(_this) {
	        return function(resolve, reject) {
	          return _this.once("" + cid + "_callback", function(err, data) {
	            console.log(data);
	            if (err != null) {
	              return reject(err);
	            } else {
	              return resolve(data);
	            }
	          });
	        };
	      })(this));
	      p.cid = cid;
	      return p;
	    } else {
	      this.once("" + cid + "_callback", callback);
	      return cid;
	    }
	  };

	  BabaScript.prototype.__exec = function(task) {
	    var tuple;
	    tuple = task.toTuple();
	    if (tuple.timeout != null) {
	      setTimeout((function(_this) {
	        return function() {
	          return _this.cancel(tuple.cid, 'timeout');
	        };
	      })(this), tuple.timeout);
	    }
	    this.plugins.send();
	    this.adapter.receive(tuple, (function(_this) {
	      return function(err, result) {
	        var cid, data, r, _i, _len;
	        if (Array.isArray(result)) {
	          data = [];
	          cid = result[0].data.cid;
	          for (_i = 0, _len = result.length; _i < _len; _i++) {
	            r = result[_i];
	            data.push(r.data);
	          }
	        } else if (result.data.reason != null) {
	          err = new Error(result.data.reason);
	          cid = result.data.cid;
	          data = null;
	        } else {
	          cid = result.data.cid;
	          data = result.data;
	        }
	        _this.plugins.receive();
	        _this.emit("" + cid + "_callback", err, data);
	        return _this.next();
	      };
	    })(this));
	    return this.adapter.send(tuple);
	  };

	  BabaScript.prototype.cancel = function(cid, reason) {
	    var error;
	    if (reason instanceof Error) {
	      error = reason;
	    } else {
	      error = new Error(reason);
	    }
	    this.adapter.cancel(cid, error);
	    return this.emit("" + cid + "_callback", error, null);
	  };

	  BabaScript.prototype.set = function(name, plugin) {
	    console.log('set');
	    console.log(this);
	    return this.plugins.set(name, plugin);
	  };

	  return BabaScript;

	})(EventEmitter);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Task;

	module.exports = Task = (function() {
	  function Task(id, key, args) {
	    var k, v;
	    this.data = {
	      baba: 'script',
	      name: id,
	      key: key,
	      type: 'eval',
	      cid: this.createCallbackId(),
	      format: (args != null ? args.format : void 0) || 'boolean',
	      at: Date.now(),
	      options: {}
	    };
	    for (k in args) {
	      v = args[k];
	      if (k === 'broadcast') {
	        this.data.type = 'broadcast';
	        this.data.count = v - 1;
	      } else if (k === 'timeout') {
	        this.data.timeout = v;
	      } else {
	        this.data.options[k] = v;
	      }
	    }
	  }

	  Task.prototype.get = function(key) {
	    return this.data[key];
	  };

	  Task.prototype.toTuple = function() {
	    return this.data;
	  };

	  Task.prototype.createCallbackId = function() {
	    return "" + (new Date() / 1000) + "_" + (Math.random(100000));
	  };

	  return Task;

	})();


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Plugins, debug;

	debug = __webpack_require__(9)('babascript:plugin');

	module.exports = Plugins = (function() {
	  function Plugins(baba) {
	    this.baba = baba;
	    this.loadings = [];
	    this.plugins = {};
	  }

	  Plugins.prototype.set = function(name, plugin) {
	    this.loadings.push({
	      name: name,
	      body: plugin
	    });
	    return this.__set();
	  };

	  Plugins.prototype.__set = function() {
	    var name, plugin;
	    if (this.loadings.length === 0) {
	      return;
	    }
	    plugin = this.loadings.shift();
	    name = plugin.name;
	    return plugin.body.load(this.baba, (function(_this) {
	      return function() {
	        _this.plugins[name] = plugin;
	        return _this.__set();
	      };
	    })(this));
	  };

	  Plugins.prototype.connect = function() {
	    var name, plugin, _ref, _ref1, _results;
	    debug('connect');
	    _ref = this.plugins;
	    _results = [];
	    for (name in _ref) {
	      plugin = _ref[name];
	      _results.push((_ref1 = plugin.body) != null ? _ref1.connect() : void 0);
	    }
	    return _results;
	  };

	  Plugins.prototype.send = function(data) {
	    var name, plugin, _ref, _ref1, _results;
	    debug('send');
	    _ref = this.plugins;
	    _results = [];
	    for (name in _ref) {
	      plugin = _ref[name];
	      _results.push((_ref1 = plugin.body) != null ? _ref1.send(data) : void 0);
	    }
	    return _results;
	  };

	  Plugins.prototype.receive = function(data) {
	    var name, plugin, _ref, _ref1, _results;
	    debug('receive');
	    _ref = this.plugins;
	    _results = [];
	    for (name in _ref) {
	      plugin = _ref[name];
	      _results.push((_ref1 = plugin.body) != null ? _ref1.receive(data) : void 0);
	    }
	    return _results;
	  };

	  Plugins.prototype.return_value = function(data) {
	    var name, plugin, _ref, _ref1, _results;
	    debug('return value');
	    _ref = this.plugins;
	    _results = [];
	    for (name in _ref) {
	      plugin = _ref[name];
	      _results.push((_ref1 = plugin.body) != null ? _ref1.return_value(data) : void 0);
	    }
	    return _results;
	  };

	  return Plugins;

	})();


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {// Copyright (C) 2011-2012 Software Languages Lab, Vrije Universiteit Brussel
	// This code is dual-licensed under both the Apache License and the MPL

	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.

	/* Version: MPL 1.1
	 *
	 * The contents of this file are subject to the Mozilla Public License Version
	 * 1.1 (the "License"); you may not use this file except in compliance with
	 * the License. You may obtain a copy of the License at
	 * http://www.mozilla.org/MPL/
	 *
	 * Software distributed under the License is distributed on an "AS IS" basis,
	 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
	 * for the specific language governing rights and limitations under the
	 * License.
	 *
	 * The Original Code is a shim for the ES-Harmony reflection module
	 *
	 * The Initial Developer of the Original Code is
	 * Tom Van Cutsem, Vrije Universiteit Brussel.
	 * Portions created by the Initial Developer are Copyright (C) 2011-2012
	 * the Initial Developer. All Rights Reserved.
	 *
	 * Contributor(s):
	 *
	 */

	 // ----------------------------------------------------------------------------

	 // This file is a polyfill for the upcoming ECMAScript Reflect API,
	 // including support for Proxies. See the draft specification at:
	 // http://wiki.ecmascript.org/doku.php?id=harmony:reflect_api
	 // http://wiki.ecmascript.org/doku.php?id=harmony:direct_proxies

	 // For an implementation of the Handler API, see handlers.js, which implements:
	 // http://wiki.ecmascript.org/doku.php?id=harmony:virtual_object_api

	 // This implementation supersedes the earlier polyfill at:
	 // code.google.com/p/es-lab/source/browse/trunk/src/proxies/DirectProxies.js

	 // This code was tested on tracemonkey / Firefox 12
	//  (and should run fine on older Firefox versions starting with FF4)
	 // The code also works correctly on
	 //   v8 --harmony_proxies --harmony_weakmaps (v3.6.5.1)

	 // Language Dependencies:
	 //  - ECMAScript 5/strict
	 //  - "old" (i.e. non-direct) Harmony Proxies
	 //  - Harmony WeakMaps
	 // Patches:
	 //  - Object.{freeze,seal,preventExtensions}
	 //  - Object.{isFrozen,isSealed,isExtensible}
	 //  - Object.getPrototypeOf
	 //  - Object.prototype.valueOf
	 //  - Object.prototype.isPrototypeOf
	 //  - Object.prototype.toString
	 //  - Object.prototype.hasOwnProperty
	 //  - Object.getOwnPropertyDescriptor
	 //  - Object.keys
	 //  - Function.prototype.toString
	 //  - Date.prototype.toString
	 //  - Array.isArray
	 //  - Proxy
	 // Adds new globals:
	 //  - Reflect

	 // Direct proxies can be created via Proxy(target, handler)

	 // ----------------------------------------------------------------------------

	(function(global){ // function-as-module pattern
	"use strict";

	// === Direct Proxies: Invariant Enforcement ===

	// Direct proxies build on non-direct proxies by automatically wrapping
	// all user-defined proxy handlers in a Validator handler that checks and
	// enforces ES5 invariants.

	// A direct proxy is a proxy for an existing object called the target object.

	// A Validator handler is a wrapper for a target proxy handler H.
	// The Validator forwards all operations to H, but additionally
	// performs a number of integrity checks on the results of some traps,
	// to make sure H does not violate the ES5 invariants w.r.t. non-configurable
	// properties and non-extensible, sealed or frozen objects.

	// For each property that H exposes as own, non-configurable
	// (e.g. by returning a descriptor from a call to getOwnPropertyDescriptor)
	// the Validator handler defines those properties on the target object.
	// When the proxy becomes non-extensible, also configurable own properties
	// are checked against the target.
	// We will call properties that are defined on the target object
	// "fixed properties".

	// We will name fixed non-configurable properties "sealed properties".
	// We will name fixed non-configurable non-writable properties "frozen
	// properties".

	// The Validator handler upholds the following invariants w.r.t. non-configurability:
	// - getOwnPropertyDescriptor cannot report sealed properties as non-existent
	// - getOwnPropertyDescriptor cannot report incompatible changes to the
	//   attributes of a sealed property (e.g. reporting a non-configurable
	//   property as configurable, or reporting a non-configurable, non-writable
	//   property as writable)
	// - getPropertyDescriptor cannot report sealed properties as non-existent
	// - getPropertyDescriptor cannot report incompatible changes to the
	//   attributes of a sealed property. It _can_ report incompatible changes
	//   to the attributes of non-own, inherited properties.
	// - defineProperty cannot make incompatible changes to the attributes of
	//   sealed properties
	// - deleteProperty cannot report a successful deletion of a sealed property
	// - hasOwn cannot report a sealed property as non-existent
	// - has cannot report a sealed property as non-existent
	// - get cannot report inconsistent values for frozen data
	//   properties, and must report undefined for sealed accessors with an
	//   undefined getter
	// - set cannot report a successful assignment for frozen data
	//   properties or sealed accessors with an undefined setter.
	// - get{Own}PropertyNames lists all sealed properties of the target.
	// - keys lists all enumerable sealed properties of the target.
	// - enumerate lists all enumerable sealed properties of the target.
	// - if a property of a non-extensible proxy is reported as non-existent,
	//   then it must forever be reported as non-existent. This applies to
	//   own and inherited properties and is enforced in the
	//   deleteProperty, get{Own}PropertyDescriptor, has{Own},
	//   get{Own}PropertyNames, keys and enumerate traps

	// Violation of any of these invariants by H will result in TypeError being
	// thrown.

	// Additionally, once Object.preventExtensions, Object.seal or Object.freeze
	// is invoked on the proxy, the set of own property names for the proxy is
	// fixed. Any property name that is not fixed is called a 'new' property.

	// The Validator upholds the following invariants regarding extensibility:
	// - getOwnPropertyDescriptor cannot report new properties as existent
	//   (it must report them as non-existent by returning undefined)
	// - defineProperty cannot successfully add a new property (it must reject)
	// - getOwnPropertyNames cannot list new properties
	// - hasOwn cannot report true for new properties (it must report false)
	// - keys cannot list new properties

	// Invariants currently not enforced:
	// - getOwnPropertyNames lists only own property names
	// - keys lists only enumerable own property names
	// Both traps may list more property names than are actually defined on the
	// target.

	// Invariants with regard to inheritance are currently not enforced.
	// - a non-configurable potentially inherited property on a proxy with
	//   non-mutable ancestry cannot be reported as non-existent
	// (An object with non-mutable ancestry is a non-extensible object whose
	// [[Prototype]] is either null or an object with non-mutable ancestry.)

	// Changes in Handler API compared to previous harmony:proxies, see:
	// http://wiki.ecmascript.org/doku.php?id=strawman:direct_proxies
	// http://wiki.ecmascript.org/doku.php?id=harmony:direct_proxies

	// ----------------------------------------------------------------------------

	// ---- WeakMap polyfill ----

	// TODO: find a proper WeakMap polyfill

	// define an empty WeakMap so that at least the Reflect module code
	// will work in the absence of WeakMaps. Proxy emulation depends on
	// actual WeakMaps, so will not work with this little shim.
	if (typeof WeakMap === "undefined") {
	  global.WeakMap = function(){};
	  global.WeakMap.prototype = {
	    get: function(k) { return undefined; },
	    set: function(k,v) { throw new Error("WeakMap not supported"); }
	  };
	}

	// ---- Normalization functions for property descriptors ----

	function isStandardAttribute(name) {
	  return /^(get|set|value|writable|enumerable|configurable)$/.test(name);
	}

	// Adapted from ES5 section 8.10.5
	function toPropertyDescriptor(obj) {
	  if (Object(obj) !== obj) {
	    throw new TypeError("property descriptor should be an Object, given: "+
	                        obj);
	  }
	  var desc = {};
	  if ('enumerable' in obj) { desc.enumerable = !!obj.enumerable; }
	  if ('configurable' in obj) { desc.configurable = !!obj.configurable; }
	  if ('value' in obj) { desc.value = obj.value; }
	  if ('writable' in obj) { desc.writable = !!obj.writable; }
	  if ('get' in obj) {
	    var getter = obj.get;
	    if (getter !== undefined && typeof getter !== "function") {
	      throw new TypeError("property descriptor 'get' attribute must be "+
	                          "callable or undefined, given: "+getter);
	    }
	    desc.get = getter;
	  }
	  if ('set' in obj) {
	    var setter = obj.set;
	    if (setter !== undefined && typeof setter !== "function") {
	      throw new TypeError("property descriptor 'set' attribute must be "+
	                          "callable or undefined, given: "+setter);
	    }
	    desc.set = setter;
	  }
	  if ('get' in desc || 'set' in desc) {
	    if ('value' in desc || 'writable' in desc) {
	      throw new TypeError("property descriptor cannot be both a data and an "+
	                          "accessor descriptor: "+obj);
	    }
	  }
	  return desc;
	}

	function isAccessorDescriptor(desc) {
	  if (desc === undefined) return false;
	  return ('get' in desc || 'set' in desc);
	}
	function isDataDescriptor(desc) {
	  if (desc === undefined) return false;
	  return ('value' in desc || 'writable' in desc);
	}
	function isGenericDescriptor(desc) {
	  if (desc === undefined) return false;
	  return !isAccessorDescriptor(desc) && !isDataDescriptor(desc);
	}

	function toCompletePropertyDescriptor(desc) {
	  var internalDesc = toPropertyDescriptor(desc);
	  if (isGenericDescriptor(internalDesc) || isDataDescriptor(internalDesc)) {
	    if (!('value' in internalDesc)) { internalDesc.value = undefined; }
	    if (!('writable' in internalDesc)) { internalDesc.writable = false; }
	  } else {
	    if (!('get' in internalDesc)) { internalDesc.get = undefined; }
	    if (!('set' in internalDesc)) { internalDesc.set = undefined; }
	  }
	  if (!('enumerable' in internalDesc)) { internalDesc.enumerable = false; }
	  if (!('configurable' in internalDesc)) { internalDesc.configurable = false; }
	  return internalDesc;
	}

	function isEmptyDescriptor(desc) {
	  return !('get' in desc) &&
	         !('set' in desc) &&
	         !('value' in desc) &&
	         !('writable' in desc) &&
	         !('enumerable' in desc) &&
	         !('configurable' in desc);
	}

	function isEquivalentDescriptor(desc1, desc2) {
	  return sameValue(desc1.get, desc2.get) &&
	         sameValue(desc1.set, desc2.set) &&
	         sameValue(desc1.value, desc2.value) &&
	         sameValue(desc1.writable, desc2.writable) &&
	         sameValue(desc1.enumerable, desc2.enumerable) &&
	         sameValue(desc1.configurable, desc2.configurable);
	}

	// copied from http://wiki.ecmascript.org/doku.php?id=harmony:egal
	function sameValue(x, y) {
	  if (x === y) {
	    // 0 === -0, but they are not identical
	    return x !== 0 || 1 / x === 1 / y;
	  }

	  // NaN !== NaN, but they are identical.
	  // NaNs are the only non-reflexive value, i.e., if x !== x,
	  // then x is a NaN.
	  // isNaN is broken: it converts its argument to number, so
	  // isNaN("foo") => true
	  return x !== x && y !== y;
	}

	/**
	 * Returns a fresh property descriptor that is guaranteed
	 * to be complete (i.e. contain all the standard attributes).
	 * Additionally, any non-standard enumerable properties of
	 * attributes are copied over to the fresh descriptor.
	 *
	 * If attributes is undefined, returns undefined.
	 *
	 * See also: http://wiki.ecmascript.org/doku.php?id=harmony:proxies_semantics
	 */
	function normalizeAndCompletePropertyDescriptor(attributes) {
	  if (attributes === undefined) { return undefined; }
	  var desc = toCompletePropertyDescriptor(attributes);
	  // Note: no need to call FromPropertyDescriptor(desc), as we represent
	  // "internal" property descriptors as proper Objects from the start
	  for (var name in attributes) {
	    if (!isStandardAttribute(name)) {
	      Object.defineProperty(desc, name,
	        { value: attributes[name],
	          writable: true,
	          enumerable: true,
	          configurable: true });
	    }
	  }
	  return desc;
	}

	/**
	 * Returns a fresh property descriptor whose standard
	 * attributes are guaranteed to be data properties of the right type.
	 * Additionally, any non-standard enumerable properties of
	 * attributes are copied over to the fresh descriptor.
	 *
	 * If attributes is undefined, will throw a TypeError.
	 *
	 * See also: http://wiki.ecmascript.org/doku.php?id=harmony:proxies_semantics
	 */
	function normalizePropertyDescriptor(attributes) {
	  var desc = toPropertyDescriptor(attributes);
	  // Note: no need to call FromGenericPropertyDescriptor(desc), as we represent
	  // "internal" property descriptors as proper Objects from the start
	  for (var name in attributes) {
	    if (!isStandardAttribute(name)) {
	      Object.defineProperty(desc, name,
	        { value: attributes[name],
	          writable: true,
	          enumerable: true,
	          configurable: true });
	    }
	  }
	  return desc;
	}

	// store a reference to the real ES5 primitives before patching them later
	var prim_preventExtensions =        Object.preventExtensions,
	    prim_seal =                     Object.seal,
	    prim_freeze =                   Object.freeze,
	    prim_isExtensible =             Object.isExtensible,
	    prim_isSealed =                 Object.isSealed,
	    prim_isFrozen =                 Object.isFrozen,
	    prim_getPrototypeOf =           Object.getPrototypeOf,
	    prim_getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
	    prim_defineProperty =           Object.defineProperty,
	    prim_keys =                     Object.keys,
	    prim_getOwnPropertyNames =      Object.getOwnPropertyNames,
	    prim_isArray =                  Array.isArray,
	    prim_concat =                   Array.prototype.concat,
	    prim_isPrototypeOf =            Object.prototype.isPrototypeOf,
	    prim_hasOwnProperty =           Object.prototype.hasOwnProperty;

	// these will point to the patched versions of the respective methods on
	// Object. They are used within this module as the "intrinsic" bindings
	// of these methods (i.e. the "original" bindings as defined in the spec)
	var Object_isFrozen,
	    Object_isSealed,
	    Object_isExtensible,
	    Object_getPrototypeOf,
	    Object_getOwnPropertyNames;

	/**
	 * A property 'name' is fixed if it is an own property of the target.
	 */
	function isFixed(name, target) {
	  return ({}).hasOwnProperty.call(target, name);
	}
	function isSealed(name, target) {
	  var desc = Object.getOwnPropertyDescriptor(target, name);
	  if (desc === undefined) { return false; }
	  return desc.configurable === false;
	}
	function isSealedDesc(desc) {
	  return desc !== undefined && desc.configurable === false;
	}

	/**
	 * Performs all validation that Object.defineProperty performs,
	 * without actually defining the property. Returns a boolean
	 * indicating whether validation succeeded.
	 *
	 * Implementation transliterated from ES5.1 section 8.12.9
	 */
	function isCompatibleDescriptor(extensible, current, desc) {
	  if (current === undefined && extensible === false) {
	    return false;
	  }
	  if (current === undefined && extensible === true) {
	    return true;
	  }
	  if (isEmptyDescriptor(desc)) {
	    return true;
	  }
	  if (isEquivalentDescriptor(current, desc)) {
	    return true;
	  }
	  if (current.configurable === false) {
	    if (desc.configurable === true) {
	      return false;
	    }
	    if ('enumerable' in desc && desc.enumerable !== current.enumerable) {
	      return false;
	    }
	  }
	  if (isGenericDescriptor(desc)) {
	    return true;
	  }
	  if (isDataDescriptor(current) !== isDataDescriptor(desc)) {
	    if (current.configurable === false) {
	      return false;
	    }
	    return true;
	  }
	  if (isDataDescriptor(current) && isDataDescriptor(desc)) {
	    if (current.configurable === false) {
	      if (current.writable === false && desc.writable === true) {
	        return false;
	      }
	      if (current.writable === false) {
	        if ('value' in desc && !sameValue(desc.value, current.value)) {
	          return false;
	        }
	      }
	    }
	    return true;
	  }
	  if (isAccessorDescriptor(current) && isAccessorDescriptor(desc)) {
	    if (current.configurable === false) {
	      if ('set' in desc && !sameValue(desc.set, current.set)) {
	        return false;
	      }
	      if ('get' in desc && !sameValue(desc.get, current.get)) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	// ES6 7.3.11 SetIntegrityLevel
	// level is one of "sealed" or "frozen"
	function setIntegrityLevel(target, level) {
	  var ownProps = Object_getOwnPropertyNames(target);
	  var pendingException = undefined;
	  if (level === "sealed") {
	    var l = +ownProps.length;
	    var k;
	    for (var i = 0; i < l; i++) {
	      k = String(ownProps[i]);
	      try {
	        Object.defineProperty(target, k, { configurable: false });
	      } catch (e) {
	        if (pendingException === undefined) {
	          pendingException = e;
	        }
	      }
	    }
	  } else {
	    // level === "frozen"
	    var l = +ownProps.length;
	    var k;
	    for (var i = 0; i < l; i++) {
	      k = String(ownProps[i]);
	      try {
	        var currentDesc = Object.getOwnPropertyDescriptor(target, k);
	        if (currentDesc !== undefined) {
	          var desc;
	          if (isAccessorDescriptor(currentDesc)) {
	            desc = { configurable: false }
	          } else {
	            desc = { configurable: false, writable: false }
	          }
	          Object.defineProperty(target, k, desc);
	        }        
	      } catch (e) {
	        if (pendingException === undefined) {
	          pendingException = e;
	        }
	      }
	    }
	  }
	  if (pendingException !== undefined) {
	    throw pendingException;
	  }
	  return Reflect.preventExtensions(target);
	}

	// ES6 7.3.12 TestIntegrityLevel
	// level is one of "sealed" or "frozen"
	function testIntegrityLevel(target, level) {
	  var isExtensible = Object_isExtensible(target);
	  if (isExtensible) return false;
	  
	  var ownProps = Object_getOwnPropertyNames(target);
	  var pendingException = undefined;
	  var configurable = false;
	  var writable = false;
	  
	  var l = +ownProps.length;
	  var k;
	  var currentDesc;
	  for (var i = 0; i < l; i++) {
	    k = String(ownProps[i]);
	    try {
	      currentDesc = Object.getOwnPropertyDescriptor(target, k);
	      configurable = configurable || currentDesc.configurable;
	      if (isDataDescriptor(currentDesc)) {
	        writable = writable || currentDesc.writable;
	      }
	    } catch (e) {
	      if (pendingException === undefined) {
	        pendingException = e;
	        configurable = true;
	      }
	    }
	  }
	  if (pendingException !== undefined) {
	    throw pendingException;
	  }
	  if (level === "frozen" && writable === true) {
	    return false;
	  }
	  if (configurable === true) {
	    return false;
	  }
	  return true;
	}

	// ---- The Validator handler wrapper around user handlers ----

	/**
	 * @param target the object wrapped by this proxy.
	 * As long as the proxy is extensible, only non-configurable properties
	 * are checked against the target. Once the proxy becomes non-extensible,
	 * invariants w.r.t. non-extensibility are also enforced.
	 *
	 * @param handler the handler of the direct proxy. The object emulated by
	 * this handler is validated against the target object of the direct proxy.
	 * Any violations that the handler makes against the invariants
	 * of the target will cause a TypeError to be thrown.
	 *
	 * Both target and handler must be proper Objects at initialization time.
	 */
	function Validator(target, handler) {
	  // for non-revokable proxies, these are const references
	  // for revokable proxies, on revocation:
	  // - this.target is set to null
	  // - this.handler is set to a handler that throws on all traps
	  this.target  = target;
	  this.handler = handler;
	}

	Validator.prototype = {

	  /**
	   * If getTrap returns undefined, the caller should perform the
	   * default forwarding behavior.
	   * If getTrap returns normally otherwise, the return value
	   * will be a callable trap function. When calling the trap function,
	   * the caller is responsible for binding its |this| to |this.handler|.
	   */
	  getTrap: function(trapName) {
	    var trap = this.handler[trapName];
	    if (trap === undefined) {
	      // the trap was not defined,
	      // perform the default forwarding behavior
	      return undefined;
	    }

	    if (typeof trap !== "function") {
	      throw new TypeError(trapName + " trap is not callable: "+trap);
	    }

	    return trap;
	  },

	  // === fundamental traps ===

	  /**
	   * If name denotes a fixed property, check:
	   *   - whether targetHandler reports it as existent
	   *   - whether the returned descriptor is compatible with the fixed property
	   * If the proxy is non-extensible, check:
	   *   - whether name is not a new property
	   * Additionally, the returned descriptor is normalized and completed.
	   */
	  getOwnPropertyDescriptor: function(name) {
	    "use strict";

	    var trap = this.getTrap("getOwnPropertyDescriptor");
	    if (trap === undefined) {
	      return Reflect.getOwnPropertyDescriptor(this.target, name);
	    }

	    name = String(name);
	    var desc = trap.call(this.handler, this.target, name);
	    desc = normalizeAndCompletePropertyDescriptor(desc);

	    var targetDesc = Object.getOwnPropertyDescriptor(this.target, name);
	    var extensible = Object.isExtensible(this.target);

	    if (desc === undefined) {
	      if (isSealedDesc(targetDesc)) {
	        throw new TypeError("cannot report non-configurable property '"+name+
	                            "' as non-existent");
	      }
	      if (!extensible && targetDesc !== undefined) {
	          // if handler is allowed to return undefined, we cannot guarantee
	          // that it will not return a descriptor for this property later.
	          // Once a property has been reported as non-existent on a non-extensible
	          // object, it should forever be reported as non-existent
	          throw new TypeError("cannot report existing own property '"+name+
	                              "' as non-existent on a non-extensible object");
	      }
	      return undefined;
	    }

	    // at this point, we know (desc !== undefined), i.e.
	    // targetHandler reports 'name' as an existing property

	    // Note: we could collapse the following two if-tests into a single
	    // test. Separating out the cases to improve error reporting.

	    if (!extensible) {
	      if (targetDesc === undefined) {
	        throw new TypeError("cannot report a new own property '"+
	                            name + "' on a non-extensible object");
	      }
	    }

	    if (name !== undefined) {
	      if (!isCompatibleDescriptor(extensible, targetDesc, desc)) {
	        throw new TypeError("cannot report incompatible property descriptor "+
	                            "for property '"+name+"'");
	      }
	    }

	    if (desc.configurable === false && !isSealedDesc(targetDesc)) {
	      // if the property is configurable or non-existent on the target,
	      // but is reported as a non-configurable property, it may later be
	      // reported as configurable or non-existent, which violates the
	      // invariant that if the property might change or disappear, the
	      // configurable attribute must be true.
	      throw new TypeError("cannot report a non-configurable descriptor "+
	                          "for configurable or non-existent property '"+name+"'");
	    }

	    return desc;
	  },

	  /**
	   * In the direct proxies design with refactored prototype climbing,
	   * this trap is deprecated. For proxies-as-prototypes, instead
	   * of calling this trap, the get, set, has or enumerate traps are
	   * called instead.
	   *
	   * In this implementation, we "abuse" getPropertyDescriptor to
	   * support trapping the get or set traps for proxies-as-prototypes.
	   * We do this by returning a getter/setter pair that invokes
	   * the corresponding traps.
	   *
	   * While this hack works for inherited property access, it has some
	   * quirks:
	   *
	   * In Firefox, this trap is only called after a prior invocation
	   * of the 'has' trap has returned true. Hence, expect the following
	   * behavior:
	   * <code>
	   * var child = Object.create(Proxy(target, handler));
	   * child[name] // triggers handler.has(target, name)
	   * // if that returns true, triggers handler.get(target, name, child)
	   * </code>
	   *
	   * On v8, the 'in' operator, when applied to an object that inherits
	   * from a proxy, will call getPropertyDescriptor and walk the proto-chain.
	   * That calls the below getPropertyDescriptor trap on the proxy. The
	   * result of the 'in'-operator is then determined by whether this trap
	   * returns undefined or a property descriptor object. That is why
	   * we first explicitly trigger the 'has' trap to determine whether
	   * the property exists.
	   *
	   * This has the side-effect that when enumerating properties on
	   * an object that inherits from a proxy in v8, only properties
	   * for which 'has' returns true are returned:
	   *
	   * <code>
	   * var child = Object.create(Proxy(target, handler));
	   * for (var prop in child) {
	   *   // only enumerates prop if (prop in child) returns true
	   * }
	   * </code>
	   */
	  getPropertyDescriptor: function(name) {
	    var handler = this;

	    if (!handler.has(name)) return undefined;

	    return {
	      get: function() {
	        return handler.get(this, name);
	      },
	      set: function(val) {
	        if (handler.set(this, name, val)) {
	          return val;
	        } else {
	          throw new TypeError("failed assignment to "+name);
	        }
	      },
	      enumerable: true,
	      configurable: true
	    };
	  },

	  /**
	   * If name denotes a fixed property, check for incompatible changes.
	   * If the proxy is non-extensible, check that new properties are rejected.
	   */
	  defineProperty: function(name, desc) {
	    // TODO(tvcutsem): the current tracemonkey implementation of proxies
	    // auto-completes 'desc', which is not correct. 'desc' should be
	    // normalized, but not completed. Consider:
	    // Object.defineProperty(proxy, 'foo', {enumerable:false})
	    // This trap will receive desc =
	    //  {value:undefined,writable:false,enumerable:false,configurable:false}
	    // This will also set all other attributes to their default value,
	    // which is unexpected and different from [[DefineOwnProperty]].
	    // Bug filed: https://bugzilla.mozilla.org/show_bug.cgi?id=601329

	    var trap = this.getTrap("defineProperty");
	    if (trap === undefined) {
	      // default forwarding behavior
	      return Reflect.defineProperty(this.target, name, desc);
	    }

	    name = String(name);
	    desc = normalizePropertyDescriptor(desc);
	    var success = trap.call(this.handler, this.target, name, desc);
	    success = !!success; // coerce to Boolean

	    if (success === true) {

	      var targetDesc = Object.getOwnPropertyDescriptor(this.target, name);
	      var extensible = Object.isExtensible(this.target);

	      // Note: we could collapse the following two if-tests into a single
	      // test. Separating out the cases to improve error reporting.

	      if (!extensible) {
	        if (targetDesc === undefined) {
	          throw new TypeError("cannot successfully add a new property '"+
	                              name + "' to a non-extensible object");
	        }
	      }

	      if (targetDesc !== undefined) {
	        if (!isCompatibleDescriptor(extensible, targetDesc, desc)) {
	          throw new TypeError("cannot define incompatible property "+
	                              "descriptor for property '"+name+"'");
	        }
	      }

	      if (desc.configurable === false && !isSealedDesc(targetDesc)) {
	        // if the property is configurable or non-existent on the target,
	        // but is successfully being redefined as a non-configurable property,
	        // it may later be reported as configurable or non-existent, which violates
	        // the invariant that if the property might change or disappear, the
	        // configurable attribute must be true.
	        throw new TypeError("cannot successfully define a non-configurable "+
	                            "descriptor for configurable or non-existent property '"+
	                            name+"'");
	      }

	    }

	    return success;
	  },

	  /**
	   * On success, check whether the target object is indeed non-extensible.
	   */
	  preventExtensions: function() {
	    var trap = this.getTrap("preventExtensions");
	    if (trap === undefined) {
	      // default forwarding behavior
	      return Reflect.preventExtensions(this.target);
	    }

	    var success = trap.call(this.handler, this.target);
	    success = !!success; // coerce to Boolean
	    if (success) {
	      if (Object_isExtensible(this.target)) {
	        throw new TypeError("can't report extensible object as non-extensible: "+
	                            this.target);
	      }
	    }
	    return success;
	  },

	  /**
	   * If name denotes a sealed property, check whether handler rejects.
	   */
	  delete: function(name) {
	    "use strict";
	    var trap = this.getTrap("deleteProperty");
	    if (trap === undefined) {
	      // default forwarding behavior
	      return Reflect.deleteProperty(this.target, name);
	    }

	    name = String(name);
	    var res = trap.call(this.handler, this.target, name);
	    res = !!res; // coerce to Boolean

	    if (res === true) {
	      if (isSealed(name, this.target)) {
	        throw new TypeError("property '"+name+"' is non-configurable "+
	                            "and can't be deleted");
	      }
	    }

	    return res;
	  },

	  /**
	   * The getOwnPropertyNames trap was replaced by the ownKeys trap,
	   * which now also returns an array (of strings or symbols) and
	   * which performs the same rigorous invariant checks as getOwnPropertyNames
	   */
	  getOwnPropertyNames: function() {
	    throw new TypeError("getOwnPropertyNames trap is deprecated");
	  },

	  /**
	   * Checks whether the trap result does not contain any new properties
	   * if the proxy is non-extensible.
	   *
	   * Any own non-configurable properties of the target that are not included
	   * in the trap result give rise to a TypeError. As such, we check whether the
	   * returned result contains at least all sealed properties of the target
	   * object.
	   *
	   * Additionally, the trap result is normalized.
	   * Instead of returning the trap result directly:
	   *  - create and return a fresh Array,
	   *  - of which each element is coerced to a String
	   *
	   * This trap is called a.o. by Reflect.ownKeys, Object.getOwnPropertyNames
	   * and Object.keys (the latter filters out only the enumerable own properties).
	   */
	  ownKeys: function() {
	    var trap = this.getTrap("ownKeys");
	    if (trap === undefined) {
	      // default forwarding behavior
	      return Reflect.ownKeys(this.target);
	    }

	    var trapResult = trap.call(this.handler, this.target);

	    // propNames is used as a set of strings
	    var propNames = Object.create(null);
	    var numProps = +trapResult.length;
	    var result = new Array(numProps);

	    for (var i = 0; i < numProps; i++) {
	      var s = String(trapResult[i]);
	      if (!Object.isExtensible(this.target) && !isFixed(s, this.target)) {
	        // non-extensible proxies don't tolerate new own property names
	        throw new TypeError("ownKeys trap cannot list a new "+
	                            "property '"+s+"' on a non-extensible object");
	      }

	      propNames[s] = true;
	      result[i] = s;
	    }

	    var ownProps = Object_getOwnPropertyNames(this.target);
	    var target = this.target;
	    ownProps.forEach(function (ownProp) {
	      if (!propNames[ownProp]) {
	        if (isSealed(ownProp, target)) {
	          throw new TypeError("ownKeys trap failed to include "+
	                              "non-configurable property '"+ownProp+"'");
	        }
	        if (!Object.isExtensible(target) &&
	            isFixed(ownProp, target)) {
	            // if handler is allowed to report ownProp as non-existent,
	            // we cannot guarantee that it will never later report it as
	            // existent. Once a property has been reported as non-existent
	            // on a non-extensible object, it should forever be reported as
	            // non-existent
	            throw new TypeError("ownKeys trap cannot report existing own property '"+
	                                ownProp+"' as non-existent on a non-extensible object");
	        }
	      }
	    });

	    return result;
	  },

	  /**
	   * Checks whether the trap result is consistent with the state of the
	   * wrapped target.
	   */
	  isExtensible: function() {
	    var trap = this.getTrap("isExtensible");
	    if (trap === undefined) {
	      // default forwarding behavior
	      return Reflect.isExtensible(this.target);
	    }

	    var result = trap.call(this.handler, this.target);
	    result = !!result; // coerce to Boolean
	    var state = Object_isExtensible(this.target);
	    if (result !== state) {
	      if (result) {
	        throw new TypeError("cannot report non-extensible object as extensible: "+
	                             this.target);
	      } else {
	        throw new TypeError("cannot report extensible object as non-extensible: "+
	                             this.target);
	      }
	    }
	    return state;
	  },

	  /**
	   * Check whether the trap result corresponds to the target's [[Prototype]]
	   */
	  getPrototypeOf: function() {
	    var trap = this.getTrap("getPrototypeOf");
	    if (trap === undefined) {
	      // default forwarding behavior
	      return Reflect.getPrototypeOf(this.target);
	    }

	    var allegedProto = trap.call(this.handler, this.target);

	    if (!Object_isExtensible(this.target)) {
	      var actualProto = Object_getPrototypeOf(this.target);
	      if (!sameValue(allegedProto, actualProto)) {
	        throw new TypeError("prototype value does not match: " + this.target);
	      }
	    }

	    return allegedProto;
	  },

	  /**
	   * If target is non-extensible and setPrototypeOf trap returns true,
	   * check whether the trap result corresponds to the target's [[Prototype]]
	   */
	  setPrototypeOf: function(newProto) {
	    var trap = this.getTrap("setPrototypeOf");
	    if (trap === undefined) {
	      // default forwarding behavior
	      return Reflect.setPrototypeOf(this.target, newProto);
	    }

	    var success = trap.call(this.handler, this.target, newProto);

	    success = !!success;
	    if (success && !Object_isExtensible(this.target)) {
	      var actualProto = Object_getPrototypeOf(this.target);
	      if (!sameValue(newProto, actualProto)) {
	        throw new TypeError("prototype value does not match: " + this.target);
	      }
	    }

	    return success;
	  },

	  /**
	   * In the direct proxies design with refactored prototype climbing,
	   * this trap is deprecated. For proxies-as-prototypes, for-in will
	   * call the enumerate() trap. If that trap is not defined, the
	   * operation is forwarded to the target, no more fallback on this
	   * fundamental trap.
	   */
	  getPropertyNames: function() {
	    throw new TypeError("getPropertyNames trap is deprecated");
	  },

	  // === derived traps ===

	  /**
	   * If name denotes a fixed property, check whether the trap returns true.
	   */
	  has: function(name) {
	    var trap = this.getTrap("has");
	    if (trap === undefined) {
	      // default forwarding behavior
	      return Reflect.has(this.target, name);
	    }

	    name = String(name);
	    var res = trap.call(this.handler, this.target, name);
	    res = !!res; // coerce to Boolean

	    if (res === false) {
	      if (isSealed(name, this.target)) {
	        throw new TypeError("cannot report existing non-configurable own "+
	                            "property '"+ name + "' as a non-existent "+
	                            "property");
	      }
	      if (!Object.isExtensible(this.target) &&
	          isFixed(name, this.target)) {
	          // if handler is allowed to return false, we cannot guarantee
	          // that it will not return true for this property later.
	          // Once a property has been reported as non-existent on a non-extensible
	          // object, it should forever be reported as non-existent
	          throw new TypeError("cannot report existing own property '"+name+
	                              "' as non-existent on a non-extensible object");
	      }
	    }

	    // if res === true, we don't need to check for extensibility
	    // even for a non-extensible proxy that has no own name property,
	    // the property may have been inherited

	    return res;
	  },

	  /**
	   * If name denotes a fixed non-configurable, non-writable data property,
	   * check its return value against the previously asserted value of the
	   * fixed property.
	   */
	  get: function(receiver, name) {

	    // experimental support for invoke() trap on platforms that
	    // support __noSuchMethod__
	    /*
	    if (name === '__noSuchMethod__') {
	      var handler = this;
	      return function(name, args) {
	        return handler.invoke(receiver, name, args);
	      }
	    }
	    */

	    var trap = this.getTrap("get");
	    if (trap === undefined) {
	      // default forwarding behavior
	      return Reflect.get(this.target, name, receiver);
	    }

	    name = String(name);
	    var res = trap.call(this.handler, this.target, name, receiver);

	    var fixedDesc = Object.getOwnPropertyDescriptor(this.target, name);
	    // check consistency of the returned value
	    if (fixedDesc !== undefined) { // getting an existing property
	      if (isDataDescriptor(fixedDesc) &&
	          fixedDesc.configurable === false &&
	          fixedDesc.writable === false) { // own frozen data property
	        if (!sameValue(res, fixedDesc.value)) {
	          throw new TypeError("cannot report inconsistent value for "+
	                              "non-writable, non-configurable property '"+
	                              name+"'");
	        }
	      } else { // it's an accessor property
	        if (isAccessorDescriptor(fixedDesc) &&
	            fixedDesc.configurable === false &&
	            fixedDesc.get === undefined) {
	          if (res !== undefined) {
	            throw new TypeError("must report undefined for non-configurable "+
	                                "accessor property '"+name+"' without getter");
	          }
	        }
	      }
	    }

	    return res;
	  },

	  /**
	   * If name denotes a fixed non-configurable, non-writable data property,
	   * check that the trap rejects the assignment.
	   */
	  set: function(receiver, name, val) {
	    var trap = this.getTrap("set");
	    if (trap === undefined) {
	      // default forwarding behavior
	      return Reflect.set(this.target, name, val, receiver);
	    }

	    name = String(name);
	    var res = trap.call(this.handler, this.target, name, val, receiver);
	    res = !!res; // coerce to Boolean

	    // if success is reported, check whether property is truly assignable
	    if (res === true) {
	      var fixedDesc = Object.getOwnPropertyDescriptor(this.target, name);
	      if (fixedDesc !== undefined) { // setting an existing property
	        if (isDataDescriptor(fixedDesc) &&
	            fixedDesc.configurable === false &&
	            fixedDesc.writable === false) {
	          if (!sameValue(val, fixedDesc.value)) {
	            throw new TypeError("cannot successfully assign to a "+
	                                "non-writable, non-configurable property '"+
	                                name+"'");
	          }
	        } else {
	          if (isAccessorDescriptor(fixedDesc) &&
	              fixedDesc.configurable === false && // non-configurable
	              fixedDesc.set === undefined) {      // accessor with undefined setter
	            throw new TypeError("setting a property '"+name+"' that has "+
	                                " only a getter");
	          }
	        }
	      }
	    }

	    return res;
	  },

	  /**
	   * Any own enumerable non-configurable properties of the target that are not
	   * included in the trap result give rise to a TypeError. As such, we check
	   * whether the returned result contains at least all sealed enumerable properties
	   * of the target object.
	   *
	   * The trap should return an iterator.
	   *
	   * However, as implementations of pre-direct proxies still expect enumerate
	   * to return an array of strings, we convert the iterator into an array.
	   */
	  enumerate: function() {
	    var trap = this.getTrap("enumerate");
	    if (trap === undefined) {
	      // default forwarding behavior
	      var trapResult = Reflect.enumerate(this.target);
	      var result = [];
	      var nxt = trapResult.next();
	      while (!nxt.done) {
	        result.push(String(nxt.value));
	        nxt = trapResult.next();
	      }
	      return result;
	    }

	    var trapResult = trap.call(this.handler, this.target);
	    
	    if (trapResult === null ||
	        trapResult === undefined ||
	        trapResult.next === undefined) {
	      throw new TypeError("enumerate trap should return an iterator, got: "+
	                          trapResult);    
	    }
	    
	    // propNames is used as a set of strings
	    var propNames = Object.create(null);
	    
	    // var numProps = +trapResult.length;
	    var result = []; // new Array(numProps);
	    
	    // trapResult is supposed to be an iterator
	    // drain iterator to array as current implementations still expect
	    // enumerate to return an array of strings
	    var nxt = trapResult.next();
	    
	    while (!nxt.done) {
	      var s = String(nxt.value);
	      if (propNames[s]) {
	        throw new TypeError("enumerate trap cannot list a "+
	                            "duplicate property '"+s+"'");
	      }
	      propNames[s] = true;
	      result.push(s);
	      nxt = trapResult.next();
	    }
	    
	    /*for (var i = 0; i < numProps; i++) {
	      var s = String(trapResult[i]);
	      if (propNames[s]) {
	        throw new TypeError("enumerate trap cannot list a "+
	                            "duplicate property '"+s+"'");
	      }

	      propNames[s] = true;
	      result[i] = s;
	    } */

	    var ownEnumerableProps = Object.keys(this.target);
	    var target = this.target;
	    ownEnumerableProps.forEach(function (ownEnumerableProp) {
	      if (!propNames[ownEnumerableProp]) {
	        if (isSealed(ownEnumerableProp, target)) {
	          throw new TypeError("enumerate trap failed to include "+
	                              "non-configurable enumerable property '"+
	                              ownEnumerableProp+"'");
	        }
	        if (!Object.isExtensible(target) &&
	            isFixed(ownEnumerableProp, target)) {
	            // if handler is allowed not to report ownEnumerableProp as an own
	            // property, we cannot guarantee that it will never report it as
	            // an own property later. Once a property has been reported as
	            // non-existent on a non-extensible object, it should forever be
	            // reported as non-existent
	            throw new TypeError("cannot report existing own property '"+
	                                ownEnumerableProp+"' as non-existent on a "+
	                                "non-extensible object");
	        }
	      }
	    });

	    return result;
	  },

	  /**
	   * The iterate trap is deprecated by the enumerate trap.
	   */
	  iterate: Validator.prototype.enumerate,

	  /**
	   * Any own non-configurable properties of the target that are not included
	   * in the trap result give rise to a TypeError. As such, we check whether the
	   * returned result contains at least all sealed properties of the target
	   * object.
	   *
	   * The trap result is normalized.
	   * The trap result is not returned directly. Instead:
	   *  - create and return a fresh Array,
	   *  - of which each element is coerced to String,
	   *  - which does not contain duplicates
	   *
	   * FIXME: keys trap is deprecated
	   */
	  /*
	  keys: function() {
	    var trap = this.getTrap("keys");
	    if (trap === undefined) {
	      // default forwarding behavior
	      return Reflect.keys(this.target);
	    }

	    var trapResult = trap.call(this.handler, this.target);

	    // propNames is used as a set of strings
	    var propNames = Object.create(null);
	    var numProps = +trapResult.length;
	    var result = new Array(numProps);

	    for (var i = 0; i < numProps; i++) {
	     var s = String(trapResult[i]);
	     if (propNames[s]) {
	       throw new TypeError("keys trap cannot list a "+
	                           "duplicate property '"+s+"'");
	     }
	     if (!Object.isExtensible(this.target) && !isFixed(s, this.target)) {
	       // non-extensible proxies don't tolerate new own property names
	       throw new TypeError("keys trap cannot list a new "+
	                           "property '"+s+"' on a non-extensible object");
	     }

	     propNames[s] = true;
	     result[i] = s;
	    }

	    var ownEnumerableProps = Object.keys(this.target);
	    var target = this.target;
	    ownEnumerableProps.forEach(function (ownEnumerableProp) {
	      if (!propNames[ownEnumerableProp]) {
	        if (isSealed(ownEnumerableProp, target)) {
	          throw new TypeError("keys trap failed to include "+
	                              "non-configurable enumerable property '"+
	                              ownEnumerableProp+"'");
	        }
	        if (!Object.isExtensible(target) &&
	            isFixed(ownEnumerableProp, target)) {
	            // if handler is allowed not to report ownEnumerableProp as an own
	            // property, we cannot guarantee that it will never report it as
	            // an own property later. Once a property has been reported as
	            // non-existent on a non-extensible object, it should forever be
	            // reported as non-existent
	            throw new TypeError("cannot report existing own property '"+
	                                ownEnumerableProp+"' as non-existent on a "+
	                                "non-extensible object");
	        }
	      }
	    });

	    return result;
	  },
	  */
	  
	  /**
	   * New trap that reifies [[Call]].
	   * If the target is a function, then a call to
	   *   proxy(...args)
	   * Triggers this trap
	   */
	  apply: function(target, thisBinding, args) {
	    var trap = this.getTrap("apply");
	    if (trap === undefined) {
	      return Reflect.apply(target, thisBinding, args);
	    }

	    if (typeof this.target === "function") {
	      return trap.call(this.handler, target, thisBinding, args);
	    } else {
	      throw new TypeError("apply: "+ target + " is not a function");
	    }
	  },

	  /**
	   * New trap that reifies [[Construct]].
	   * If the target is a function, then a call to
	   *   new proxy(...args)
	   * Triggers this trap
	   */
	  construct: function(target, args) {
	    var trap = this.getTrap("construct");
	    if (trap === undefined) {
	      return Reflect.construct(target, args);
	    }

	    if (typeof this.target === "function") {
	      return trap.call(this.handler, target, args);
	    } else {
	      throw new TypeError("new: "+ target + " is not a function");
	    }
	  }
	};

	// ---- end of the Validator handler wrapper handler ----

	// In what follows, a 'direct proxy' is a proxy
	// whose handler is a Validator. Such proxies can be made non-extensible,
	// sealed or frozen without losing the ability to trap.

	// maps direct proxies to their Validator handlers
	var directProxies = new WeakMap();

	// patch Object.{preventExtensions,seal,freeze} so that
	// they recognize fixable proxies and act accordingly
	Object.preventExtensions = function(subject) {
	  var vhandler = directProxies.get(subject);
	  if (vhandler !== undefined) {
	    if (vhandler.preventExtensions()) {
	      return subject;
	    } else {
	      throw new TypeError("preventExtensions on "+subject+" rejected");
	    }
	  } else {
	    return prim_preventExtensions(subject);
	  }
	};
	Object.seal = function(subject) {
	  setIntegrityLevel(subject, "sealed");
	  return subject;
	};
	Object.freeze = function(subject) {
	  setIntegrityLevel(subject, "frozen");
	  return subject;
	};
	Object.isExtensible = Object_isExtensible = function(subject) {
	  var vHandler = directProxies.get(subject);
	  if (vHandler !== undefined) {
	    return vHandler.isExtensible();
	  } else {
	    return prim_isExtensible(subject);
	  }
	};
	Object.isSealed = Object_isSealed = function(subject) {
	  return testIntegrityLevel(subject, "sealed");
	};
	Object.isFrozen = Object_isFrozen = function(subject) {
	  return testIntegrityLevel(subject, "frozen");
	};
	Object.getPrototypeOf = Object_getPrototypeOf = function(subject) {
	  var vHandler = directProxies.get(subject);
	  if (vHandler !== undefined) {
	    return vHandler.getPrototypeOf();
	  } else {
	    return prim_getPrototypeOf(subject);
	  }
	};

	// patch Object.getOwnPropertyDescriptor to directly call
	// the Validator.prototype.getOwnPropertyDescriptor trap
	// This is to circumvent an assertion in the built-in Proxy
	// trapping mechanism of v8, which disallows that trap to
	// return non-configurable property descriptors (as per the
	// old Proxy design)
	Object.getOwnPropertyDescriptor = function(subject, name) {
	  var vhandler = directProxies.get(subject);
	  if (vhandler !== undefined) {
	    return vhandler.getOwnPropertyDescriptor(name);
	  } else {
	    return prim_getOwnPropertyDescriptor(subject, name);
	  }
	};

	// patch Object.defineProperty to directly call
	// the Validator.prototype.defineProperty trap
	// This is to circumvent two issues with the built-in
	// trap mechanism:
	// 1) the current tracemonkey implementation of proxies
	// auto-completes 'desc', which is not correct. 'desc' should be
	// normalized, but not completed. Consider:
	// Object.defineProperty(proxy, 'foo', {enumerable:false})
	// This trap will receive desc =
	//  {value:undefined,writable:false,enumerable:false,configurable:false}
	// This will also set all other attributes to their default value,
	// which is unexpected and different from [[DefineOwnProperty]].
	// Bug filed: https://bugzilla.mozilla.org/show_bug.cgi?id=601329
	// 2) the current spidermonkey implementation does not
	// throw an exception when this trap returns 'false', but instead silently
	// ignores the operation (this is regardless of strict-mode)
	// 2a) v8 does throw an exception for this case, but includes the rather
	//     unhelpful error message:
	// 'Proxy handler #<Object> returned false from 'defineProperty' trap'
	Object.defineProperty = function(subject, name, desc) {
	  var vhandler = directProxies.get(subject);
	  if (vhandler !== undefined) {
	    var normalizedDesc = normalizePropertyDescriptor(desc);
	    var success = vhandler.defineProperty(name, normalizedDesc);
	    if (success === false) {
	      throw new TypeError("can't redefine property '"+name+"'");
	    }
	    return success;
	  } else {
	    return prim_defineProperty(subject, name, desc);
	  }
	};

	Object.keys = function(subject) {
	  var vHandler = directProxies.get(subject);
	  if (vHandler !== undefined) {
	    var ownKeys = vHandler.ownKeys();
	    var result = [];
	    for (var i = 0; i < ownKeys.length; i++) {
	      var k = String(ownKeys[i]);
	      var desc = Object.getOwnPropertyDescriptor(subject, k);
	      if (desc !== undefined && desc.enumerable === true) {
	        result.push(k);
	      }
	    }
	    return result;
	  } else {
	    return prim_keys(subject);
	  }
	}

	Object.getOwnPropertyNames = Object_getOwnPropertyNames = function(subject) {
	  var vHandler = directProxies.get(subject);
	  if (vHandler !== undefined) {
	    return vHandler.ownKeys();
	  } else {
	    return prim_getOwnPropertyNames(subject);
	  }
	}

	// returns whether an argument is a reference to an object,
	// which is legal as a WeakMap key.
	function isObject(arg) {
	  var type = typeof arg;
	  return (type === 'object' && arg !== null) || (type === 'function');
	};

	// a wrapper for WeakMap.get which returns the undefined value
	// for keys that are not objects (in which case the underlying
	// WeakMap would have thrown a TypeError).
	function safeWeakMapGet(map, key) {
	  return isObject(key) ? map.get(key) : undefined;
	};

	// returns a new function of zero arguments that recursively
	// unwraps any proxies specified as the |this|-value.
	// The primitive is assumed to be a zero-argument method
	// that uses its |this|-binding.
	function makeUnwrapping0ArgMethod(primitive) {
	  return function builtin() {
	    var vHandler = safeWeakMapGet(directProxies, this);
	    if (vHandler !== undefined) {
	      return builtin.call(vHandler.target);
	    } else {
	      return primitive.call(this);
	    }
	  }
	};

	// returns a new function of 1 arguments that recursively
	// unwraps any proxies specified as the |this|-value.
	// The primitive is assumed to be a 1-argument method
	// that uses its |this|-binding.
	function makeUnwrapping1ArgMethod(primitive) {
	  return function builtin(arg) {
	    var vHandler = safeWeakMapGet(directProxies, this);
	    if (vHandler !== undefined) {
	      return builtin.call(vHandler.target, arg);
	    } else {
	      return primitive.call(this, arg);
	    }
	  }
	};

	Object.prototype.valueOf =
	  makeUnwrapping0ArgMethod(Object.prototype.valueOf);
	Object.prototype.toString =
	  makeUnwrapping0ArgMethod(Object.prototype.toString);
	Function.prototype.toString =
	  makeUnwrapping0ArgMethod(Function.prototype.toString);
	Date.prototype.toString =
	  makeUnwrapping0ArgMethod(Date.prototype.toString);

	Object.prototype.isPrototypeOf = function builtin(arg) {
	  // bugfix thanks to Bill Mark:
	  // built-in isPrototypeOf does not unwrap proxies used
	  // as arguments. So, we implement the builtin ourselves,
	  // based on the ECMAScript 6 spec. Our encoding will
	  // make sure that if a proxy is used as an argument,
	  // its getPrototypeOf trap will be called.
	  while (true) {
	    var vHandler2 = safeWeakMapGet(directProxies, arg);
	    if (vHandler2 !== undefined) {
	      arg = vHandler2.getPrototypeOf();
	      if (arg === null) {
	        return false;
	      } else if (sameValue(arg, this)) {
	        return true;
	      }
	    } else {
	      return prim_isPrototypeOf.call(this, arg);
	    }
	  }
	};

	Array.isArray = function(subject) {
	  var vHandler = safeWeakMapGet(directProxies, subject);
	  if (vHandler !== undefined) {
	    return Array.isArray(vHandler.target);
	  } else {
	    return prim_isArray(subject);
	  }
	};

	function isProxyArray(arg) {
	  var vHandler = safeWeakMapGet(directProxies, arg);
	  if (vHandler !== undefined) {
	    return Array.isArray(vHandler.target);
	  }
	  return false;
	}

	// Array.prototype.concat internally tests whether one of its
	// arguments is an Array, by checking whether [[Class]] == "Array"
	// As such, it will fail to recognize proxies-for-arrays as arrays.
	// We patch Array.prototype.concat so that it "unwraps" proxies-for-arrays
	// by making a copy. This will trigger the exact same sequence of
	// traps on the proxy-for-array as if we would not have unwrapped it.
	// See <https://github.com/tvcutsem/harmony-reflect/issues/19> for more.
	Array.prototype.concat = function(/*...args*/) {
	  var length;
	  for (var i = 0; i < arguments.length; i++) {
	    if (isProxyArray(arguments[i])) {
	      length = arguments[i].length;
	      arguments[i] = Array.prototype.slice.call(arguments[i], 0, length);
	    }
	  }
	  return prim_concat.apply(this, arguments);
	};

	// setPrototypeOf support on platforms that support __proto__

	var prim_setPrototypeOf = Object.setPrototypeOf;

	// patch and extract original __proto__ setter
	var __proto__setter = (function() {
	  var protoDesc = prim_getOwnPropertyDescriptor(Object.prototype,'__proto__');
	  if (protoDesc === undefined ||
	      typeof protoDesc.set !== "function") {
	    return function() {
	      throw new TypeError("setPrototypeOf not supported on this platform");
	    }
	  }

	  // see if we can actually mutate a prototype with the generic setter
	  // (e.g. Chrome v28 doesn't allow setting __proto__ via the generic setter)
	  try {
	    protoDesc.set.call({},{});
	  } catch (e) {
	    return function() {
	      throw new TypeError("setPrototypeOf not supported on this platform");
	    }
	  }

	  prim_defineProperty(Object.prototype, '__proto__', {
	    set: function(newProto) {
	      return Object.setPrototypeOf(this, newProto);
	    }
	  });

	  return protoDesc.set;
	}());

	Object.setPrototypeOf = function(target, newProto) {
	  var handler = directProxies.get(target);
	  if (handler !== undefined) {
	    if (handler.setPrototypeOf(newProto)) {
	      return target;
	    } else {
	      throw new TypeError("proxy rejected prototype mutation");
	    }
	  } else {
	    if (!Object_isExtensible(target)) {
	      throw new TypeError("can't set prototype on non-extensible object: " +
	                          target);
	    }
	    if (prim_setPrototypeOf)
	      return prim_setPrototypeOf(target, newProto);

	    if (Object(newProto) !== newProto || newProto === null) {
	      throw new TypeError("Object prototype may only be an Object or null: " +
	                         newProto);
	      // throw new TypeError("prototype must be an object or null")
	    }
	    __proto__setter.call(target, newProto);
	    return target;
	  }
	}

	Object.prototype.hasOwnProperty = function(name) {
	  var handler = safeWeakMapGet(directProxies, this);
	  if (handler !== undefined) {
	    var desc = handler.getOwnPropertyDescriptor(name);
	    return desc !== undefined;
	  } else {
	    return prim_hasOwnProperty.call(this, name);
	  }
	}

	// ============= Reflection module =============
	// see http://wiki.ecmascript.org/doku.php?id=harmony:reflect_api

	var Reflect = global.Reflect = {
	  getOwnPropertyDescriptor: function(target, name) {
	    return Object.getOwnPropertyDescriptor(target, name);
	  },
	  defineProperty: function(target, name, desc) {

	    // if target is a proxy, invoke its "defineProperty" trap
	    var handler = directProxies.get(target);
	    if (handler !== undefined) {
	      return handler.defineProperty(target, name, desc);
	    }

	    // Implementation transliterated from [[DefineOwnProperty]]
	    // see ES5.1 section 8.12.9
	    // this is the _exact same algorithm_ as the isCompatibleDescriptor
	    // algorithm defined above, except that at every place it
	    // returns true, this algorithm actually does define the property.
	    var current = Object.getOwnPropertyDescriptor(target, name);
	    var extensible = Object.isExtensible(target);
	    if (current === undefined && extensible === false) {
	      return false;
	    }
	    if (current === undefined && extensible === true) {
	      Object.defineProperty(target, name, desc); // should never fail
	      return true;
	    }
	    if (isEmptyDescriptor(desc)) {
	      return true;
	    }
	    if (isEquivalentDescriptor(current, desc)) {
	      return true;
	    }
	    if (current.configurable === false) {
	      if (desc.configurable === true) {
	        return false;
	      }
	      if ('enumerable' in desc && desc.enumerable !== current.enumerable) {
	        return false;
	      }
	    }
	    if (isGenericDescriptor(desc)) {
	      // no further validation necessary
	    } else if (isDataDescriptor(current) !== isDataDescriptor(desc)) {
	      if (current.configurable === false) {
	        return false;
	      }
	    } else if (isDataDescriptor(current) && isDataDescriptor(desc)) {
	      if (current.configurable === false) {
	        if (current.writable === false && desc.writable === true) {
	          return false;
	        }
	        if (current.writable === false) {
	          if ('value' in desc && !sameValue(desc.value, current.value)) {
	            return false;
	          }
	        }
	      }
	    } else if (isAccessorDescriptor(current) && isAccessorDescriptor(desc)) {
	      if (current.configurable === false) {
	        if ('set' in desc && !sameValue(desc.set, current.set)) {
	          return false;
	        }
	        if ('get' in desc && !sameValue(desc.get, current.get)) {
	          return false;
	        }
	      }
	    }
	    Object.defineProperty(target, name, desc); // should never fail
	    return true;
	  },
	  deleteProperty: function(target, name) {
	    var handler = directProxies.get(target);
	    if (handler !== undefined) {
	      return handler.deleteProperty(target, name);
	    }
	    
	    var desc = Object.getOwnPropertyDescriptor(target, name);
	    if (desc === undefined) {
	      return true;
	    }
	    if (desc.configurable === true) {
	      delete target[name];
	      return true;
	    }
	    return false;    
	  },
	  getPrototypeOf: function(target) {
	    return Object.getPrototypeOf(target);
	  },
	  setPrototypeOf: function(target, newProto) {
	    
	    var handler = directProxies.get(target);
	    if (handler !== undefined) {
	      return handler.setPrototypeOf(newProto);
	    }
	    
	    if (Object(newProto) !== newProto || newProto === null) {
	      throw new TypeError("Object prototype may only be an Object or null: " +
	                         newProto);
	    }
	    
	    if (!Object_isExtensible(target)) {
	      return false;
	    }
	    
	    var current = Object.getPrototypeOf(target);
	    if (sameValue(current, newProto)) {
	      return true;
	    }
	    
	    if (prim_setPrototypeOf) {
	      try {
	        prim_setPrototypeOf(target, newProto);
	        return true;
	      } catch (e) {
	        return false;
	      }
	    }

	    __proto__setter.call(target, newProto);
	    return true;
	  },
	  preventExtensions: function(target) {
	    var handler = directProxies.get(target);
	    if (handler !== undefined) {
	      return handler.preventExtensions();
	    }
	    prim_preventExtensions(target);
	    return true;
	  },
	  isExtensible: function(target) {
	    return Object.isExtensible(target);
	  },
	  has: function(target, name) {
	    return name in target;
	  },
	  get: function(target, name, receiver) {
	    receiver = receiver || target;

	    // if target is a proxy, invoke its "get" trap
	    var handler = directProxies.get(target);
	    if (handler !== undefined) {
	      return handler.get(receiver, name);
	    }

	    var desc = Object.getOwnPropertyDescriptor(target, name);
	    if (desc === undefined) {
	      var proto = Object.getPrototypeOf(target);
	      if (proto === null) {
	        return undefined;
	      }
	      return Reflect.get(proto, name, receiver);
	    }
	    if (isDataDescriptor(desc)) {
	      return desc.value;
	    }
	    var getter = desc.get;
	    if (getter === undefined) {
	      return undefined;
	    }
	    return desc.get.call(receiver);
	  },
	  // Reflect.set implementation based on latest version of [[SetP]] at
	  // http://wiki.ecmascript.org/doku.php?id=harmony:proto_climbing_refactoring
	  set: function(target, name, value, receiver) {
	    receiver = receiver || target;

	    // if target is a proxy, invoke its "set" trap
	    var handler = directProxies.get(target);
	    if (handler !== undefined) {
	      return handler.set(receiver, name, value);
	    }

	    // first, check whether target has a non-writable property
	    // shadowing name on receiver
	    var ownDesc = Object.getOwnPropertyDescriptor(target, name);

	    if (ownDesc === undefined) {
	      // name is not defined in target, search target's prototype
	      var proto = Object.getPrototypeOf(target);

	      if (proto !== null) {
	        // continue the search in target's prototype
	        return Reflect.set(proto, name, value, receiver);
	      }

	      // Rev16 change. Cf. https://bugs.ecmascript.org/show_bug.cgi?id=1549
	      // target was the last prototype, now we know that 'name' is not shadowed
	      // by an existing (accessor or data) property, so we can add the property
	      // to the initial receiver object
	      // (this branch will intentionally fall through to the code below)
	      ownDesc =
	        { value: undefined,
	          writable: true,
	          enumerable: true,
	          configurable: true };
	    }

	    // we now know that ownDesc !== undefined
	    if (isAccessorDescriptor(ownDesc)) {
	      var setter = ownDesc.set;
	      if (setter === undefined) return false;
	      setter.call(receiver, value); // assumes Function.prototype.call
	      return true;
	    }
	    // otherwise, isDataDescriptor(ownDesc) must be true
	    if (ownDesc.writable === false) return false;
	    // we found an existing writable data property on the prototype chain.
	    // Now update or add the data property on the receiver, depending on
	    // whether the receiver already defines the property or not.
	    var existingDesc = Object.getOwnPropertyDescriptor(receiver, name);
	    if (existingDesc !== undefined) {
	      var updateDesc =
	        { value: value,
	          // FIXME: it should not be necessary to describe the following
	          // attributes. Added to circumvent a bug in tracemonkey:
	          // https://bugzilla.mozilla.org/show_bug.cgi?id=601329
	          writable:     existingDesc.writable,
	          enumerable:   existingDesc.enumerable,
	          configurable: existingDesc.configurable };
	      Object.defineProperty(receiver, name, updateDesc);
	      return true;
	    } else {
	      if (!Object.isExtensible(receiver)) return false;
	      var newDesc =
	        { value: value,
	          writable: true,
	          enumerable: true,
	          configurable: true };
	      Object.defineProperty(receiver, name, newDesc);
	      return true;
	    }
	  },
	  /*invoke: function(target, name, args, receiver) {
	    receiver = receiver || target;

	    var handler = directProxies.get(target);
	    if (handler !== undefined) {
	      return handler.invoke(receiver, name, args);
	    }

	    var fun = Reflect.get(target, name, receiver);
	    return Function.prototype.apply.call(fun, receiver, args);
	  },*/
	  enumerate: function(target) {
	    var handler = directProxies.get(target);
	    var result;
	    if (handler !== undefined) {
	      // handler.enumerate should return an iterator directly, but the
	      // iterator gets converted to an array for backward-compat reasons,
	      // so we must re-iterate over the array
	      result = handler.enumerate(handler.target);
	    } else {
	      result = [];
	      for (var name in target) { result.push(name); };      
	    }
	    var l = +result.length;
	    var idx = 0;
	    return {
	      next: function() {
	        if (idx === l) return { done: true };
	        return { done: false, value: result[idx++] };
	      }
	    };
	  },
	  // imperfect ownKeys implementation: in ES6, should also include
	  // symbol-keyed properties.
	  ownKeys: function(target) {
	    return Object_getOwnPropertyNames(target);
	  },
	  apply: function(target, receiver, args) {
	    // target.apply(receiver, args)
	    return Function.prototype.apply.call(target, receiver, args);
	  },
	  construct: function(target, args) {
	    // return new target(...args);

	    // if target is a proxy, invoke its "construct" trap
	    var handler = directProxies.get(target);
	    if (handler !== undefined) {
	      return handler.construct(handler.target, args);
	    }

	    var proto = target.prototype;
	    var instance = (Object(proto) === proto) ? Object.create(proto) : {};
	    var result = Function.prototype.apply.call(target, instance, args);
	    return Object(result) === result ? result : instance;
	  }
	};

	// feature-test whether the Proxy global exists
	if (typeof Proxy !== "undefined") {

	  var primCreate = Proxy.create,
	      primCreateFunction = Proxy.createFunction;

	  var revokedHandler = primCreate({
	    get: function() { throw new TypeError("proxy is revoked"); }
	  });

	  global.Proxy = function(target, handler) {
	    // check that target is an Object
	    if (Object(target) !== target) {
	      throw new TypeError("Proxy target must be an Object, given "+target);
	    }
	    // check that handler is an Object
	    if (Object(handler) !== handler) {
	      throw new TypeError("Proxy handler must be an Object, given "+handler);
	    }

	    var vHandler = new Validator(target, handler);
	    var proxy;
	    if (typeof target === "function") {
	      proxy = primCreateFunction(vHandler,
	        // call trap
	        function() {
	          var args = Array.prototype.slice.call(arguments);
	          return vHandler.apply(target, this, args);
	        },
	        // construct trap
	        function() {
	          var args = Array.prototype.slice.call(arguments);
	          return vHandler.construct(target, args);
	        });
	    } else {
	      proxy = primCreate(vHandler, Object.getPrototypeOf(target));
	    }
	    directProxies.set(proxy, vHandler);
	    return proxy;
	  };

	  global.Proxy.revocable = function(target, handler) {
	    var proxy = new Proxy(target, handler);
	    var revoke = function() {
	      var vHandler = directProxies.get(proxy);
	      if (vHandler !== null) {
	        vHandler.target  = null;
	        vHandler.handler = revokedHandler;
	      }
	      return undefined;
	    };
	    return {proxy: proxy, revoke: revoke};
	  }

	} else {
	  // Proxy global not defined, so proxies are not supported

	  global.Proxy = function(_target, _handler) {
	    throw new Error("proxies not supported on this platform");
	  }

	}

	// for node.js modules, export every property in the Reflect object
	// as part of the module interface
	if (true) {
	  Object.keys(Reflect).forEach(function (key) {
	    exports[key] = Reflect[key];
	  });
	}

	}(true ? global : this)); // function-as-module pattern
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        len = arguments.length;
	        args = new Array(len - 1);
	        for (i = 1; i < len; i++)
	          args[i - 1] = arguments[i];
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    len = arguments.length;
	    args = new Array(len - 1);
	    for (i = 1; i < len; i++)
	      args[i - 1] = arguments[i];

	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    var m;
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  var ret;
	  if (!emitter._events || !emitter._events[type])
	    ret = 0;
	  else if (isFunction(emitter._events[type]))
	    ret = 1;
	  else
	    ret = emitter._events[type].length;
	  return ret;
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(10);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(14);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(11)))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {(function() {
	  'use strict';
	  var Linda, LindaAdapter, SocketIOClient, async;

	  SocketIOClient = __webpack_require__(15);

	  Linda = __webpack_require__(17);

	  if (typeof window !== "undefined" && window !== null) {
	    Linda = window.Linda;
	  }

	  async = __webpack_require__(18);

	  module.exports = LindaAdapter = (function() {
	    LindaAdapter.DEFAULT = {
	      address: 'http://babascript-linda.herokuapp.com'
	    };

	    function LindaAdapter(api, options) {
	      this.options = options != null ? options : {};
	      this.api = api || LindaAdapter.DEFAULT.address;
	      this.functions = {};
	    }

	    LindaAdapter.prototype.attach = function(baba) {
	      this.baba = baba;
	      this.connect();
	      this.result_queue = this.linda.tuplespace("" + this.baba.id + "_result_queue");
	      this.normal_queue = this.linda.tuplespace("" + this.baba.id + "_normal_queue");
	      this.interrupt_queue = this.linda.tuplespace("" + this.baba.id + "_interrupt_queue");
	      if (this.linda.io.connected) {
	        return this.baba.emit('connect');
	      } else {
	        return this.linda.io.on('connect', (function(_this) {
	          return function() {
	            return _this.baba.emit('connect');
	          };
	        })(this));
	      }
	    };

	    LindaAdapter.prototype.connect = function() {
	      var port, socket;
	      port = this.options.port || process.env.PORT || 80;
	      socket = SocketIOClient.connect(this.api + (":" + port), {
	        'force new connection': true
	      });
	      return this.linda = new Linda().connect(socket);
	    };

	    LindaAdapter.prototype.disconnect = function() {
	      return this.linda.io.disconnect();
	    };

	    LindaAdapter.prototype.send = function(data) {
	      var _ref;
	      if (data.type === 'return') {
	        return this.result_queue.write(data);
	      } else if (((_ref = data.options) != null ? _ref.interrupt : void 0) != null) {
	        data.type = 'interrupt';
	        return this.interrupt_queue.write(data);
	      } else {
	        return this.normal_queue.write(data);
	      }
	    };

	    LindaAdapter.prototype.receive = function(tuple, callback) {
	      var cid, cs, i, t, _i, _ref;
	      cid = tuple.cid;
	      t = {
	        baba: 'script',
	        cid: cid,
	        type: 'return'
	      };
	      this.functions[cid] = [];
	      if (tuple.type === 'broadcast') {
	        cs = [];
	        for (i = _i = 0, _ref = tuple.count; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
	          this.functions[cid].push((function(_this) {
	            return function(c) {
	              cs.push(c);
	              return _this.result_queue.take(t, function(err, tuple) {
	                var func;
	                func = cs.shift();
	                return func(null, tuple);
	              });
	            };
	          })(this));
	        }
	        return async.parallel(this.functions[cid], (function(_this) {
	          return function(err, results) {
	            callback(err, results);
	            return _this.functions[cid] = null;
	          };
	        })(this));
	      } else {
	        this.functions[cid].push(callback);
	        return this.result_queue.take(t, function(err, tuple) {
	          return callback(err, tuple);
	        });
	      }
	    };

	    LindaAdapter.prototype.clientReceive = function(tuple, callback) {
	      switch (tuple.type) {
	        case 'eval':
	          return this.normal_queue.option({
	            sort: 'queue'
	          }).take(tuple, callback);
	        case 'broadcast':
	        case 'cancel':
	          return this.normal_queue.watch(tuple, callback);
	        case 'interrupt':
	          return this.interrupt_queue.option({
	            sort: 'queue'
	          }).take(tuple, function(err, tuple) {
	            return callback(err, tuple);
	          });
	        default:
	          return null;
	      }
	    };

	    LindaAdapter.prototype.stream = function(callback) {
	      this.normal_queue.option({
	        sort: 'queue'
	      }).read({
	        type: 'eval'
	      }, (function(_this) {
	        return function(err, data) {
	          _this.normal_queue.watch({
	            type: 'eval'
	          }, callback);
	          return callback(err, data);
	        };
	      })(this));
	      return this.interrupt_queue.option({
	        sort: 'queue'
	      }).read({
	        type: 'interrupt'
	      }, (function(_this) {
	        return function(err, data) {
	          _this.interrupt_queue.watch({
	            type: 'interrupt'
	          }, callback);
	          return callback(err, data);
	        };
	      })(this));
	    };

	    LindaAdapter.prototype.cancel = function(cid, reason) {
	      var tuple;
	      tuple = {
	        baba: 'script',
	        cid: cid,
	        type: 'cancel',
	        reason: reason
	      };
	      return this.normal_queue.write(tuple);
	    };

	    return LindaAdapter;

	  })();

	}).call(this);
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Promise = __webpack_require__(12).Promise;
	var polyfill = __webpack_require__(13).polyfill;
	exports.Promise = Promise;
	exports.polyfill = polyfill;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(16);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return args;

	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	  return args;
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // This hackery is required for IE8,
	  // where the `console.log` function doesn't have 'apply'
	  return 'object' == typeof console
	    && 'function' == typeof console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      localStorage.removeItem('debug');
	    } else {
	      localStorage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    r = localStorage.debug;
	  } catch(e) {}
	  return r;
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// shim for using process in browser

	var process = module.exports = {};

	process.nextTick = (function () {
	    var canSetImmediate = typeof window !== 'undefined'
	    && window.setImmediate;
	    var canMutationObserver = typeof window !== 'undefined'
	    && window.MutationObserver;
	    var canPost = typeof window !== 'undefined'
	    && window.postMessage && window.addEventListener
	    ;

	    if (canSetImmediate) {
	        return function (f) { return window.setImmediate(f) };
	    }

	    var queue = [];

	    if (canMutationObserver) {
	        var hiddenDiv = document.createElement("div");
	        var observer = new MutationObserver(function () {
	            var queueList = queue.slice();
	            queue.length = 0;
	            queueList.forEach(function (fn) {
	                fn();
	            });
	        });

	        observer.observe(hiddenDiv, { attributes: true });

	        return function nextTick(fn) {
	            if (!queue.length) {
	                hiddenDiv.setAttribute('yes', 'no');
	            }
	            queue.push(fn);
	        };
	    }

	    if (canPost) {
	        window.addEventListener('message', function (ev) {
	            var source = ev.source;
	            if ((source === window || source === null) && ev.data === 'process-tick') {
	                ev.stopPropagation();
	                if (queue.length > 0) {
	                    var fn = queue.shift();
	                    fn();
	                }
	            }
	        }, true);

	        return function nextTick(fn) {
	            queue.push(fn);
	            window.postMessage('process-tick', '*');
	        };
	    }

	    return function nextTick(fn) {
	        setTimeout(fn, 0);
	    };
	})();

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var config = __webpack_require__(19).config;
	var configure = __webpack_require__(19).configure;
	var objectOrFunction = __webpack_require__(20).objectOrFunction;
	var isFunction = __webpack_require__(20).isFunction;
	var now = __webpack_require__(20).now;
	var all = __webpack_require__(21).all;
	var race = __webpack_require__(22).race;
	var staticResolve = __webpack_require__(23).resolve;
	var staticReject = __webpack_require__(24).reject;
	var asap = __webpack_require__(25).asap;

	var counter = 0;

	config.async = asap; // default async is asap;

	function Promise(resolver) {
	  if (!isFunction(resolver)) {
	    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	  }

	  if (!(this instanceof Promise)) {
	    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	  }

	  this._subscribers = [];

	  invokeResolver(resolver, this);
	}

	function invokeResolver(resolver, promise) {
	  function resolvePromise(value) {
	    resolve(promise, value);
	  }

	  function rejectPromise(reason) {
	    reject(promise, reason);
	  }

	  try {
	    resolver(resolvePromise, rejectPromise);
	  } catch(e) {
	    rejectPromise(e);
	  }
	}

	function invokeCallback(settled, promise, callback, detail) {
	  var hasCallback = isFunction(callback),
	      value, error, succeeded, failed;

	  if (hasCallback) {
	    try {
	      value = callback(detail);
	      succeeded = true;
	    } catch(e) {
	      failed = true;
	      error = e;
	    }
	  } else {
	    value = detail;
	    succeeded = true;
	  }

	  if (handleThenable(promise, value)) {
	    return;
	  } else if (hasCallback && succeeded) {
	    resolve(promise, value);
	  } else if (failed) {
	    reject(promise, error);
	  } else if (settled === FULFILLED) {
	    resolve(promise, value);
	  } else if (settled === REJECTED) {
	    reject(promise, value);
	  }
	}

	var PENDING   = void 0;
	var SEALED    = 0;
	var FULFILLED = 1;
	var REJECTED  = 2;

	function subscribe(parent, child, onFulfillment, onRejection) {
	  var subscribers = parent._subscribers;
	  var length = subscribers.length;

	  subscribers[length] = child;
	  subscribers[length + FULFILLED] = onFulfillment;
	  subscribers[length + REJECTED]  = onRejection;
	}

	function publish(promise, settled) {
	  var child, callback, subscribers = promise._subscribers, detail = promise._detail;

	  for (var i = 0; i < subscribers.length; i += 3) {
	    child = subscribers[i];
	    callback = subscribers[i + settled];

	    invokeCallback(settled, child, callback, detail);
	  }

	  promise._subscribers = null;
	}

	Promise.prototype = {
	  constructor: Promise,

	  _state: undefined,
	  _detail: undefined,
	  _subscribers: undefined,

	  then: function(onFulfillment, onRejection) {
	    var promise = this;

	    var thenPromise = new this.constructor(function() {});

	    if (this._state) {
	      var callbacks = arguments;
	      config.async(function invokePromiseCallback() {
	        invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
	      });
	    } else {
	      subscribe(this, thenPromise, onFulfillment, onRejection);
	    }

	    return thenPromise;
	  },

	  'catch': function(onRejection) {
	    return this.then(null, onRejection);
	  }
	};

	Promise.all = all;
	Promise.race = race;
	Promise.resolve = staticResolve;
	Promise.reject = staticReject;

	function handleThenable(promise, value) {
	  var then = null,
	  resolved;

	  try {
	    if (promise === value) {
	      throw new TypeError("A promises callback cannot return that same promise.");
	    }

	    if (objectOrFunction(value)) {
	      then = value.then;

	      if (isFunction(then)) {
	        then.call(value, function(val) {
	          if (resolved) { return true; }
	          resolved = true;

	          if (value !== val) {
	            resolve(promise, val);
	          } else {
	            fulfill(promise, val);
	          }
	        }, function(val) {
	          if (resolved) { return true; }
	          resolved = true;

	          reject(promise, val);
	        });

	        return true;
	      }
	    }
	  } catch (error) {
	    if (resolved) { return true; }
	    reject(promise, error);
	    return true;
	  }

	  return false;
	}

	function resolve(promise, value) {
	  if (promise === value) {
	    fulfill(promise, value);
	  } else if (!handleThenable(promise, value)) {
	    fulfill(promise, value);
	  }
	}

	function fulfill(promise, value) {
	  if (promise._state !== PENDING) { return; }
	  promise._state = SEALED;
	  promise._detail = value;

	  config.async(publishFulfillment, promise);
	}

	function reject(promise, reason) {
	  if (promise._state !== PENDING) { return; }
	  promise._state = SEALED;
	  promise._detail = reason;

	  config.async(publishRejection, promise);
	}

	function publishFulfillment(promise) {
	  publish(promise, promise._state = FULFILLED);
	}

	function publishRejection(promise) {
	  publish(promise, promise._state = REJECTED);
	}

	exports.Promise = Promise;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";
	/*global self*/
	var RSVPPromise = __webpack_require__(12).Promise;
	var isFunction = __webpack_require__(20).isFunction;

	function polyfill() {
	  var local;

	  if (typeof global !== 'undefined') {
	    local = global;
	  } else if (typeof window !== 'undefined' && window.document) {
	    local = window;
	  } else {
	    local = self;
	  }

	  var es6PromiseSupport = 
	    "Promise" in local &&
	    // Some of these methods are missing from
	    // Firefox/Chrome experimental implementations
	    "resolve" in local.Promise &&
	    "reject" in local.Promise &&
	    "all" in local.Promise &&
	    "race" in local.Promise &&
	    // Older version of the spec had a resolver object
	    // as the arg rather than a function
	    (function() {
	      var resolve;
	      new local.Promise(function(r) { resolve = r; });
	      return isFunction(resolve);
	    }());

	  if (!es6PromiseSupport) {
	    local.Promise = RSVPPromise;
	  }
	}

	exports.polyfill = polyfill;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = __webpack_require__(26);


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(27);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = Array.prototype.slice.call(arguments);

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {(function() {
	  var LindaClient, ReadTakeOption, TupleSpace;

	  LindaClient = (function() {
	    function LindaClient() {}

	    LindaClient.prototype.connect = function(io) {
	      this.io = io;
	      return this;
	    };

	    LindaClient.prototype.tuplespace = function(name) {
	      return new TupleSpace(this, name);
	    };

	    return LindaClient;

	  })();

	  TupleSpace = (function() {
	    function TupleSpace(linda, name) {
	      this.linda = linda;
	      this.name = name;
	      this.watch_callback_ids = {};
	      this.io_callbacks = [];
	      this.linda.io.on('disconnect', (function(_this) {
	        return function() {
	          return _this.remove_io_callbacks();
	        };
	      })(this));
	    }

	    TupleSpace.prototype.create_callback_id = function() {
	      return Date.now() - Math.random();
	    };

	    TupleSpace.prototype.option = function(opt) {
	      return new ReadTakeOption(this, opt);
	    };

	    TupleSpace.prototype.create_watch_callback_id = function(tuple) {
	      var key;
	      key = JSON.stringify(tuple);
	      return this.watch_callback_ids[key] || (this.watch_callback_ids[key] = this.create_callback_id());
	    };

	    TupleSpace.prototype.remove_io_callbacks = function() {
	      var c, _i, _len, _ref;
	      _ref = this.io_callbacks;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        c = _ref[_i];
	        this.linda.io.removeListener(c.name, c.listener);
	      }
	      return this.io_callbacks = [];
	    };

	    TupleSpace.prototype.write = function(tuple, options) {
	      var data;
	      if (options == null) {
	        options = {
	          expire: null
	        };
	      }
	      data = {
	        tuplespace: this.name,
	        tuple: tuple,
	        options: options
	      };
	      return this.linda.io.emit('__linda_write', data);
	    };

	    TupleSpace.prototype.take = function(tuple, callback) {
	      return this.option({}).take(tuple, callback);
	    };

	    TupleSpace.prototype.read = function(tuple, callback) {
	      return this.option({}).read(tuple, callback);
	    };

	    TupleSpace.prototype.watch = function(tuple, callback) {
	      var id, listener, name;
	      if (typeof callback !== 'function') {
	        return;
	      }
	      id = this.create_watch_callback_id(tuple);
	      name = "__linda_watch_" + id;
	      listener = function(err, tuple) {
	        return callback(err, tuple);
	      };
	      this.io_callbacks.push({
	        name: name,
	        listener: listener
	      });
	      this.linda.io.on(name, listener);
	      this.linda.io.emit('__linda_watch', {
	        tuplespace: this.name,
	        tuple: tuple,
	        id: id
	      });
	      return id;
	    };

	    TupleSpace.prototype.cancel = function(id) {
	      if (this.linda.io.connected) {
	        this.linda.io.emit('__linda_cancel', {
	          tuplespace: this.name,
	          id: id
	        });
	      }
	      return setTimeout((function(_this) {
	        return function() {
	          var c, i, _i, _ref, _results;
	          _results = [];
	          for (i = _i = _ref = _this.io_callbacks.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
	            c = _this.io_callbacks[i];
	            if (c.name.match(new RegExp("_" + id + "$"))) {
	              _this.linda.io.removeListener(c.name, c.listener);
	              _results.push(_this.io_callbacks.splice(i, 1));
	            } else {
	              _results.push(void 0);
	            }
	          }
	          return _results;
	        };
	      })(this), 100);
	    };

	    return TupleSpace;

	  })();

	  ReadTakeOption = (function() {
	    var DEFAULT;

	    DEFAULT = {
	      sort: 'stack'
	    };

	    function ReadTakeOption(ts, opts) {
	      var k, v;
	      this.ts = ts;
	      this.opts = opts != null ? opts : {};
	      for (k in DEFAULT) {
	        v = DEFAULT[k];
	        if (!this.opts.hasOwnProperty(k)) {
	          this.opts[k] = v;
	        }
	      }
	    }

	    ReadTakeOption.prototype.read = function(tuple, callback) {
	      var id, listener, name;
	      if (typeof callback !== 'function') {
	        return;
	      }
	      id = this.ts.create_callback_id();
	      name = "__linda_read_" + id;
	      listener = function(err, tuple) {
	        return callback(err, tuple);
	      };
	      this.ts.io_callbacks.push({
	        name: name,
	        listener: listener
	      });
	      this.ts.linda.io.once(name, listener);
	      this.ts.linda.io.emit('__linda_read', {
	        tuplespace: this.ts.name,
	        tuple: tuple,
	        id: id,
	        options: this.opts
	      });
	      return id;
	    };

	    ReadTakeOption.prototype.take = function(tuple, callback) {
	      var id, listener, name;
	      if (typeof callback !== 'function') {
	        return;
	      }
	      id = this.ts.create_callback_id();
	      name = "__linda_take_" + id;
	      listener = function(err, tuple) {
	        return callback(err, tuple);
	      };
	      this.ts.io_callbacks.push({
	        name: name,
	        listener: listener
	      });
	      this.ts.linda.io.once(name, listener);
	      this.ts.linda.io.emit('__linda_take', {
	        tuplespace: this.ts.name,
	        tuple: tuple,
	        id: id,
	        options: this.opts
	      });
	      return id;
	    };

	    return ReadTakeOption;

	  })();

	  if (typeof window !== "undefined" && window !== null) {
	    window.Linda = LindaClient;
	  } else if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
	    module.exports = LindaClient;
	  }

	}).call(this);
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(31)(module)))

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process) {/*!
	 * async
	 * https://github.com/caolan/async
	 *
	 * Copyright 2010-2014 Caolan McMahon
	 * Released under the MIT license
	 */
	/*jshint onevar: false, indent:4 */
	/*global setImmediate: false, setTimeout: false, console: false */
	(function () {

	    var async = {};

	    // global on the server, window in the browser
	    var root, previous_async;

	    root = this;
	    if (root != null) {
	      previous_async = root.async;
	    }

	    async.noConflict = function () {
	        root.async = previous_async;
	        return async;
	    };

	    function only_once(fn) {
	        var called = false;
	        return function() {
	            if (called) throw new Error("Callback was already called.");
	            called = true;
	            fn.apply(root, arguments);
	        }
	    }

	    //// cross-browser compatiblity functions ////

	    var _toString = Object.prototype.toString;

	    var _isArray = Array.isArray || function (obj) {
	        return _toString.call(obj) === '[object Array]';
	    };

	    var _each = function (arr, iterator) {
	        if (arr.forEach) {
	            return arr.forEach(iterator);
	        }
	        for (var i = 0; i < arr.length; i += 1) {
	            iterator(arr[i], i, arr);
	        }
	    };

	    var _map = function (arr, iterator) {
	        if (arr.map) {
	            return arr.map(iterator);
	        }
	        var results = [];
	        _each(arr, function (x, i, a) {
	            results.push(iterator(x, i, a));
	        });
	        return results;
	    };

	    var _reduce = function (arr, iterator, memo) {
	        if (arr.reduce) {
	            return arr.reduce(iterator, memo);
	        }
	        _each(arr, function (x, i, a) {
	            memo = iterator(memo, x, i, a);
	        });
	        return memo;
	    };

	    var _keys = function (obj) {
	        if (Object.keys) {
	            return Object.keys(obj);
	        }
	        var keys = [];
	        for (var k in obj) {
	            if (obj.hasOwnProperty(k)) {
	                keys.push(k);
	            }
	        }
	        return keys;
	    };

	    //// exported async module functions ////

	    //// nextTick implementation with browser-compatible fallback ////
	    if (typeof process === 'undefined' || !(process.nextTick)) {
	        if (typeof setImmediate === 'function') {
	            async.nextTick = function (fn) {
	                // not a direct alias for IE10 compatibility
	                setImmediate(fn);
	            };
	            async.setImmediate = async.nextTick;
	        }
	        else {
	            async.nextTick = function (fn) {
	                setTimeout(fn, 0);
	            };
	            async.setImmediate = async.nextTick;
	        }
	    }
	    else {
	        async.nextTick = process.nextTick;
	        if (typeof setImmediate !== 'undefined') {
	            async.setImmediate = function (fn) {
	              // not a direct alias for IE10 compatibility
	              setImmediate(fn);
	            };
	        }
	        else {
	            async.setImmediate = async.nextTick;
	        }
	    }

	    async.each = function (arr, iterator, callback) {
	        callback = callback || function () {};
	        if (!arr.length) {
	            return callback();
	        }
	        var completed = 0;
	        _each(arr, function (x) {
	            iterator(x, only_once(done) );
	        });
	        function done(err) {
	          if (err) {
	              callback(err);
	              callback = function () {};
	          }
	          else {
	              completed += 1;
	              if (completed >= arr.length) {
	                  callback();
	              }
	          }
	        }
	    };
	    async.forEach = async.each;

	    async.eachSeries = function (arr, iterator, callback) {
	        callback = callback || function () {};
	        if (!arr.length) {
	            return callback();
	        }
	        var completed = 0;
	        var iterate = function () {
	            iterator(arr[completed], function (err) {
	                if (err) {
	                    callback(err);
	                    callback = function () {};
	                }
	                else {
	                    completed += 1;
	                    if (completed >= arr.length) {
	                        callback();
	                    }
	                    else {
	                        iterate();
	                    }
	                }
	            });
	        };
	        iterate();
	    };
	    async.forEachSeries = async.eachSeries;

	    async.eachLimit = function (arr, limit, iterator, callback) {
	        var fn = _eachLimit(limit);
	        fn.apply(null, [arr, iterator, callback]);
	    };
	    async.forEachLimit = async.eachLimit;

	    var _eachLimit = function (limit) {

	        return function (arr, iterator, callback) {
	            callback = callback || function () {};
	            if (!arr.length || limit <= 0) {
	                return callback();
	            }
	            var completed = 0;
	            var started = 0;
	            var running = 0;

	            (function replenish () {
	                if (completed >= arr.length) {
	                    return callback();
	                }

	                while (running < limit && started < arr.length) {
	                    started += 1;
	                    running += 1;
	                    iterator(arr[started - 1], function (err) {
	                        if (err) {
	                            callback(err);
	                            callback = function () {};
	                        }
	                        else {
	                            completed += 1;
	                            running -= 1;
	                            if (completed >= arr.length) {
	                                callback();
	                            }
	                            else {
	                                replenish();
	                            }
	                        }
	                    });
	                }
	            })();
	        };
	    };


	    var doParallel = function (fn) {
	        return function () {
	            var args = Array.prototype.slice.call(arguments);
	            return fn.apply(null, [async.each].concat(args));
	        };
	    };
	    var doParallelLimit = function(limit, fn) {
	        return function () {
	            var args = Array.prototype.slice.call(arguments);
	            return fn.apply(null, [_eachLimit(limit)].concat(args));
	        };
	    };
	    var doSeries = function (fn) {
	        return function () {
	            var args = Array.prototype.slice.call(arguments);
	            return fn.apply(null, [async.eachSeries].concat(args));
	        };
	    };


	    var _asyncMap = function (eachfn, arr, iterator, callback) {
	        arr = _map(arr, function (x, i) {
	            return {index: i, value: x};
	        });
	        if (!callback) {
	            eachfn(arr, function (x, callback) {
	                iterator(x.value, function (err) {
	                    callback(err);
	                });
	            });
	        } else {
	            var results = [];
	            eachfn(arr, function (x, callback) {
	                iterator(x.value, function (err, v) {
	                    results[x.index] = v;
	                    callback(err);
	                });
	            }, function (err) {
	                callback(err, results);
	            });
	        }
	    };
	    async.map = doParallel(_asyncMap);
	    async.mapSeries = doSeries(_asyncMap);
	    async.mapLimit = function (arr, limit, iterator, callback) {
	        return _mapLimit(limit)(arr, iterator, callback);
	    };

	    var _mapLimit = function(limit) {
	        return doParallelLimit(limit, _asyncMap);
	    };

	    // reduce only has a series version, as doing reduce in parallel won't
	    // work in many situations.
	    async.reduce = function (arr, memo, iterator, callback) {
	        async.eachSeries(arr, function (x, callback) {
	            iterator(memo, x, function (err, v) {
	                memo = v;
	                callback(err);
	            });
	        }, function (err) {
	            callback(err, memo);
	        });
	    };
	    // inject alias
	    async.inject = async.reduce;
	    // foldl alias
	    async.foldl = async.reduce;

	    async.reduceRight = function (arr, memo, iterator, callback) {
	        var reversed = _map(arr, function (x) {
	            return x;
	        }).reverse();
	        async.reduce(reversed, memo, iterator, callback);
	    };
	    // foldr alias
	    async.foldr = async.reduceRight;

	    var _filter = function (eachfn, arr, iterator, callback) {
	        var results = [];
	        arr = _map(arr, function (x, i) {
	            return {index: i, value: x};
	        });
	        eachfn(arr, function (x, callback) {
	            iterator(x.value, function (v) {
	                if (v) {
	                    results.push(x);
	                }
	                callback();
	            });
	        }, function (err) {
	            callback(_map(results.sort(function (a, b) {
	                return a.index - b.index;
	            }), function (x) {
	                return x.value;
	            }));
	        });
	    };
	    async.filter = doParallel(_filter);
	    async.filterSeries = doSeries(_filter);
	    // select alias
	    async.select = async.filter;
	    async.selectSeries = async.filterSeries;

	    var _reject = function (eachfn, arr, iterator, callback) {
	        var results = [];
	        arr = _map(arr, function (x, i) {
	            return {index: i, value: x};
	        });
	        eachfn(arr, function (x, callback) {
	            iterator(x.value, function (v) {
	                if (!v) {
	                    results.push(x);
	                }
	                callback();
	            });
	        }, function (err) {
	            callback(_map(results.sort(function (a, b) {
	                return a.index - b.index;
	            }), function (x) {
	                return x.value;
	            }));
	        });
	    };
	    async.reject = doParallel(_reject);
	    async.rejectSeries = doSeries(_reject);

	    var _detect = function (eachfn, arr, iterator, main_callback) {
	        eachfn(arr, function (x, callback) {
	            iterator(x, function (result) {
	                if (result) {
	                    main_callback(x);
	                    main_callback = function () {};
	                }
	                else {
	                    callback();
	                }
	            });
	        }, function (err) {
	            main_callback();
	        });
	    };
	    async.detect = doParallel(_detect);
	    async.detectSeries = doSeries(_detect);

	    async.some = function (arr, iterator, main_callback) {
	        async.each(arr, function (x, callback) {
	            iterator(x, function (v) {
	                if (v) {
	                    main_callback(true);
	                    main_callback = function () {};
	                }
	                callback();
	            });
	        }, function (err) {
	            main_callback(false);
	        });
	    };
	    // any alias
	    async.any = async.some;

	    async.every = function (arr, iterator, main_callback) {
	        async.each(arr, function (x, callback) {
	            iterator(x, function (v) {
	                if (!v) {
	                    main_callback(false);
	                    main_callback = function () {};
	                }
	                callback();
	            });
	        }, function (err) {
	            main_callback(true);
	        });
	    };
	    // all alias
	    async.all = async.every;

	    async.sortBy = function (arr, iterator, callback) {
	        async.map(arr, function (x, callback) {
	            iterator(x, function (err, criteria) {
	                if (err) {
	                    callback(err);
	                }
	                else {
	                    callback(null, {value: x, criteria: criteria});
	                }
	            });
	        }, function (err, results) {
	            if (err) {
	                return callback(err);
	            }
	            else {
	                var fn = function (left, right) {
	                    var a = left.criteria, b = right.criteria;
	                    return a < b ? -1 : a > b ? 1 : 0;
	                };
	                callback(null, _map(results.sort(fn), function (x) {
	                    return x.value;
	                }));
	            }
	        });
	    };

	    async.auto = function (tasks, callback) {
	        callback = callback || function () {};
	        var keys = _keys(tasks);
	        var remainingTasks = keys.length
	        if (!remainingTasks) {
	            return callback();
	        }

	        var results = {};

	        var listeners = [];
	        var addListener = function (fn) {
	            listeners.unshift(fn);
	        };
	        var removeListener = function (fn) {
	            for (var i = 0; i < listeners.length; i += 1) {
	                if (listeners[i] === fn) {
	                    listeners.splice(i, 1);
	                    return;
	                }
	            }
	        };
	        var taskComplete = function () {
	            remainingTasks--
	            _each(listeners.slice(0), function (fn) {
	                fn();
	            });
	        };

	        addListener(function () {
	            if (!remainingTasks) {
	                var theCallback = callback;
	                // prevent final callback from calling itself if it errors
	                callback = function () {};

	                theCallback(null, results);
	            }
	        });

	        _each(keys, function (k) {
	            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
	            var taskCallback = function (err) {
	                var args = Array.prototype.slice.call(arguments, 1);
	                if (args.length <= 1) {
	                    args = args[0];
	                }
	                if (err) {
	                    var safeResults = {};
	                    _each(_keys(results), function(rkey) {
	                        safeResults[rkey] = results[rkey];
	                    });
	                    safeResults[k] = args;
	                    callback(err, safeResults);
	                    // stop subsequent errors hitting callback multiple times
	                    callback = function () {};
	                }
	                else {
	                    results[k] = args;
	                    async.setImmediate(taskComplete);
	                }
	            };
	            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
	            var ready = function () {
	                return _reduce(requires, function (a, x) {
	                    return (a && results.hasOwnProperty(x));
	                }, true) && !results.hasOwnProperty(k);
	            };
	            if (ready()) {
	                task[task.length - 1](taskCallback, results);
	            }
	            else {
	                var listener = function () {
	                    if (ready()) {
	                        removeListener(listener);
	                        task[task.length - 1](taskCallback, results);
	                    }
	                };
	                addListener(listener);
	            }
	        });
	    };

	    async.retry = function(times, task, callback) {
	        var DEFAULT_TIMES = 5;
	        var attempts = [];
	        // Use defaults if times not passed
	        if (typeof times === 'function') {
	            callback = task;
	            task = times;
	            times = DEFAULT_TIMES;
	        }
	        // Make sure times is a number
	        times = parseInt(times, 10) || DEFAULT_TIMES;
	        var wrappedTask = function(wrappedCallback, wrappedResults) {
	            var retryAttempt = function(task, finalAttempt) {
	                return function(seriesCallback) {
	                    task(function(err, result){
	                        seriesCallback(!err || finalAttempt, {err: err, result: result});
	                    }, wrappedResults);
	                };
	            };
	            while (times) {
	                attempts.push(retryAttempt(task, !(times-=1)));
	            }
	            async.series(attempts, function(done, data){
	                data = data[data.length - 1];
	                (wrappedCallback || callback)(data.err, data.result);
	            });
	        }
	        // If a callback is passed, run this as a controll flow
	        return callback ? wrappedTask() : wrappedTask
	    };

	    async.waterfall = function (tasks, callback) {
	        callback = callback || function () {};
	        if (!_isArray(tasks)) {
	          var err = new Error('First argument to waterfall must be an array of functions');
	          return callback(err);
	        }
	        if (!tasks.length) {
	            return callback();
	        }
	        var wrapIterator = function (iterator) {
	            return function (err) {
	                if (err) {
	                    callback.apply(null, arguments);
	                    callback = function () {};
	                }
	                else {
	                    var args = Array.prototype.slice.call(arguments, 1);
	                    var next = iterator.next();
	                    if (next) {
	                        args.push(wrapIterator(next));
	                    }
	                    else {
	                        args.push(callback);
	                    }
	                    async.setImmediate(function () {
	                        iterator.apply(null, args);
	                    });
	                }
	            };
	        };
	        wrapIterator(async.iterator(tasks))();
	    };

	    var _parallel = function(eachfn, tasks, callback) {
	        callback = callback || function () {};
	        if (_isArray(tasks)) {
	            eachfn.map(tasks, function (fn, callback) {
	                if (fn) {
	                    fn(function (err) {
	                        var args = Array.prototype.slice.call(arguments, 1);
	                        if (args.length <= 1) {
	                            args = args[0];
	                        }
	                        callback.call(null, err, args);
	                    });
	                }
	            }, callback);
	        }
	        else {
	            var results = {};
	            eachfn.each(_keys(tasks), function (k, callback) {
	                tasks[k](function (err) {
	                    var args = Array.prototype.slice.call(arguments, 1);
	                    if (args.length <= 1) {
	                        args = args[0];
	                    }
	                    results[k] = args;
	                    callback(err);
	                });
	            }, function (err) {
	                callback(err, results);
	            });
	        }
	    };

	    async.parallel = function (tasks, callback) {
	        _parallel({ map: async.map, each: async.each }, tasks, callback);
	    };

	    async.parallelLimit = function(tasks, limit, callback) {
	        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
	    };

	    async.series = function (tasks, callback) {
	        callback = callback || function () {};
	        if (_isArray(tasks)) {
	            async.mapSeries(tasks, function (fn, callback) {
	                if (fn) {
	                    fn(function (err) {
	                        var args = Array.prototype.slice.call(arguments, 1);
	                        if (args.length <= 1) {
	                            args = args[0];
	                        }
	                        callback.call(null, err, args);
	                    });
	                }
	            }, callback);
	        }
	        else {
	            var results = {};
	            async.eachSeries(_keys(tasks), function (k, callback) {
	                tasks[k](function (err) {
	                    var args = Array.prototype.slice.call(arguments, 1);
	                    if (args.length <= 1) {
	                        args = args[0];
	                    }
	                    results[k] = args;
	                    callback(err);
	                });
	            }, function (err) {
	                callback(err, results);
	            });
	        }
	    };

	    async.iterator = function (tasks) {
	        var makeCallback = function (index) {
	            var fn = function () {
	                if (tasks.length) {
	                    tasks[index].apply(null, arguments);
	                }
	                return fn.next();
	            };
	            fn.next = function () {
	                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
	            };
	            return fn;
	        };
	        return makeCallback(0);
	    };

	    async.apply = function (fn) {
	        var args = Array.prototype.slice.call(arguments, 1);
	        return function () {
	            return fn.apply(
	                null, args.concat(Array.prototype.slice.call(arguments))
	            );
	        };
	    };

	    var _concat = function (eachfn, arr, fn, callback) {
	        var r = [];
	        eachfn(arr, function (x, cb) {
	            fn(x, function (err, y) {
	                r = r.concat(y || []);
	                cb(err);
	            });
	        }, function (err) {
	            callback(err, r);
	        });
	    };
	    async.concat = doParallel(_concat);
	    async.concatSeries = doSeries(_concat);

	    async.whilst = function (test, iterator, callback) {
	        if (test()) {
	            iterator(function (err) {
	                if (err) {
	                    return callback(err);
	                }
	                async.whilst(test, iterator, callback);
	            });
	        }
	        else {
	            callback();
	        }
	    };

	    async.doWhilst = function (iterator, test, callback) {
	        iterator(function (err) {
	            if (err) {
	                return callback(err);
	            }
	            var args = Array.prototype.slice.call(arguments, 1);
	            if (test.apply(null, args)) {
	                async.doWhilst(iterator, test, callback);
	            }
	            else {
	                callback();
	            }
	        });
	    };

	    async.until = function (test, iterator, callback) {
	        if (!test()) {
	            iterator(function (err) {
	                if (err) {
	                    return callback(err);
	                }
	                async.until(test, iterator, callback);
	            });
	        }
	        else {
	            callback();
	        }
	    };

	    async.doUntil = function (iterator, test, callback) {
	        iterator(function (err) {
	            if (err) {
	                return callback(err);
	            }
	            var args = Array.prototype.slice.call(arguments, 1);
	            if (!test.apply(null, args)) {
	                async.doUntil(iterator, test, callback);
	            }
	            else {
	                callback();
	            }
	        });
	    };

	    async.queue = function (worker, concurrency) {
	        if (concurrency === undefined) {
	            concurrency = 1;
	        }
	        function _insert(q, data, pos, callback) {
	          if (!q.started){
	            q.started = true;
	          }
	          if (!_isArray(data)) {
	              data = [data];
	          }
	          if(data.length == 0) {
	             // call drain immediately if there are no tasks
	             return async.setImmediate(function() {
	                 if (q.drain) {
	                     q.drain();
	                 }
	             });
	          }
	          _each(data, function(task) {
	              var item = {
	                  data: task,
	                  callback: typeof callback === 'function' ? callback : null
	              };

	              if (pos) {
	                q.tasks.unshift(item);
	              } else {
	                q.tasks.push(item);
	              }

	              if (q.saturated && q.tasks.length === q.concurrency) {
	                  q.saturated();
	              }
	              async.setImmediate(q.process);
	          });
	        }

	        var workers = 0;
	        var q = {
	            tasks: [],
	            concurrency: concurrency,
	            saturated: null,
	            empty: null,
	            drain: null,
	            started: false,
	            paused: false,
	            push: function (data, callback) {
	              _insert(q, data, false, callback);
	            },
	            kill: function () {
	              q.drain = null;
	              q.tasks = [];
	            },
	            unshift: function (data, callback) {
	              _insert(q, data, true, callback);
	            },
	            process: function () {
	                if (!q.paused && workers < q.concurrency && q.tasks.length) {
	                    var task = q.tasks.shift();
	                    if (q.empty && q.tasks.length === 0) {
	                        q.empty();
	                    }
	                    workers += 1;
	                    var next = function () {
	                        workers -= 1;
	                        if (task.callback) {
	                            task.callback.apply(task, arguments);
	                        }
	                        if (q.drain && q.tasks.length + workers === 0) {
	                            q.drain();
	                        }
	                        q.process();
	                    };
	                    var cb = only_once(next);
	                    worker(task.data, cb);
	                }
	            },
	            length: function () {
	                return q.tasks.length;
	            },
	            running: function () {
	                return workers;
	            },
	            idle: function() {
	                return q.tasks.length + workers === 0;
	            },
	            pause: function () {
	                if (q.paused === true) { return; }
	                q.paused = true;
	                q.process();
	            },
	            resume: function () {
	                if (q.paused === false) { return; }
	                q.paused = false;
	                q.process();
	            }
	        };
	        return q;
	    };
	    
	    async.priorityQueue = function (worker, concurrency) {
	        
	        function _compareTasks(a, b){
	          return a.priority - b.priority;
	        };
	        
	        function _binarySearch(sequence, item, compare) {
	          var beg = -1,
	              end = sequence.length - 1;
	          while (beg < end) {
	            var mid = beg + ((end - beg + 1) >>> 1);
	            if (compare(item, sequence[mid]) >= 0) {
	              beg = mid;
	            } else {
	              end = mid - 1;
	            }
	          }
	          return beg;
	        }
	        
	        function _insert(q, data, priority, callback) {
	          if (!q.started){
	            q.started = true;
	          }
	          if (!_isArray(data)) {
	              data = [data];
	          }
	          if(data.length == 0) {
	             // call drain immediately if there are no tasks
	             return async.setImmediate(function() {
	                 if (q.drain) {
	                     q.drain();
	                 }
	             });
	          }
	          _each(data, function(task) {
	              var item = {
	                  data: task,
	                  priority: priority,
	                  callback: typeof callback === 'function' ? callback : null
	              };
	              
	              q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

	              if (q.saturated && q.tasks.length === q.concurrency) {
	                  q.saturated();
	              }
	              async.setImmediate(q.process);
	          });
	        }
	        
	        // Start with a normal queue
	        var q = async.queue(worker, concurrency);
	        
	        // Override push to accept second parameter representing priority
	        q.push = function (data, priority, callback) {
	          _insert(q, data, priority, callback);
	        };
	        
	        // Remove unshift function
	        delete q.unshift;

	        return q;
	    };

	    async.cargo = function (worker, payload) {
	        var working     = false,
	            tasks       = [];

	        var cargo = {
	            tasks: tasks,
	            payload: payload,
	            saturated: null,
	            empty: null,
	            drain: null,
	            drained: true,
	            push: function (data, callback) {
	                if (!_isArray(data)) {
	                    data = [data];
	                }
	                _each(data, function(task) {
	                    tasks.push({
	                        data: task,
	                        callback: typeof callback === 'function' ? callback : null
	                    });
	                    cargo.drained = false;
	                    if (cargo.saturated && tasks.length === payload) {
	                        cargo.saturated();
	                    }
	                });
	                async.setImmediate(cargo.process);
	            },
	            process: function process() {
	                if (working) return;
	                if (tasks.length === 0) {
	                    if(cargo.drain && !cargo.drained) cargo.drain();
	                    cargo.drained = true;
	                    return;
	                }

	                var ts = typeof payload === 'number'
	                            ? tasks.splice(0, payload)
	                            : tasks.splice(0, tasks.length);

	                var ds = _map(ts, function (task) {
	                    return task.data;
	                });

	                if(cargo.empty) cargo.empty();
	                working = true;
	                worker(ds, function () {
	                    working = false;

	                    var args = arguments;
	                    _each(ts, function (data) {
	                        if (data.callback) {
	                            data.callback.apply(null, args);
	                        }
	                    });

	                    process();
	                });
	            },
	            length: function () {
	                return tasks.length;
	            },
	            running: function () {
	                return working;
	            }
	        };
	        return cargo;
	    };

	    var _console_fn = function (name) {
	        return function (fn) {
	            var args = Array.prototype.slice.call(arguments, 1);
	            fn.apply(null, args.concat([function (err) {
	                var args = Array.prototype.slice.call(arguments, 1);
	                if (typeof console !== 'undefined') {
	                    if (err) {
	                        if (console.error) {
	                            console.error(err);
	                        }
	                    }
	                    else if (console[name]) {
	                        _each(args, function (x) {
	                            console[name](x);
	                        });
	                    }
	                }
	            }]));
	        };
	    };
	    async.log = _console_fn('log');
	    async.dir = _console_fn('dir');
	    /*async.info = _console_fn('info');
	    async.warn = _console_fn('warn');
	    async.error = _console_fn('error');*/

	    async.memoize = function (fn, hasher) {
	        var memo = {};
	        var queues = {};
	        hasher = hasher || function (x) {
	            return x;
	        };
	        var memoized = function () {
	            var args = Array.prototype.slice.call(arguments);
	            var callback = args.pop();
	            var key = hasher.apply(null, args);
	            if (key in memo) {
	                async.nextTick(function () {
	                    callback.apply(null, memo[key]);
	                });
	            }
	            else if (key in queues) {
	                queues[key].push(callback);
	            }
	            else {
	                queues[key] = [callback];
	                fn.apply(null, args.concat([function () {
	                    memo[key] = arguments;
	                    var q = queues[key];
	                    delete queues[key];
	                    for (var i = 0, l = q.length; i < l; i++) {
	                      q[i].apply(null, arguments);
	                    }
	                }]));
	            }
	        };
	        memoized.memo = memo;
	        memoized.unmemoized = fn;
	        return memoized;
	    };

	    async.unmemoize = function (fn) {
	      return function () {
	        return (fn.unmemoized || fn).apply(null, arguments);
	      };
	    };

	    async.times = function (count, iterator, callback) {
	        var counter = [];
	        for (var i = 0; i < count; i++) {
	            counter.push(i);
	        }
	        return async.map(counter, iterator, callback);
	    };

	    async.timesSeries = function (count, iterator, callback) {
	        var counter = [];
	        for (var i = 0; i < count; i++) {
	            counter.push(i);
	        }
	        return async.mapSeries(counter, iterator, callback);
	    };

	    async.seq = function (/* functions... */) {
	        var fns = arguments;
	        return function () {
	            var that = this;
	            var args = Array.prototype.slice.call(arguments);
	            var callback = args.pop();
	            async.reduce(fns, args, function (newargs, fn, cb) {
	                fn.apply(that, newargs.concat([function () {
	                    var err = arguments[0];
	                    var nextargs = Array.prototype.slice.call(arguments, 1);
	                    cb(err, nextargs);
	                }]))
	            },
	            function (err, results) {
	                callback.apply(that, [err].concat(results));
	            });
	        };
	    };

	    async.compose = function (/* functions... */) {
	      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
	    };

	    var _applyEach = function (eachfn, fns /*args...*/) {
	        var go = function () {
	            var that = this;
	            var args = Array.prototype.slice.call(arguments);
	            var callback = args.pop();
	            return eachfn(fns, function (fn, cb) {
	                fn.apply(that, args.concat([cb]));
	            },
	            callback);
	        };
	        if (arguments.length > 2) {
	            var args = Array.prototype.slice.call(arguments, 2);
	            return go.apply(this, args);
	        }
	        else {
	            return go;
	        }
	    };
	    async.applyEach = doParallel(_applyEach);
	    async.applyEachSeries = doSeries(_applyEach);

	    async.forever = function (fn, callback) {
	        function next(err) {
	            if (err) {
	                if (callback) {
	                    return callback(err);
	                }
	                throw err;
	            }
	            fn(next);
	        }
	        next();
	    };

	    // Node.js
	    if (typeof module !== 'undefined' && module.exports) {
	        module.exports = async;
	    }
	    // AMD / RequireJS
	    else if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	            return async;
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	    // included directly via <script> tag
	    else {
	        root.async = async;
	    }

	}());
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var config = {
	  instrument: false
	};

	function configure(name, value) {
	  if (arguments.length === 2) {
	    config[name] = value;
	  } else {
	    return config[name];
	  }
	}

	exports.config = config;
	exports.configure = configure;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function objectOrFunction(x) {
	  return isFunction(x) || (typeof x === "object" && x !== null);
	}

	function isFunction(x) {
	  return typeof x === "function";
	}

	function isArray(x) {
	  return Object.prototype.toString.call(x) === "[object Array]";
	}

	// Date.now is not available in browsers < IE9
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
	var now = Date.now || function() { return new Date().getTime(); };


	exports.objectOrFunction = objectOrFunction;
	exports.isFunction = isFunction;
	exports.isArray = isArray;
	exports.now = now;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* global toString */

	var isArray = __webpack_require__(20).isArray;
	var isFunction = __webpack_require__(20).isFunction;

	/**
	  Returns a promise that is fulfilled when all the given promises have been
	  fulfilled, or rejected if any of them become rejected. The return promise
	  is fulfilled with an array that gives all the values in the order they were
	  passed in the `promises` array argument.

	  Example:

	  ```javascript
	  var promise1 = RSVP.resolve(1);
	  var promise2 = RSVP.resolve(2);
	  var promise3 = RSVP.resolve(3);
	  var promises = [ promise1, promise2, promise3 ];

	  RSVP.all(promises).then(function(array){
	    // The array here would be [ 1, 2, 3 ];
	  });
	  ```

	  If any of the `promises` given to `RSVP.all` are rejected, the first promise
	  that is rejected will be given as an argument to the returned promises's
	  rejection handler. For example:

	  Example:

	  ```javascript
	  var promise1 = RSVP.resolve(1);
	  var promise2 = RSVP.reject(new Error("2"));
	  var promise3 = RSVP.reject(new Error("3"));
	  var promises = [ promise1, promise2, promise3 ];

	  RSVP.all(promises).then(function(array){
	    // Code here never runs because there are rejected promises!
	  }, function(error) {
	    // error.message === "2"
	  });
	  ```

	  @method all
	  @for RSVP
	  @param {Array} promises
	  @param {String} label
	  @return {Promise} promise that is fulfilled when all `promises` have been
	  fulfilled, or rejected if any of them become rejected.
	*/
	function all(promises) {
	  /*jshint validthis:true */
	  var Promise = this;

	  if (!isArray(promises)) {
	    throw new TypeError('You must pass an array to all.');
	  }

	  return new Promise(function(resolve, reject) {
	    var results = [], remaining = promises.length,
	    promise;

	    if (remaining === 0) {
	      resolve([]);
	    }

	    function resolver(index) {
	      return function(value) {
	        resolveAll(index, value);
	      };
	    }

	    function resolveAll(index, value) {
	      results[index] = value;
	      if (--remaining === 0) {
	        resolve(results);
	      }
	    }

	    for (var i = 0; i < promises.length; i++) {
	      promise = promises[i];

	      if (promise && isFunction(promise.then)) {
	        promise.then(resolver(i), reject);
	      } else {
	        resolveAll(i, promise);
	      }
	    }
	  });
	}

	exports.all = all;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* global toString */
	var isArray = __webpack_require__(20).isArray;

	/**
	  `RSVP.race` allows you to watch a series of promises and act as soon as the
	  first promise given to the `promises` argument fulfills or rejects.

	  Example:

	  ```javascript
	  var promise1 = new RSVP.Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve("promise 1");
	    }, 200);
	  });

	  var promise2 = new RSVP.Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve("promise 2");
	    }, 100);
	  });

	  RSVP.race([promise1, promise2]).then(function(result){
	    // result === "promise 2" because it was resolved before promise1
	    // was resolved.
	  });
	  ```

	  `RSVP.race` is deterministic in that only the state of the first completed
	  promise matters. For example, even if other promises given to the `promises`
	  array argument are resolved, but the first completed promise has become
	  rejected before the other promises became fulfilled, the returned promise
	  will become rejected:

	  ```javascript
	  var promise1 = new RSVP.Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve("promise 1");
	    }, 200);
	  });

	  var promise2 = new RSVP.Promise(function(resolve, reject){
	    setTimeout(function(){
	      reject(new Error("promise 2"));
	    }, 100);
	  });

	  RSVP.race([promise1, promise2]).then(function(result){
	    // Code here never runs because there are rejected promises!
	  }, function(reason){
	    // reason.message === "promise2" because promise 2 became rejected before
	    // promise 1 became fulfilled
	  });
	  ```

	  @method race
	  @for RSVP
	  @param {Array} promises array of promises to observe
	  @param {String} label optional string for describing the promise returned.
	  Useful for tooling.
	  @return {Promise} a promise that becomes fulfilled with the value the first
	  completed promises is resolved with if the first completed promise was
	  fulfilled, or rejected with the reason that the first completed promise
	  was rejected with.
	*/
	function race(promises) {
	  /*jshint validthis:true */
	  var Promise = this;

	  if (!isArray(promises)) {
	    throw new TypeError('You must pass an array to race.');
	  }
	  return new Promise(function(resolve, reject) {
	    var results = [], promise;

	    for (var i = 0; i < promises.length; i++) {
	      promise = promises[i];

	      if (promise && typeof promise.then === 'function') {
	        promise.then(resolve, reject);
	      } else {
	        resolve(promise);
	      }
	    }
	  });
	}

	exports.race = race;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function resolve(value) {
	  /*jshint validthis:true */
	  if (value && typeof value === 'object' && value.constructor === this) {
	    return value;
	  }

	  var Promise = this;

	  return new Promise(function(resolve) {
	    resolve(value);
	  });
	}

	exports.resolve = resolve;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/**
	  `RSVP.reject` returns a promise that will become rejected with the passed
	  `reason`. `RSVP.reject` is essentially shorthand for the following:

	  ```javascript
	  var promise = new RSVP.Promise(function(resolve, reject){
	    reject(new Error('WHOOPS'));
	  });

	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```

	  Instead of writing the above, your code now simply becomes the following:

	  ```javascript
	  var promise = RSVP.reject(new Error('WHOOPS'));

	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```

	  @method reject
	  @for RSVP
	  @param {Any} reason value that the returned promise will be rejected with.
	  @param {String} label optional string for identifying the returned promise.
	  Useful for tooling.
	  @return {Promise} a promise that will become rejected with the given
	  `reason`.
	*/
	function reject(reason) {
	  /*jshint validthis:true */
	  var Promise = this;

	  return new Promise(function (resolve, reject) {
	    reject(reason);
	  });
	}

	exports.reject = reject;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {"use strict";
	var browserGlobal = (typeof window !== 'undefined') ? window : {};
	var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
	var local = (typeof global !== 'undefined') ? global : (this === undefined? window:this);

	// node
	function useNextTick() {
	  return function() {
	    process.nextTick(flush);
	  };
	}

	function useMutationObserver() {
	  var iterations = 0;
	  var observer = new BrowserMutationObserver(flush);
	  var node = document.createTextNode('');
	  observer.observe(node, { characterData: true });

	  return function() {
	    node.data = (iterations = ++iterations % 2);
	  };
	}

	function useSetTimeout() {
	  return function() {
	    local.setTimeout(flush, 1);
	  };
	}

	var queue = [];
	function flush() {
	  for (var i = 0; i < queue.length; i++) {
	    var tuple = queue[i];
	    var callback = tuple[0], arg = tuple[1];
	    callback(arg);
	  }
	  queue = [];
	}

	var scheduleFlush;

	// Decide what async method to use to triggering processing of queued callbacks:
	if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
	  scheduleFlush = useNextTick();
	} else if (BrowserMutationObserver) {
	  scheduleFlush = useMutationObserver();
	} else {
	  scheduleFlush = useSetTimeout();
	}

	function asap(callback, arg) {
	  var length = queue.push([callback, arg]);
	  if (length === 1) {
	    // If length is 1, that means that we need to schedule an async flush.
	    // If additional callbacks are queued before the queue is flushed, they
	    // will be processed by this flush that we are scheduling.
	    scheduleFlush();
	  }
	}

	exports.asap = asap;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(11)))

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var url = __webpack_require__(28);
	var parser = __webpack_require__(32);
	var Manager = __webpack_require__(29);
	var debug = __webpack_require__(34)('socket.io-client');

	/**
	 * Module exports.
	 */

	module.exports = exports = lookup;

	/**
	 * Managers cache.
	 */

	var cache = exports.managers = {};

	/**
	 * Looks up an existing `Manager` for multiplexing.
	 * If the user summons:
	 *
	 *   `io('http://localhost/a');`
	 *   `io('http://localhost/b');`
	 *
	 * We reuse the existing instance based on same scheme/port/host,
	 * and we initialize sockets for each namespace.
	 *
	 * @api public
	 */

	function lookup(uri, opts) {
	  if (typeof uri == 'object') {
	    opts = uri;
	    uri = undefined;
	  }

	  opts = opts || {};

	  var parsed = url(uri);
	  var source = parsed.source;
	  var id = parsed.id;
	  var io;

	  if (opts.forceNew || opts['force new connection'] || false === opts.multiplex) {
	    debug('ignoring socket cache for %s', source);
	    io = Manager(source, opts);
	  } else {
	    if (!cache[id]) {
	      debug('new io instance for %s', source);
	      cache[id] = Manager(source, opts);
	    }
	    io = cache[id];
	  }

	  return io.socket(parsed.path);
	}

	/**
	 * Protocol version.
	 *
	 * @api public
	 */

	exports.protocol = parser.protocol;

	/**
	 * `connect`.
	 *
	 * @param {String} uri
	 * @api public
	 */

	exports.connect = lookup;

	/**
	 * Expose constructors for standalone build.
	 *
	 * @api public
	 */

	exports.Manager = __webpack_require__(29);
	exports.Socket = __webpack_require__(30);


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 's':
	      return n * s;
	    case 'ms':
	      return n;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/**
	 * Module dependencies.
	 */

	var parseuri = __webpack_require__(35);
	var debug = __webpack_require__(34)('socket.io-client:url');

	/**
	 * Module exports.
	 */

	module.exports = url;

	/**
	 * URL parser.
	 *
	 * @param {String} url
	 * @param {Object} An object meant to mimic window.location.
	 *                 Defaults to window.location.
	 * @api public
	 */

	function url(uri, loc){
	  var obj = uri;

	  // default to window.location
	  var loc = loc || global.location;
	  if (null == uri) uri = loc.protocol + '//' + loc.hostname;

	  // relative path support
	  if ('string' == typeof uri) {
	    if ('/' == uri.charAt(0)) {
	      if ('undefined' != typeof loc) {
	        uri = loc.hostname + uri;
	      }
	    }

	    if (!/^(https?|wss?):\/\//.test(uri)) {
	      debug('protocol-less url %s', uri);
	      if ('undefined' != typeof loc) {
	        uri = loc.protocol + '//' + uri;
	      } else {
	        uri = 'https://' + uri;
	      }
	    }

	    // parse
	    debug('parse %s', uri);
	    obj = parseuri(uri);
	  }

	  // make sure we treat `localhost:80` and `localhost` equally
	  if (!obj.port) {
	    if (/^(http|ws)$/.test(obj.protocol)) {
	      obj.port = '80';
	    }
	    else if (/^(http|ws)s$/.test(obj.protocol)) {
	      obj.port = '443';
	    }
	  }

	  obj.path = obj.path || '/';

	  // define unique id
	  obj.id = obj.protocol + '://' + obj.host + ':' + obj.port;
	  // define href
	  obj.href = obj.protocol + '://' + obj.host + (loc && loc.port == obj.port ? '' : (':' + obj.port));

	  return obj;
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var url = __webpack_require__(28);
	var eio = __webpack_require__(36);
	var Socket = __webpack_require__(30);
	var Emitter = __webpack_require__(37);
	var parser = __webpack_require__(32);
	var on = __webpack_require__(33);
	var bind = __webpack_require__(38);
	var object = __webpack_require__(39);
	var debug = __webpack_require__(34)('socket.io-client:manager');

	/**
	 * Module exports
	 */

	module.exports = Manager;

	/**
	 * `Manager` constructor.
	 *
	 * @param {String} engine instance or engine uri/opts
	 * @param {Object} options
	 * @api public
	 */

	function Manager(uri, opts){
	  if (!(this instanceof Manager)) return new Manager(uri, opts);
	  if (uri && ('object' == typeof uri)) {
	    opts = uri;
	    uri = undefined;
	  }
	  opts = opts || {};

	  opts.path = opts.path || '/socket.io';
	  this.nsps = {};
	  this.subs = [];
	  this.opts = opts;
	  this.reconnection(opts.reconnection !== false);
	  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
	  this.reconnectionDelay(opts.reconnectionDelay || 1000);
	  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
	  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
	  this.readyState = 'closed';
	  this.uri = uri;
	  this.connected = 0;
	  this.attempts = 0;
	  this.encoding = false;
	  this.packetBuffer = [];
	  this.encoder = new parser.Encoder();
	  this.decoder = new parser.Decoder();
	  this.autoConnect = opts.autoConnect !== false;
	  if (this.autoConnect) this.open();
	}

	/**
	 * Propagate given event to sockets and emit on `this`
	 *
	 * @api private
	 */

	Manager.prototype.emitAll = function() {
	  this.emit.apply(this, arguments);
	  for (var nsp in this.nsps) {
	    this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
	  }
	};

	/**
	 * Mix in `Emitter`.
	 */

	Emitter(Manager.prototype);

	/**
	 * Sets the `reconnection` config.
	 *
	 * @param {Boolean} true/false if it should automatically reconnect
	 * @return {Manager} self or value
	 * @api public
	 */

	Manager.prototype.reconnection = function(v){
	  if (!arguments.length) return this._reconnection;
	  this._reconnection = !!v;
	  return this;
	};

	/**
	 * Sets the reconnection attempts config.
	 *
	 * @param {Number} max reconnection attempts before giving up
	 * @return {Manager} self or value
	 * @api public
	 */

	Manager.prototype.reconnectionAttempts = function(v){
	  if (!arguments.length) return this._reconnectionAttempts;
	  this._reconnectionAttempts = v;
	  return this;
	};

	/**
	 * Sets the delay between reconnections.
	 *
	 * @param {Number} delay
	 * @return {Manager} self or value
	 * @api public
	 */

	Manager.prototype.reconnectionDelay = function(v){
	  if (!arguments.length) return this._reconnectionDelay;
	  this._reconnectionDelay = v;
	  return this;
	};

	/**
	 * Sets the maximum delay between reconnections.
	 *
	 * @param {Number} delay
	 * @return {Manager} self or value
	 * @api public
	 */

	Manager.prototype.reconnectionDelayMax = function(v){
	  if (!arguments.length) return this._reconnectionDelayMax;
	  this._reconnectionDelayMax = v;
	  return this;
	};

	/**
	 * Sets the connection timeout. `false` to disable
	 *
	 * @return {Manager} self or value
	 * @api public
	 */

	Manager.prototype.timeout = function(v){
	  if (!arguments.length) return this._timeout;
	  this._timeout = v;
	  return this;
	};

	/**
	 * Starts trying to reconnect if reconnection is enabled and we have not
	 * started reconnecting yet
	 *
	 * @api private
	 */

	Manager.prototype.maybeReconnectOnOpen = function() {
	  // Only try to reconnect if it's the first time we're connecting
	  if (!this.openReconnect && !this.reconnecting && this._reconnection && this.attempts === 0) {
	    // keeps reconnection from firing twice for the same reconnection loop
	    this.openReconnect = true;
	    this.reconnect();
	  }
	};


	/**
	 * Sets the current transport `socket`.
	 *
	 * @param {Function} optional, callback
	 * @return {Manager} self
	 * @api public
	 */

	Manager.prototype.open =
	Manager.prototype.connect = function(fn){
	  debug('readyState %s', this.readyState);
	  if (~this.readyState.indexOf('open')) return this;

	  debug('opening %s', this.uri);
	  this.engine = eio(this.uri, this.opts);
	  var socket = this.engine;
	  var self = this;
	  this.readyState = 'opening';

	  // emit `open`
	  var openSub = on(socket, 'open', function() {
	    self.onopen();
	    fn && fn();
	  });

	  // emit `connect_error`
	  var errorSub = on(socket, 'error', function(data){
	    debug('connect_error');
	    self.cleanup();
	    self.readyState = 'closed';
	    self.emitAll('connect_error', data);
	    if (fn) {
	      var err = new Error('Connection error');
	      err.data = data;
	      fn(err);
	    }

	    self.maybeReconnectOnOpen();
	  });

	  // emit `connect_timeout`
	  if (false !== this._timeout) {
	    var timeout = this._timeout;
	    debug('connect attempt will timeout after %d', timeout);

	    // set timer
	    var timer = setTimeout(function(){
	      debug('connect attempt timed out after %d', timeout);
	      openSub.destroy();
	      socket.close();
	      socket.emit('error', 'timeout');
	      self.emitAll('connect_timeout', timeout);
	    }, timeout);

	    this.subs.push({
	      destroy: function(){
	        clearTimeout(timer);
	      }
	    });
	  }

	  this.subs.push(openSub);
	  this.subs.push(errorSub);

	  return this;
	};

	/**
	 * Called upon transport open.
	 *
	 * @api private
	 */

	Manager.prototype.onopen = function(){
	  debug('open');

	  // clear old subs
	  this.cleanup();

	  // mark as open
	  this.readyState = 'open';
	  this.emit('open');

	  // add new subs
	  var socket = this.engine;
	  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
	  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
	  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
	  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
	};

	/**
	 * Called with data.
	 *
	 * @api private
	 */

	Manager.prototype.ondata = function(data){
	  this.decoder.add(data);
	};

	/**
	 * Called when parser fully decodes a packet.
	 *
	 * @api private
	 */

	Manager.prototype.ondecoded = function(packet) {
	  this.emit('packet', packet);
	};

	/**
	 * Called upon socket error.
	 *
	 * @api private
	 */

	Manager.prototype.onerror = function(err){
	  debug('error', err);
	  this.emitAll('error', err);
	};

	/**
	 * Creates a new socket for the given `nsp`.
	 *
	 * @return {Socket}
	 * @api public
	 */

	Manager.prototype.socket = function(nsp){
	  var socket = this.nsps[nsp];
	  if (!socket) {
	    socket = new Socket(this, nsp);
	    this.nsps[nsp] = socket;
	    var self = this;
	    socket.on('connect', function(){
	      self.connected++;
	    });
	  }
	  return socket;
	};

	/**
	 * Called upon a socket close.
	 *
	 * @param {Socket} socket
	 */

	Manager.prototype.destroy = function(socket){
	  --this.connected || this.close();
	};

	/**
	 * Writes a packet.
	 *
	 * @param {Object} packet
	 * @api private
	 */

	Manager.prototype.packet = function(packet){
	  debug('writing packet %j', packet);
	  var self = this;

	  if (!self.encoding) {
	    // encode, then write to engine with result
	    self.encoding = true;
	    this.encoder.encode(packet, function(encodedPackets) {
	      for (var i = 0; i < encodedPackets.length; i++) {
	        self.engine.write(encodedPackets[i]);
	      }
	      self.encoding = false;
	      self.processPacketQueue();
	    });
	  } else { // add packet to the queue
	    self.packetBuffer.push(packet);
	  }
	};

	/**
	 * If packet buffer is non-empty, begins encoding the
	 * next packet in line.
	 *
	 * @api private
	 */

	Manager.prototype.processPacketQueue = function() {
	  if (this.packetBuffer.length > 0 && !this.encoding) {
	    var pack = this.packetBuffer.shift();
	    this.packet(pack);
	  }
	};

	/**
	 * Clean up transport subscriptions and packet buffer.
	 *
	 * @api private
	 */

	Manager.prototype.cleanup = function(){
	  var sub;
	  while (sub = this.subs.shift()) sub.destroy();

	  this.packetBuffer = [];
	  this.encoding = false;

	  this.decoder.destroy();
	};

	/**
	 * Close the current socket.
	 *
	 * @api private
	 */

	Manager.prototype.close =
	Manager.prototype.disconnect = function(){
	  this.skipReconnect = true;
	  this.engine.close();
	};

	/**
	 * Called upon engine close.
	 *
	 * @api private
	 */

	Manager.prototype.onclose = function(reason){
	  debug('close');
	  this.cleanup();
	  this.readyState = 'closed';
	  this.emit('close', reason);
	  if (this._reconnection && !this.skipReconnect) {
	    this.reconnect();
	  }
	};

	/**
	 * Attempt a reconnection.
	 *
	 * @api private
	 */

	Manager.prototype.reconnect = function(){
	  if (this.reconnecting) return this;

	  var self = this;
	  this.attempts++;

	  if (this.attempts > this._reconnectionAttempts) {
	    debug('reconnect failed');
	    this.emitAll('reconnect_failed');
	    this.reconnecting = false;
	  } else {
	    var delay = this.attempts * this.reconnectionDelay();
	    delay = Math.min(delay, this.reconnectionDelayMax());
	    debug('will wait %dms before reconnect attempt', delay);

	    this.reconnecting = true;
	    var timer = setTimeout(function(){
	      debug('attempting reconnect');
	      self.emitAll('reconnect_attempt', self.attempts);
	      self.emitAll('reconnecting', self.attempts);
	      self.open(function(err){
	        if (err) {
	          debug('reconnect attempt error');
	          self.reconnecting = false;
	          self.reconnect();
	          self.emitAll('reconnect_error', err.data);
	        } else {
	          debug('reconnect success');
	          self.onreconnect();
	        }
	      });
	    }, delay);

	    this.subs.push({
	      destroy: function(){
	        clearTimeout(timer);
	      }
	    });
	  }
	};

	/**
	 * Called upon successful reconnect.
	 *
	 * @api private
	 */

	Manager.prototype.onreconnect = function(){
	  var attempt = this.attempts;
	  this.attempts = 0;
	  this.reconnecting = false;
	  this.emitAll('reconnect', attempt);
	};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var parser = __webpack_require__(32);
	var Emitter = __webpack_require__(37);
	var toArray = __webpack_require__(40);
	var on = __webpack_require__(33);
	var bind = __webpack_require__(38);
	var debug = __webpack_require__(34)('socket.io-client:socket');
	var hasBin = __webpack_require__(41);
	var indexOf = __webpack_require__(42);

	/**
	 * Module exports.
	 */

	module.exports = exports = Socket;

	/**
	 * Internal events (blacklisted).
	 * These events can't be emitted by the user.
	 *
	 * @api private
	 */

	var events = {
	  connect: 1,
	  connect_error: 1,
	  connect_timeout: 1,
	  disconnect: 1,
	  error: 1,
	  reconnect: 1,
	  reconnect_attempt: 1,
	  reconnect_failed: 1,
	  reconnect_error: 1,
	  reconnecting: 1
	};

	/**
	 * Shortcut to `Emitter#emit`.
	 */

	var emit = Emitter.prototype.emit;

	/**
	 * `Socket` constructor.
	 *
	 * @api public
	 */

	function Socket(io, nsp){
	  this.io = io;
	  this.nsp = nsp;
	  this.json = this; // compat
	  this.ids = 0;
	  this.acks = {};
	  if (this.io.autoConnect) this.open();
	  this.receiveBuffer = [];
	  this.sendBuffer = [];
	  this.connected = false;
	  this.disconnected = true;
	  this.subEvents();
	}

	/**
	 * Mix in `Emitter`.
	 */

	Emitter(Socket.prototype);

	/**
	 * Subscribe to open, close and packet events
	 *
	 * @api private
	 */

	Socket.prototype.subEvents = function() {
	  var io = this.io;
	  this.subs = [
	    on(io, 'open', bind(this, 'onopen')),
	    on(io, 'packet', bind(this, 'onpacket')),
	    on(io, 'close', bind(this, 'onclose'))
	  ];
	};

	/**
	 * Called upon engine `open`.
	 *
	 * @api private
	 */

	Socket.prototype.open =
	Socket.prototype.connect = function(){
	  if (this.connected) return this;

	  this.io.open(); // ensure open
	  if ('open' == this.io.readyState) this.onopen();
	  return this;
	};

	/**
	 * Sends a `message` event.
	 *
	 * @return {Socket} self
	 * @api public
	 */

	Socket.prototype.send = function(){
	  var args = toArray(arguments);
	  args.unshift('message');
	  this.emit.apply(this, args);
	  return this;
	};

	/**
	 * Override `emit`.
	 * If the event is in `events`, it's emitted normally.
	 *
	 * @param {String} event name
	 * @return {Socket} self
	 * @api public
	 */

	Socket.prototype.emit = function(ev){
	  if (events.hasOwnProperty(ev)) {
	    emit.apply(this, arguments);
	    return this;
	  }

	  var args = toArray(arguments);
	  var parserType = parser.EVENT; // default
	  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
	  var packet = { type: parserType, data: args };

	  // event ack callback
	  if ('function' == typeof args[args.length - 1]) {
	    debug('emitting packet with ack id %d', this.ids);
	    this.acks[this.ids] = args.pop();
	    packet.id = this.ids++;
	  }

	  if (this.connected) {
	    this.packet(packet);
	  } else {
	    this.sendBuffer.push(packet);
	  }

	  return this;
	};

	/**
	 * Sends a packet.
	 *
	 * @param {Object} packet
	 * @api private
	 */

	Socket.prototype.packet = function(packet){
	  packet.nsp = this.nsp;
	  this.io.packet(packet);
	};

	/**
	 * "Opens" the socket.
	 *
	 * @api private
	 */

	Socket.prototype.onopen = function(){
	  debug('transport is open - connecting');

	  // write connect packet if necessary
	  if ('/' != this.nsp) {
	    this.packet({ type: parser.CONNECT });
	  }
	};

	/**
	 * Called upon engine `close`.
	 *
	 * @param {String} reason
	 * @api private
	 */

	Socket.prototype.onclose = function(reason){
	  debug('close (%s)', reason);
	  this.connected = false;
	  this.disconnected = true;
	  this.emit('disconnect', reason);
	};

	/**
	 * Called with socket packet.
	 *
	 * @param {Object} packet
	 * @api private
	 */

	Socket.prototype.onpacket = function(packet){
	  if (packet.nsp != this.nsp) return;

	  switch (packet.type) {
	    case parser.CONNECT:
	      this.onconnect();
	      break;

	    case parser.EVENT:
	      this.onevent(packet);
	      break;

	    case parser.BINARY_EVENT:
	      this.onevent(packet);
	      break;

	    case parser.ACK:
	      this.onack(packet);
	      break;

	    case parser.BINARY_ACK:
	      this.onack(packet);
	      break;

	    case parser.DISCONNECT:
	      this.ondisconnect();
	      break;

	    case parser.ERROR:
	      this.emit('error', packet.data);
	      break;
	  }
	};

	/**
	 * Called upon a server event.
	 *
	 * @param {Object} packet
	 * @api private
	 */

	Socket.prototype.onevent = function(packet){
	  var args = packet.data || [];
	  debug('emitting event %j', args);

	  if (null != packet.id) {
	    debug('attaching ack callback to event');
	    args.push(this.ack(packet.id));
	  }

	  if (this.connected) {
	    emit.apply(this, args);
	  } else {
	    this.receiveBuffer.push(args);
	  }
	};

	/**
	 * Produces an ack callback to emit with an event.
	 *
	 * @api private
	 */

	Socket.prototype.ack = function(id){
	  var self = this;
	  var sent = false;
	  return function(){
	    // prevent double callbacks
	    if (sent) return;
	    sent = true;
	    var args = toArray(arguments);
	    debug('sending ack %j', args);

	    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
	    self.packet({
	      type: type,
	      id: id,
	      data: args
	    });
	  };
	};

	/**
	 * Called upon a server acknowlegement.
	 *
	 * @param {Object} packet
	 * @api private
	 */

	Socket.prototype.onack = function(packet){
	  debug('calling ack %s with %j', packet.id, packet.data);
	  var fn = this.acks[packet.id];
	  fn.apply(this, packet.data);
	  delete this.acks[packet.id];
	};

	/**
	 * Called upon server connect.
	 *
	 * @api private
	 */

	Socket.prototype.onconnect = function(){
	  this.connected = true;
	  this.disconnected = false;
	  this.emit('connect');
	  this.emitBuffered();
	};

	/**
	 * Emit buffered events (received and emitted).
	 *
	 * @api private
	 */

	Socket.prototype.emitBuffered = function(){
	  var i;
	  for (i = 0; i < this.receiveBuffer.length; i++) {
	    emit.apply(this, this.receiveBuffer[i]);
	  }
	  this.receiveBuffer = [];

	  for (i = 0; i < this.sendBuffer.length; i++) {
	    this.packet(this.sendBuffer[i]);
	  }
	  this.sendBuffer = [];
	};

	/**
	 * Called upon server disconnect.
	 *
	 * @api private
	 */

	Socket.prototype.ondisconnect = function(){
	  debug('server disconnect (%s)', this.nsp);
	  this.destroy();
	  this.onclose('io server disconnect');
	};

	/**
	 * Called upon forced client/server side disconnections,
	 * this method ensures the manager stops tracking us and
	 * that reconnections don't get triggered for this.
	 *
	 * @api private.
	 */

	Socket.prototype.destroy = function(){
	  // clean subscriptions to avoid reconnections
	  for (var i = 0; i < this.subs.length; i++) {
	    this.subs[i].destroy();
	  }

	  this.io.destroy(this);
	};

	/**
	 * Disconnects the socket manually.
	 *
	 * @return {Socket} self
	 * @api public
	 */

	Socket.prototype.close =
	Socket.prototype.disconnect = function(){
	  if (!this.connected) return this;

	  debug('performing disconnect (%s)', this.nsp);
	  this.packet({ type: parser.DISCONNECT });

	  // remove socket from pool
	  this.destroy();

	  // fire events
	  this.onclose('io client disconnect');
	  return this;
	};


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var debug = __webpack_require__(48)('socket.io-parser');
	var json = __webpack_require__(49);
	var isArray = __webpack_require__(45);
	var Emitter = __webpack_require__(46);
	var binary = __webpack_require__(43);
	var isBuf = __webpack_require__(44);

	/**
	 * Protocol version.
	 *
	 * @api public
	 */

	exports.protocol = 4;

	/**
	 * Packet types.
	 *
	 * @api public
	 */

	exports.types = [
	  'CONNECT',
	  'DISCONNECT',
	  'EVENT',
	  'BINARY_EVENT',
	  'ACK',
	  'BINARY_ACK',
	  'ERROR'
	];

	/**
	 * Packet type `connect`.
	 *
	 * @api public
	 */

	exports.CONNECT = 0;

	/**
	 * Packet type `disconnect`.
	 *
	 * @api public
	 */

	exports.DISCONNECT = 1;

	/**
	 * Packet type `event`.
	 *
	 * @api public
	 */

	exports.EVENT = 2;

	/**
	 * Packet type `ack`.
	 *
	 * @api public
	 */

	exports.ACK = 3;

	/**
	 * Packet type `error`.
	 *
	 * @api public
	 */

	exports.ERROR = 4;

	/**
	 * Packet type 'binary event'
	 *
	 * @api public
	 */

	exports.BINARY_EVENT = 5;

	/**
	 * Packet type `binary ack`. For acks with binary arguments.
	 *
	 * @api public
	 */

	exports.BINARY_ACK = 6;

	/**
	 * Encoder constructor.
	 *
	 * @api public
	 */

	exports.Encoder = Encoder;

	/**
	 * Decoder constructor.
	 *
	 * @api public
	 */

	exports.Decoder = Decoder;

	/**
	 * A socket.io Encoder instance
	 *
	 * @api public
	 */

	function Encoder() {}

	/**
	 * Encode a packet as a single string if non-binary, or as a
	 * buffer sequence, depending on packet type.
	 *
	 * @param {Object} obj - packet object
	 * @param {Function} callback - function to handle encodings (likely engine.write)
	 * @return Calls callback with Array of encodings
	 * @api public
	 */

	Encoder.prototype.encode = function(obj, callback){
	  debug('encoding packet %j', obj);

	  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
	    encodeAsBinary(obj, callback);
	  }
	  else {
	    var encoding = encodeAsString(obj);
	    callback([encoding]);
	  }
	};

	/**
	 * Encode packet as string.
	 *
	 * @param {Object} packet
	 * @return {String} encoded
	 * @api private
	 */

	function encodeAsString(obj) {
	  var str = '';
	  var nsp = false;

	  // first is type
	  str += obj.type;

	  // attachments if we have them
	  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
	    str += obj.attachments;
	    str += '-';
	  }

	  // if we have a namespace other than `/`
	  // we append it followed by a comma `,`
	  if (obj.nsp && '/' != obj.nsp) {
	    nsp = true;
	    str += obj.nsp;
	  }

	  // immediately followed by the id
	  if (null != obj.id) {
	    if (nsp) {
	      str += ',';
	      nsp = false;
	    }
	    str += obj.id;
	  }

	  // json data
	  if (null != obj.data) {
	    if (nsp) str += ',';
	    str += json.stringify(obj.data);
	  }

	  debug('encoded %j as %s', obj, str);
	  return str;
	}

	/**
	 * Encode packet as 'buffer sequence' by removing blobs, and
	 * deconstructing packet into object with placeholders and
	 * a list of buffers.
	 *
	 * @param {Object} packet
	 * @return {Buffer} encoded
	 * @api private
	 */

	function encodeAsBinary(obj, callback) {

	  function writeEncoding(bloblessData) {
	    var deconstruction = binary.deconstructPacket(bloblessData);
	    var pack = encodeAsString(deconstruction.packet);
	    var buffers = deconstruction.buffers;

	    buffers.unshift(pack); // add packet info to beginning of data list
	    callback(buffers); // write all the buffers
	  }

	  binary.removeBlobs(obj, writeEncoding);
	}

	/**
	 * A socket.io Decoder instance
	 *
	 * @return {Object} decoder
	 * @api public
	 */

	function Decoder() {
	  this.reconstructor = null;
	}

	/**
	 * Mix in `Emitter` with Decoder.
	 */

	Emitter(Decoder.prototype);

	/**
	 * Decodes an ecoded packet string into packet JSON.
	 *
	 * @param {String} obj - encoded packet
	 * @return {Object} packet
	 * @api public
	 */

	Decoder.prototype.add = function(obj) {
	  var packet;
	  if ('string' == typeof obj) {
	    packet = decodeString(obj);
	    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
	      this.reconstructor = new BinaryReconstructor(packet);

	      // no attachments, labeled binary but no binary data to follow
	      if (this.reconstructor.reconPack.attachments == 0) {
	        this.emit('decoded', packet);
	      }
	    } else { // non-binary full packet
	      this.emit('decoded', packet);
	    }
	  }
	  else if (isBuf(obj) || obj.base64) { // raw binary data
	    if (!this.reconstructor) {
	      throw new Error('got binary data when not reconstructing a packet');
	    } else {
	      packet = this.reconstructor.takeBinaryData(obj);
	      if (packet) { // received final buffer
	        this.reconstructor = null;
	        this.emit('decoded', packet);
	      }
	    }
	  }
	  else {
	    throw new Error('Unknown type: ' + obj);
	  }
	};

	/**
	 * Decode a packet String (JSON data)
	 *
	 * @param {String} str
	 * @return {Object} packet
	 * @api private
	 */

	function decodeString(str) {
	  var p = {};
	  var i = 0;

	  // look up type
	  p.type = Number(str.charAt(0));
	  if (null == exports.types[p.type]) return error();

	  // look up attachments if type binary
	  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
	    p.attachments = '';
	    while (str.charAt(++i) != '-') {
	      p.attachments += str.charAt(i);
	    }
	    p.attachments = Number(p.attachments);
	  }

	  // look up namespace (if any)
	  if ('/' == str.charAt(i + 1)) {
	    p.nsp = '';
	    while (++i) {
	      var c = str.charAt(i);
	      if (',' == c) break;
	      p.nsp += c;
	      if (i + 1 == str.length) break;
	    }
	  } else {
	    p.nsp = '/';
	  }

	  // look up id
	  var next = str.charAt(i + 1);
	  if ('' != next && Number(next) == next) {
	    p.id = '';
	    while (++i) {
	      var c = str.charAt(i);
	      if (null == c || Number(c) != c) {
	        --i;
	        break;
	      }
	      p.id += str.charAt(i);
	      if (i + 1 == str.length) break;
	    }
	    p.id = Number(p.id);
	  }

	  // look up json data
	  if (str.charAt(++i)) {
	    try {
	      p.data = json.parse(str.substr(i));
	    } catch(e){
	      return error();
	    }
	  }

	  debug('decoded %s as %j', str, p);
	  return p;
	}

	/**
	 * Deallocates a parser's resources
	 *
	 * @api public
	 */

	Decoder.prototype.destroy = function() {
	  if (this.reconstructor) {
	    this.reconstructor.finishedReconstruction();
	  }
	};

	/**
	 * A manager of a binary event's 'buffer sequence'. Should
	 * be constructed whenever a packet of type BINARY_EVENT is
	 * decoded.
	 *
	 * @param {Object} packet
	 * @return {BinaryReconstructor} initialized reconstructor
	 * @api private
	 */

	function BinaryReconstructor(packet) {
	  this.reconPack = packet;
	  this.buffers = [];
	}

	/**
	 * Method to be called when binary data received from connection
	 * after a BINARY_EVENT packet.
	 *
	 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
	 * @return {null | Object} returns null if more binary data is expected or
	 *   a reconstructed packet object if all buffers have been received.
	 * @api private
	 */

	BinaryReconstructor.prototype.takeBinaryData = function(binData) {
	  this.buffers.push(binData);
	  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
	    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
	    this.finishedReconstruction();
	    return packet;
	  }
	  return null;
	};

	/**
	 * Cleans up binary packet reconstruction variables.
	 *
	 * @api private
	 */

	BinaryReconstructor.prototype.finishedReconstruction = function() {
	  this.reconPack = null;
	  this.buffers = [];
	};

	function error(data){
	  return {
	    type: exports.ERROR,
	    data: 'parser error'
	  };
	}


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module exports.
	 */

	module.exports = on;

	/**
	 * Helper for subscriptions.
	 *
	 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
	 * @param {String} event name
	 * @param {Function} callback
	 * @api public
	 */

	function on(obj, ev, fn) {
	  obj.on(ev, fn);
	  return {
	    destroy: function(){
	      obj.removeListener(ev, fn);
	    }
	  };
	}


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `debug()` as the module.
	 */

	module.exports = debug;

	/**
	 * Create a debugger with the given `name`.
	 *
	 * @param {String} name
	 * @return {Type}
	 * @api public
	 */

	function debug(name) {
	  if (!debug.enabled(name)) return function(){};

	  return function(fmt){
	    fmt = coerce(fmt);

	    var curr = new Date;
	    var ms = curr - (debug[name] || curr);
	    debug[name] = curr;

	    fmt = name
	      + ' '
	      + fmt
	      + ' +' + debug.humanize(ms);

	    // This hackery is required for IE8
	    // where `console.log` doesn't have 'apply'
	    window.console
	      && console.log
	      && Function.prototype.apply.call(console.log, console, arguments);
	  }
	}

	/**
	 * The currently active debug mode names.
	 */

	debug.names = [];
	debug.skips = [];

	/**
	 * Enables a debug mode by name. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} name
	 * @api public
	 */

	debug.enable = function(name) {
	  try {
	    localStorage.debug = name;
	  } catch(e){}

	  var split = (name || '').split(/[\s,]+/)
	    , len = split.length;

	  for (var i = 0; i < len; i++) {
	    name = split[i].replace('*', '.*?');
	    if (name[0] === '-') {
	      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
	    }
	    else {
	      debug.names.push(new RegExp('^' + name + '$'));
	    }
	  }
	};

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	debug.disable = function(){
	  debug.enable('');
	};

	/**
	 * Humanize the given `ms`.
	 *
	 * @param {Number} m
	 * @return {String}
	 * @api private
	 */

	debug.humanize = function(ms) {
	  var sec = 1000
	    , min = 60 * 1000
	    , hour = 60 * min;

	  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
	  if (ms >= min) return (ms / min).toFixed(1) + 'm';
	  if (ms >= sec) return (ms / sec | 0) + 's';
	  return ms + 'ms';
	};

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	debug.enabled = function(name) {
	  for (var i = 0, len = debug.skips.length; i < len; i++) {
	    if (debug.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (var i = 0, len = debug.names.length; i < len; i++) {
	    if (debug.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	};

	/**
	 * Coerce `val`.
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}

	// persist

	try {
	  if (window.localStorage) debug.enable(localStorage.debug);
	} catch(e){}


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Parses an URI
	 *
	 * @author Steven Levithan <stevenlevithan.com> (MIT license)
	 * @api private
	 */

	var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

	var parts = [
	    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host'
	  , 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
	];

	module.exports = function parseuri(str) {
	  var m = re.exec(str || '')
	    , uri = {}
	    , i = 14;

	  while (i--) {
	    uri[parts[i]] = m[i] || '';
	  }

	  return uri;
	};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports =  __webpack_require__(47);


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `Emitter`.
	 */

	module.exports = Emitter;

	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */

	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};

	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks[event] = this._callbacks[event] || [])
	    .push(fn);
	  return this;
	};

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.once = function(event, fn){
	  var self = this;
	  this._callbacks = this._callbacks || {};

	  function on() {
	    self.off(event, on);
	    fn.apply(this, arguments);
	  }

	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};

	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }

	  // specific event
	  var callbacks = this._callbacks[event];
	  if (!callbacks) return this;

	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks[event];
	    return this;
	  }

	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};

	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */

	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks[event];

	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }

	  return this;
	};

	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */

	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks[event] || [];
	};

	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */

	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Slice reference.
	 */

	var slice = [].slice;

	/**
	 * Bind `obj` to `fn`.
	 *
	 * @param {Object} obj
	 * @param {Function|String} fn or string
	 * @return {Function}
	 * @api public
	 */

	module.exports = function(obj, fn){
	  if ('string' == typeof fn) fn = obj[fn];
	  if ('function' != typeof fn) throw new Error('bind() requires a function');
	  var args = slice.call(arguments, 2);
	  return function(){
	    return fn.apply(obj, args.concat(slice.call(arguments)));
	  }
	};


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * HOP ref.
	 */

	var has = Object.prototype.hasOwnProperty;

	/**
	 * Return own keys in `obj`.
	 *
	 * @param {Object} obj
	 * @return {Array}
	 * @api public
	 */

	exports.keys = Object.keys || function(obj){
	  var keys = [];
	  for (var key in obj) {
	    if (has.call(obj, key)) {
	      keys.push(key);
	    }
	  }
	  return keys;
	};

	/**
	 * Return own values in `obj`.
	 *
	 * @param {Object} obj
	 * @return {Array}
	 * @api public
	 */

	exports.values = function(obj){
	  var vals = [];
	  for (var key in obj) {
	    if (has.call(obj, key)) {
	      vals.push(obj[key]);
	    }
	  }
	  return vals;
	};

	/**
	 * Merge `b` into `a`.
	 *
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Object} a
	 * @api public
	 */

	exports.merge = function(a, b){
	  for (var key in b) {
	    if (has.call(b, key)) {
	      a[key] = b[key];
	    }
	  }
	  return a;
	};

	/**
	 * Return length of `obj`.
	 *
	 * @param {Object} obj
	 * @return {Number}
	 * @api public
	 */

	exports.length = function(obj){
	  return exports.keys(obj).length;
	};

	/**
	 * Check if `obj` is empty.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api public
	 */

	exports.isEmpty = function(obj){
	  return 0 == exports.length(obj);
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = toArray

	function toArray(list, index) {
	    var array = []

	    index = index || 0

	    for (var i = index || 0; i < list.length; i++) {
	        array[i - index] = list[i]
	    }

	    return array
	}


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/*
	 * Module requirements.
	 */

	var isArray = __webpack_require__(50);

	/**
	 * Module exports.
	 */

	module.exports = hasBinary;

	/**
	 * Checks for binary data.
	 *
	 * Right now only Buffer and ArrayBuffer are supported..
	 *
	 * @param {Object} anything
	 * @api public
	 */

	function hasBinary(data) {

	  function _hasBinary(obj) {
	    if (!obj) return false;

	    if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
	         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
	         (global.Blob && obj instanceof Blob) ||
	         (global.File && obj instanceof File)
	        ) {
	      return true;
	    }

	    if (isArray(obj)) {
	      for (var i = 0; i < obj.length; i++) {
	          if (_hasBinary(obj[i])) {
	              return true;
	          }
	      }
	    } else if (obj && 'object' == typeof obj) {
	      if (obj.toJSON) {
	        obj = obj.toJSON();
	      }

	      for (var key in obj) {
	        if (obj.hasOwnProperty(key) && _hasBinary(obj[key])) {
	          return true;
	        }
	      }
	    }

	    return false;
	  }

	  return _hasBinary(data);
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	
	var indexOf = [].indexOf;

	module.exports = function(arr, obj){
	  if (indexOf) return arr.indexOf(obj);
	  for (var i = 0; i < arr.length; ++i) {
	    if (arr[i] === obj) return i;
	  }
	  return -1;
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*global Blob,File*/

	/**
	 * Module requirements
	 */

	var isArray = __webpack_require__(45);
	var isBuf = __webpack_require__(44);

	/**
	 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
	 * Anything with blobs or files should be fed through removeBlobs before coming
	 * here.
	 *
	 * @param {Object} packet - socket.io event packet
	 * @return {Object} with deconstructed packet and list of buffers
	 * @api public
	 */

	exports.deconstructPacket = function(packet){
	  var buffers = [];
	  var packetData = packet.data;

	  function _deconstructPacket(data) {
	    if (!data) return data;

	    if (isBuf(data)) {
	      var placeholder = { _placeholder: true, num: buffers.length };
	      buffers.push(data);
	      return placeholder;
	    } else if (isArray(data)) {
	      var newData = new Array(data.length);
	      for (var i = 0; i < data.length; i++) {
	        newData[i] = _deconstructPacket(data[i]);
	      }
	      return newData;
	    } else if ('object' == typeof data && !(data instanceof Date)) {
	      var newData = {};
	      for (var key in data) {
	        newData[key] = _deconstructPacket(data[key]);
	      }
	      return newData;
	    }
	    return data;
	  }

	  var pack = packet;
	  pack.data = _deconstructPacket(packetData);
	  pack.attachments = buffers.length; // number of binary 'attachments'
	  return {packet: pack, buffers: buffers};
	};

	/**
	 * Reconstructs a binary packet from its placeholder packet and buffers
	 *
	 * @param {Object} packet - event packet with placeholders
	 * @param {Array} buffers - binary buffers to put in placeholder positions
	 * @return {Object} reconstructed packet
	 * @api public
	 */

	exports.reconstructPacket = function(packet, buffers) {
	  var curPlaceHolder = 0;

	  function _reconstructPacket(data) {
	    if (data && data._placeholder) {
	      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
	      return buf;
	    } else if (isArray(data)) {
	      for (var i = 0; i < data.length; i++) {
	        data[i] = _reconstructPacket(data[i]);
	      }
	      return data;
	    } else if (data && 'object' == typeof data) {
	      for (var key in data) {
	        data[key] = _reconstructPacket(data[key]);
	      }
	      return data;
	    }
	    return data;
	  }

	  packet.data = _reconstructPacket(packet.data);
	  packet.attachments = undefined; // no longer useful
	  return packet;
	};

	/**
	 * Asynchronously removes Blobs or Files from data via
	 * FileReader's readAsArrayBuffer method. Used before encoding
	 * data as msgpack. Calls callback with the blobless data.
	 *
	 * @param {Object} data
	 * @param {Function} callback
	 * @api private
	 */

	exports.removeBlobs = function(data, callback) {
	  function _removeBlobs(obj, curKey, containingObject) {
	    if (!obj) return obj;

	    // convert any blob
	    if ((global.Blob && obj instanceof Blob) ||
	        (global.File && obj instanceof File)) {
	      pendingBlobs++;

	      // async filereader
	      var fileReader = new FileReader();
	      fileReader.onload = function() { // this.result == arraybuffer
	        if (containingObject) {
	          containingObject[curKey] = this.result;
	        }
	        else {
	          bloblessData = this.result;
	        }

	        // if nothing pending its callback time
	        if(! --pendingBlobs) {
	          callback(bloblessData);
	        }
	      };

	      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
	    } else if (isArray(obj)) { // handle array
	      for (var i = 0; i < obj.length; i++) {
	        _removeBlobs(obj[i], i, obj);
	      }
	    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
	      for (var key in obj) {
	        _removeBlobs(obj[key], key, obj);
	      }
	    }
	  }

	  var pendingBlobs = 0;
	  var bloblessData = data;
	  _removeBlobs(bloblessData);
	  if (!pendingBlobs) {
	    callback(bloblessData);
	  }
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	module.exports = isBuf;

	/**
	 * Returns true if obj is a buffer or an arraybuffer.
	 *
	 * @api private
	 */

	function isBuf(obj) {
	  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
	         (global.ArrayBuffer && obj instanceof ArrayBuffer);
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `Emitter`.
	 */

	module.exports = Emitter;

	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */

	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};

	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks[event] = this._callbacks[event] || [])
	    .push(fn);
	  return this;
	};

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.once = function(event, fn){
	  var self = this;
	  this._callbacks = this._callbacks || {};

	  function on() {
	    self.off(event, on);
	    fn.apply(this, arguments);
	  }

	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};

	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }

	  // specific event
	  var callbacks = this._callbacks[event];
	  if (!callbacks) return this;

	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks[event];
	    return this;
	  }

	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};

	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */

	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks[event];

	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }

	  return this;
	};

	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */

	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks[event] || [];
	};

	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */

	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = __webpack_require__(51);

	/**
	 * Exports parser
	 *
	 * @api public
	 *
	 */
	module.exports.parser = __webpack_require__(55);


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `debug()` as the module.
	 */

	module.exports = debug;

	/**
	 * Create a debugger with the given `name`.
	 *
	 * @param {String} name
	 * @return {Type}
	 * @api public
	 */

	function debug(name) {
	  if (!debug.enabled(name)) return function(){};

	  return function(fmt){
	    fmt = coerce(fmt);

	    var curr = new Date;
	    var ms = curr - (debug[name] || curr);
	    debug[name] = curr;

	    fmt = name
	      + ' '
	      + fmt
	      + ' +' + debug.humanize(ms);

	    // This hackery is required for IE8
	    // where `console.log` doesn't have 'apply'
	    window.console
	      && console.log
	      && Function.prototype.apply.call(console.log, console, arguments);
	  }
	}

	/**
	 * The currently active debug mode names.
	 */

	debug.names = [];
	debug.skips = [];

	/**
	 * Enables a debug mode by name. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} name
	 * @api public
	 */

	debug.enable = function(name) {
	  try {
	    localStorage.debug = name;
	  } catch(e){}

	  var split = (name || '').split(/[\s,]+/)
	    , len = split.length;

	  for (var i = 0; i < len; i++) {
	    name = split[i].replace('*', '.*?');
	    if (name[0] === '-') {
	      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
	    }
	    else {
	      debug.names.push(new RegExp('^' + name + '$'));
	    }
	  }
	};

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	debug.disable = function(){
	  debug.enable('');
	};

	/**
	 * Humanize the given `ms`.
	 *
	 * @param {Number} m
	 * @return {String}
	 * @api private
	 */

	debug.humanize = function(ms) {
	  var sec = 1000
	    , min = 60 * 1000
	    , hour = 60 * min;

	  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
	  if (ms >= min) return (ms / min).toFixed(1) + 'm';
	  if (ms >= sec) return (ms / sec | 0) + 's';
	  return ms + 'ms';
	};

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	debug.enabled = function(name) {
	  for (var i = 0, len = debug.skips.length; i < len; i++) {
	    if (debug.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (var i = 0, len = debug.names.length; i < len; i++) {
	    if (debug.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	};

	/**
	 * Coerce `val`.
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}

	// persist

	try {
	  if (window.localStorage) debug.enable(localStorage.debug);
	} catch(e){}


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*! JSON v3.2.6 | http://bestiejs.github.io/json3 | Copyright 2012-2013, Kit Cambridge | http://kit.mit-license.org */
	;(function (window) {
	  // Convenience aliases.
	  var getClass = {}.toString, isProperty, forEach, undef;

	  // Detect the `define` function exposed by asynchronous module loaders. The
	  // strict `define` check is necessary for compatibility with `r.js`.
	  var isLoader = "function" === "function" && __webpack_require__(52);

	  // Detect native implementations.
	  var nativeJSON = typeof JSON == "object" && JSON;

	  // Set up the JSON 3 namespace, preferring the CommonJS `exports` object if
	  // available.
	  var JSON3 = typeof exports == "object" && exports && !exports.nodeType && exports;

	  if (JSON3 && nativeJSON) {
	    // Explicitly delegate to the native `stringify` and `parse`
	    // implementations in CommonJS environments.
	    JSON3.stringify = nativeJSON.stringify;
	    JSON3.parse = nativeJSON.parse;
	  } else {
	    // Export for web browsers, JavaScript engines, and asynchronous module
	    // loaders, using the global `JSON` object if available.
	    JSON3 = window.JSON = nativeJSON || {};
	  }

	  // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
	  var isExtended = new Date(-3509827334573292);
	  try {
	    // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
	    // results for certain dates in Opera >= 10.53.
	    isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
	      // Safari < 2.0.2 stores the internal millisecond time value correctly,
	      // but clips the values returned by the date methods to the range of
	      // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
	      isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
	  } catch (exception) {}

	  // Internal: Determines whether the native `JSON.stringify` and `parse`
	  // implementations are spec-compliant. Based on work by Ken Snyder.
	  function has(name) {
	    if (has[name] !== undef) {
	      // Return cached feature test result.
	      return has[name];
	    }

	    var isSupported;
	    if (name == "bug-string-char-index") {
	      // IE <= 7 doesn't support accessing string characters using square
	      // bracket notation. IE 8 only supports this for primitives.
	      isSupported = "a"[0] != "a";
	    } else if (name == "json") {
	      // Indicates whether both `JSON.stringify` and `JSON.parse` are
	      // supported.
	      isSupported = has("json-stringify") && has("json-parse");
	    } else {
	      var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
	      // Test `JSON.stringify`.
	      if (name == "json-stringify") {
	        var stringify = JSON3.stringify, stringifySupported = typeof stringify == "function" && isExtended;
	        if (stringifySupported) {
	          // A test function object with a custom `toJSON` method.
	          (value = function () {
	            return 1;
	          }).toJSON = value;
	          try {
	            stringifySupported =
	              // Firefox 3.1b1 and b2 serialize string, number, and boolean
	              // primitives as object literals.
	              stringify(0) === "0" &&
	              // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
	              // literals.
	              stringify(new Number()) === "0" &&
	              stringify(new String()) == '""' &&
	              // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
	              // does not define a canonical JSON representation (this applies to
	              // objects with `toJSON` properties as well, *unless* they are nested
	              // within an object or array).
	              stringify(getClass) === undef &&
	              // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
	              // FF 3.1b3 pass this test.
	              stringify(undef) === undef &&
	              // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
	              // respectively, if the value is omitted entirely.
	              stringify() === undef &&
	              // FF 3.1b1, 2 throw an error if the given value is not a number,
	              // string, array, object, Boolean, or `null` literal. This applies to
	              // objects with custom `toJSON` methods as well, unless they are nested
	              // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
	              // methods entirely.
	              stringify(value) === "1" &&
	              stringify([value]) == "[1]" &&
	              // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
	              // `"[null]"`.
	              stringify([undef]) == "[null]" &&
	              // YUI 3.0.0b1 fails to serialize `null` literals.
	              stringify(null) == "null" &&
	              // FF 3.1b1, 2 halts serialization if an array contains a function:
	              // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
	              // elides non-JSON values from objects and arrays, unless they
	              // define custom `toJSON` methods.
	              stringify([undef, getClass, null]) == "[null,null,null]" &&
	              // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
	              // where character escape codes are expected (e.g., `\b` => `\u0008`).
	              stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
	              // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
	              stringify(null, value) === "1" &&
	              stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
	              // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
	              // serialize extended years.
	              stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
	              // The milliseconds are optional in ES 5, but required in 5.1.
	              stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
	              // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
	              // four-digit years instead of six-digit years. Credits: @Yaffle.
	              stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
	              // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
	              // values less than 1000. Credits: @Yaffle.
	              stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
	          } catch (exception) {
	            stringifySupported = false;
	          }
	        }
	        isSupported = stringifySupported;
	      }
	      // Test `JSON.parse`.
	      if (name == "json-parse") {
	        var parse = JSON3.parse;
	        if (typeof parse == "function") {
	          try {
	            // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
	            // Conforming implementations should also coerce the initial argument to
	            // a string prior to parsing.
	            if (parse("0") === 0 && !parse(false)) {
	              // Simple parsing test.
	              value = parse(serialized);
	              var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
	              if (parseSupported) {
	                try {
	                  // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
	                  parseSupported = !parse('"\t"');
	                } catch (exception) {}
	                if (parseSupported) {
	                  try {
	                    // FF 4.0 and 4.0.1 allow leading `+` signs and leading
	                    // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
	                    // certain octal literals.
	                    parseSupported = parse("01") !== 1;
	                  } catch (exception) {}
	                }
	                if (parseSupported) {
	                  try {
	                    // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
	                    // points. These environments, along with FF 3.1b1 and 2,
	                    // also allow trailing commas in JSON objects and arrays.
	                    parseSupported = parse("1.") !== 1;
	                  } catch (exception) {}
	                }
	              }
	            }
	          } catch (exception) {
	            parseSupported = false;
	          }
	        }
	        isSupported = parseSupported;
	      }
	    }
	    return has[name] = !!isSupported;
	  }

	  if (!has("json")) {
	    // Common `[[Class]]` name aliases.
	    var functionClass = "[object Function]";
	    var dateClass = "[object Date]";
	    var numberClass = "[object Number]";
	    var stringClass = "[object String]";
	    var arrayClass = "[object Array]";
	    var booleanClass = "[object Boolean]";

	    // Detect incomplete support for accessing string characters by index.
	    var charIndexBuggy = has("bug-string-char-index");

	    // Define additional utility methods if the `Date` methods are buggy.
	    if (!isExtended) {
	      var floor = Math.floor;
	      // A mapping between the months of the year and the number of days between
	      // January 1st and the first of the respective month.
	      var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	      // Internal: Calculates the number of days between the Unix epoch and the
	      // first day of the given month.
	      var getDay = function (year, month) {
	        return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
	      };
	    }

	    // Internal: Determines if a property is a direct property of the given
	    // object. Delegates to the native `Object#hasOwnProperty` method.
	    if (!(isProperty = {}.hasOwnProperty)) {
	      isProperty = function (property) {
	        var members = {}, constructor;
	        if ((members.__proto__ = null, members.__proto__ = {
	          // The *proto* property cannot be set multiple times in recent
	          // versions of Firefox and SeaMonkey.
	          "toString": 1
	        }, members).toString != getClass) {
	          // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
	          // supports the mutable *proto* property.
	          isProperty = function (property) {
	            // Capture and break the object's prototype chain (see section 8.6.2
	            // of the ES 5.1 spec). The parenthesized expression prevents an
	            // unsafe transformation by the Closure Compiler.
	            var original = this.__proto__, result = property in (this.__proto__ = null, this);
	            // Restore the original prototype chain.
	            this.__proto__ = original;
	            return result;
	          };
	        } else {
	          // Capture a reference to the top-level `Object` constructor.
	          constructor = members.constructor;
	          // Use the `constructor` property to simulate `Object#hasOwnProperty` in
	          // other environments.
	          isProperty = function (property) {
	            var parent = (this.constructor || constructor).prototype;
	            return property in this && !(property in parent && this[property] === parent[property]);
	          };
	        }
	        members = null;
	        return isProperty.call(this, property);
	      };
	    }

	    // Internal: A set of primitive types used by `isHostType`.
	    var PrimitiveTypes = {
	      'boolean': 1,
	      'number': 1,
	      'string': 1,
	      'undefined': 1
	    };

	    // Internal: Determines if the given object `property` value is a
	    // non-primitive.
	    var isHostType = function (object, property) {
	      var type = typeof object[property];
	      return type == 'object' ? !!object[property] : !PrimitiveTypes[type];
	    };

	    // Internal: Normalizes the `for...in` iteration algorithm across
	    // environments. Each enumerated key is yielded to a `callback` function.
	    forEach = function (object, callback) {
	      var size = 0, Properties, members, property;

	      // Tests for bugs in the current environment's `for...in` algorithm. The
	      // `valueOf` property inherits the non-enumerable flag from
	      // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
	      (Properties = function () {
	        this.valueOf = 0;
	      }).prototype.valueOf = 0;

	      // Iterate over a new instance of the `Properties` class.
	      members = new Properties();
	      for (property in members) {
	        // Ignore all properties inherited from `Object.prototype`.
	        if (isProperty.call(members, property)) {
	          size++;
	        }
	      }
	      Properties = members = null;

	      // Normalize the iteration algorithm.
	      if (!size) {
	        // A list of non-enumerable properties inherited from `Object.prototype`.
	        members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
	        // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
	        // properties.
	        forEach = function (object, callback) {
	          var isFunction = getClass.call(object) == functionClass, property, length;
	          var hasProperty = !isFunction && typeof object.constructor != 'function' && isHostType(object, 'hasOwnProperty') ? object.hasOwnProperty : isProperty;
	          for (property in object) {
	            // Gecko <= 1.0 enumerates the `prototype` property of functions under
	            // certain conditions; IE does not.
	            if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
	              callback(property);
	            }
	          }
	          // Manually invoke the callback for each non-enumerable property.
	          for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
	        };
	      } else if (size == 2) {
	        // Safari <= 2.0.4 enumerates shadowed properties twice.
	        forEach = function (object, callback) {
	          // Create a set of iterated properties.
	          var members = {}, isFunction = getClass.call(object) == functionClass, property;
	          for (property in object) {
	            // Store each property name to prevent double enumeration. The
	            // `prototype` property of functions is not enumerated due to cross-
	            // environment inconsistencies.
	            if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
	              callback(property);
	            }
	          }
	        };
	      } else {
	        // No bugs detected; use the standard `for...in` algorithm.
	        forEach = function (object, callback) {
	          var isFunction = getClass.call(object) == functionClass, property, isConstructor;
	          for (property in object) {
	            if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
	              callback(property);
	            }
	          }
	          // Manually invoke the callback for the `constructor` property due to
	          // cross-environment inconsistencies.
	          if (isConstructor || isProperty.call(object, (property = "constructor"))) {
	            callback(property);
	          }
	        };
	      }
	      return forEach(object, callback);
	    };

	    // Public: Serializes a JavaScript `value` as a JSON string. The optional
	    // `filter` argument may specify either a function that alters how object and
	    // array members are serialized, or an array of strings and numbers that
	    // indicates which properties should be serialized. The optional `width`
	    // argument may be either a string or number that specifies the indentation
	    // level of the output.
	    if (!has("json-stringify")) {
	      // Internal: A map of control characters and their escaped equivalents.
	      var Escapes = {
	        92: "\\\\",
	        34: '\\"',
	        8: "\\b",
	        12: "\\f",
	        10: "\\n",
	        13: "\\r",
	        9: "\\t"
	      };

	      // Internal: Converts `value` into a zero-padded string such that its
	      // length is at least equal to `width`. The `width` must be <= 6.
	      var leadingZeroes = "000000";
	      var toPaddedString = function (width, value) {
	        // The `|| 0` expression is necessary to work around a bug in
	        // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
	        return (leadingZeroes + (value || 0)).slice(-width);
	      };

	      // Internal: Double-quotes a string `value`, replacing all ASCII control
	      // characters (characters with code unit values between 0 and 31) with
	      // their escaped equivalents. This is an implementation of the
	      // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
	      var unicodePrefix = "\\u00";
	      var quote = function (value) {
	        var result = '"', index = 0, length = value.length, isLarge = length > 10 && charIndexBuggy, symbols;
	        if (isLarge) {
	          symbols = value.split("");
	        }
	        for (; index < length; index++) {
	          var charCode = value.charCodeAt(index);
	          // If the character is a control character, append its Unicode or
	          // shorthand escape sequence; otherwise, append the character as-is.
	          switch (charCode) {
	            case 8: case 9: case 10: case 12: case 13: case 34: case 92:
	              result += Escapes[charCode];
	              break;
	            default:
	              if (charCode < 32) {
	                result += unicodePrefix + toPaddedString(2, charCode.toString(16));
	                break;
	              }
	              result += isLarge ? symbols[index] : charIndexBuggy ? value.charAt(index) : value[index];
	          }
	        }
	        return result + '"';
	      };

	      // Internal: Recursively serializes an object. Implements the
	      // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
	      var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
	        var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
	        try {
	          // Necessary for host object support.
	          value = object[property];
	        } catch (exception) {}
	        if (typeof value == "object" && value) {
	          className = getClass.call(value);
	          if (className == dateClass && !isProperty.call(value, "toJSON")) {
	            if (value > -1 / 0 && value < 1 / 0) {
	              // Dates are serialized according to the `Date#toJSON` method
	              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
	              // for the ISO 8601 date time string format.
	              if (getDay) {
	                // Manually compute the year, month, date, hours, minutes,
	                // seconds, and milliseconds if the `getUTC*` methods are
	                // buggy. Adapted from @Yaffle's `date-shim` project.
	                date = floor(value / 864e5);
	                for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
	                for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
	                date = 1 + date - getDay(year, month);
	                // The `time` value specifies the time within the day (see ES
	                // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
	                // to compute `A modulo B`, as the `%` operator does not
	                // correspond to the `modulo` operation for negative numbers.
	                time = (value % 864e5 + 864e5) % 864e5;
	                // The hours, minutes, seconds, and milliseconds are obtained by
	                // decomposing the time within the day. See section 15.9.1.10.
	                hours = floor(time / 36e5) % 24;
	                minutes = floor(time / 6e4) % 60;
	                seconds = floor(time / 1e3) % 60;
	                milliseconds = time % 1e3;
	              } else {
	                year = value.getUTCFullYear();
	                month = value.getUTCMonth();
	                date = value.getUTCDate();
	                hours = value.getUTCHours();
	                minutes = value.getUTCMinutes();
	                seconds = value.getUTCSeconds();
	                milliseconds = value.getUTCMilliseconds();
	              }
	              // Serialize extended years correctly.
	              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
	                "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
	                // Months, dates, hours, minutes, and seconds should have two
	                // digits; milliseconds should have three.
	                "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
	                // Milliseconds are optional in ES 5.0, but required in 5.1.
	                "." + toPaddedString(3, milliseconds) + "Z";
	            } else {
	              value = null;
	            }
	          } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
	            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
	            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
	            // ignores all `toJSON` methods on these objects unless they are
	            // defined directly on an instance.
	            value = value.toJSON(property);
	          }
	        }
	        if (callback) {
	          // If a replacement function was provided, call it to obtain the value
	          // for serialization.
	          value = callback.call(object, property, value);
	        }
	        if (value === null) {
	          return "null";
	        }
	        className = getClass.call(value);
	        if (className == booleanClass) {
	          // Booleans are represented literally.
	          return "" + value;
	        } else if (className == numberClass) {
	          // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
	          // `"null"`.
	          return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
	        } else if (className == stringClass) {
	          // Strings are double-quoted and escaped.
	          return quote("" + value);
	        }
	        // Recursively serialize objects and arrays.
	        if (typeof value == "object") {
	          // Check for cyclic structures. This is a linear search; performance
	          // is inversely proportional to the number of unique nested objects.
	          for (length = stack.length; length--;) {
	            if (stack[length] === value) {
	              // Cyclic structures cannot be serialized by `JSON.stringify`.
	              throw TypeError();
	            }
	          }
	          // Add the object to the stack of traversed objects.
	          stack.push(value);
	          results = [];
	          // Save the current indentation level and indent one additional level.
	          prefix = indentation;
	          indentation += whitespace;
	          if (className == arrayClass) {
	            // Recursively serialize array elements.
	            for (index = 0, length = value.length; index < length; index++) {
	              element = serialize(index, value, callback, properties, whitespace, indentation, stack);
	              results.push(element === undef ? "null" : element);
	            }
	            result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
	          } else {
	            // Recursively serialize object members. Members are selected from
	            // either a user-specified list of property names, or the object
	            // itself.
	            forEach(properties || value, function (property) {
	              var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
	              if (element !== undef) {
	                // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
	                // is not the empty string, let `member` {quote(property) + ":"}
	                // be the concatenation of `member` and the `space` character."
	                // The "`space` character" refers to the literal space
	                // character, not the `space` {width} argument provided to
	                // `JSON.stringify`.
	                results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
	              }
	            });
	            result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
	          }
	          // Remove the object from the traversed object stack.
	          stack.pop();
	          return result;
	        }
	      };

	      // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
	      JSON3.stringify = function (source, filter, width) {
	        var whitespace, callback, properties, className;
	        if (typeof filter == "function" || typeof filter == "object" && filter) {
	          if ((className = getClass.call(filter)) == functionClass) {
	            callback = filter;
	          } else if (className == arrayClass) {
	            // Convert the property names array into a makeshift set.
	            properties = {};
	            for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
	          }
	        }
	        if (width) {
	          if ((className = getClass.call(width)) == numberClass) {
	            // Convert the `width` to an integer and create a string containing
	            // `width` number of space characters.
	            if ((width -= width % 1) > 0) {
	              for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
	            }
	          } else if (className == stringClass) {
	            whitespace = width.length <= 10 ? width : width.slice(0, 10);
	          }
	        }
	        // Opera <= 7.54u2 discards the values associated with empty string keys
	        // (`""`) only if they are used directly within an object member list
	        // (e.g., `!("" in { "": 1})`).
	        return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
	      };
	    }

	    // Public: Parses a JSON source string.
	    if (!has("json-parse")) {
	      var fromCharCode = String.fromCharCode;

	      // Internal: A map of escaped control characters and their unescaped
	      // equivalents.
	      var Unescapes = {
	        92: "\\",
	        34: '"',
	        47: "/",
	        98: "\b",
	        116: "\t",
	        110: "\n",
	        102: "\f",
	        114: "\r"
	      };

	      // Internal: Stores the parser state.
	      var Index, Source;

	      // Internal: Resets the parser state and throws a `SyntaxError`.
	      var abort = function() {
	        Index = Source = null;
	        throw SyntaxError();
	      };

	      // Internal: Returns the next token, or `"$"` if the parser has reached
	      // the end of the source string. A token may be a string, number, `null`
	      // literal, or Boolean literal.
	      var lex = function () {
	        var source = Source, length = source.length, value, begin, position, isSigned, charCode;
	        while (Index < length) {
	          charCode = source.charCodeAt(Index);
	          switch (charCode) {
	            case 9: case 10: case 13: case 32:
	              // Skip whitespace tokens, including tabs, carriage returns, line
	              // feeds, and space characters.
	              Index++;
	              break;
	            case 123: case 125: case 91: case 93: case 58: case 44:
	              // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
	              // the current position.
	              value = charIndexBuggy ? source.charAt(Index) : source[Index];
	              Index++;
	              return value;
	            case 34:
	              // `"` delimits a JSON string; advance to the next character and
	              // begin parsing the string. String tokens are prefixed with the
	              // sentinel `@` character to distinguish them from punctuators and
	              // end-of-string tokens.
	              for (value = "@", Index++; Index < length;) {
	                charCode = source.charCodeAt(Index);
	                if (charCode < 32) {
	                  // Unescaped ASCII control characters (those with a code unit
	                  // less than the space character) are not permitted.
	                  abort();
	                } else if (charCode == 92) {
	                  // A reverse solidus (`\`) marks the beginning of an escaped
	                  // control character (including `"`, `\`, and `/`) or Unicode
	                  // escape sequence.
	                  charCode = source.charCodeAt(++Index);
	                  switch (charCode) {
	                    case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
	                      // Revive escaped control characters.
	                      value += Unescapes[charCode];
	                      Index++;
	                      break;
	                    case 117:
	                      // `\u` marks the beginning of a Unicode escape sequence.
	                      // Advance to the first character and validate the
	                      // four-digit code point.
	                      begin = ++Index;
	                      for (position = Index + 4; Index < position; Index++) {
	                        charCode = source.charCodeAt(Index);
	                        // A valid sequence comprises four hexdigits (case-
	                        // insensitive) that form a single hexadecimal value.
	                        if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
	                          // Invalid Unicode escape sequence.
	                          abort();
	                        }
	                      }
	                      // Revive the escaped character.
	                      value += fromCharCode("0x" + source.slice(begin, Index));
	                      break;
	                    default:
	                      // Invalid escape sequence.
	                      abort();
	                  }
	                } else {
	                  if (charCode == 34) {
	                    // An unescaped double-quote character marks the end of the
	                    // string.
	                    break;
	                  }
	                  charCode = source.charCodeAt(Index);
	                  begin = Index;
	                  // Optimize for the common case where a string is valid.
	                  while (charCode >= 32 && charCode != 92 && charCode != 34) {
	                    charCode = source.charCodeAt(++Index);
	                  }
	                  // Append the string as-is.
	                  value += source.slice(begin, Index);
	                }
	              }
	              if (source.charCodeAt(Index) == 34) {
	                // Advance to the next character and return the revived string.
	                Index++;
	                return value;
	              }
	              // Unterminated string.
	              abort();
	            default:
	              // Parse numbers and literals.
	              begin = Index;
	              // Advance past the negative sign, if one is specified.
	              if (charCode == 45) {
	                isSigned = true;
	                charCode = source.charCodeAt(++Index);
	              }
	              // Parse an integer or floating-point value.
	              if (charCode >= 48 && charCode <= 57) {
	                // Leading zeroes are interpreted as octal literals.
	                if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
	                  // Illegal octal literal.
	                  abort();
	                }
	                isSigned = false;
	                // Parse the integer component.
	                for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
	                // Floats cannot contain a leading decimal point; however, this
	                // case is already accounted for by the parser.
	                if (source.charCodeAt(Index) == 46) {
	                  position = ++Index;
	                  // Parse the decimal component.
	                  for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                  if (position == Index) {
	                    // Illegal trailing decimal.
	                    abort();
	                  }
	                  Index = position;
	                }
	                // Parse exponents. The `e` denoting the exponent is
	                // case-insensitive.
	                charCode = source.charCodeAt(Index);
	                if (charCode == 101 || charCode == 69) {
	                  charCode = source.charCodeAt(++Index);
	                  // Skip past the sign following the exponent, if one is
	                  // specified.
	                  if (charCode == 43 || charCode == 45) {
	                    Index++;
	                  }
	                  // Parse the exponential component.
	                  for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                  if (position == Index) {
	                    // Illegal empty exponent.
	                    abort();
	                  }
	                  Index = position;
	                }
	                // Coerce the parsed value to a JavaScript number.
	                return +source.slice(begin, Index);
	              }
	              // A negative sign may only precede numbers.
	              if (isSigned) {
	                abort();
	              }
	              // `true`, `false`, and `null` literals.
	              if (source.slice(Index, Index + 4) == "true") {
	                Index += 4;
	                return true;
	              } else if (source.slice(Index, Index + 5) == "false") {
	                Index += 5;
	                return false;
	              } else if (source.slice(Index, Index + 4) == "null") {
	                Index += 4;
	                return null;
	              }
	              // Unrecognized token.
	              abort();
	          }
	        }
	        // Return the sentinel `$` character if the parser has reached the end
	        // of the source string.
	        return "$";
	      };

	      // Internal: Parses a JSON `value` token.
	      var get = function (value) {
	        var results, hasMembers;
	        if (value == "$") {
	          // Unexpected end of input.
	          abort();
	        }
	        if (typeof value == "string") {
	          if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
	            // Remove the sentinel `@` character.
	            return value.slice(1);
	          }
	          // Parse object and array literals.
	          if (value == "[") {
	            // Parses a JSON array, returning a new JavaScript array.
	            results = [];
	            for (;; hasMembers || (hasMembers = true)) {
	              value = lex();
	              // A closing square bracket marks the end of the array literal.
	              if (value == "]") {
	                break;
	              }
	              // If the array literal contains elements, the current token
	              // should be a comma separating the previous element from the
	              // next.
	              if (hasMembers) {
	                if (value == ",") {
	                  value = lex();
	                  if (value == "]") {
	                    // Unexpected trailing `,` in array literal.
	                    abort();
	                  }
	                } else {
	                  // A `,` must separate each array element.
	                  abort();
	                }
	              }
	              // Elisions and leading commas are not permitted.
	              if (value == ",") {
	                abort();
	              }
	              results.push(get(value));
	            }
	            return results;
	          } else if (value == "{") {
	            // Parses a JSON object, returning a new JavaScript object.
	            results = {};
	            for (;; hasMembers || (hasMembers = true)) {
	              value = lex();
	              // A closing curly brace marks the end of the object literal.
	              if (value == "}") {
	                break;
	              }
	              // If the object literal contains members, the current token
	              // should be a comma separator.
	              if (hasMembers) {
	                if (value == ",") {
	                  value = lex();
	                  if (value == "}") {
	                    // Unexpected trailing `,` in object literal.
	                    abort();
	                  }
	                } else {
	                  // A `,` must separate each object member.
	                  abort();
	                }
	              }
	              // Leading commas are not permitted, object property names must be
	              // double-quoted strings, and a `:` must separate each property
	              // name and value.
	              if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
	                abort();
	              }
	              results[value.slice(1)] = get(lex());
	            }
	            return results;
	          }
	          // Unexpected token encountered.
	          abort();
	        }
	        return value;
	      };

	      // Internal: Updates a traversed object member.
	      var update = function(source, property, callback) {
	        var element = walk(source, property, callback);
	        if (element === undef) {
	          delete source[property];
	        } else {
	          source[property] = element;
	        }
	      };

	      // Internal: Recursively traverses a parsed JSON object, invoking the
	      // `callback` function for each value. This is an implementation of the
	      // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
	      var walk = function (source, property, callback) {
	        var value = source[property], length;
	        if (typeof value == "object" && value) {
	          // `forEach` can't be used to traverse an array in Opera <= 8.54
	          // because its `Object#hasOwnProperty` implementation returns `false`
	          // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
	          if (getClass.call(value) == arrayClass) {
	            for (length = value.length; length--;) {
	              update(value, length, callback);
	            }
	          } else {
	            forEach(value, function (property) {
	              update(value, property, callback);
	            });
	          }
	        }
	        return callback.call(source, property, value);
	      };

	      // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
	      JSON3.parse = function (source, callback) {
	        var result, value;
	        Index = 0;
	        Source = "" + source;
	        result = get(lex());
	        // If a JSON string contains multiple tokens, it is invalid.
	        if (lex() != "$") {
	          abort();
	        }
	        // Reset the parser state.
	        Index = Source = null;
	        return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
	      };
	    }
	  }

	  // Export for asynchronous module loaders.
	  if (isLoader) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return JSON3;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}(this));


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module dependencies.
	 */

	var transports = __webpack_require__(54);
	var Emitter = __webpack_require__(37);
	var debug = __webpack_require__(34)('engine.io-client:socket');
	var index = __webpack_require__(42);
	var parser = __webpack_require__(55);
	var parseuri = __webpack_require__(56);
	var parsejson = __webpack_require__(57);
	var parseqs = __webpack_require__(58);

	/**
	 * Module exports.
	 */

	module.exports = Socket;

	/**
	 * Noop function.
	 *
	 * @api private
	 */

	function noop(){}

	/**
	 * Socket constructor.
	 *
	 * @param {String|Object} uri or options
	 * @param {Object} options
	 * @api public
	 */

	function Socket(uri, opts){
	  if (!(this instanceof Socket)) return new Socket(uri, opts);

	  opts = opts || {};

	  if (uri && 'object' == typeof uri) {
	    opts = uri;
	    uri = null;
	  }

	  if (uri) {
	    uri = parseuri(uri);
	    opts.host = uri.host;
	    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
	    opts.port = uri.port;
	    if (uri.query) opts.query = uri.query;
	  }

	  this.secure = null != opts.secure ? opts.secure :
	    (global.location && 'https:' == location.protocol);

	  if (opts.host) {
	    var pieces = opts.host.split(':');
	    opts.hostname = pieces.shift();
	    if (pieces.length) opts.port = pieces.pop();
	  }

	  this.agent = opts.agent || false;
	  this.hostname = opts.hostname ||
	    (global.location ? location.hostname : 'localhost');
	  this.port = opts.port || (global.location && location.port ?
	       location.port :
	       (this.secure ? 443 : 80));
	  this.query = opts.query || {};
	  if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
	  this.upgrade = false !== opts.upgrade;
	  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
	  this.forceJSONP = !!opts.forceJSONP;
	  this.jsonp = false !== opts.jsonp;
	  this.forceBase64 = !!opts.forceBase64;
	  this.enablesXDR = !!opts.enablesXDR;
	  this.timestampParam = opts.timestampParam || 't';
	  this.timestampRequests = opts.timestampRequests;
	  this.transports = opts.transports || ['polling', 'websocket'];
	  this.readyState = '';
	  this.writeBuffer = [];
	  this.callbackBuffer = [];
	  this.policyPort = opts.policyPort || 843;
	  this.rememberUpgrade = opts.rememberUpgrade || false;
	  this.open();
	  this.binaryType = null;
	  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
	}

	Socket.priorWebsocketSuccess = false;

	/**
	 * Mix in `Emitter`.
	 */

	Emitter(Socket.prototype);

	/**
	 * Protocol version.
	 *
	 * @api public
	 */

	Socket.protocol = parser.protocol; // this is an int

	/**
	 * Expose deps for legacy compatibility
	 * and standalone browser access.
	 */

	Socket.Socket = Socket;
	Socket.Transport = __webpack_require__(53);
	Socket.transports = __webpack_require__(54);
	Socket.parser = __webpack_require__(55);

	/**
	 * Creates transport of the given type.
	 *
	 * @param {String} transport name
	 * @return {Transport}
	 * @api private
	 */

	Socket.prototype.createTransport = function (name) {
	  debug('creating transport "%s"', name);
	  var query = clone(this.query);

	  // append engine.io protocol identifier
	  query.EIO = parser.protocol;

	  // transport name
	  query.transport = name;

	  // session id if we already have one
	  if (this.id) query.sid = this.id;

	  var transport = new transports[name]({
	    agent: this.agent,
	    hostname: this.hostname,
	    port: this.port,
	    secure: this.secure,
	    path: this.path,
	    query: query,
	    forceJSONP: this.forceJSONP,
	    jsonp: this.jsonp,
	    forceBase64: this.forceBase64,
	    enablesXDR: this.enablesXDR,
	    timestampRequests: this.timestampRequests,
	    timestampParam: this.timestampParam,
	    policyPort: this.policyPort,
	    socket: this
	  });

	  return transport;
	};

	function clone (obj) {
	  var o = {};
	  for (var i in obj) {
	    if (obj.hasOwnProperty(i)) {
	      o[i] = obj[i];
	    }
	  }
	  return o;
	}

	/**
	 * Initializes transport to use and starts probe.
	 *
	 * @api private
	 */
	Socket.prototype.open = function () {
	  var transport;
	  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
	    transport = 'websocket';
	  } else if (0 == this.transports.length) {
	    // Emit error on next tick so it can be listened to
	    var self = this;
	    setTimeout(function() {
	      self.emit('error', 'No transports available');
	    }, 0);
	    return;
	  } else {
	    transport = this.transports[0];
	  }
	  this.readyState = 'opening';

	  // Retry with the next transport if the transport is disabled (jsonp: false)
	  var transport;
	  try {
	    transport = this.createTransport(transport);
	  } catch (e) {
	    this.transports.shift();
	    this.open();
	    return;
	  }

	  transport.open();
	  this.setTransport(transport);
	};

	/**
	 * Sets the current transport. Disables the existing one (if any).
	 *
	 * @api private
	 */

	Socket.prototype.setTransport = function(transport){
	  debug('setting transport %s', transport.name);
	  var self = this;

	  if (this.transport) {
	    debug('clearing existing transport %s', this.transport.name);
	    this.transport.removeAllListeners();
	  }

	  // set up transport
	  this.transport = transport;

	  // set up transport listeners
	  transport
	  .on('drain', function(){
	    self.onDrain();
	  })
	  .on('packet', function(packet){
	    self.onPacket(packet);
	  })
	  .on('error', function(e){
	    self.onError(e);
	  })
	  .on('close', function(){
	    self.onClose('transport close');
	  });
	};

	/**
	 * Probes a transport.
	 *
	 * @param {String} transport name
	 * @api private
	 */

	Socket.prototype.probe = function (name) {
	  debug('probing transport "%s"', name);
	  var transport = this.createTransport(name, { probe: 1 })
	    , failed = false
	    , self = this;

	  Socket.priorWebsocketSuccess = false;

	  function onTransportOpen(){
	    if (self.onlyBinaryUpgrades) {
	      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
	      failed = failed || upgradeLosesBinary;
	    }
	    if (failed) return;

	    debug('probe transport "%s" opened', name);
	    transport.send([{ type: 'ping', data: 'probe' }]);
	    transport.once('packet', function (msg) {
	      if (failed) return;
	      if ('pong' == msg.type && 'probe' == msg.data) {
	        debug('probe transport "%s" pong', name);
	        self.upgrading = true;
	        self.emit('upgrading', transport);
	        Socket.priorWebsocketSuccess = 'websocket' == transport.name;

	        debug('pausing current transport "%s"', self.transport.name);
	        self.transport.pause(function () {
	          if (failed) return;
	          if ('closed' == self.readyState || 'closing' == self.readyState) {
	            return;
	          }
	          debug('changing transport and sending upgrade packet');

	          cleanup();

	          self.setTransport(transport);
	          transport.send([{ type: 'upgrade' }]);
	          self.emit('upgrade', transport);
	          transport = null;
	          self.upgrading = false;
	          self.flush();
	        });
	      } else {
	        debug('probe transport "%s" failed', name);
	        var err = new Error('probe error');
	        err.transport = transport.name;
	        self.emit('upgradeError', err);
	      }
	    });
	  }

	  function freezeTransport() {
	    if (failed) return;

	    // Any callback called by transport should be ignored since now
	    failed = true;

	    cleanup();

	    transport.close();
	    transport = null;
	  }

	  //Handle any error that happens while probing
	  function onerror(err) {
	    var error = new Error('probe error: ' + err);
	    error.transport = transport.name;

	    freezeTransport();

	    debug('probe transport "%s" failed because of error: %s', name, err);

	    self.emit('upgradeError', error);
	  }

	  function onTransportClose(){
	    onerror("transport closed");
	  }

	  //When the socket is closed while we're probing
	  function onclose(){
	    onerror("socket closed");
	  }

	  //When the socket is upgraded while we're probing
	  function onupgrade(to){
	    if (transport && to.name != transport.name) {
	      debug('"%s" works - aborting "%s"', to.name, transport.name);
	      freezeTransport();
	    }
	  }

	  //Remove all listeners on the transport and on self
	  function cleanup(){
	    transport.removeListener('open', onTransportOpen);
	    transport.removeListener('error', onerror);
	    transport.removeListener('close', onTransportClose);
	    self.removeListener('close', onclose);
	    self.removeListener('upgrading', onupgrade);
	  }

	  transport.once('open', onTransportOpen);
	  transport.once('error', onerror);
	  transport.once('close', onTransportClose);

	  this.once('close', onclose);
	  this.once('upgrading', onupgrade);

	  transport.open();

	};

	/**
	 * Called when connection is deemed open.
	 *
	 * @api public
	 */

	Socket.prototype.onOpen = function () {
	  debug('socket open');
	  this.readyState = 'open';
	  Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
	  this.emit('open');
	  this.flush();

	  // we check for `readyState` in case an `open`
	  // listener already closed the socket
	  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
	    debug('starting upgrade probes');
	    for (var i = 0, l = this.upgrades.length; i < l; i++) {
	      this.probe(this.upgrades[i]);
	    }
	  }
	};

	/**
	 * Handles a packet.
	 *
	 * @api private
	 */

	Socket.prototype.onPacket = function (packet) {
	  if ('opening' == this.readyState || 'open' == this.readyState) {
	    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

	    this.emit('packet', packet);

	    // Socket is live - any packet counts
	    this.emit('heartbeat');

	    switch (packet.type) {
	      case 'open':
	        this.onHandshake(parsejson(packet.data));
	        break;

	      case 'pong':
	        this.setPing();
	        break;

	      case 'error':
	        var err = new Error('server error');
	        err.code = packet.data;
	        this.emit('error', err);
	        break;

	      case 'message':
	        this.emit('data', packet.data);
	        this.emit('message', packet.data);
	        break;
	    }
	  } else {
	    debug('packet received with socket readyState "%s"', this.readyState);
	  }
	};

	/**
	 * Called upon handshake completion.
	 *
	 * @param {Object} handshake obj
	 * @api private
	 */

	Socket.prototype.onHandshake = function (data) {
	  this.emit('handshake', data);
	  this.id = data.sid;
	  this.transport.query.sid = data.sid;
	  this.upgrades = this.filterUpgrades(data.upgrades);
	  this.pingInterval = data.pingInterval;
	  this.pingTimeout = data.pingTimeout;
	  this.onOpen();
	  // In case open handler closes socket
	  if  ('closed' == this.readyState) return;
	  this.setPing();

	  // Prolong liveness of socket on heartbeat
	  this.removeListener('heartbeat', this.onHeartbeat);
	  this.on('heartbeat', this.onHeartbeat);
	};

	/**
	 * Resets ping timeout.
	 *
	 * @api private
	 */

	Socket.prototype.onHeartbeat = function (timeout) {
	  clearTimeout(this.pingTimeoutTimer);
	  var self = this;
	  self.pingTimeoutTimer = setTimeout(function () {
	    if ('closed' == self.readyState) return;
	    self.onClose('ping timeout');
	  }, timeout || (self.pingInterval + self.pingTimeout));
	};

	/**
	 * Pings server every `this.pingInterval` and expects response
	 * within `this.pingTimeout` or closes connection.
	 *
	 * @api private
	 */

	Socket.prototype.setPing = function () {
	  var self = this;
	  clearTimeout(self.pingIntervalTimer);
	  self.pingIntervalTimer = setTimeout(function () {
	    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
	    self.ping();
	    self.onHeartbeat(self.pingTimeout);
	  }, self.pingInterval);
	};

	/**
	* Sends a ping packet.
	*
	* @api public
	*/

	Socket.prototype.ping = function () {
	  this.sendPacket('ping');
	};

	/**
	 * Called on `drain` event
	 *
	 * @api private
	 */

	Socket.prototype.onDrain = function() {
	  for (var i = 0; i < this.prevBufferLen; i++) {
	    if (this.callbackBuffer[i]) {
	      this.callbackBuffer[i]();
	    }
	  }

	  this.writeBuffer.splice(0, this.prevBufferLen);
	  this.callbackBuffer.splice(0, this.prevBufferLen);

	  // setting prevBufferLen = 0 is very important
	  // for example, when upgrading, upgrade packet is sent over,
	  // and a nonzero prevBufferLen could cause problems on `drain`
	  this.prevBufferLen = 0;

	  if (this.writeBuffer.length == 0) {
	    this.emit('drain');
	  } else {
	    this.flush();
	  }
	};

	/**
	 * Flush write buffers.
	 *
	 * @api private
	 */

	Socket.prototype.flush = function () {
	  if ('closed' != this.readyState && this.transport.writable &&
	    !this.upgrading && this.writeBuffer.length) {
	    debug('flushing %d packets in socket', this.writeBuffer.length);
	    this.transport.send(this.writeBuffer);
	    // keep track of current length of writeBuffer
	    // splice writeBuffer and callbackBuffer on `drain`
	    this.prevBufferLen = this.writeBuffer.length;
	    this.emit('flush');
	  }
	};

	/**
	 * Sends a message.
	 *
	 * @param {String} message.
	 * @param {Function} callback function.
	 * @return {Socket} for chaining.
	 * @api public
	 */

	Socket.prototype.write =
	Socket.prototype.send = function (msg, fn) {
	  this.sendPacket('message', msg, fn);
	  return this;
	};

	/**
	 * Sends a packet.
	 *
	 * @param {String} packet type.
	 * @param {String} data.
	 * @param {Function} callback function.
	 * @api private
	 */

	Socket.prototype.sendPacket = function (type, data, fn) {
	  var packet = { type: type, data: data };
	  this.emit('packetCreate', packet);
	  this.writeBuffer.push(packet);
	  this.callbackBuffer.push(fn);
	  this.flush();
	};

	/**
	 * Closes the connection.
	 *
	 * @api private
	 */

	Socket.prototype.close = function () {
	  if ('opening' == this.readyState || 'open' == this.readyState) {
	    this.onClose('forced close');
	    debug('socket closing - telling transport to close');
	    this.transport.close();
	  }

	  return this;
	};

	/**
	 * Called upon transport error
	 *
	 * @api private
	 */

	Socket.prototype.onError = function (err) {
	  debug('socket error %j', err);
	  Socket.priorWebsocketSuccess = false;
	  this.emit('error', err);
	  this.onClose('transport error', err);
	};

	/**
	 * Called upon transport close.
	 *
	 * @api private
	 */

	Socket.prototype.onClose = function (reason, desc) {
	  if ('opening' == this.readyState || 'open' == this.readyState) {
	    debug('socket close with reason: "%s"', reason);
	    var self = this;

	    // clear timers
	    clearTimeout(this.pingIntervalTimer);
	    clearTimeout(this.pingTimeoutTimer);

	    // clean buffers in next tick, so developers can still
	    // grab the buffers on `close` event
	    setTimeout(function() {
	      self.writeBuffer = [];
	      self.callbackBuffer = [];
	      self.prevBufferLen = 0;
	    }, 0);

	    // stop event from firing again for transport
	    this.transport.removeAllListeners('close');

	    // ensure transport won't stay open
	    this.transport.close();

	    // ignore further transport communication
	    this.transport.removeAllListeners();

	    // set ready state
	    this.readyState = 'closed';

	    // clear session id
	    this.id = null;

	    // emit close event
	    this.emit('close', reason, desc);
	  }
	};

	/**
	 * Filters upgrades, returning only those matching client transports.
	 *
	 * @param {Array} server upgrades
	 * @api private
	 *
	 */

	Socket.prototype.filterUpgrades = function (upgrades) {
	  var filteredUpgrades = [];
	  for (var i = 0, j = upgrades.length; i<j; i++) {
	    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
	  }
	  return filteredUpgrades;
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;
	
	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var parser = __webpack_require__(55);
	var Emitter = __webpack_require__(37);

	/**
	 * Module exports.
	 */

	module.exports = Transport;

	/**
	 * Transport abstract constructor.
	 *
	 * @param {Object} options.
	 * @api private
	 */

	function Transport (opts) {
	  this.path = opts.path;
	  this.hostname = opts.hostname;
	  this.port = opts.port;
	  this.secure = opts.secure;
	  this.query = opts.query;
	  this.timestampParam = opts.timestampParam;
	  this.timestampRequests = opts.timestampRequests;
	  this.readyState = '';
	  this.agent = opts.agent || false;
	  this.socket = opts.socket;
	  this.enablesXDR = opts.enablesXDR;
	}

	/**
	 * Mix in `Emitter`.
	 */

	Emitter(Transport.prototype);

	/**
	 * A counter used to prevent collisions in the timestamps used
	 * for cache busting.
	 */

	Transport.timestamps = 0;

	/**
	 * Emits an error.
	 *
	 * @param {String} str
	 * @return {Transport} for chaining
	 * @api public
	 */

	Transport.prototype.onError = function (msg, desc) {
	  var err = new Error(msg);
	  err.type = 'TransportError';
	  err.description = desc;
	  this.emit('error', err);
	  return this;
	};

	/**
	 * Opens the transport.
	 *
	 * @api public
	 */

	Transport.prototype.open = function () {
	  if ('closed' == this.readyState || '' == this.readyState) {
	    this.readyState = 'opening';
	    this.doOpen();
	  }

	  return this;
	};

	/**
	 * Closes the transport.
	 *
	 * @api private
	 */

	Transport.prototype.close = function () {
	  if ('opening' == this.readyState || 'open' == this.readyState) {
	    this.doClose();
	    this.onClose();
	  }

	  return this;
	};

	/**
	 * Sends multiple packets.
	 *
	 * @param {Array} packets
	 * @api private
	 */

	Transport.prototype.send = function(packets){
	  if ('open' == this.readyState) {
	    this.write(packets);
	  } else {
	    throw new Error('Transport not open');
	  }
	};

	/**
	 * Called upon open
	 *
	 * @api private
	 */

	Transport.prototype.onOpen = function () {
	  this.readyState = 'open';
	  this.writable = true;
	  this.emit('open');
	};

	/**
	 * Called with data.
	 *
	 * @param {String} data
	 * @api private
	 */

	Transport.prototype.onData = function(data){
	  var packet = parser.decodePacket(data, this.socket.binaryType);
	  this.onPacket(packet);
	};

	/**
	 * Called with a decoded packet.
	 */

	Transport.prototype.onPacket = function (packet) {
	  this.emit('packet', packet);
	};

	/**
	 * Called upon close.
	 *
	 * @api private
	 */

	Transport.prototype.onClose = function () {
	  this.readyState = 'closed';
	  this.emit('close');
	};


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module dependencies
	 */

	var XMLHttpRequest = __webpack_require__(59);
	var XHR = __webpack_require__(60);
	var JSONP = __webpack_require__(61);
	var websocket = __webpack_require__(62);

	/**
	 * Export transports.
	 */

	exports.polling = polling;
	exports.websocket = websocket;

	/**
	 * Polling transport polymorphic constructor.
	 * Decides on xhr vs jsonp based on feature detection.
	 *
	 * @api private
	 */

	function polling(opts){
	  var xhr;
	  var xd = false;
	  var xs = false;
	  var jsonp = false !== opts.jsonp;

	  if (global.location) {
	    var isSSL = 'https:' == location.protocol;
	    var port = location.port;

	    // some user agents have empty `location.port`
	    if (!port) {
	      port = isSSL ? 443 : 80;
	    }

	    xd = opts.hostname != location.hostname || port != opts.port;
	    xs = opts.secure != isSSL;
	  }

	  opts.xdomain = xd;
	  opts.xscheme = xs;
	  xhr = new XMLHttpRequest(opts);

	  if ('open' in xhr && !opts.forceJSONP) {
	    return new XHR(opts);
	  } else {
	    if (!jsonp) throw new Error('JSONP disabled');
	    return new JSONP(opts);
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module dependencies.
	 */

	var keys = __webpack_require__(63);
	var sliceBuffer = __webpack_require__(65);
	var base64encoder = __webpack_require__(69);
	var after = __webpack_require__(66);
	var utf8 = __webpack_require__(68);

	/**
	 * Check if we are running an android browser. That requires us to use
	 * ArrayBuffer with polling transports...
	 *
	 * http://ghinda.net/jpeg-blob-ajax-android/
	 */

	var isAndroid = navigator.userAgent.match(/Android/i);

	/**
	 * Current protocol version.
	 */

	exports.protocol = 3;

	/**
	 * Packet types.
	 */

	var packets = exports.packets = {
	    open:     0    // non-ws
	  , close:    1    // non-ws
	  , ping:     2
	  , pong:     3
	  , message:  4
	  , upgrade:  5
	  , noop:     6
	};

	var packetslist = keys(packets);

	/**
	 * Premade error packet.
	 */

	var err = { type: 'error', data: 'parser error' };

	/**
	 * Create a blob api even for blob builder when vendor prefixes exist
	 */

	var Blob = __webpack_require__(67);

	/**
	 * Encodes a packet.
	 *
	 *     <packet type id> [ <data> ]
	 *
	 * Example:
	 *
	 *     5hello world
	 *     3
	 *     4
	 *
	 * Binary is encoded in an identical principle
	 *
	 * @api private
	 */

	exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
	  if ('function' == typeof supportsBinary) {
	    callback = supportsBinary;
	    supportsBinary = false;
	  }

	  if ('function' == typeof utf8encode) {
	    callback = utf8encode;
	    utf8encode = null;
	  }

	  var data = (packet.data === undefined)
	    ? undefined
	    : packet.data.buffer || packet.data;

	  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
	    return encodeArrayBuffer(packet, supportsBinary, callback);
	  } else if (Blob && data instanceof global.Blob) {
	    return encodeBlob(packet, supportsBinary, callback);
	  }

	  // Sending data as a utf-8 string
	  var encoded = packets[packet.type];

	  // data fragment is optional
	  if (undefined !== packet.data) {
	    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
	  }

	  return callback('' + encoded);

	};

	/**
	 * Encode packet helpers for binary types
	 */

	function encodeArrayBuffer(packet, supportsBinary, callback) {
	  if (!supportsBinary) {
	    return exports.encodeBase64Packet(packet, callback);
	  }

	  var data = packet.data;
	  var contentArray = new Uint8Array(data);
	  var resultBuffer = new Uint8Array(1 + data.byteLength);

	  resultBuffer[0] = packets[packet.type];
	  for (var i = 0; i < contentArray.length; i++) {
	    resultBuffer[i+1] = contentArray[i];
	  }

	  return callback(resultBuffer.buffer);
	}

	function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
	  if (!supportsBinary) {
	    return exports.encodeBase64Packet(packet, callback);
	  }

	  var fr = new FileReader();
	  fr.onload = function() {
	    packet.data = fr.result;
	    exports.encodePacket(packet, supportsBinary, true, callback);
	  };
	  return fr.readAsArrayBuffer(packet.data);
	}

	function encodeBlob(packet, supportsBinary, callback) {
	  if (!supportsBinary) {
	    return exports.encodeBase64Packet(packet, callback);
	  }

	  if (isAndroid) {
	    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
	  }

	  var length = new Uint8Array(1);
	  length[0] = packets[packet.type];
	  var blob = new Blob([length.buffer, packet.data]);

	  return callback(blob);
	}

	/**
	 * Encodes a packet with binary data in a base64 string
	 *
	 * @param {Object} packet, has `type` and `data`
	 * @return {String} base64 encoded message
	 */

	exports.encodeBase64Packet = function(packet, callback) {
	  var message = 'b' + exports.packets[packet.type];
	  if (Blob && packet.data instanceof Blob) {
	    var fr = new FileReader();
	    fr.onload = function() {
	      var b64 = fr.result.split(',')[1];
	      callback(message + b64);
	    };
	    return fr.readAsDataURL(packet.data);
	  }

	  var b64data;
	  try {
	    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
	  } catch (e) {
	    // iPhone Safari doesn't let you apply with typed arrays
	    var typed = new Uint8Array(packet.data);
	    var basic = new Array(typed.length);
	    for (var i = 0; i < typed.length; i++) {
	      basic[i] = typed[i];
	    }
	    b64data = String.fromCharCode.apply(null, basic);
	  }
	  message += global.btoa(b64data);
	  return callback(message);
	};

	/**
	 * Decodes a packet. Changes format to Blob if requested.
	 *
	 * @return {Object} with `type` and `data` (if any)
	 * @api private
	 */

	exports.decodePacket = function (data, binaryType, utf8decode) {
	  // String data
	  if (typeof data == 'string' || data === undefined) {
	    if (data.charAt(0) == 'b') {
	      return exports.decodeBase64Packet(data.substr(1), binaryType);
	    }

	    if (utf8decode) {
	      try {
	        data = utf8.decode(data);
	      } catch (e) {
	        return err;
	      }
	    }
	    var type = data.charAt(0);

	    if (Number(type) != type || !packetslist[type]) {
	      return err;
	    }

	    if (data.length > 1) {
	      return { type: packetslist[type], data: data.substring(1) };
	    } else {
	      return { type: packetslist[type] };
	    }
	  }

	  var asArray = new Uint8Array(data);
	  var type = asArray[0];
	  var rest = sliceBuffer(data, 1);
	  if (Blob && binaryType === 'blob') {
	    rest = new Blob([rest]);
	  }
	  return { type: packetslist[type], data: rest };
	};

	/**
	 * Decodes a packet encoded in a base64 string
	 *
	 * @param {String} base64 encoded message
	 * @return {Object} with `type` and `data` (if any)
	 */

	exports.decodeBase64Packet = function(msg, binaryType) {
	  var type = packetslist[msg.charAt(0)];
	  if (!global.ArrayBuffer) {
	    return { type: type, data: { base64: true, data: msg.substr(1) } };
	  }

	  var data = base64encoder.decode(msg.substr(1));

	  if (binaryType === 'blob' && Blob) {
	    data = new Blob([data]);
	  }

	  return { type: type, data: data };
	};

	/**
	 * Encodes multiple messages (payload).
	 *
	 *     <length>:data
	 *
	 * Example:
	 *
	 *     11:hello world2:hi
	 *
	 * If any contents are binary, they will be encoded as base64 strings. Base64
	 * encoded strings are marked with a b before the length specifier
	 *
	 * @param {Array} packets
	 * @api private
	 */

	exports.encodePayload = function (packets, supportsBinary, callback) {
	  if (typeof supportsBinary == 'function') {
	    callback = supportsBinary;
	    supportsBinary = null;
	  }

	  if (supportsBinary) {
	    if (Blob && !isAndroid) {
	      return exports.encodePayloadAsBlob(packets, callback);
	    }

	    return exports.encodePayloadAsArrayBuffer(packets, callback);
	  }

	  if (!packets.length) {
	    return callback('0:');
	  }

	  function setLengthHeader(message) {
	    return message.length + ':' + message;
	  }

	  function encodeOne(packet, doneCallback) {
	    exports.encodePacket(packet, supportsBinary, true, function(message) {
	      doneCallback(null, setLengthHeader(message));
	    });
	  }

	  map(packets, encodeOne, function(err, results) {
	    return callback(results.join(''));
	  });
	};

	/**
	 * Async array map using after
	 */

	function map(ary, each, done) {
	  var result = new Array(ary.length);
	  var next = after(ary.length, done);

	  var eachWithIndex = function(i, el, cb) {
	    each(el, function(error, msg) {
	      result[i] = msg;
	      cb(error, result);
	    });
	  };

	  for (var i = 0; i < ary.length; i++) {
	    eachWithIndex(i, ary[i], next);
	  }
	}

	/*
	 * Decodes data when a payload is maybe expected. Possible binary contents are
	 * decoded from their base64 representation
	 *
	 * @param {String} data, callback method
	 * @api public
	 */

	exports.decodePayload = function (data, binaryType, callback) {
	  if (typeof data != 'string') {
	    return exports.decodePayloadAsBinary(data, binaryType, callback);
	  }

	  if (typeof binaryType === 'function') {
	    callback = binaryType;
	    binaryType = null;
	  }

	  var packet;
	  if (data == '') {
	    // parser error - ignoring payload
	    return callback(err, 0, 1);
	  }

	  var length = ''
	    , n, msg;

	  for (var i = 0, l = data.length; i < l; i++) {
	    var chr = data.charAt(i);

	    if (':' != chr) {
	      length += chr;
	    } else {
	      if ('' == length || (length != (n = Number(length)))) {
	        // parser error - ignoring payload
	        return callback(err, 0, 1);
	      }

	      msg = data.substr(i + 1, n);

	      if (length != msg.length) {
	        // parser error - ignoring payload
	        return callback(err, 0, 1);
	      }

	      if (msg.length) {
	        packet = exports.decodePacket(msg, binaryType, true);

	        if (err.type == packet.type && err.data == packet.data) {
	          // parser error in individual packet - ignoring payload
	          return callback(err, 0, 1);
	        }

	        var ret = callback(packet, i + n, l);
	        if (false === ret) return;
	      }

	      // advance cursor
	      i += n;
	      length = '';
	    }
	  }

	  if (length != '') {
	    // parser error - ignoring payload
	    return callback(err, 0, 1);
	  }

	};

	/**
	 * Encodes multiple messages (payload) as binary.
	 *
	 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
	 * 255><data>
	 *
	 * Example:
	 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
	 *
	 * @param {Array} packets
	 * @return {ArrayBuffer} encoded payload
	 * @api private
	 */

	exports.encodePayloadAsArrayBuffer = function(packets, callback) {
	  if (!packets.length) {
	    return callback(new ArrayBuffer(0));
	  }

	  function encodeOne(packet, doneCallback) {
	    exports.encodePacket(packet, true, true, function(data) {
	      return doneCallback(null, data);
	    });
	  }

	  map(packets, encodeOne, function(err, encodedPackets) {
	    var totalLength = encodedPackets.reduce(function(acc, p) {
	      var len;
	      if (typeof p === 'string'){
	        len = p.length;
	      } else {
	        len = p.byteLength;
	      }
	      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
	    }, 0);

	    var resultArray = new Uint8Array(totalLength);

	    var bufferIndex = 0;
	    encodedPackets.forEach(function(p) {
	      var isString = typeof p === 'string';
	      var ab = p;
	      if (isString) {
	        var view = new Uint8Array(p.length);
	        for (var i = 0; i < p.length; i++) {
	          view[i] = p.charCodeAt(i);
	        }
	        ab = view.buffer;
	      }

	      if (isString) { // not true binary
	        resultArray[bufferIndex++] = 0;
	      } else { // true binary
	        resultArray[bufferIndex++] = 1;
	      }

	      var lenStr = ab.byteLength.toString();
	      for (var i = 0; i < lenStr.length; i++) {
	        resultArray[bufferIndex++] = parseInt(lenStr[i]);
	      }
	      resultArray[bufferIndex++] = 255;

	      var view = new Uint8Array(ab);
	      for (var i = 0; i < view.length; i++) {
	        resultArray[bufferIndex++] = view[i];
	      }
	    });

	    return callback(resultArray.buffer);
	  });
	};

	/**
	 * Encode as Blob
	 */

	exports.encodePayloadAsBlob = function(packets, callback) {
	  function encodeOne(packet, doneCallback) {
	    exports.encodePacket(packet, true, true, function(encoded) {
	      var binaryIdentifier = new Uint8Array(1);
	      binaryIdentifier[0] = 1;
	      if (typeof encoded === 'string') {
	        var view = new Uint8Array(encoded.length);
	        for (var i = 0; i < encoded.length; i++) {
	          view[i] = encoded.charCodeAt(i);
	        }
	        encoded = view.buffer;
	        binaryIdentifier[0] = 0;
	      }

	      var len = (encoded instanceof ArrayBuffer)
	        ? encoded.byteLength
	        : encoded.size;

	      var lenStr = len.toString();
	      var lengthAry = new Uint8Array(lenStr.length + 1);
	      for (var i = 0; i < lenStr.length; i++) {
	        lengthAry[i] = parseInt(lenStr[i]);
	      }
	      lengthAry[lenStr.length] = 255;

	      if (Blob) {
	        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
	        doneCallback(null, blob);
	      }
	    });
	  }

	  map(packets, encodeOne, function(err, results) {
	    return callback(new Blob(results));
	  });
	};

	/*
	 * Decodes data when a payload is maybe expected. Strings are decoded by
	 * interpreting each byte as a key code for entries marked to start with 0. See
	 * description of encodePayloadAsBinary
	 *
	 * @param {ArrayBuffer} data, callback method
	 * @api public
	 */

	exports.decodePayloadAsBinary = function (data, binaryType, callback) {
	  if (typeof binaryType === 'function') {
	    callback = binaryType;
	    binaryType = null;
	  }

	  var bufferTail = data;
	  var buffers = [];

	  var numberTooLong = false;
	  while (bufferTail.byteLength > 0) {
	    var tailArray = new Uint8Array(bufferTail);
	    var isString = tailArray[0] === 0;
	    var msgLength = '';

	    for (var i = 1; ; i++) {
	      if (tailArray[i] == 255) break;

	      if (msgLength.length > 310) {
	        numberTooLong = true;
	        break;
	      }

	      msgLength += tailArray[i];
	    }

	    if(numberTooLong) return callback(err, 0, 1);

	    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
	    msgLength = parseInt(msgLength);

	    var msg = sliceBuffer(bufferTail, 0, msgLength);
	    if (isString) {
	      try {
	        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
	      } catch (e) {
	        // iPhone Safari doesn't let you apply to typed arrays
	        var typed = new Uint8Array(msg);
	        msg = '';
	        for (var i = 0; i < typed.length; i++) {
	          msg += String.fromCharCode(typed[i]);
	        }
	      }
	    }

	    buffers.push(msg);
	    bufferTail = sliceBuffer(bufferTail, msgLength);
	  }

	  var total = buffers.length;
	  buffers.forEach(function(buffer, i) {
	    callback(exports.decodePacket(buffer, binaryType, true), i, total);
	  });
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Parses an URI
	 *
	 * @author Steven Levithan <stevenlevithan.com> (MIT license)
	 * @api private
	 */

	var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

	var parts = [
	    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
	];

	module.exports = function parseuri(str) {
	    var src = str,
	        b = str.indexOf('['),
	        e = str.indexOf(']');

	    if (b != -1 && e != -1) {
	        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
	    }

	    var m = re.exec(str || ''),
	        uri = {},
	        i = 14;

	    while (i--) {
	        uri[parts[i]] = m[i] || '';
	    }

	    if (b != -1 && e != -1) {
	        uri.source = src;
	        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
	        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
	        uri.ipv6uri = true;
	    }

	    return uri;
	};


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * JSON parse.
	 *
	 * @see Based on jQuery#parseJSON (MIT) and JSON2
	 * @api private
	 */

	var rvalidchars = /^[\],:{}\s]*$/;
	var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
	var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
	var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
	var rtrimLeft = /^\s+/;
	var rtrimRight = /\s+$/;

	module.exports = function parsejson(data) {
	  if ('string' != typeof data || !data) {
	    return null;
	  }

	  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

	  // Attempt to parse using the native JSON parser first
	  if (global.JSON && JSON.parse) {
	    return JSON.parse(data);
	  }

	  if (rvalidchars.test(data.replace(rvalidescape, '@')
	      .replace(rvalidtokens, ']')
	      .replace(rvalidbraces, ''))) {
	    return (new Function('return ' + data))();
	  }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Compiles a querystring
	 * Returns string representation of the object
	 *
	 * @param {Object}
	 * @api private
	 */

	exports.encode = function (obj) {
	  var str = '';

	  for (var i in obj) {
	    if (obj.hasOwnProperty(i)) {
	      if (str.length) str += '&';
	      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
	    }
	  }

	  return str;
	};

	/**
	 * Parses a simple querystring into an object
	 *
	 * @param {String} qs
	 * @api private
	 */

	exports.decode = function(qs){
	  var qry = {};
	  var pairs = qs.split('&');
	  for (var i = 0, l = pairs.length; i < l; i++) {
	    var pair = pairs[i].split('=');
	    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	  }
	  return qry;
	};


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	// browser shim for xmlhttprequest module
	var hasCORS = __webpack_require__(70);

	module.exports = function(opts) {
	  var xdomain = opts.xdomain;

	  // scheme must be same when usign XDomainRequest
	  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
	  var xscheme = opts.xscheme;

	  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
	  // https://github.com/Automattic/engine.io-client/pull/217
	  var enablesXDR = opts.enablesXDR;

	  // Use XDomainRequest for IE8 if enablesXDR is true
	  // because loading bar keeps flashing when using jsonp-polling
	  // https://github.com/yujiosaka/socke.io-ie8-loading-example
	  try {
	    if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
	      return new XDomainRequest();
	    }
	  } catch (e) { }

	  // XMLHttpRequest can be disabled on IE
	  try {
	    if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
	      return new XMLHttpRequest();
	    }
	  } catch (e) { }

	  if (!xdomain) {
	    try {
	      return new ActiveXObject('Microsoft.XMLHTTP');
	    } catch(e) { }
	  }
	}


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module requirements.
	 */

	var XMLHttpRequest = __webpack_require__(59);
	var Polling = __webpack_require__(64);
	var Emitter = __webpack_require__(37);
	var inherit = __webpack_require__(71);
	var debug = __webpack_require__(34)('engine.io-client:polling-xhr');

	/**
	 * Module exports.
	 */

	module.exports = XHR;
	module.exports.Request = Request;

	/**
	 * Empty function
	 */

	function empty(){}

	/**
	 * XHR Polling constructor.
	 *
	 * @param {Object} opts
	 * @api public
	 */

	function XHR(opts){
	  Polling.call(this, opts);

	  if (global.location) {
	    var isSSL = 'https:' == location.protocol;
	    var port = location.port;

	    // some user agents have empty `location.port`
	    if (!port) {
	      port = isSSL ? 443 : 80;
	    }

	    this.xd = opts.hostname != global.location.hostname ||
	      port != opts.port;
	    this.xs = opts.secure != isSSL;
	  }
	}

	/**
	 * Inherits from Polling.
	 */

	inherit(XHR, Polling);

	/**
	 * XHR supports binary
	 */

	XHR.prototype.supportsBinary = true;

	/**
	 * Creates a request.
	 *
	 * @param {String} method
	 * @api private
	 */

	XHR.prototype.request = function(opts){
	  opts = opts || {};
	  opts.uri = this.uri();
	  opts.xd = this.xd;
	  opts.xs = this.xs;
	  opts.agent = this.agent || false;
	  opts.supportsBinary = this.supportsBinary;
	  opts.enablesXDR = this.enablesXDR;
	  return new Request(opts);
	};

	/**
	 * Sends data.
	 *
	 * @param {String} data to send.
	 * @param {Function} called upon flush.
	 * @api private
	 */

	XHR.prototype.doWrite = function(data, fn){
	  var isBinary = typeof data !== 'string' && data !== undefined;
	  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
	  var self = this;
	  req.on('success', fn);
	  req.on('error', function(err){
	    self.onError('xhr post error', err);
	  });
	  this.sendXhr = req;
	};

	/**
	 * Starts a poll cycle.
	 *
	 * @api private
	 */

	XHR.prototype.doPoll = function(){
	  debug('xhr poll');
	  var req = this.request();
	  var self = this;
	  req.on('data', function(data){
	    self.onData(data);
	  });
	  req.on('error', function(err){
	    self.onError('xhr poll error', err);
	  });
	  this.pollXhr = req;
	};

	/**
	 * Request constructor
	 *
	 * @param {Object} options
	 * @api public
	 */

	function Request(opts){
	  this.method = opts.method || 'GET';
	  this.uri = opts.uri;
	  this.xd = !!opts.xd;
	  this.xs = !!opts.xs;
	  this.async = false !== opts.async;
	  this.data = undefined != opts.data ? opts.data : null;
	  this.agent = opts.agent;
	  this.isBinary = opts.isBinary;
	  this.supportsBinary = opts.supportsBinary;
	  this.enablesXDR = opts.enablesXDR;
	  this.create();
	}

	/**
	 * Mix in `Emitter`.
	 */

	Emitter(Request.prototype);

	/**
	 * Creates the XHR object and sends the request.
	 *
	 * @api private
	 */

	Request.prototype.create = function(){
	  var xhr = this.xhr = new XMLHttpRequest({ agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR });
	  var self = this;

	  try {
	    debug('xhr open %s: %s', this.method, this.uri);
	    xhr.open(this.method, this.uri, this.async);
	    if (this.supportsBinary) {
	      // This has to be done after open because Firefox is stupid
	      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
	      xhr.responseType = 'arraybuffer';
	    }

	    if ('POST' == this.method) {
	      try {
	        if (this.isBinary) {
	          xhr.setRequestHeader('Content-type', 'application/octet-stream');
	        } else {
	          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
	        }
	      } catch (e) {}
	    }

	    // ie6 check
	    if ('withCredentials' in xhr) {
	      xhr.withCredentials = true;
	    }

	    if (this.hasXDR()) {
	      xhr.onload = function(){
	        self.onLoad();
	      };
	      xhr.onerror = function(){
	        self.onError(xhr.responseText);
	      };
	    } else {
	      xhr.onreadystatechange = function(){
	        if (4 != xhr.readyState) return;
	        if (200 == xhr.status || 1223 == xhr.status) {
	          self.onLoad();
	        } else {
	          // make sure the `error` event handler that's user-set
	          // does not throw in the same tick and gets caught here
	          setTimeout(function(){
	            self.onError(xhr.status);
	          }, 0);
	        }
	      };
	    }

	    debug('xhr data %s', this.data);
	    xhr.send(this.data);
	  } catch (e) {
	    // Need to defer since .create() is called directly fhrom the constructor
	    // and thus the 'error' event can only be only bound *after* this exception
	    // occurs.  Therefore, also, we cannot throw here at all.
	    setTimeout(function() {
	      self.onError(e);
	    }, 0);
	    return;
	  }

	  if (global.document) {
	    this.index = Request.requestsCount++;
	    Request.requests[this.index] = this;
	  }
	};

	/**
	 * Called upon successful response.
	 *
	 * @api private
	 */

	Request.prototype.onSuccess = function(){
	  this.emit('success');
	  this.cleanup();
	};

	/**
	 * Called if we have data.
	 *
	 * @api private
	 */

	Request.prototype.onData = function(data){
	  this.emit('data', data);
	  this.onSuccess();
	};

	/**
	 * Called upon error.
	 *
	 * @api private
	 */

	Request.prototype.onError = function(err){
	  this.emit('error', err);
	  this.cleanup();
	};

	/**
	 * Cleans up house.
	 *
	 * @api private
	 */

	Request.prototype.cleanup = function(){
	  if ('undefined' == typeof this.xhr || null === this.xhr) {
	    return;
	  }
	  // xmlhttprequest
	  if (this.hasXDR()) {
	    this.xhr.onload = this.xhr.onerror = empty;
	  } else {
	    this.xhr.onreadystatechange = empty;
	  }

	  try {
	    this.xhr.abort();
	  } catch(e) {}

	  if (global.document) {
	    delete Request.requests[this.index];
	  }

	  this.xhr = null;
	};

	/**
	 * Called upon load.
	 *
	 * @api private
	 */

	Request.prototype.onLoad = function(){
	  var data;
	  try {
	    var contentType;
	    try {
	      contentType = this.xhr.getResponseHeader('Content-Type');
	    } catch (e) {}
	    if (contentType === 'application/octet-stream') {
	      data = this.xhr.response;
	    } else {
	      if (!this.supportsBinary) {
	        data = this.xhr.responseText;
	      } else {
	        data = 'ok';
	      }
	    }
	  } catch (e) {
	    this.onError(e);
	  }
	  if (null != data) {
	    this.onData(data);
	  }
	};

	/**
	 * Check if it has XDomainRequest.
	 *
	 * @api private
	 */

	Request.prototype.hasXDR = function(){
	  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
	};

	/**
	 * Aborts the request.
	 *
	 * @api public
	 */

	Request.prototype.abort = function(){
	  this.cleanup();
	};

	/**
	 * Aborts pending requests when unloading the window. This is needed to prevent
	 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
	 * emitted.
	 */

	if (global.document) {
	  Request.requestsCount = 0;
	  Request.requests = {};
	  if (global.attachEvent) {
	    global.attachEvent('onunload', unloadHandler);
	  } else if (global.addEventListener) {
	    global.addEventListener('beforeunload', unloadHandler);
	  }
	}

	function unloadHandler() {
	  for (var i in Request.requests) {
	    if (Request.requests.hasOwnProperty(i)) {
	      Request.requests[i].abort();
	    }
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/**
	 * Module requirements.
	 */

	var Polling = __webpack_require__(64);
	var inherit = __webpack_require__(71);

	/**
	 * Module exports.
	 */

	module.exports = JSONPPolling;

	/**
	 * Cached regular expressions.
	 */

	var rNewline = /\n/g;
	var rEscapedNewline = /\\n/g;

	/**
	 * Global JSONP callbacks.
	 */

	var callbacks;

	/**
	 * Callbacks count.
	 */

	var index = 0;

	/**
	 * Noop.
	 */

	function empty () { }

	/**
	 * JSONP Polling constructor.
	 *
	 * @param {Object} opts.
	 * @api public
	 */

	function JSONPPolling (opts) {
	  Polling.call(this, opts);

	  this.query = this.query || {};

	  // define global callbacks array if not present
	  // we do this here (lazily) to avoid unneeded global pollution
	  if (!callbacks) {
	    // we need to consider multiple engines in the same page
	    if (!global.___eio) global.___eio = [];
	    callbacks = global.___eio;
	  }

	  // callback identifier
	  this.index = callbacks.length;

	  // add callback to jsonp global
	  var self = this;
	  callbacks.push(function (msg) {
	    self.onData(msg);
	  });

	  // append to query string
	  this.query.j = this.index;

	  // prevent spurious errors from being emitted when the window is unloaded
	  if (global.document && global.addEventListener) {
	    global.addEventListener('beforeunload', function () {
	      if (self.script) self.script.onerror = empty;
	    });
	  }
	}

	/**
	 * Inherits from Polling.
	 */

	inherit(JSONPPolling, Polling);

	/*
	 * JSONP only supports binary as base64 encoded strings
	 */

	JSONPPolling.prototype.supportsBinary = false;

	/**
	 * Closes the socket.
	 *
	 * @api private
	 */

	JSONPPolling.prototype.doClose = function () {
	  if (this.script) {
	    this.script.parentNode.removeChild(this.script);
	    this.script = null;
	  }

	  if (this.form) {
	    this.form.parentNode.removeChild(this.form);
	    this.form = null;
	  }

	  Polling.prototype.doClose.call(this);
	};

	/**
	 * Starts a poll cycle.
	 *
	 * @api private
	 */

	JSONPPolling.prototype.doPoll = function () {
	  var self = this;
	  var script = document.createElement('script');

	  if (this.script) {
	    this.script.parentNode.removeChild(this.script);
	    this.script = null;
	  }

	  script.async = true;
	  script.src = this.uri();
	  script.onerror = function(e){
	    self.onError('jsonp poll error',e);
	  };

	  var insertAt = document.getElementsByTagName('script')[0];
	  insertAt.parentNode.insertBefore(script, insertAt);
	  this.script = script;

	  var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);
	  
	  if (isUAgecko) {
	    setTimeout(function () {
	      var iframe = document.createElement('iframe');
	      document.body.appendChild(iframe);
	      document.body.removeChild(iframe);
	    }, 100);
	  }
	};

	/**
	 * Writes with a hidden iframe.
	 *
	 * @param {String} data to send
	 * @param {Function} called upon flush.
	 * @api private
	 */

	JSONPPolling.prototype.doWrite = function (data, fn) {
	  var self = this;

	  if (!this.form) {
	    var form = document.createElement('form');
	    var area = document.createElement('textarea');
	    var id = this.iframeId = 'eio_iframe_' + this.index;
	    var iframe;

	    form.className = 'socketio';
	    form.style.position = 'absolute';
	    form.style.top = '-1000px';
	    form.style.left = '-1000px';
	    form.target = id;
	    form.method = 'POST';
	    form.setAttribute('accept-charset', 'utf-8');
	    area.name = 'd';
	    form.appendChild(area);
	    document.body.appendChild(form);

	    this.form = form;
	    this.area = area;
	  }

	  this.form.action = this.uri();

	  function complete () {
	    initIframe();
	    fn();
	  }

	  function initIframe () {
	    if (self.iframe) {
	      try {
	        self.form.removeChild(self.iframe);
	      } catch (e) {
	        self.onError('jsonp polling iframe removal error', e);
	      }
	    }

	    try {
	      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
	      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
	      iframe = document.createElement(html);
	    } catch (e) {
	      iframe = document.createElement('iframe');
	      iframe.name = self.iframeId;
	      iframe.src = 'javascript:0';
	    }

	    iframe.id = self.iframeId;

	    self.form.appendChild(iframe);
	    self.iframe = iframe;
	  }

	  initIframe();

	  // escape \n to prevent it from being converted into \r\n by some UAs
	  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
	  data = data.replace(rEscapedNewline, '\\\n');
	  this.area.value = data.replace(rNewline, '\\n');

	  try {
	    this.form.submit();
	  } catch(e) {}

	  if (this.iframe.attachEvent) {
	    this.iframe.onreadystatechange = function(){
	      if (self.iframe.readyState == 'complete') {
	        complete();
	      }
	    };
	  } else {
	    this.iframe.onload = complete;
	  }
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var Transport = __webpack_require__(53);
	var parser = __webpack_require__(55);
	var parseqs = __webpack_require__(58);
	var inherit = __webpack_require__(71);
	var debug = __webpack_require__(34)('engine.io-client:websocket');

	/**
	 * `ws` exposes a WebSocket-compatible interface in
	 * Node, or the `WebSocket` or `MozWebSocket` globals
	 * in the browser.
	 */

	var WebSocket = __webpack_require__(72);

	/**
	 * Module exports.
	 */

	module.exports = WS;

	/**
	 * WebSocket transport constructor.
	 *
	 * @api {Object} connection options
	 * @api public
	 */

	function WS(opts){
	  var forceBase64 = (opts && opts.forceBase64);
	  if (forceBase64) {
	    this.supportsBinary = false;
	  }
	  Transport.call(this, opts);
	}

	/**
	 * Inherits from Transport.
	 */

	inherit(WS, Transport);

	/**
	 * Transport name.
	 *
	 * @api public
	 */

	WS.prototype.name = 'websocket';

	/*
	 * WebSockets support binary
	 */

	WS.prototype.supportsBinary = true;

	/**
	 * Opens socket.
	 *
	 * @api private
	 */

	WS.prototype.doOpen = function(){
	  if (!this.check()) {
	    // let probe timeout
	    return;
	  }

	  var self = this;
	  var uri = this.uri();
	  var protocols = void(0);
	  var opts = { agent: this.agent };

	  this.ws = new WebSocket(uri, protocols, opts);

	  if (this.ws.binaryType === undefined) {
	    this.supportsBinary = false;
	  }

	  this.ws.binaryType = 'arraybuffer';
	  this.addEventListeners();
	};

	/**
	 * Adds event listeners to the socket
	 *
	 * @api private
	 */

	WS.prototype.addEventListeners = function(){
	  var self = this;

	  this.ws.onopen = function(){
	    self.onOpen();
	  };
	  this.ws.onclose = function(){
	    self.onClose();
	  };
	  this.ws.onmessage = function(ev){
	    self.onData(ev.data);
	  };
	  this.ws.onerror = function(e){
	    self.onError('websocket error', e);
	  };
	};

	/**
	 * Override `onData` to use a timer on iOS.
	 * See: https://gist.github.com/mloughran/2052006
	 *
	 * @api private
	 */

	if ('undefined' != typeof navigator
	  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
	  WS.prototype.onData = function(data){
	    var self = this;
	    setTimeout(function(){
	      Transport.prototype.onData.call(self, data);
	    }, 0);
	  };
	}

	/**
	 * Writes data to socket.
	 *
	 * @param {Array} array of packets.
	 * @api private
	 */

	WS.prototype.write = function(packets){
	  var self = this;
	  this.writable = false;
	  // encodePacket efficient as it uses WS framing
	  // no need for encodePayload
	  for (var i = 0, l = packets.length; i < l; i++) {
	    parser.encodePacket(packets[i], this.supportsBinary, function(data) {
	      //Sometimes the websocket has already been closed but the browser didn't
	      //have a chance of informing us about it yet, in that case send will
	      //throw an error
	      try {
	        self.ws.send(data);
	      } catch (e){
	        debug('websocket closed before onclose event');
	      }
	    });
	  }

	  function ondrain() {
	    self.writable = true;
	    self.emit('drain');
	  }
	  // fake drain
	  // defer to next tick to allow Socket to clear writeBuffer
	  setTimeout(ondrain, 0);
	};

	/**
	 * Called upon close
	 *
	 * @api private
	 */

	WS.prototype.onClose = function(){
	  Transport.prototype.onClose.call(this);
	};

	/**
	 * Closes socket.
	 *
	 * @api private
	 */

	WS.prototype.doClose = function(){
	  if (typeof this.ws !== 'undefined') {
	    this.ws.close();
	  }
	};

	/**
	 * Generates uri for connection.
	 *
	 * @api private
	 */

	WS.prototype.uri = function(){
	  var query = this.query || {};
	  var schema = this.secure ? 'wss' : 'ws';
	  var port = '';

	  // avoid port if default for schema
	  if (this.port && (('wss' == schema && this.port != 443)
	    || ('ws' == schema && this.port != 80))) {
	    port = ':' + this.port;
	  }

	  // append timestamp to URI
	  if (this.timestampRequests) {
	    query[this.timestampParam] = +new Date;
	  }

	  // communicate binary support capabilities
	  if (!this.supportsBinary) {
	    query.b64 = 1;
	  }

	  query = parseqs.encode(query);

	  // prepend ? to query
	  if (query.length) {
	    query = '?' + query;
	  }

	  return schema + '://' + this.hostname + port + this.path + query;
	};

	/**
	 * Feature detection for WebSocket.
	 *
	 * @return {Boolean} whether this transport is available.
	 * @api public
	 */

	WS.prototype.check = function(){
	  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
	};


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Gets the keys for an object.
	 *
	 * @return {Array} keys
	 * @api private
	 */

	module.exports = Object.keys || function keys (obj){
	  var arr = [];
	  var has = Object.prototype.hasOwnProperty;

	  for (var i in obj) {
	    if (has.call(obj, i)) {
	      arr.push(i);
	    }
	  }
	  return arr;
	};


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var Transport = __webpack_require__(53);
	var parseqs = __webpack_require__(58);
	var parser = __webpack_require__(55);
	var inherit = __webpack_require__(71);
	var debug = __webpack_require__(34)('engine.io-client:polling');

	/**
	 * Module exports.
	 */

	module.exports = Polling;

	/**
	 * Is XHR2 supported?
	 */

	var hasXHR2 = (function() {
	  var XMLHttpRequest = __webpack_require__(59);
	  var xhr = new XMLHttpRequest({ agent: this.agent, xdomain: false });
	  return null != xhr.responseType;
	})();

	/**
	 * Polling interface.
	 *
	 * @param {Object} opts
	 * @api private
	 */

	function Polling(opts){
	  var forceBase64 = (opts && opts.forceBase64);
	  if (!hasXHR2 || forceBase64) {
	    this.supportsBinary = false;
	  }
	  Transport.call(this, opts);
	}

	/**
	 * Inherits from Transport.
	 */

	inherit(Polling, Transport);

	/**
	 * Transport name.
	 */

	Polling.prototype.name = 'polling';

	/**
	 * Opens the socket (triggers polling). We write a PING message to determine
	 * when the transport is open.
	 *
	 * @api private
	 */

	Polling.prototype.doOpen = function(){
	  this.poll();
	};

	/**
	 * Pauses polling.
	 *
	 * @param {Function} callback upon buffers are flushed and transport is paused
	 * @api private
	 */

	Polling.prototype.pause = function(onPause){
	  var pending = 0;
	  var self = this;

	  this.readyState = 'pausing';

	  function pause(){
	    debug('paused');
	    self.readyState = 'paused';
	    onPause();
	  }

	  if (this.polling || !this.writable) {
	    var total = 0;

	    if (this.polling) {
	      debug('we are currently polling - waiting to pause');
	      total++;
	      this.once('pollComplete', function(){
	        debug('pre-pause polling complete');
	        --total || pause();
	      });
	    }

	    if (!this.writable) {
	      debug('we are currently writing - waiting to pause');
	      total++;
	      this.once('drain', function(){
	        debug('pre-pause writing complete');
	        --total || pause();
	      });
	    }
	  } else {
	    pause();
	  }
	};

	/**
	 * Starts polling cycle.
	 *
	 * @api public
	 */

	Polling.prototype.poll = function(){
	  debug('polling');
	  this.polling = true;
	  this.doPoll();
	  this.emit('poll');
	};

	/**
	 * Overloads onData to detect payloads.
	 *
	 * @api private
	 */

	Polling.prototype.onData = function(data){
	  var self = this;
	  debug('polling got data %s', data);
	  var callback = function(packet, index, total) {
	    // if its the first message we consider the transport open
	    if ('opening' == self.readyState) {
	      self.onOpen();
	    }

	    // if its a close packet, we close the ongoing requests
	    if ('close' == packet.type) {
	      self.onClose();
	      return false;
	    }

	    // otherwise bypass onData and handle the message
	    self.onPacket(packet);
	  };

	  // decode payload
	  parser.decodePayload(data, this.socket.binaryType, callback);

	  // if an event did not trigger closing
	  if ('closed' != this.readyState) {
	    // if we got data we're not polling
	    this.polling = false;
	    this.emit('pollComplete');

	    if ('open' == this.readyState) {
	      this.poll();
	    } else {
	      debug('ignoring poll - transport state "%s"', this.readyState);
	    }
	  }
	};

	/**
	 * For polling, send a close packet.
	 *
	 * @api private
	 */

	Polling.prototype.doClose = function(){
	  var self = this;

	  function close(){
	    debug('writing close packet');
	    self.write([{ type: 'close' }]);
	  }

	  if ('open' == this.readyState) {
	    debug('transport open - closing');
	    close();
	  } else {
	    // in case we're trying to close while
	    // handshaking is in progress (GH-164)
	    debug('transport not open - deferring close');
	    this.once('open', close);
	  }
	};

	/**
	 * Writes a packets payload.
	 *
	 * @param {Array} data packets
	 * @param {Function} drain callback
	 * @api private
	 */

	Polling.prototype.write = function(packets){
	  var self = this;
	  this.writable = false;
	  var callbackfn = function() {
	    self.writable = true;
	    self.emit('drain');
	  };

	  var self = this;
	  parser.encodePayload(packets, this.supportsBinary, function(data) {
	    self.doWrite(data, callbackfn);
	  });
	};

	/**
	 * Generates uri for connection.
	 *
	 * @api private
	 */

	Polling.prototype.uri = function(){
	  var query = this.query || {};
	  var schema = this.secure ? 'https' : 'http';
	  var port = '';

	  // cache busting is forced
	  if (false !== this.timestampRequests) {
	    query[this.timestampParam] = +new Date + '-' + Transport.timestamps++;
	  }

	  if (!this.supportsBinary && !query.sid) {
	    query.b64 = 1;
	  }

	  query = parseqs.encode(query);

	  // avoid port if default for schema
	  if (this.port && (('https' == schema && this.port != 443) ||
	     ('http' == schema && this.port != 80))) {
	    port = ':' + this.port;
	  }

	  // prepend ? to query
	  if (query.length) {
	    query = '?' + query;
	  }

	  return schema + '://' + this.hostname + port + this.path + query;
	};


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * An abstraction for slicing an arraybuffer even when
	 * ArrayBuffer.prototype.slice is not supported
	 *
	 * @api public
	 */

	module.exports = function(arraybuffer, start, end) {
	  var bytes = arraybuffer.byteLength;
	  start = start || 0;
	  end = end || bytes;

	  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

	  if (start < 0) { start += bytes; }
	  if (end < 0) { end += bytes; }
	  if (end > bytes) { end = bytes; }

	  if (start >= bytes || start >= end || bytes === 0) {
	    return new ArrayBuffer(0);
	  }

	  var abv = new Uint8Array(arraybuffer);
	  var result = new Uint8Array(end - start);
	  for (var i = start, ii = 0; i < end; i++, ii++) {
	    result[ii] = abv[i];
	  }
	  return result.buffer;
	};


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = after

	function after(count, callback, err_cb) {
	    var bail = false
	    err_cb = err_cb || noop
	    proxy.count = count

	    return (count === 0) ? callback() : proxy

	    function proxy(err, result) {
	        if (proxy.count <= 0) {
	            throw new Error('after called too many times')
	        }
	        --proxy.count

	        // after first error, rest are passed to err_cb
	        if (err) {
	            bail = true
	            callback(err)
	            // future error callbacks will go to error handler
	            callback = err_cb
	        } else if (proxy.count === 0 && !bail) {
	            callback(null, result)
	        }
	    }
	}

	function noop() {}


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Create a blob builder even when vendor prefixes exist
	 */

	var BlobBuilder = global.BlobBuilder
	  || global.WebKitBlobBuilder
	  || global.MSBlobBuilder
	  || global.MozBlobBuilder;

	/**
	 * Check if Blob constructor is supported
	 */

	var blobSupported = (function() {
	  try {
	    var b = new Blob(['hi']);
	    return b.size == 2;
	  } catch(e) {
	    return false;
	  }
	})();

	/**
	 * Check if BlobBuilder is supported
	 */

	var blobBuilderSupported = BlobBuilder
	  && BlobBuilder.prototype.append
	  && BlobBuilder.prototype.getBlob;

	function BlobBuilderConstructor(ary, options) {
	  options = options || {};

	  var bb = new BlobBuilder();
	  for (var i = 0; i < ary.length; i++) {
	    bb.append(ary[i]);
	  }
	  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
	};

	module.exports = (function() {
	  if (blobSupported) {
	    return global.Blob;
	  } else if (blobBuilderSupported) {
	    return BlobBuilderConstructor;
	  } else {
	    return undefined;
	  }
	})();
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! http://mths.be/utf8js v2.0.0 by @mathias */
	;(function(root) {

		// Detect free variables `exports`
		var freeExports = typeof exports == 'object' && exports;

		// Detect free variable `module`
		var freeModule = typeof module == 'object' && module &&
			module.exports == freeExports && module;

		// Detect free variable `global`, from Node.js or Browserified code,
		// and use it as `root`
		var freeGlobal = typeof global == 'object' && global;
		if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
			root = freeGlobal;
		}

		/*--------------------------------------------------------------------------*/

		var stringFromCharCode = String.fromCharCode;

		// Taken from http://mths.be/punycode
		function ucs2decode(string) {
			var output = [];
			var counter = 0;
			var length = string.length;
			var value;
			var extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}

		// Taken from http://mths.be/punycode
		function ucs2encode(array) {
			var length = array.length;
			var index = -1;
			var value;
			var output = '';
			while (++index < length) {
				value = array[index];
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
			}
			return output;
		}

		/*--------------------------------------------------------------------------*/

		function createByte(codePoint, shift) {
			return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
		}

		function encodeCodePoint(codePoint) {
			if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
				return stringFromCharCode(codePoint);
			}
			var symbol = '';
			if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
				symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
			}
			else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
				symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
				symbol += createByte(codePoint, 6);
			}
			else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
				symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
				symbol += createByte(codePoint, 12);
				symbol += createByte(codePoint, 6);
			}
			symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
			return symbol;
		}

		function utf8encode(string) {
			var codePoints = ucs2decode(string);

			// console.log(JSON.stringify(codePoints.map(function(x) {
			// 	return 'U+' + x.toString(16).toUpperCase();
			// })));

			var length = codePoints.length;
			var index = -1;
			var codePoint;
			var byteString = '';
			while (++index < length) {
				codePoint = codePoints[index];
				byteString += encodeCodePoint(codePoint);
			}
			return byteString;
		}

		/*--------------------------------------------------------------------------*/

		function readContinuationByte() {
			if (byteIndex >= byteCount) {
				throw Error('Invalid byte index');
			}

			var continuationByte = byteArray[byteIndex] & 0xFF;
			byteIndex++;

			if ((continuationByte & 0xC0) == 0x80) {
				return continuationByte & 0x3F;
			}

			// If we end up here, it’s not a continuation byte
			throw Error('Invalid continuation byte');
		}

		function decodeSymbol() {
			var byte1;
			var byte2;
			var byte3;
			var byte4;
			var codePoint;

			if (byteIndex > byteCount) {
				throw Error('Invalid byte index');
			}

			if (byteIndex == byteCount) {
				return false;
			}

			// Read first byte
			byte1 = byteArray[byteIndex] & 0xFF;
			byteIndex++;

			// 1-byte sequence (no continuation bytes)
			if ((byte1 & 0x80) == 0) {
				return byte1;
			}

			// 2-byte sequence
			if ((byte1 & 0xE0) == 0xC0) {
				var byte2 = readContinuationByte();
				codePoint = ((byte1 & 0x1F) << 6) | byte2;
				if (codePoint >= 0x80) {
					return codePoint;
				} else {
					throw Error('Invalid continuation byte');
				}
			}

			// 3-byte sequence (may include unpaired surrogates)
			if ((byte1 & 0xF0) == 0xE0) {
				byte2 = readContinuationByte();
				byte3 = readContinuationByte();
				codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
				if (codePoint >= 0x0800) {
					return codePoint;
				} else {
					throw Error('Invalid continuation byte');
				}
			}

			// 4-byte sequence
			if ((byte1 & 0xF8) == 0xF0) {
				byte2 = readContinuationByte();
				byte3 = readContinuationByte();
				byte4 = readContinuationByte();
				codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
					(byte3 << 0x06) | byte4;
				if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
					return codePoint;
				}
			}

			throw Error('Invalid UTF-8 detected');
		}

		var byteArray;
		var byteCount;
		var byteIndex;
		function utf8decode(byteString) {
			byteArray = ucs2decode(byteString);
			byteCount = byteArray.length;
			byteIndex = 0;
			var codePoints = [];
			var tmp;
			while ((tmp = decodeSymbol()) !== false) {
				codePoints.push(tmp);
			}
			return ucs2encode(codePoints);
		}

		/*--------------------------------------------------------------------------*/

		var utf8 = {
			'version': '2.0.0',
			'encode': utf8encode,
			'decode': utf8decode
		};

		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return utf8;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}	else if (freeExports && !freeExports.nodeType) {
			if (freeModule) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = utf8;
			} else { // in Narwhal or RingoJS v0.7.0-
				var object = {};
				var hasOwnProperty = object.hasOwnProperty;
				for (var key in utf8) {
					hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.utf8 = utf8;
		}

	}(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(31)(module), (function() { return this; }())))

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * base64-arraybuffer
	 * https://github.com/niklasvh/base64-arraybuffer
	 *
	 * Copyright (c) 2012 Niklas von Hertzen
	 * Licensed under the MIT license.
	 */
	(function(chars){
	  "use strict";

	  exports.encode = function(arraybuffer) {
	    var bytes = new Uint8Array(arraybuffer),
	    i, len = bytes.length, base64 = "";

	    for (i = 0; i < len; i+=3) {
	      base64 += chars[bytes[i] >> 2];
	      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
	      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
	      base64 += chars[bytes[i + 2] & 63];
	    }

	    if ((len % 3) === 2) {
	      base64 = base64.substring(0, base64.length - 1) + "=";
	    } else if (len % 3 === 1) {
	      base64 = base64.substring(0, base64.length - 2) + "==";
	    }

	    return base64;
	  };

	  exports.decode =  function(base64) {
	    var bufferLength = base64.length * 0.75,
	    len = base64.length, i, p = 0,
	    encoded1, encoded2, encoded3, encoded4;

	    if (base64[base64.length - 1] === "=") {
	      bufferLength--;
	      if (base64[base64.length - 2] === "=") {
	        bufferLength--;
	      }
	    }

	    var arraybuffer = new ArrayBuffer(bufferLength),
	    bytes = new Uint8Array(arraybuffer);

	    for (i = 0; i < len; i+=4) {
	      encoded1 = chars.indexOf(base64[i]);
	      encoded2 = chars.indexOf(base64[i+1]);
	      encoded3 = chars.indexOf(base64[i+2]);
	      encoded4 = chars.indexOf(base64[i+3]);

	      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
	      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
	      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
	    }

	    return arraybuffer;
	  };
	})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var global = __webpack_require__(73);

	/**
	 * Module exports.
	 *
	 * Logic borrowed from Modernizr:
	 *
	 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
	 */

	try {
	  module.exports = 'XMLHttpRequest' in global &&
	    'withCredentials' in new global.XMLHttpRequest();
	} catch (err) {
	  // if XMLHttp support is disabled in IE then it will throw
	  // when trying to create
	  module.exports = false;
	}


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = function(a, b){
	  var fn = function(){};
	  fn.prototype = b.prototype;
	  a.prototype = new fn;
	  a.prototype.constructor = a;
	};

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var global = (function() { return this; })();

	/**
	 * WebSocket constructor.
	 */

	var WebSocket = global.WebSocket || global.MozWebSocket;

	/**
	 * Module exports.
	 */

	module.exports = WebSocket ? ws : null;

	/**
	 * WebSocket constructor.
	 *
	 * The third `opts` options object gets ignored in web browsers, since it's
	 * non-standard, and throws a TypeError if passed to the constructor.
	 * See: https://github.com/einaros/ws/issues/227
	 *
	 * @param {String} uri
	 * @param {Array} protocols (optional)
	 * @param {Object) opts (optional)
	 * @api public
	 */

	function ws(uri, protocols, opts) {
	  var instance;
	  if (protocols) {
	    instance = new WebSocket(uri, protocols);
	  } else {
	    instance = new WebSocket(uri);
	  }
	  return instance;
	}

	if (WebSocket) ws.prototype = WebSocket.prototype;


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Returns `this`. Execute this without a "context" (i.e. without it being
	 * attached to an object of the left-hand side), and `this` points to the
	 * "global" scope of the current JS execution.
	 */

	module.exports = (function () { return this; })();


/***/ }
/******/ ])