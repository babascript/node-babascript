var Plugins, debug;

debug = require('debug')('babascript:plugin');

module.exports = Plugins = (function() {
  function Plugins() {
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
    return plugin.body.load(this, (function(_this) {
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

  Plugins.prototype.send = function() {
    var name, plugin, _ref, _ref1, _results;
    debug('send');
    _ref = this.plugins;
    _results = [];
    for (name in _ref) {
      plugin = _ref[name];
      _results.push((_ref1 = plugin.body) != null ? _ref1.send() : void 0);
    }
    return _results;
  };

  Plugins.prototype.receive = function() {
    var name, plugin, _ref, _ref1, _results;
    debug('receive');
    _ref = this.plugins;
    _results = [];
    for (name in _ref) {
      plugin = _ref[name];
      _results.push((_ref1 = plugin.body) != null ? _ref1.receive() : void 0);
    }
    return _results;
  };

  Plugins.prototype.return_value = function() {
    var name, plugin, _ref, _ref1, _results;
    debug('return value');
    _ref = this.plugins;
    _results = [];
    for (name in _ref) {
      plugin = _ref[name];
      _results.push((_ref1 = plugin.body) != null ? _ref1.return_value() : void 0);
    }
    return _results;
  };

  return Plugins;

})();
