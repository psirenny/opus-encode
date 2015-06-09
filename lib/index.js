var _ = require('lodash');
var concat = require('concat-stream');
var duplex = require('duplexer');
var stream = require('stream');
var work = require('webworkify');

var defs = {
  bitDepth: 16,
  bitRate: 64000,
  bufferLength: 4096,
  encoderApplication: 2049,
  encoderFrameSize: 20,
  maxBuffersPerPage: 40,
  monitorGain: 0,
  outputSampleRate: 48000
};

module.exports = function (options) {
  var opts = _.merge({}, defs, options);
  var ctx = new AudioContext();
  var input = new stream.PassThrough();
  var output = new stream.PassThrough();
  var encoder = work(require('./encoder.js'));
  var chunker = work(require('./chunker.js'));

  chunker.addEventListener('message', function (e) {
    encoder.postMessage({
      cmd: 'data',
      args: [e.data]
    });
  });

  chunker.postMessage({
    cmd: 'start',
    args: [opts]
  });

  encoder.addEventListener('message', function (e) {
    var data = e.data ? new Buffer(e.data) : null;
    output.push(data);
  });

  input.pipe(concat(function (buf) {
    ctx.decodeAudioData(buf.toArrayBuffer(), function (buf) {
      if (!opts.inputSampleRate) {
        opts.inputSampleRate = buf.sampleRate;
        opts.numberOfChannels = buf.numberOfChannels;

        encoder.postMessage({
          cmd: 'start',
          args: [opts]
        });
      }

      var channels = [];
      for (var i = 0; i < buf.numberOfChannels; i++) {
        channels.push(buf.getChannelData(i));
      }

      chunker.postMessage({
        cmd: 'data',
        args: [channels]
      });

      chunker.postMessage({
        cmd: 'end'
      });
    });
  }));

  return duplex(input, output);
};
