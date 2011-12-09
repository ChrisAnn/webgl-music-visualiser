var canvas = null;
var ctx = null;

function Sound() {
 var self = this;
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
 
 jsProcessor = context.createJavaScriptNode(2048 /*bufferSize*/, 1 /*num inputs*/, 1 /*num outputs*/);
 jsProcessor.onaudioprocess = processAudio;
 
 analyser = context.createAnalyser();
 
 source.connect(context.destination);
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
 
 this.processAudio = function() {
  var freqByteData = new Uint8Array(analyser.frequencyBinCount);
  
  analyser.getByteFrequencyData(freqByteData);
  self.renderFFT(freqByteData);
 };

 this.renderFFT = function(freqByteData) {
  var SPACER_WIDTH = 11;
  var numBars = Math.round(canvas.width / SPACER_WIDTH);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  freqByteData = freqByteData.subarray(viewportOffset_.valueAsNumber);

  var colors = [
  '#3369E8', // blue
  '#D53225', // red
  '#EEB211', // yellow
  '#009939' // green
  ];
  // Draw rectangle for each frequency bin.
  for (var i = 0; i < numBars /*freqByteData.length*/; ++i) {
  var magnitude = freqByteData[i];


    var lingrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - magnitude);
    lingrad.addColorStop(0, '#fff');
    lingrad.addColorStop(1, colors[i % colors.length]);
    ctx.fillStyle = lingrad;


  ctx.fillRect(i * SPACER_WIDTH, canvas.height, colWidth_, -magnitude);
  }
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

window.onLoad = function() {
 canvas = document.getElementById("audio-canvas");
 ctx = canvas.getContext('2d');
 canvas.width = document.body.clientWidth / 1.4;

 var sound = new Sound();
 sound.load('offkey_070221---snake-eyes-160.mp3');
};