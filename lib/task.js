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
      format: args.format || 'boolean',
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
