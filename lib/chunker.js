function Commands(worker) {
  this.worker = self;
}

Commands.prototype.data = function (bufs) {
  var self = this;
  var count = Math.floor(bufs[0].length / self.size);
  var begin = 0;
  var end = this.size;

  for (var i = 0; i < count; i++) {
    var chunks = [];

    for (var j = 0; j < bufs.length; j++) {
      chunks.push(bufs[j].subarray(begin, end));
    }

    self.worker.postMessage(chunks);
    begin += self.size;
    end += self.size;
  }
};

Commands.prototype.end = function () {
  this.worker.postMessage(null);
  this.worker.close();
};

Commands.prototype.start = function (opts) {
  this.size = opts.bufferLength;
};

module.exports = function (self) {
  var commands = new Commands(self);
  self.addEventListener('message', function (e) {
    var cmd = e.data.cmd;
    var args = e.data.args;
    commands[cmd].apply(commands, args);
  });
};
