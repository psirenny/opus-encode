var polyfill = require('audiocontext-polyfill');
var concat = require('concat-stream');
var lib = require('..');
var stream = require('stream');
var test = require('tape');

test('lib', function (t) {
  t.plan(1);
  t.equal(typeof lib, 'function');
});

test('encode', function (t) {
  t.plan(3);

  var req = new XMLHttpRequest();
  req.open('GET', 'fixture.wav', true);
  req.responseType = 'arraybuffer';

  req.onload = function () {
    var encode = lib();
    t.equal(typeof encode, 'object');
    t.equal(typeof encode.pipe, 'function');

    var ctx = new AudioContext();
    var buf = new Buffer(new Uint8Array(req.response));

    ctx.decodeAudioData(buf.toArrayBuffer(), function (buf) {
      var read = new stream.Readable({objectMode: true});
      read._read = function () {
        read.push(buf);
        read.push(null);
      };

      read.pipe(encode).pipe(concat(function (buf) {
        var blob1 = new Blob([buf.toArrayBuffer()]);
        var req = new XMLHttpRequest();
        req.open('GET', 'expected.opus', true);
        req.responseType = 'blob';

        req.onload = function () {
          var blob2 = req.response;
          t.equal(blob1.size, blob2.size);
        };

        req.send();
      }));
    });
  };

  req.send();
});
