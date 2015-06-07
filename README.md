#opus-encode

Node ogg opus audio encoder. This currently only works in the browser.

##Installation

    npm install --save opus-encode

##Notes

You **must** specify the `inputSampleRate` of the audio piped into the encoder.

##Usage

    var encode = require('opus-encode');
    var stream = require('stream');

    var req = new XMLHttpRequest();
    req.open('GET', '/path/to/file.wav', true);
    req.responseType = 'arraybuffer';

    req.onload = function () {
      var audio = new stream.PassThrough();
      var opus = encode({inputSampleRate: 41000});
      audio.push(new Buffer(new Uint8Array(req.response)));
      audio.push(null);
      audio.pipe(opus).pipe(...);
    };

    req.send();

##Disclaimer

I don't pretend to understand how the encoder actually works.
I modified the encoder written by [chris-rudmin](https://github.com/chris-rudmin) in his fork of [RecordJS](https://github.com/chris-rudmin/Recorderjs).

##Tests

In order to run tests in the browser make sure you open your browser with the following flag:

    --allow-file-access-from-files
