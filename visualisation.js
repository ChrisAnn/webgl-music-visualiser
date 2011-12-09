alert("hello");

var canvas = document.getElementById("audio-canvas");
var ctx = canvas.getContext('2d');
canvas.width = document.body.clientWidth / 1.4;

function Sound() {
 var context = new (window.AudioContext || window.webkitAudioContext) ();
 var source = null;
 var jsProcessor = null;
 var analyser = null;
 
 this.initAudio = function(arrayBuffer) {
  source = context.createBufferSource();
  source.looping = true;
  if (context.decodeAudioData) {
      context.decodeAudioData(arrayBuffer, function(buffer) {
          source.buffer = buffer;
      }, function(e) {
          console.log(e);
      });
  } else {
      source.buffer = context.createBuffer(arrayBuffer,false /*Mix to mono*/);
  }
 
 jsProcessor = context_.createJavaScriptNode(2048 /*bufferSize*/, 1 /*num inputs*/, 1 /*num outputs*/);
 jsProcessor.onaudioprocess = processAudio;
 
 analyser = context.createAnalyser();
 
 source.connect(context.destination);
 };
 
 this.load = function(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
   self_.initAudio(request.response);
  };
  request.send();
 };
 
   this.play = function() {
    if (!source) {
      sound.load('IO-5.0.wav');
    } else {
      // Connect the processing graph:
      // source -> destination
      // source -> analyser -> jsProcessor -> destination
      source.connect(context.destination);
      source.connect(analyser);

      analyser.connect(jsProcessor);
      jsProcessor.connect(context.destination);

      source.noteOn(0);
    }
  };

  this.stop = function() {
    source.noteOff(0);
    source.disconnect(0);
    jsProcessor.disconnect(0);
    analyser.disconnect(0);
  };
}

var sound = new Sound();
sound.load('offkey_070221---snake-eyes-160.mp3');
