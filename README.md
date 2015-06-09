#opus-encode

Encode audio buffer streams to ogg opus. AFAIK, this only works in the browser.

##Installation

    npm install --save opus-encode

##Usage

    var encode = require('opus-encode');
    var stream = require('stream');

    // request an audio file
    var req = new XMLHttpRequest();
    req.open('GET', '/path/to/file.wav', true);
    req.responseType = 'arraybuffer';

    req.onload = function () {
      var res = req.response;
      var ctx = new AudioContext();

      // decode the file to audio buffers
      ctx.decodeAudioData(res.toArrayBuffer(), function (buf) {
        var audio = new stream.Readable({objectMode: true});
        var opus = encode({inputSampleRate: 41000});

        // convert the audio buffers to an object stream
        audio._read = function () {
          read.push(buf);
          read.push(null);
        };

        // pipe the audio buffer stream to the encoder
        audio.pipe(opus).pipe(...);
      });
    };

    req.send();

##Disclaimer

I don't pretend to understand how the encoder actually works.
I modified the encoder written by [chris-rudmin](https://github.com/chris-rudmin) in his fork of [RecordJS](https://github.com/chris-rudmin/Recorderjs).

##Tests

In order to run tests in the browser make sure you open your browser with the following flag:

    --allow-file-access-from-files
