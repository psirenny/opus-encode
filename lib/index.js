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
  numberOfChannels: 1,
  outputSampleRate: 48000
};

module.exports = function (options) {
  var opts = _.merge({}, defs, options);
  var worker = work(require('./worker.js'));
  var ctx = new AudioContext();
  var input = new stream.PassThrough();
  var output = new stream.PassThrough();
  var srcNode = ctx.createBufferSource();
  var destNode = ctx.createScriptProcessor(opts.bufferLength, opts.numberOfChannels, opts.numberOfChannels);

  if (!opts.inputSampleRate) {
    throw new Error('input sample rate is required');
  }

  // processed some audio, so extract channel data from
  // it and pass it to the worker for encoding
  destNode.onaudioprocess = function (e) {
    var bufs = [];
    for (var i = 0; i < opts.numberOfChannels; i++) {
      bufs.push(e.inputBuffer.getChannelData(i));
    }

    worker.postMessage({
      cmd: 'data', args: [bufs]
    });
  };

  // finished processing audio, so close any nodes
  // and tell the worker to wrap up any encoding
  srcNode.onended = function () {
    srcNode.disconnect(destNode);
    destNode.disconnect(ctx.destination);
    worker.postMessage({cmd: 'end'});
  };

  // received encoding data from the worker
  // so push it to our output stream
  worker.addEventListener('message', function (e) {
    var data = e.data ? new Buffer(e.data) : null;
    output.push(data);
  });

  // start the worker so that it can initialize the encoder
  // and write some basic ogg/opus header info
  worker.postMessage({
    cmd: 'start', args: [opts]
  });

  // write the entire input stream to a buffer before processing...
  // is there a way to stream to a web audio node instead?
  input.pipe(concat(function (buf) {
    ctx.decodeAudioData(buf.toArrayBuffer(), function (buf) {
      srcNode.buffer = buf;
      srcNode.connect(destNode);
      destNode.connect(ctx.destination);
      srcNode.start(0);
    });
  }));

  return duplex(input, output);
};
