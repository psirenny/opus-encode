var OggOpus = require('./vendor/oggopus');

function Commands(worker) {
  this.worker = self;
}

Commands.prototype.data = function (bufs) {
  this.encoder.recordBuffers(bufs);
};

Commands.prototype.end = function () {
  this.encoder.encodeFinalFrame();
  this.worker.close();
};

Commands.prototype.onPage = function (page) {
  this.worker.postMessage(page);
};

Commands.prototype.onPagingDone = function () {
  this.worker.postMessage(null);
};

Commands.prototype.start = function (opts) {
  opts.onPageComplete = this.onPage.bind(this);
  opts.onFinished = this.onPagingDone.bind(this);
  this.encoder = new OggOpus(opts);
};

module.exports = function (self) {
  var commands = new Commands(self);
  self.addEventListener('message', function (e) {
    var cmd = e.data.cmd;
    var args = e.data.args;
    commands[cmd].apply(commands, args);
  });
};
