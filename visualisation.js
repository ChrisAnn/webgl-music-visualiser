
var canvas = document.getElementById("audio-canvas");
var ctx = canvas.getContext('2d');
canvas.width = document.body.clientWidth / 1.4;

// One-liner to resume playback when user interacted with the page.
document.querySelector('button').addEventListener('click', function() {
    var sound = new Sound();
    sound.load('offkey_070221---snake-eyes-160.mp3'); 
  });

function Sound() {
	"use strict"; 
    var self = this;
    var context = new AudioContext();
    var source = null;
    var jsProcessor = null;
    var analyser = null;

    this.processAudio = function() {
        var freqByteData = new Uint8Array(analyser.frequencyBinCount);

        analyser.getByteFrequencyData(freqByteData);
        self.renderFFT(freqByteData);
    };

    this.renderFFT = function(freqByteData) {
        var SPACER_WIDTH = 11;
        var numBars = Math.round(canvas.width / SPACER_WIDTH);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //freqByteData = freqByteData.subarray(viewportOffset.valueAsNumber);

        var colors = [
        '#EB6711', // orange
        '#9B000C', // red
        '#FAB300' // yellow
        ];
        // Draw rectangle for each frequency bin.
        for (var i = 0; i < numBars /*freqByteData.length*/; ++i) {
            var magnitude = freqByteData[i];


            var lingrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - magnitude);
            lingrad.addColorStop(0, '#fff');
            lingrad.addColorStop(1, colors[i % colors.length]);
            ctx.fillStyle = lingrad;


            ctx.fillRect(i * SPACER_WIDTH, canvas.height, 10, -magnitude);
        }
    };

    this.initAudio = function(arrayBuffer) {
        source = context.createBufferSource();
        source.loop = true;
        if (context.decodeAudioData) {
            context.decodeAudioData(arrayBuffer, function(buffer) {
                source.buffer = buffer;
            }, function(e) {
                console.log(e);
            });
        } else {
            source.buffer = context.createBuffer(arrayBuffer,false /*Mix to mono*/);
        }

        jsProcessor = context.createScriptProcessor(2048 /*bufferSize*/, 1 /*num inputs*/, 1 /*num outputs*/);
        jsProcessor.onaudioprocess = this.processAudio;

        analyser = context.createAnalyser();

        source.connect(context.destination);

        source.connect(analyser);

        analyser.connect(jsProcessor);
        jsProcessor.connect(context.destination);

        var gain = context.createGain();
        source.connect(gain);
        gain.gain.value = 0.2;
        gain.connect(context.destination);

        source.start(0);
    };

    this.load = function(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            self.initAudio(request.response);
        };
        request.send();
    };

    this.play = function() {
        // Connect the processing graph:
        // source -> destination
        // source -> analyser -> jsProcessor -> destination
        source.connect(context.destination);
        source.connect(analyser);

        analyser.connect(jsProcessor);
        jsProcessor.connect(context.destination);

        source.noteOn(0);
    };

    this.stop = function() {
        source.noteOff(0);
        source.disconnect(0);
        jsProcessor.disconnect(0);
        analyser.disconnect(0);
    };
}

//sound.play();
