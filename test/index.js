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
    var read = new stream.PassThrough();
    var buf = new Buffer(new Uint8Array(req.response));
    read.push(buf);
    read.push(null);

    t.equal(typeof encode, 'object');
    t.equal(typeof encode.pipe, 'function');

    console.time('runtime');
    read.pipe(encode).pipe(concat(function (buf) {
      console.timeEnd('runtime');
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
  };

  req.send();
});
